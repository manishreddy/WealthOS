'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/savings/:memberId - investments list + targets
router.get('/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const investments = db.prepare(
      'SELECT * FROM savings_plan WHERE user_id = ? AND member_id = ? AND is_active = 1 ORDER BY created_at ASC'
    ).all(req.userId, memberId);

    const targets = db.prepare(
      'SELECT * FROM savings_targets WHERE user_id = ? AND member_id = ?'
    ).get(req.userId, memberId);

    return res.status(200).json({
      investments: investments.map(inv => ({
        id: inv.id,
        name: inv.name,
        instrumentType: inv.instrument_type || '',
        assetClass: inv.asset_class,
        subCategory: inv.sub_category,
        indexType: inv.index_type || '',
        fundHouse: inv.fund_house || '',
        platform: inv.platform || '',
        amount: inv.amount,
        frequency: inv.frequency,
        startMonth: inv.start_month,
        notes: inv.notes || '',
        isActive: inv.is_active === 1,
        createdAt: inv.created_at
      })),
      targets: targets ? {
        equityPct: targets.equity_pct,
        debtPct: targets.debt_pct,
        goldPct: targets.gold_pct,
        othersPct: targets.others_pct,
        useAgeBased: targets.use_age_based === 1
      } : {
        equityPct: 60,
        debtPct: 30,
        goldPct: 5,
        othersPct: 5,
        useAgeBased: true
      }
    });
  } catch (err) {
    console.error('GET /savings/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/savings/:memberId - add savings plan item
router.post('/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const {
      name, assetClass, subCategory = '', amount, frequency = 'monthly', startMonth = '',
      instrumentType = '', indexType = '', fundHouse = '', platform = '', notes = ''
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!assetClass || !assetClass.trim()) {
      return res.status(400).json({ error: 'Asset class is required' });
    }
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Amount is required and must be a number' });
    }

    const result = db.prepare(`
      INSERT INTO savings_plan (user_id, member_id, name, instrument_type, asset_class, sub_category, index_type, fund_house, platform, amount, frequency, start_month, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.userId, memberId, name.trim(), instrumentType, assetClass.trim(), subCategory, indexType, fundHouse, platform, parseFloat(amount), frequency, startMonth, notes);

    // Update setup progress
    db.prepare(
      'UPDATE setup_progress SET savings_done = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(req.userId);

    const created = db.prepare('SELECT * FROM savings_plan WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({
      id: created.id,
      name: created.name,
      instrumentType: created.instrument_type || '',
      assetClass: created.asset_class,
      subCategory: created.sub_category,
      indexType: created.index_type || '',
      fundHouse: created.fund_house || '',
      platform: created.platform || '',
      amount: created.amount,
      frequency: created.frequency,
      startMonth: created.start_month,
      notes: created.notes || '',
      isActive: created.is_active === 1,
      createdAt: created.created_at
    });
  } catch (err) {
    console.error('POST /savings/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/savings/:memberId/targets - upsert savings targets (must come before /:memberId/:id)
router.put('/:memberId/targets', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const { equityPct, debtPct, goldPct, othersPct, useAgeBased } = req.body;

    if (equityPct === undefined || debtPct === undefined || goldPct === undefined || othersPct === undefined) {
      return res.status(400).json({ error: 'equityPct, debtPct, goldPct, and othersPct are required' });
    }

    const useAgeBasedInt = useAgeBased ? 1 : 0;

    db.prepare(`
      INSERT INTO savings_targets (user_id, member_id, equity_pct, debt_pct, gold_pct, others_pct, use_age_based)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, member_id) DO UPDATE SET
        equity_pct = excluded.equity_pct,
        debt_pct = excluded.debt_pct,
        gold_pct = excluded.gold_pct,
        others_pct = excluded.others_pct,
        use_age_based = excluded.use_age_based
    `).run(req.userId, memberId, parseFloat(equityPct), parseFloat(debtPct), parseFloat(goldPct), parseFloat(othersPct), useAgeBasedInt);

    const updated = db.prepare(
      'SELECT * FROM savings_targets WHERE user_id = ? AND member_id = ?'
    ).get(req.userId, memberId);

    return res.status(200).json({
      equityPct: updated.equity_pct,
      debtPct: updated.debt_pct,
      goldPct: updated.gold_pct,
      othersPct: updated.others_pct,
      useAgeBased: updated.use_age_based === 1
    });
  } catch (err) {
    console.error('PUT /savings/:memberId/targets error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/savings/:memberId/:id - update savings plan item
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
      'SELECT * FROM savings_plan WHERE id = ? AND user_id = ? AND member_id = ?'
    ).get(id, req.userId, memberId);
    if (!existing) return res.status(404).json({ error: 'Savings plan item not found' });

    const {
      name = existing.name,
      instrumentType = existing.instrument_type,
      assetClass = existing.asset_class,
      subCategory = existing.sub_category,
      indexType = existing.index_type,
      fundHouse = existing.fund_house,
      platform = existing.platform,
      amount = existing.amount,
      frequency = existing.frequency,
      startMonth = existing.start_month,
      notes = existing.notes
    } = req.body;

    if (!name || !name.toString().trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    if (!assetClass || !assetClass.toString().trim()) {
      return res.status(400).json({ error: 'Asset class cannot be empty' });
    }

    db.prepare(`
      UPDATE savings_plan
      SET name = ?, instrument_type = ?, asset_class = ?, sub_category = ?, index_type = ?, fund_house = ?, platform = ?, amount = ?, frequency = ?, start_month = ?, notes = ?
      WHERE id = ? AND user_id = ? AND member_id = ?
    `).run(name.toString().trim(), instrumentType || '', assetClass.toString().trim(), subCategory, indexType || '', fundHouse || '', platform || '', parseFloat(amount), frequency, startMonth, notes || '', id, req.userId, memberId);

    const updated = db.prepare('SELECT * FROM savings_plan WHERE id = ?').get(id);
    return res.status(200).json({
      id: updated.id,
      name: updated.name,
      instrumentType: updated.instrument_type || '',
      assetClass: updated.asset_class,
      subCategory: updated.sub_category,
      indexType: updated.index_type || '',
      fundHouse: updated.fund_house || '',
      platform: updated.platform || '',
      amount: updated.amount,
      frequency: updated.frequency,
      startMonth: updated.start_month,
      notes: updated.notes || '',
      isActive: updated.is_active === 1,
      createdAt: updated.created_at
    });
  } catch (err) {
    console.error('PUT /savings/:memberId/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/savings/:memberId/:id - delete savings plan item
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
      'SELECT * FROM savings_plan WHERE id = ? AND user_id = ? AND member_id = ?'
    ).get(id, req.userId, memberId);
    if (!existing) return res.status(404).json({ error: 'Savings plan item not found' });

    db.prepare('DELETE FROM savings_plan WHERE id = ? AND user_id = ? AND member_id = ?').run(id, req.userId, memberId);

    return res.status(200).json({ success: true, message: 'Savings plan item deleted successfully' });
  } catch (err) {
    console.error('DELETE /savings/:memberId/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
