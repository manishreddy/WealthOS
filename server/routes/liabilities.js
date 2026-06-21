'use strict';

const express = require('express');
const { query } = require('../db');

const router = express.Router();

const VALID_TYPES = [
  'Home Loan', 'Personal Loan', 'Car Loan', 'Two-Wheeler Loan', 'Education Loan',
  'Credit Card', 'Loan Against Securities', 'Gold Loan', 'Loan Against Property',
  'Consumer Durable', 'Business Loan'
];

const TAX_SECTION_MAP = {
  'Home Loan': '24b',
  'Education Loan': '80E',
};

function monthsBetween(dateStr) {
  if (!dateStr) return 0;
  const end = new Date(dateStr);
  if (isNaN(end.getTime())) return 0;
  const now = new Date();
  const diff = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  return Math.max(diff, 0);
}

function enrichLiability(row) {
  const orig = parseFloat(row.principal_original) || 0;
  const outstanding = parseFloat(row.principal_outstanding) || 0;
  const progressPct = orig > 0
    ? parseFloat(Math.min(((orig - outstanding) / orig) * 100, 100).toFixed(2))
    : 0;
  const monthsRemaining = row.is_revolving ? 0 : monthsBetween(row.end_date);

  return {
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    liabilityType: row.liability_type,
    lender: row.lender || '',
    principalOriginal: orig,
    principalOutstanding: outstanding,
    interestRate: parseFloat(row.interest_rate) || 0,
    emiMonthly: parseFloat(row.emi_monthly) || 0,
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    isRevolving: row.is_revolving === 1,
    collateral: row.collateral || '',
    taxBenefitSection: row.tax_benefit_section || '',
    notes: row.notes || '',
    isActive: row.is_active !== 0,
    createdAt: row.created_at,
    progressPct,
    monthsRemaining,
  };
}

function buildSummary(liabilities) {
  const totalOutstanding = liabilities.reduce((s, l) => s + l.principalOutstanding, 0);
  const totalMonthlyEmi = liabilities.reduce((s, l) => s + l.emiMonthly, 0);
  const weightedRateSum = liabilities.reduce((s, l) => s + l.interestRate * l.principalOutstanding, 0);
  const weightedAvgRate = totalOutstanding > 0
    ? parseFloat((weightedRateSum / totalOutstanding).toFixed(2))
    : 0;
  return { totalOutstanding, totalMonthlyEmi, weightedAvgRate };
}

function computeAmortization(outstanding, annualRate, emiMonthly, endDate) {
  if (!outstanding || !annualRate || !emiMonthly) return [];
  const monthlyRate = annualRate / 100 / 12;
  let balance = outstanding;
  const rows = [];
  const start = new Date();
  const end = endDate ? new Date(endDate) : null;
  const maxMonths = end
    ? Math.min(360, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()))
    : 360;

  for (let i = 1; i <= maxMonths && balance > 0; i++) {
    const interest = parseFloat((balance * monthlyRate).toFixed(2));
    const principal = parseFloat(Math.min(emiMonthly - interest, balance).toFixed(2));
    balance = parseFloat(Math.max(balance - principal, 0).toFixed(2));
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    rows.push({
      month: i,
      date: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      payment: parseFloat((interest + principal).toFixed(2)),
      principal,
      interest,
      balance,
    });
  }
  return rows;
}

// GET /liabilities
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM liabilities WHERE user_id = $1 AND is_active = 1 ORDER BY created_at ASC',
      [req.userId]
    );
    const liabilities = result.rows.map(enrichLiability);
    return res.json({ liabilities, summary: buildSummary(liabilities) });
  } catch (err) {
    console.error('GET /liabilities error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /liabilities
router.post('/', async (req, res) => {
  try {
    const {
      memberId,
      name,
      liabilityType = 'Personal Loan',
      lender = '',
      principalOriginal,
      principalOutstanding,
      interestRate,
      emiMonthly = 0,
      startDate = '',
      endDate = '',
      isRevolving = false,
      collateral = '',
      taxBenefitSection,
      notes = '',
    } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!memberId) return res.status(400).json({ error: 'memberId is required' });
    if (principalOutstanding === undefined) return res.status(400).json({ error: 'principalOutstanding is required' });
    if (interestRate === undefined) return res.status(400).json({ error: 'interestRate is required' });

    const memberCheck = await query(
      'SELECT id FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberCheck.rows[0]) return res.status(400).json({ error: 'Invalid member' });

    const resolvedTaxSection = taxBenefitSection !== undefined
      ? taxBenefitSection
      : (TAX_SECTION_MAP[liabilityType] || '');

    const result = await query(`
      INSERT INTO liabilities
        (user_id, member_id, name, liability_type, lender, principal_original, principal_outstanding,
         interest_rate, emi_monthly, start_date, end_date, is_revolving, collateral, tax_benefit_section, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING id
    `, [
      req.userId, memberId, name.trim(),
      VALID_TYPES.includes(liabilityType) ? liabilityType : 'Personal Loan',
      lender, parseFloat(principalOriginal) || parseFloat(principalOutstanding) || 0,
      parseFloat(principalOutstanding), parseFloat(interestRate),
      parseFloat(emiMonthly) || 0,
      startDate, endDate,
      isRevolving ? 1 : 0, collateral, resolvedTaxSection, notes,
    ]);

    const created = await query('SELECT * FROM liabilities WHERE id = $1', [result.rows[0].id]);
    return res.status(201).json(enrichLiability(created.rows[0]));
  } catch (err) {
    console.error('POST /liabilities error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /liabilities/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existingRes = await query(
      'SELECT * FROM liabilities WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Liability not found' });
    const e = existingRes.rows[0];

    const {
      memberId = e.member_id,
      name = e.name,
      liabilityType = e.liability_type,
      lender = e.lender,
      principalOriginal = e.principal_original,
      principalOutstanding = e.principal_outstanding,
      interestRate = e.interest_rate,
      emiMonthly = e.emi_monthly,
      startDate = e.start_date,
      endDate = e.end_date,
      isRevolving,
      collateral = e.collateral,
      taxBenefitSection = e.tax_benefit_section,
      notes = e.notes,
    } = req.body;

    const isRevolvingVal = isRevolving !== undefined ? (isRevolving ? 1 : 0) : e.is_revolving;

    await query(`
      UPDATE liabilities SET
        member_id = $1, name = $2, liability_type = $3, lender = $4,
        principal_original = $5, principal_outstanding = $6, interest_rate = $7,
        emi_monthly = $8, start_date = $9, end_date = $10, is_revolving = $11,
        collateral = $12, tax_benefit_section = $13, notes = $14
      WHERE id = $15 AND user_id = $16
    `, [
      memberId, name.toString().trim(),
      VALID_TYPES.includes(liabilityType) ? liabilityType : e.liability_type,
      lender, parseFloat(principalOriginal), parseFloat(principalOutstanding),
      parseFloat(interestRate), parseFloat(emiMonthly),
      startDate, endDate, isRevolvingVal, collateral, taxBenefitSection, notes,
      id, req.userId,
    ]);

    const updated = await query('SELECT * FROM liabilities WHERE id = $1', [id]);
    return res.json(enrichLiability(updated.rows[0]));
  } catch (err) {
    console.error('PUT /liabilities/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /liabilities/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await query(
      'SELECT id FROM liabilities WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (!existing.rows[0]) return res.status(404).json({ error: 'Liability not found' });

    await query(
      'UPDATE liabilities SET is_active = 0 WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /liabilities/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /liabilities/:id/amortization
router.get('/:id/amortization', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await query(
      'SELECT * FROM liabilities WHERE id = $1 AND user_id = $2 AND is_active = 1',
      [id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Liability not found' });
    const row = result.rows[0];

    if (row.is_revolving) {
      return res.json({ isRevolving: true, schedule: [] });
    }

    const schedule = computeAmortization(
      parseFloat(row.principal_outstanding),
      parseFloat(row.interest_rate),
      parseFloat(row.emi_monthly),
      row.end_date
    );
    return res.json({ isRevolving: false, schedule });
  } catch (err) {
    console.error('GET /liabilities/:id/amortization error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /liabilities/sync-to-projections
router.post('/sync-to-projections', async (req, res) => {
  try {
    const { buildEmiScheduleFromLiabilities } = require('../utils/projections-calc');

    const result = await query(
      'SELECT * FROM liabilities WHERE user_id = $1 AND is_active = 1',
      [req.userId]
    );
    const liabilities = result.rows;

    const emiSchedule = buildEmiScheduleFromLiabilities(liabilities);

    const existing = await query(
      'SELECT config FROM financial_plan WHERE user_id = $1',
      [req.userId]
    );
    let cfg = {};
    if (existing.rows[0] && existing.rows[0].config) {
      try { cfg = JSON.parse(existing.rows[0].config); } catch {}
    }
    cfg.emiSchedule = emiSchedule;

    await query(`
      INSERT INTO financial_plan (user_id, config, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET config = $2, updated_at = NOW()
    `, [req.userId, JSON.stringify(cfg)]);

    return res.json({ success: true, emiSchedule, count: emiSchedule.length });
  } catch (err) {
    console.error('POST /liabilities/sync-to-projections error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
