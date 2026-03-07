'use strict';

const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('../db');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Zerodha Holdings Parser ────────────────────────────────────────────────────

function parseNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function classifyEquity(symbol, sector) {
  const sym = (symbol || '').toUpperCase();
  const sec = (sector || '').toUpperCase();
  // SGB (Sovereign Gold Bond)
  if (sym.includes('-GB') || sym.startsWith('SGB')) return { assetType: 'gold', assetClass: 'Gold' };
  // Debt bonds
  if (sec === 'DEBT') return { assetType: 'fd', assetClass: 'Debt' };
  // ETFs
  if (sec === 'ETF' || sym.endsWith('-F') || sym.includes('BEES')) {
    if (sym.includes('GOLD')) return { assetType: 'mutual-funds', assetClass: 'Gold' };
    return { assetType: 'mutual-funds', assetClass: 'Equity' };
  }
  // Stocks
  return { assetType: 'stocks', assetClass: 'Equity' };
}

function classifyMF(symbol) {
  const sym = (symbol || '').toUpperCase();
  if (sym.includes('GOLD') || sym.includes('SGB')) return { assetType: 'mutual-funds', assetClass: 'Gold' };
  if (sym.includes('DEBT') || sym.includes('LIQUID') || sym.includes('OVERNIGHT') || sym.includes('MONEY MARKET')) return { assetType: 'mutual-funds', assetClass: 'Debt' };
  return { assetType: 'mutual-funds', assetClass: 'Equity' };
}

function parseZerodhaWorkbook(workbook) {
  const assets = [];

  // Try Combined sheet first, then fall back to Equity + MF separately
  const hasCombined = workbook.SheetNames.includes('Combined');
  const hasEquity = workbook.SheetNames.includes('Equity');
  const hasMF = workbook.SheetNames.includes('Mutual Funds');

  function parseSheet(sheetName, isMF) {
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    // Find header row (first cell = "Symbol")
    const headerIdx = rows.findIndex(r => String(r[0]).trim().toLowerCase() === 'symbol');
    if (headerIdx === -1) return;

    const headers = rows[headerIdx].map(h => String(h).trim().toLowerCase());
    const dataRows = rows.slice(headerIdx + 1).filter(r => r[0] && String(r[0]).trim() !== '');

    function col(row, name) {
      const idx = headers.indexOf(name.toLowerCase());
      return idx >= 0 ? row[idx] : '';
    }

    for (const row of dataRows) {
      const symbol = String(col(row, 'symbol')).trim();
      if (!symbol) continue;

      const isin = String(col(row, 'isin')).trim();
      const sector = String(col(row, 'sector') || col(row, 'instrument type')).trim();
      const instrType = String(col(row, 'instrument type')).trim();
      const isMFRow = instrType.includes('true') || isMF;

      const qtyAvail   = parseNum(col(row, 'quantity available'));
      const qtyDisc    = parseNum(col(row, 'quantity discrepant'));
      const qtyLT      = parseNum(col(row, 'quantity long term'));
      const qtyPledgeM = parseNum(col(row, 'quantity pledged (margin)'));
      const qtyPledgeL = parseNum(col(row, 'quantity pledged (loan)'));
      const totalQty   = qtyAvail + qtyDisc + qtyLT + qtyPledgeM + qtyPledgeL;

      const avgPrice      = parseNum(col(row, 'average price'));
      const closingPrice  = parseNum(col(row, 'previous closing price'));

      const purchaseValue = avgPrice * totalQty;
      const currentValue  = closingPrice * totalQty;

      // Skip zero-value rows (usually instruments with no price data)
      if (currentValue === 0 && purchaseValue === 0) continue;

      // Name: strip "-MF" suffix for mutual funds
      const name = symbol.replace(/-MF$/i, '').trim();

      const { assetType, assetClass } = isMFRow
        ? classifyMF(symbol)
        : classifyEquity(symbol, sector);

      assets.push({ name, isin, assetType, assetClass, units: totalQty, purchaseValue, currentValue });
    }
  }

  if (hasCombined) {
    parseSheet('Combined', false);
  } else {
    if (hasEquity) parseSheet('Equity', false);
    if (hasMF) parseSheet('Mutual Funds', true);
  }

  return assets;
}

// POST /api/portfolio/parse-zerodha - parse uploaded holdings Excel
router.post('/parse-zerodha', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const assets = parseZerodhaWorkbook(workbook);

    if (assets.length === 0) {
      return res.status(400).json({ error: 'No holdings found. Make sure this is a Zerodha holdings export.' });
    }

    return res.status(200).json({ assets, count: assets.length });
  } catch (err) {
    console.error('POST /portfolio/parse-zerodha error:', err);
    return res.status(500).json({ error: 'Failed to parse file: ' + err.message });
  }
});

// Helper: format an asset row
function formatAsset(asset) {
  return {
    id: asset.id,
    memberId: asset.member_id,
    year: asset.year,
    month: asset.month,
    assetType: asset.asset_type,
    name: asset.name,
    assetClass: asset.asset_class,
    purchaseValue: asset.purchase_value,
    currentValue: asset.current_value,
    units: asset.units,
    notes: asset.notes,
    lastUpdated: asset.last_updated,
    updatedAt: asset.last_updated,
    createdAt: asset.created_at
  };
}

// GET /api/portfolio - all active members with their assets
router.get('/', (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || 0;
    const month = parseInt(req.query.month, 10) || 0;

    const members = db.prepare(
      'SELECT * FROM family_members WHERE user_id = ? AND is_active = 1 ORDER BY display_order ASC, id ASC'
    ).all(req.userId);

    const result = members.map(member => {
      const assets = db.prepare(
        'SELECT * FROM portfolio_assets WHERE user_id = ? AND member_id = ? AND year = ? AND month = ? ORDER BY created_at ASC'
      ).all(req.userId, member.id, year, month);

      return {
        memberId: member.id,
        memberName: member.name,
        assets: assets.map(formatAsset)
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /portfolio error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/portfolio/delete-month - delete all assets for a year/month (optionally scoped to one member)
router.delete('/delete-month', (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    const memberId = req.query.memberId ? parseInt(req.query.memberId, 10) : null;

    if (!year || !month) return res.status(400).json({ error: 'year and month are required' });

    let result;
    if (memberId) {
      result = db.prepare(
        'DELETE FROM portfolio_assets WHERE user_id = ? AND year = ? AND month = ? AND member_id = ?'
      ).run(req.userId, year, month, memberId);
    } else {
      result = db.prepare(
        'DELETE FROM portfolio_assets WHERE user_id = ? AND year = ? AND month = ?'
      ).run(req.userId, year, month);
    }

    return res.status(200).json({ success: true, deleted: result.changes });
  } catch (err) {
    console.error('DELETE /portfolio/delete-month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/copy-month - copy assets from one month to another
router.post('/copy-month', (req, res) => {
  try {
    const { fromYear, fromMonth, toYear, toMonth } = req.body;
    if (!fromYear || !fromMonth || !toYear || !toMonth) {
      return res.status(400).json({ error: 'fromYear, fromMonth, toYear, toMonth are required' });
    }

    // Check target month already has data
    const existing = db.prepare(
      'SELECT COUNT(*) as cnt FROM portfolio_assets WHERE user_id = ? AND year = ? AND month = ?'
    ).get(req.userId, toYear, toMonth);
    if (existing.cnt > 0) {
      return res.status(400).json({ error: 'Target month already has assets. Delete them first.' });
    }

    const sourceAssets = db.prepare(
      'SELECT * FROM portfolio_assets WHERE user_id = ? AND year = ? AND month = ?'
    ).all(req.userId, fromYear, fromMonth);

    if (sourceAssets.length === 0) {
      return res.status(404).json({ error: 'No assets found in source month' });
    }

    const insert = db.prepare(`
      INSERT INTO portfolio_assets (user_id, member_id, year, month, asset_type, name, asset_class, purchase_value, current_value, units, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((assets) => {
      for (const a of assets) {
        insert.run(req.userId, a.member_id, toYear, toMonth, a.asset_type, a.name, a.asset_class, a.purchase_value, a.current_value, a.units, a.notes);
      }
    });

    insertMany(sourceAssets);

    return res.status(200).json({ success: true, copied: sourceAssets.length });
  } catch (err) {
    console.error('POST /portfolio/copy-month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/summary - net worth summary
router.get('/summary', (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || 0;
    const month = parseInt(req.query.month, 10) || 0;

    const allAssets = db.prepare(
      'SELECT pa.*, fm.name as member_name FROM portfolio_assets pa JOIN family_members fm ON pa.member_id = fm.id WHERE pa.user_id = ? AND fm.is_active = 1 AND pa.year = ? AND pa.month = ?'
    ).all(req.userId, year, month);

    const totalNetWorth = allAssets.reduce((sum, a) => sum + (a.current_value || 0), 0);

    // Group by asset class
    const classMap = {};
    allAssets.forEach(asset => {
      const cls = asset.asset_class || 'Others';
      if (!classMap[cls]) classMap[cls] = 0;
      classMap[cls] += asset.current_value || 0;
    });

    const byAssetClass = Object.entries(classMap).map(([cls, value]) => ({
      class: cls,
      value,
      pct: totalNetWorth > 0 ? parseFloat(((value / totalNetWorth) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.value - a.value);

    // Group by member
    const memberMap = {};
    allAssets.forEach(asset => {
      const key = asset.member_id;
      if (!memberMap[key]) {
        memberMap[key] = { memberId: asset.member_id, memberName: asset.member_name, total: 0 };
      }
      memberMap[key].total += asset.current_value || 0;
    });

    const byMember = Object.values(memberMap).sort((a, b) => b.total - a.total);

    return res.status(200).json({ totalNetWorth, byAssetClass, byMember });
  } catch (err) {
    console.error('GET /portfolio/summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/:memberId - assets for one member
router.get('/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const year = parseInt(req.query.year, 10) || 0;
    const month = parseInt(req.query.month, 10) || 0;

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const assets = db.prepare(
      'SELECT * FROM portfolio_assets WHERE user_id = ? AND member_id = ? AND year = ? AND month = ? ORDER BY created_at ASC'
    ).all(req.userId, memberId, year, month);

    return res.status(200).json(assets.map(formatAsset));
  } catch (err) {
    console.error('GET /portfolio/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/:memberId - add asset
router.post('/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const { assetType, name, assetClass, purchaseValue = 0, currentValue, units = 0, notes = '', year, month } = req.body;

    if (!assetType || !assetType.trim()) {
      return res.status(400).json({ error: 'Asset type is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Asset name is required' });
    }
    if (!assetClass || !assetClass.trim()) {
      return res.status(400).json({ error: 'Asset class is required' });
    }
    if (currentValue === undefined || currentValue === null || isNaN(parseFloat(currentValue))) {
      return res.status(400).json({ error: 'Current value is required and must be a number' });
    }

    const now = new Date();
    const assetYear = parseInt(year, 10) || now.getFullYear();
    const assetMonth = parseInt(month, 10) || (now.getMonth() + 1);

    const result = db.prepare(`
      INSERT INTO portfolio_assets (user_id, member_id, year, month, asset_type, name, asset_class, purchase_value, current_value, units, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.userId, memberId, assetYear, assetMonth, assetType.trim(), name.trim(), assetClass.trim(), parseFloat(purchaseValue), parseFloat(currentValue), parseFloat(units), notes);

    // Update setup progress
    db.prepare(
      'UPDATE setup_progress SET portfolio_done = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(req.userId);

    const created = db.prepare('SELECT * FROM portfolio_assets WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(formatAsset(created));
  } catch (err) {
    console.error('POST /portfolio/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/portfolio/:memberId/:id - update asset
router.put('/:memberId/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const id = parseInt(req.params.id, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const existing = db.prepare(
      'SELECT * FROM portfolio_assets WHERE id = ? AND user_id = ? AND member_id = ?'
    ).get(id, req.userId, memberId);
    if (!existing) return res.status(404).json({ error: 'Asset not found' });

    const {
      assetType = existing.asset_type,
      name = existing.name,
      assetClass = existing.asset_class,
      purchaseValue = existing.purchase_value,
      currentValue = existing.current_value,
      units = existing.units,
      notes = existing.notes
    } = req.body;

    db.prepare(`
      UPDATE portfolio_assets
      SET asset_type = ?, name = ?, asset_class = ?, purchase_value = ?, current_value = ?, units = ?, notes = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND member_id = ?
    `).run(
      assetType.toString().trim(),
      name.toString().trim(),
      assetClass.toString().trim(),
      parseFloat(purchaseValue),
      parseFloat(currentValue),
      parseFloat(units),
      notes,
      id, req.userId, memberId
    );

    const updated = db.prepare('SELECT * FROM portfolio_assets WHERE id = ?').get(id);
    return res.status(200).json(formatAsset(updated));
  } catch (err) {
    console.error('PUT /portfolio/:memberId/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/portfolio/:memberId/:id - delete asset
router.delete('/:memberId/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const id = parseInt(req.params.id, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const existing = db.prepare(
      'SELECT * FROM portfolio_assets WHERE id = ? AND user_id = ? AND member_id = ?'
    ).get(id, req.userId, memberId);
    if (!existing) return res.status(404).json({ error: 'Asset not found' });

    db.prepare('DELETE FROM portfolio_assets WHERE id = ? AND user_id = ? AND member_id = ?').run(id, req.userId, memberId);

    return res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('DELETE /portfolio/:memberId/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
