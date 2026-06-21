'use strict';

const express = require('express');
const multer = require('multer');
const { query, pool } = require('../db');
const { readWorkbookFromBuffer, sheetToArrayOfArrays, getSheetNames, getSheet } = require('../utils/excel');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function parseNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function classifyEquity(symbol, sector) {
  const sym = (symbol || '').toUpperCase();
  const sec = (sector || '').toUpperCase();
  if (sym.includes('-GB') || sym.startsWith('SGB')) return { assetType: 'gold', assetClass: 'Gold' };
  if (sec === 'DEBT') return { assetType: 'fd', assetClass: 'Debt' };
  if (sec === 'ETF' || sym.endsWith('-F') || sym.includes('BEES')) {
    if (sym.includes('GOLD')) return { assetType: 'mutual-funds', assetClass: 'Gold' };
    return { assetType: 'mutual-funds', assetClass: 'Equity' };
  }
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
  const sheetNames = getSheetNames(workbook);
  const hasCombined = sheetNames.includes('Combined');
  const hasEquity = sheetNames.includes('Equity');
  const hasMF = sheetNames.includes('Mutual Funds');

  function parseSheet(sheetName, isMF) {
    const ws = getSheet(workbook, sheetName);
    const rows = sheetToArrayOfArrays(ws, '');
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
      const avgPrice     = parseNum(col(row, 'average price'));
      const closingPrice = parseNum(col(row, 'previous closing price'));
      const purchaseValue = avgPrice * totalQty;
      const currentValue  = closingPrice * totalQty;
      if (currentValue === 0 && purchaseValue === 0) continue;
      const name = symbol.replace(/-MF$/i, '').trim();
      const { assetType, assetClass } = isMFRow ? classifyMF(symbol) : classifyEquity(symbol, sector);
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

router.post('/parse-zerodha', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = await readWorkbookFromBuffer(req.file.buffer);
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

function formatAsset(asset) {
  return {
    id: asset.id,
    memberId: asset.member_id,
    year: asset.year,
    month: asset.month,
    assetType: asset.asset_type,
    name: asset.name,
    assetClass: asset.asset_class,
    category: asset.category || '',
    purchaseValue: parseFloat(asset.purchase_value),
    currentValue: parseFloat(asset.current_value),
    units: parseFloat(asset.units),
    notes: asset.notes,
    lastUpdated: asset.last_updated,
    updatedAt: asset.last_updated,
    createdAt: asset.created_at
  };
}

router.get('/', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || 0;
    const month = parseInt(req.query.month, 10) || 0;

    const membersRes = await query(
      'SELECT * FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY display_order ASC, id ASC',
      [req.userId]
    );

    const result = await Promise.all(membersRes.rows.map(async (member) => {
      const assetsRes = await query(
        'SELECT * FROM portfolio_assets WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4 ORDER BY created_at ASC',
        [req.userId, member.id, year, month]
      );
      return {
        memberId: member.id,
        memberName: member.name,
        assets: assetsRes.rows.map(formatAsset)
      };
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /portfolio error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delete-month', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    const memberId = req.query.memberId ? parseInt(req.query.memberId, 10) : null;

    if (!year || !month) return res.status(400).json({ error: 'year and month are required' });

    let result;
    if (memberId) {
      result = await query(
        'DELETE FROM portfolio_assets WHERE user_id = $1 AND year = $2 AND month = $3 AND member_id = $4',
        [req.userId, year, month, memberId]
      );
    } else {
      result = await query(
        'DELETE FROM portfolio_assets WHERE user_id = $1 AND year = $2 AND month = $3',
        [req.userId, year, month]
      );
    }

    return res.status(200).json({ success: true, deleted: result.rowCount });
  } catch (err) {
    console.error('DELETE /portfolio/delete-month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/copy-month', async (req, res) => {
  try {
    const { fromYear, fromMonth, toYear, toMonth } = req.body;
    if (!fromYear || !fromMonth || !toYear || !toMonth) {
      return res.status(400).json({ error: 'fromYear, fromMonth, toYear, toMonth are required' });
    }

    const existingRes = await query(
      'SELECT COUNT(*) as cnt FROM portfolio_assets WHERE user_id = $1 AND year = $2 AND month = $3',
      [req.userId, toYear, toMonth]
    );
    if (parseInt(existingRes.rows[0].cnt) > 0) {
      return res.status(400).json({ error: 'Target month already has assets. Delete them first.' });
    }

    const sourceRes = await query(
      'SELECT * FROM portfolio_assets WHERE user_id = $1 AND year = $2 AND month = $3',
      [req.userId, fromYear, fromMonth]
    );
    const sourceAssets = sourceRes.rows;

    if (sourceAssets.length === 0) {
      return res.status(404).json({ error: 'No assets found in source month' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const a of sourceAssets) {
        await client.query(
          'INSERT INTO portfolio_assets (user_id, member_id, year, month, asset_type, name, asset_class, category, purchase_value, current_value, units, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [req.userId, a.member_id, toYear, toMonth, a.asset_type, a.name, a.asset_class, a.category || '', a.purchase_value, a.current_value, a.units, a.notes]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return res.status(200).json({ success: true, copied: sourceAssets.length });
  } catch (err) {
    console.error('POST /portfolio/copy-month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || 0;
    const month = parseInt(req.query.month, 10) || 0;

    const allAssetsRes = await query(
      'SELECT pa.*, fm.name as member_name FROM portfolio_assets pa JOIN family_members fm ON pa.member_id = fm.id WHERE pa.user_id = $1 AND fm.is_active = 1 AND pa.year = $2 AND pa.month = $3',
      [req.userId, year, month]
    );
    const allAssets = allAssetsRes.rows;

    const totalNetWorth = allAssets.reduce((sum, a) => sum + parseFloat(a.current_value || 0), 0);

    const classMap = {};
    allAssets.forEach(asset => {
      const cls = asset.asset_class || 'Others';
      if (!classMap[cls]) classMap[cls] = 0;
      classMap[cls] += parseFloat(asset.current_value || 0);
    });

    const byAssetClass = Object.entries(classMap).map(([cls, value]) => ({
      class: cls,
      value,
      pct: totalNetWorth > 0 ? parseFloat(((value / totalNetWorth) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.value - a.value);

    const memberMap = {};
    allAssets.forEach(asset => {
      const key = asset.member_id;
      if (!memberMap[key]) {
        memberMap[key] = { memberId: asset.member_id, memberName: asset.member_name, total: 0 };
      }
      memberMap[key].total += parseFloat(asset.current_value || 0);
    });

    const byMember = Object.values(memberMap).sort((a, b) => b.total - a.total);

    return res.status(200).json({ totalNetWorth, byAssetClass, byMember });
  } catch (err) {
    console.error('GET /portfolio/summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const year = parseInt(req.query.year, 10) || 0;
    const month = parseInt(req.query.month, 10) || 0;

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const assetsRes = await query(
      'SELECT * FROM portfolio_assets WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4 ORDER BY created_at ASC',
      [req.userId, memberId, year, month]
    );

    return res.status(200).json(assetsRes.rows.map(formatAsset));
  } catch (err) {
    console.error('GET /portfolio/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const { assetType, name, assetClass, category = '', purchaseValue = 0, currentValue, units = 0, notes = '', year, month } = req.body;

    if (!assetType || !assetType.trim()) return res.status(400).json({ error: 'Asset type is required' });
    if (!name || !name.trim()) return res.status(400).json({ error: 'Asset name is required' });
    if (!assetClass || !assetClass.trim()) return res.status(400).json({ error: 'Asset class is required' });
    if (currentValue === undefined || currentValue === null || isNaN(parseFloat(currentValue))) {
      return res.status(400).json({ error: 'Current value is required and must be a number' });
    }

    const now = new Date();
    const assetYear = parseInt(year, 10) || now.getFullYear();
    const assetMonth = parseInt(month, 10) || (now.getMonth() + 1);

    const result = await query(`
      INSERT INTO portfolio_assets (user_id, member_id, year, month, asset_type, name, asset_class, category, purchase_value, current_value, units, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [req.userId, memberId, assetYear, assetMonth, assetType.trim(), name.trim(), assetClass.trim(), category, parseFloat(purchaseValue), parseFloat(currentValue), parseFloat(units), notes]);

    await query(
      'UPDATE setup_progress SET portfolio_done = 1, updated_at = NOW() WHERE user_id = $1',
      [req.userId]
    );

    const createdRes = await query('SELECT * FROM portfolio_assets WHERE id = $1', [result.rows[0].id]);
    return res.status(201).json(formatAsset(createdRes.rows[0]));
  } catch (err) {
    console.error('POST /portfolio/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:memberId/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const id = parseInt(req.params.id, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const existingRes = await query(
      'SELECT * FROM portfolio_assets WHERE id = $1 AND user_id = $2 AND member_id = $3',
      [id, req.userId, memberId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    const existing = existingRes.rows[0];

    const {
      assetType = existing.asset_type,
      name = existing.name,
      assetClass = existing.asset_class,
      category = existing.category,
      purchaseValue = existing.purchase_value,
      currentValue = existing.current_value,
      units = existing.units,
      notes = existing.notes
    } = req.body;

    await query(`
      UPDATE portfolio_assets
      SET asset_type = $1, name = $2, asset_class = $3, category = $4, purchase_value = $5, current_value = $6, units = $7, notes = $8, last_updated = NOW()
      WHERE id = $9 AND user_id = $10 AND member_id = $11
    `, [
      assetType.toString().trim(),
      name.toString().trim(),
      assetClass.toString().trim(),
      category || '',
      parseFloat(purchaseValue),
      parseFloat(currentValue),
      parseFloat(units),
      notes,
      id, req.userId, memberId
    ]);

    const updatedRes = await query('SELECT * FROM portfolio_assets WHERE id = $1', [id]);
    return res.status(200).json(formatAsset(updatedRes.rows[0]));
  } catch (err) {
    console.error('PUT /portfolio/:memberId/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:memberId/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const id = parseInt(req.params.id, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const existingRes = await query(
      'SELECT * FROM portfolio_assets WHERE id = $1 AND user_id = $2 AND member_id = $3',
      [id, req.userId, memberId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Asset not found' });

    await query('DELETE FROM portfolio_assets WHERE id = $1 AND user_id = $2 AND member_id = $3', [id, req.userId, memberId]);

    return res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('DELETE /portfolio/:memberId/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
