'use strict';

const express = require('express');
const { query } = require('../db');

const router = express.Router();

function monthsRemaining(targetDate) {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;
  const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(diffMonths, 0);
}

function calcRequiredSip(targetAmount, currentAmount, months) {
  const remaining = Math.max(targetAmount - currentAmount, 0);
  if (months <= 0) return remaining;
  const r = 0.12;
  const rm = r / 12;
  const factor = Math.pow(1 + rm, months);
  if (factor === 1) return remaining / months;
  return (remaining * rm) / (factor - 1);
}

function calcStepUpSip(targetAmount, currentAmount, months) {
  if (months <= 0) return 0;
  const R = 0.12 / 12;
  const g = Math.pow(1.10, 1 / 12) - 1;
  const fvCorpus = currentAmount * Math.pow(1 + R, months);
  const needed = targetAmount - fvCorpus;
  if (needed <= 0) return 0;
  const denom = (Math.pow(1 + R, months) - Math.pow(1 + g, months)) / (R - g);
  return Math.round(needed / denom);
}

function enrichGoal(goal) {
  const months = monthsRemaining(goal.target_date);
  const targetAmount = parseFloat(goal.target_amount);
  const currentAmount = parseFloat(goal.current_amount);
  const monthlyContribution = parseFloat(goal.monthly_contribution);
  const progressPct = targetAmount > 0
    ? parseFloat(((currentAmount / targetAmount) * 100).toFixed(2))
    : 0;
  const inflationRate = goal.inflation_rate != null ? parseFloat(goal.inflation_rate) : 8;
  const baseYear = goal.base_year || new Date().getFullYear();
  const targetYear = goal.target_date ? new Date(goal.target_date).getFullYear() : baseYear;
  const yrsFromBase = Math.max(targetYear - baseYear, 0);
  const futureValue = Math.round(targetAmount * Math.pow(1 + inflationRate / 100, yrsFromBase));
  const yrsFromNow = months ? Math.round(months / 12) : 0;

  const fundingType = goal.funding_type || 'Savings';
  let fundingDetails = {};
  if (fundingType === 'EMI') {
    const dpPct = parseFloat(goal.down_payment_pct) || 0;
    const downPaymentAmount = Math.round(futureValue * dpPct / 100);
    const loanAmount = futureValue - downPaymentAmount;
    const dur = parseInt(goal.loan_duration_yrs) || 1;
    const roi = goal.loan_roi != null ? parseFloat(goal.loan_roi) : 8;
    const r = roi / 12 / 100;
    const n = dur * 12;
    const emi = r === 0
      ? loanAmount / n
      : loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const emiTargetYear = goal.target_date ? new Date(goal.target_date).getFullYear() : new Date().getFullYear();
    // Down payment savings progress
    const dpSavedSoFar = Math.min(currentAmount || 0, downPaymentAmount);
    const dpRemaining = Math.max(downPaymentAmount - dpSavedSoFar, 0);
    const downPaymentSip = Math.round(calcRequiredSip(downPaymentAmount, dpSavedSoFar, months || 0));
    const dpProgressPct = downPaymentAmount > 0
      ? parseFloat(((dpSavedSoFar / downPaymentAmount) * 100).toFixed(2))
      : 0;
    fundingDetails = {
      downPaymentAmount,
      dpSavedSoFar: Math.round(dpSavedSoFar),
      dpRemaining: Math.round(dpRemaining),
      dpProgressPct,
      downPaymentSip,
      loanAmount: Math.round(loanAmount),
      monthlyEmi: Math.round(emi),
      yearlyEmi: Math.round(emi * 12),
      loanEndsFy: emiTargetYear + dur,
    };
  } else {
    fundingDetails = { stepUpSip: calcStepUpSip(futureValue, currentAmount || 0, months || 0) };
  }

  const fundingTypeRaw = goal.funding_type || 'Savings';
  const stepUpSipRef = fundingDetails.stepUpSip || 0;
  const requiredMonthlySip = fundingTypeRaw === 'EMI' ? 0 : stepUpSipRef;
  const isOnTrack = fundingTypeRaw === 'EMI' ? null : (monthlyContribution || 0) >= stepUpSipRef;

  const isMilestone = goal.is_milestone === 1;

  return {
    id: goal.id,
    name: goal.name,
    goalType: goal.goal_type,
    targetAmount,
    currentAmount,
    monthlyContribution,
    targetDate: goal.target_date,
    assignedMembers: JSON.parse(goal.assigned_members || '[]'),
    notes: goal.notes,
    isAchieved: goal.is_achieved === 1,
    isActive: goal.is_active !== 0,
    isMilestone,
    createdAt: goal.created_at,
    monthsRemaining: months,
    progressPct,
    requiredMonthlySip,
    isOnTrack: isMilestone ? null : isOnTrack,
    fundingType: isMilestone ? 'Savings' : fundingType,
    baseYear,
    inflationRate,
    downPaymentPct: parseFloat(goal.down_payment_pct) || 0,
    loanDurationYrs: parseInt(goal.loan_duration_yrs) || 0,
    loanRoi: goal.loan_roi != null ? parseFloat(goal.loan_roi) : 8,
    futureValue,
    yrsFromNow,
    ...fundingDetails,
  };
}

router.get('/', async (req, res) => {
  try {
    const goalsRes = await query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    return res.status(200).json(goalsRes.rows.map(enrichGoal));
  } catch (err) {
    console.error('GET /goals error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      name,
      goalType = 'Other',
      targetAmount,
      currentAmount = 0,
      monthlyContribution = 0,
      targetDate = '',
      assignedMembers = [],
      notes = '',
      fundingType = 'Savings',
      inflationRate = 8,
      downPaymentPct = 0,
      loanDurationYrs = 0,
      loanRoi = 8,
      isMilestone = false,
      baseYear = new Date().getFullYear(),
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Goal name is required' });
    }
    if (targetAmount === undefined || targetAmount === null || isNaN(parseFloat(targetAmount))) {
      return res.status(400).json({ error: 'Target amount is required and must be a number' });
    }

    const assignedMembersStr = JSON.stringify(Array.isArray(assignedMembers) ? assignedMembers : []);

    const result = await query(`
      INSERT INTO goals (user_id, name, goal_type, target_amount, current_amount, monthly_contribution, target_date, assigned_members, notes, funding_type, inflation_rate, down_payment_pct, loan_duration_yrs, loan_roi, is_milestone, base_year)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `, [
      req.userId,
      name.trim(),
      goalType,
      parseFloat(targetAmount),
      parseFloat(currentAmount),
      parseFloat(monthlyContribution),
      targetDate,
      assignedMembersStr,
      notes,
      isMilestone ? 'Savings' : fundingType,
      parseFloat(inflationRate),
      isMilestone ? 0 : parseFloat(downPaymentPct),
      isMilestone ? 0 : parseInt(loanDurationYrs, 10),
      parseFloat(loanRoi),
      isMilestone ? 1 : 0,
      parseInt(baseYear, 10) || new Date().getFullYear(),
    ]);

    await query(
      'UPDATE setup_progress SET goals_done = 1, updated_at = NOW() WHERE user_id = $1',
      [req.userId]
    );

    const createdRes = await query('SELECT * FROM goals WHERE id = $1', [result.rows[0].id]);
    return res.status(201).json(enrichGoal(createdRes.rows[0]));
  } catch (err) {
    console.error('POST /goals error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existingRes = await query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Goal not found' });
    const existing = existingRes.rows[0];

    const {
      name = existing.name,
      goalType = existing.goal_type,
      targetAmount = existing.target_amount,
      currentAmount = existing.current_amount,
      monthlyContribution = existing.monthly_contribution,
      targetDate = existing.target_date,
      assignedMembers,
      notes = existing.notes,
      isAchieved,
      fundingType = existing.funding_type,
      inflationRate = existing.inflation_rate,
      downPaymentPct = existing.down_payment_pct,
      loanDurationYrs = existing.loan_duration_yrs,
      loanRoi = existing.loan_roi,
      isMilestone,
      baseYear = existing.base_year,
    } = req.body;

    const assignedMembersStr = assignedMembers !== undefined
      ? JSON.stringify(Array.isArray(assignedMembers) ? assignedMembers : [])
      : existing.assigned_members;

    const isAchievedInt = isAchieved !== undefined ? (isAchieved ? 1 : 0) : existing.is_achieved;
    const isMilestoneInt = isMilestone !== undefined ? (isMilestone ? 1 : 0) : existing.is_milestone;

    if (!name || !name.toString().trim()) {
      return res.status(400).json({ error: 'Goal name cannot be empty' });
    }

    await query(`
      UPDATE goals
      SET name = $1, goal_type = $2, target_amount = $3, current_amount = $4, monthly_contribution = $5,
          target_date = $6, assigned_members = $7, notes = $8, is_achieved = $9,
          funding_type = $10, inflation_rate = $11, down_payment_pct = $12, loan_duration_yrs = $13, loan_roi = $14,
          is_milestone = $15, base_year = $16
      WHERE id = $17 AND user_id = $18
    `, [
      name.toString().trim(),
      goalType,
      parseFloat(targetAmount),
      parseFloat(currentAmount),
      parseFloat(monthlyContribution),
      targetDate,
      assignedMembersStr,
      notes,
      isAchievedInt,
      isMilestoneInt ? 'Savings' : (fundingType || 'Savings'),
      inflationRate != null && !isNaN(parseFloat(inflationRate)) ? parseFloat(inflationRate) : 8,
      isMilestoneInt ? 0 : (downPaymentPct != null && !isNaN(parseFloat(downPaymentPct)) ? parseFloat(downPaymentPct) : 0),
      isMilestoneInt ? 0 : (loanDurationYrs != null && !isNaN(parseInt(loanDurationYrs, 10)) ? parseInt(loanDurationYrs, 10) : 0),
      loanRoi != null && !isNaN(parseFloat(loanRoi)) ? parseFloat(loanRoi) : 8,
      isMilestoneInt,
      parseInt(baseYear, 10) || new Date().getFullYear(),
      id, req.userId
    ]);

    const updatedRes = await query('SELECT * FROM goals WHERE id = $1', [id]);
    return res.status(200).json(enrichGoal(updatedRes.rows[0]));
  } catch (err) {
    console.error('PUT /goals/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existingRes = await query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Goal not found' });

    await query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [id, req.userId]);

    return res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (err) {
    console.error('DELETE /goals/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existingRes = await query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (!existingRes.rows[0]) return res.status(404).json({ error: 'Goal not found' });

    const current = existingRes.rows[0].is_active;
    const newVal = current === 0 ? 1 : 0;

    await query(
      'UPDATE goals SET is_active = $1 WHERE id = $2 AND user_id = $3',
      [newVal, id, req.userId]
    );

    const updatedRes = await query('SELECT * FROM goals WHERE id = $1', [id]);
    return res.status(200).json(enrichGoal(updatedRes.rows[0]));
  } catch (err) {
    console.error('PATCH /goals/:id/toggle-active error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
