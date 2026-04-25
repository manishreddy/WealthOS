'use strict';

const express = require('express');
const { query } = require('../db');

const router = express.Router();

router.get('/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const investmentsRes = await query(
      'SELECT * FROM savings_plan WHERE user_id = $1 AND member_id = $2 AND is_active = 1 ORDER BY created_at ASC',
      [req.userId, memberId]
    );

    const targetsRes = await query(
      'SELECT * FROM savings_targets WHERE user_id = $1 AND member_id = $2',
      [req.userId, memberId]
    );
    const targets = targetsRes.rows[0];

    return res.status(200).json({
      investments: investmentsRes.rows.map(inv => ({
        id: inv.id,
        name: inv.name,
        instrumentType: inv.instrument_type || '',
        assetClass: inv.asset_class,
        subCategory: inv.sub_category,
        indexType: inv.index_type || '',
        fundHouse: inv.fund_house || '',
        platform: inv.platform || '',
        amount: parseFloat(inv.amount),
        frequency: inv.frequency,
        startMonth: inv.start_month,
        notes: inv.notes || '',
        isActive: inv.is_active === 1,
        createdAt: inv.created_at
      })),
      targets: targets ? {
        equityPct: parseFloat(targets.equity_pct),
        debtPct: parseFloat(targets.debt_pct),
        goldPct: parseFloat(targets.gold_pct),
        othersPct: parseFloat(targets.others_pct),
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

router.post('/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

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

    const result = await query(`
      INSERT INTO savings_plan (user_id, member_id, name, instrument_type, asset_class, sub_category, index_type, fund_house, platform, amount, frequency, start_month, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [req.userId, memberId, name.trim(), instrumentType, assetClass.trim(), subCategory, indexType, fundHouse, platform, parseFloat(amount), frequency, startMonth, notes]);

    await query(
      'UPDATE setup_progress SET savings_done = 1, updated_at = NOW() WHERE user_id = $1',
      [req.userId]
    );

    const createdRes = await query('SELECT * FROM savings_plan WHERE id = $1', [result.rows[0].id]);
    const created = createdRes.rows[0];
    return res.status(201).json({
      id: created.id,
      name: created.name,
      instrumentType: created.instrument_type || '',
      assetClass: created.asset_class,
      subCategory: created.sub_category,
      indexType: created.index_type || '',
      fundHouse: created.fund_house || '',
      platform: created.platform || '',
      amount: parseFloat(created.amount),
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

router.put('/:memberId/targets', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const { equityPct, debtPct, goldPct, othersPct, useAgeBased } = req.body;

    if (equityPct === undefined || debtPct === undefined || goldPct === undefined || othersPct === undefined) {
      return res.status(400).json({ error: 'equityPct, debtPct, goldPct, and othersPct are required' });
    }

    const useAgeBasedInt = useAgeBased ? 1 : 0;

    await query(`
      INSERT INTO savings_targets (user_id, member_id, equity_pct, debt_pct, gold_pct, others_pct, use_age_based)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, member_id) DO UPDATE SET
        equity_pct = EXCLUDED.equity_pct,
        debt_pct = EXCLUDED.debt_pct,
        gold_pct = EXCLUDED.gold_pct,
        others_pct = EXCLUDED.others_pct,
        use_age_based = EXCLUDED.use_age_based
    `, [req.userId, memberId, parseFloat(equityPct), parseFloat(debtPct), parseFloat(goldPct), parseFloat(othersPct), useAgeBasedInt]);

    const updatedRes = await query(
      'SELECT * FROM savings_targets WHERE user_id = $1 AND member_id = $2',
      [req.userId, memberId]
    );
    const updated = updatedRes.rows[0];

    return res.status(200).json({
      equityPct: parseFloat(updated.equity_pct),
      debtPct: parseFloat(updated.debt_pct),
      goldPct: parseFloat(updated.gold_pct),
      othersPct: parseFloat(updated.others_pct),
      useAgeBased: updated.use_age_based === 1
    });
  } catch (err) {
    console.error('PUT /savings/:memberId/targets error:', err);
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
      'SELECT * FROM savings_plan WHERE id = $1 AND user_id = $2 AND member_id = $3',
      [id, req.userId, memberId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Savings plan item not found' });
    const existing = existingRes.rows[0];

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

    await query(`
      UPDATE savings_plan
      SET name = $1, instrument_type = $2, asset_class = $3, sub_category = $4, index_type = $5, fund_house = $6, platform = $7, amount = $8, frequency = $9, start_month = $10, notes = $11
      WHERE id = $12 AND user_id = $13 AND member_id = $14
    `, [name.toString().trim(), instrumentType || '', assetClass.toString().trim(), subCategory, indexType || '', fundHouse || '', platform || '', parseFloat(amount), frequency, startMonth, notes || '', id, req.userId, memberId]);

    const updatedRes = await query('SELECT * FROM savings_plan WHERE id = $1', [id]);
    const updated = updatedRes.rows[0];
    return res.status(200).json({
      id: updated.id,
      name: updated.name,
      instrumentType: updated.instrument_type || '',
      assetClass: updated.asset_class,
      subCategory: updated.sub_category,
      indexType: updated.index_type || '',
      fundHouse: updated.fund_house || '',
      platform: updated.platform || '',
      amount: parseFloat(updated.amount),
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
      'SELECT * FROM savings_plan WHERE id = $1 AND user_id = $2 AND member_id = $3',
      [id, req.userId, memberId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Savings plan item not found' });

    await query('DELETE FROM savings_plan WHERE id = $1 AND user_id = $2 AND member_id = $3', [id, req.userId, memberId]);

    return res.status(200).json({ success: true, message: 'Savings plan item deleted successfully' });
  } catch (err) {
    console.error('DELETE /savings/:memberId/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
