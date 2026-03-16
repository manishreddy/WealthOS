'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// Helper: calculate months between today and targetDate string "YYYY-MM" or "YYYY-MM-DD"
function monthsRemaining(targetDate) {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;
  const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(diffMonths, 0);
}

// Helper: SIP formula to reach goal
// requiredMonthlySip = (remainingAmount * r/12) / ((1 + r/12)^months - 1)
function calcRequiredSip(targetAmount, currentAmount, months) {
  const remaining = Math.max(targetAmount - currentAmount, 0);
  if (months <= 0) return remaining;
  const r = 0.12; // 12% annual
  const rm = r / 12;
  const factor = Math.pow(1 + rm, months);
  if (factor === 1) return remaining / months;
  return (remaining * rm) / (factor - 1);
}

// Helper: Step-up SIP (10% annual step-up, 12% annual return)
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

// Helper: enrich goal with calculated fields
function enrichGoal(goal) {
  const months = monthsRemaining(goal.target_date);
  const progressPct = goal.target_amount > 0
    ? parseFloat(((goal.current_amount / goal.target_amount) * 100).toFixed(2))
    : 0;
  // Inflation-adjusted future value — fixed from baseYear to targetYear, not from today
  const inflationRate = goal.inflation_rate != null ? goal.inflation_rate : 8;
  const baseYear = goal.base_year || new Date().getFullYear();
  const targetYear = goal.target_date ? new Date(goal.target_date).getFullYear() : baseYear;
  const yrsFromBase = Math.max(targetYear - baseYear, 0);
  const futureValue = Math.round(goal.target_amount * Math.pow(1 + inflationRate / 100, yrsFromBase));
  // yrsFromNow kept for display (time remaining)
  const yrsFromNow = months ? Math.round(months / 12) : 0;

  // Funding-type-specific fields
  const fundingType = goal.funding_type || 'Savings';
  let fundingDetails = {};
  if (fundingType === 'EMI') {
    const dpPct = goal.down_payment_pct || 0;
    const downPaymentAmount = Math.round(futureValue * dpPct / 100);
    const loanAmount = futureValue - downPaymentAmount;
    const dur = goal.loan_duration_yrs || 1;
    const roi = goal.loan_roi != null ? goal.loan_roi : 8;
    const r = roi / 12 / 100;
    const n = dur * 12;
    const emi = r === 0
      ? loanAmount / n
      : loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const emiTargetYear = goal.target_date ? new Date(goal.target_date).getFullYear() : new Date().getFullYear();
    fundingDetails = {
      downPaymentAmount,
      loanAmount: Math.round(loanAmount),
      monthlyEmi: Math.round(emi),
      yearlyEmi: Math.round(emi * 12),
      loanEndsFy: emiTargetYear + dur,
    };
  } else {
    fundingDetails = { stepUpSip: calcStepUpSip(futureValue, goal.current_amount || 0, months || 0) };
  }

  // Use stepUpSip as the reference for on-track check and gap/surplus — same basis as what's shown on the card
  const fundingTypeRaw = goal.funding_type || 'Savings';
  const stepUpSipRef = fundingDetails.stepUpSip || 0;
  const requiredMonthlySip = fundingTypeRaw === 'EMI' ? 0 : stepUpSipRef;
  const isOnTrack = fundingTypeRaw === 'EMI' ? null : (goal.monthly_contribution || 0) >= stepUpSipRef;

  const isMilestone = goal.is_milestone === 1;

  return {
    id: goal.id,
    name: goal.name,
    goalType: goal.goal_type,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    monthlyContribution: goal.monthly_contribution,
    targetDate: goal.target_date,
    assignedMembers: JSON.parse(goal.assigned_members || '[]'),
    notes: goal.notes,
    isAchieved: goal.is_achieved === 1,
    isMilestone,
    createdAt: goal.created_at,
    monthsRemaining: months,
    progressPct,
    requiredMonthlySip,
    isOnTrack: isMilestone ? null : isOnTrack,
    fundingType: isMilestone ? 'Savings' : fundingType,
    baseYear,
    inflationRate,
    downPaymentPct: goal.down_payment_pct || 0,
    loanDurationYrs: goal.loan_duration_yrs || 0,
    loanRoi: goal.loan_roi != null ? goal.loan_roi : 8,
    futureValue,
    yrsFromNow,
    ...fundingDetails,
  };
}

// GET /api/goals - all goals with calculated fields
router.get('/', (req, res) => {
  try {
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.userId);

    return res.status(200).json(goals.map(enrichGoal));
  } catch (err) {
    console.error('GET /goals error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/goals - create goal
router.post('/', (req, res) => {
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

    const result = db.prepare(`
      INSERT INTO goals (user_id, name, goal_type, target_amount, current_amount, monthly_contribution, target_date, assigned_members, notes, funding_type, inflation_rate, down_payment_pct, loan_duration_yrs, loan_roi, is_milestone, base_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
    );

    // Update setup progress
    db.prepare(
      'UPDATE setup_progress SET goals_done = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(req.userId);

    const created = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(enrichGoal(created));
  } catch (err) {
    console.error('POST /goals error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/goals/:id - update goal
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = db.prepare(
      'SELECT * FROM goals WHERE id = ? AND user_id = ?'
    ).get(id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

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

    db.prepare(`
      UPDATE goals
      SET name = ?, goal_type = ?, target_amount = ?, current_amount = ?, monthly_contribution = ?,
          target_date = ?, assigned_members = ?, notes = ?, is_achieved = ?,
          funding_type = ?, inflation_rate = ?, down_payment_pct = ?, loan_duration_yrs = ?, loan_roi = ?,
          is_milestone = ?, base_year = ?
      WHERE id = ? AND user_id = ?
    `).run(
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
    );

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    return res.status(200).json(enrichGoal(updated));
  } catch (err) {
    console.error('PUT /goals/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/goals/:id - delete goal
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = db.prepare(
      'SELECT * FROM goals WHERE id = ? AND user_id = ?'
    ).get(id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, req.userId);

    return res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (err) {
    console.error('DELETE /goals/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
