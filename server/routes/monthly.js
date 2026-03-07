'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// Helper: format month label e.g. "Jan 2026"
function monthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

// Helper: get last N months as [{year, month}] sorted oldest to newest
function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

// GET /api/monthly/history/:memberId?months=6 - last N months history
router.get('/history/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const numMonths = parseInt(req.query.months, 10) || 6;

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const months = getLastNMonths(numMonths);

    const result = months.map(({ year, month }) => {
      const data = db.prepare(
        'SELECT * FROM monthly_data WHERE user_id = ? AND member_id = ? AND year = ? AND month = ?'
      ).get(req.userId, memberId, year, month);

      return {
        year,
        month,
        label: monthLabel(year, month),
        income: data ? data.income : 0,
        expenditure: data ? data.expenditure : 0,
        investments: data ? data.investments : 0,
        savings: data ? (data.income - data.expenditure - data.investments) : 0
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /monthly/history/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/monthly/:year/:month - all active members with their monthly data
router.get('/:year/:month', (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    // Get all active members for this user
    const members = db.prepare(
      'SELECT * FROM family_members WHERE user_id = ? AND is_active = 1 ORDER BY display_order ASC, id ASC'
    ).all(req.userId);

    const result = members.map(member => {
      const data = db.prepare(
        'SELECT * FROM monthly_data WHERE user_id = ? AND member_id = ? AND year = ? AND month = ?'
      ).get(req.userId, member.id, year, month);

      if (data) {
        return {
          memberId: member.id,
          memberName: member.name,
          year,
          month,
          income: data.income,
          expenditure: data.expenditure,
          investments: data.investments,
          savings: data.income - data.expenditure - data.investments,
          incomeBreakup: JSON.parse(data.income_breakup || '[]'),
          expenseBreakup: JSON.parse(data.expense_breakup || '[]'),
          investmentBreakup: JSON.parse(data.investment_breakup || '[]')
        };
      } else {
        return {
          memberId: member.id,
          memberName: member.name,
          year,
          month,
          income: 0,
          expenditure: 0,
          investments: 0,
          savings: 0,
          incomeBreakup: [],
          expenseBreakup: [],
          investmentBreakup: []
        };
      }
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /monthly/:year/:month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/monthly/:year/:month/:memberId - single member data
router.get('/:year/:month/:memberId', (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const memberId = parseInt(req.params.memberId, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ? AND is_active = 1'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const data = db.prepare(
      'SELECT * FROM monthly_data WHERE user_id = ? AND member_id = ? AND year = ? AND month = ?'
    ).get(req.userId, memberId, year, month);

    if (!data) {
      return res.status(200).json({
        memberId,
        memberName: member.name,
        year,
        month,
        income: 0,
        expenditure: 0,
        investments: 0,
        savings: 0,
        incomeBreakup: [],
        expenseBreakup: [],
        investmentBreakup: []
      });
    }

    return res.status(200).json({
      memberId,
      memberName: member.name,
      year,
      month,
      income: data.income,
      expenditure: data.expenditure,
      investments: data.investments,
      savings: data.income - data.expenditure - data.investments,
      incomeBreakup: JSON.parse(data.income_breakup || '[]'),
      expenseBreakup: JSON.parse(data.expense_breakup || '[]'),
      investmentBreakup: JSON.parse(data.investment_breakup || '[]')
    });
  } catch (err) {
    console.error('GET /monthly/:year/:month/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/monthly/:year/:month/:memberId - upsert monthly data
router.put('/:year/:month/:memberId', (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const memberId = parseInt(req.params.memberId, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const {
      income = 0,
      expenditure = 0,
      investments = 0,
      incomeBreakup = [],
      expenseBreakup = [],
      investmentBreakup = []
    } = req.body;

    const incomeBreakupStr = JSON.stringify(Array.isArray(incomeBreakup) ? incomeBreakup : []);
    const expenseBreakupStr = JSON.stringify(Array.isArray(expenseBreakup) ? expenseBreakup : []);
    const investmentBreakupStr = JSON.stringify(Array.isArray(investmentBreakup) ? investmentBreakup : []);

    db.prepare(`
      INSERT INTO monthly_data (user_id, member_id, year, month, income, expenditure, investments, income_breakup, expense_breakup, investment_breakup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, member_id, year, month) DO UPDATE SET
        income = excluded.income,
        expenditure = excluded.expenditure,
        investments = excluded.investments,
        income_breakup = excluded.income_breakup,
        expense_breakup = excluded.expense_breakup,
        investment_breakup = excluded.investment_breakup
    `).run(req.userId, memberId, year, month, income, expenditure, investments, incomeBreakupStr, expenseBreakupStr, investmentBreakupStr);

    // Update setup progress
    db.prepare(
      'UPDATE setup_progress SET monthly_done = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(req.userId);

    const savings = income - expenditure - investments;

    return res.status(200).json({
      memberId,
      memberName: member.name,
      year,
      month,
      income,
      expenditure,
      investments,
      savings,
      incomeBreakup: Array.isArray(incomeBreakup) ? incomeBreakup : [],
      expenseBreakup: Array.isArray(expenseBreakup) ? expenseBreakup : [],
      investmentBreakup: Array.isArray(investmentBreakup) ? investmentBreakup : []
    });
  } catch (err) {
    console.error('PUT /monthly/:year/:month/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// DELETE /api/monthly/:year/:month - delete monthly data for a month (optionally scoped to one member)
router.delete('/:year/:month', (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const memberId = req.query.memberId ? parseInt(req.query.memberId, 10) : null;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    let result;
    if (memberId) {
      result = db.prepare(
        'DELETE FROM monthly_data WHERE user_id = ? AND year = ? AND month = ? AND member_id = ?'
      ).run(req.userId, year, month, memberId);
    } else {
      result = db.prepare(
        'DELETE FROM monthly_data WHERE user_id = ? AND year = ? AND month = ?'
      ).run(req.userId, year, month);
    }

    return res.status(200).json({ success: true, deleted: result.changes });
  } catch (err) {
    console.error('DELETE /monthly/:year/:month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
