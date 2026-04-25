'use strict';

const express = require('express');
const { query } = require('../db');

const router = express.Router();

function monthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

router.get('/history/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const numMonths = parseInt(req.query.months, 10) || 6;

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const months = getLastNMonths(numMonths);

    const result = await Promise.all(months.map(async ({ year, month }) => {
      const dataRes = await query(
        'SELECT * FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
        [req.userId, memberId, year, month]
      );
      const data = dataRes.rows[0];

      return {
        year,
        month,
        label: monthLabel(year, month),
        income: data ? parseFloat(data.income) : 0,
        expenditure: data ? parseFloat(data.expenditure) : 0,
        investments: data ? parseFloat(data.investments) : 0,
        savings: data ? parseFloat(data.income) - parseFloat(data.expenditure) - parseFloat(data.investments) : 0
      };
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /monthly/history/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const membersRes = await query(
      'SELECT * FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY display_order ASC, id ASC',
      [req.userId]
    );

    const result = await Promise.all(membersRes.rows.map(async (member) => {
      const dataRes = await query(
        'SELECT * FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
        [req.userId, member.id, year, month]
      );
      const data = dataRes.rows[0];

      if (data) {
        const income = parseFloat(data.income);
        const expenditure = parseFloat(data.expenditure);
        const investments = parseFloat(data.investments);
        return {
          memberId: member.id,
          memberName: member.name,
          year,
          month,
          income,
          expenditure,
          investments,
          savings: income - expenditure - investments,
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
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /monthly/:year/:month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:year/:month/:memberId', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const memberId = parseInt(req.params.memberId, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2 AND is_active = 1',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });
    const member = memberRes.rows[0];

    const dataRes = await query(
      'SELECT * FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
      [req.userId, memberId, year, month]
    );
    const data = dataRes.rows[0];

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

    const income = parseFloat(data.income);
    const expenditure = parseFloat(data.expenditure);
    const investments = parseFloat(data.investments);

    return res.status(200).json({
      memberId,
      memberName: member.name,
      year,
      month,
      income,
      expenditure,
      investments,
      savings: income - expenditure - investments,
      incomeBreakup: JSON.parse(data.income_breakup || '[]'),
      expenseBreakup: JSON.parse(data.expense_breakup || '[]'),
      investmentBreakup: JSON.parse(data.investment_breakup || '[]')
    });
  } catch (err) {
    console.error('GET /monthly/:year/:month/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:year/:month/:memberId', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const memberId = parseInt(req.params.memberId, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });
    const member = memberRes.rows[0];

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

    await query(`
      INSERT INTO monthly_data (user_id, member_id, year, month, income, expenditure, investments, income_breakup, expense_breakup, investment_breakup)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id, member_id, year, month) DO UPDATE SET
        income = EXCLUDED.income,
        expenditure = EXCLUDED.expenditure,
        investments = EXCLUDED.investments,
        income_breakup = EXCLUDED.income_breakup,
        expense_breakup = EXCLUDED.expense_breakup,
        investment_breakup = EXCLUDED.investment_breakup
    `, [req.userId, memberId, year, month, income, expenditure, investments, incomeBreakupStr, expenseBreakupStr, investmentBreakupStr]);

    await query(
      'UPDATE setup_progress SET monthly_done = 1, updated_at = NOW() WHERE user_id = $1',
      [req.userId]
    );

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

router.delete('/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const memberId = req.query.memberId ? parseInt(req.query.memberId, 10) : null;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    let result;
    if (memberId) {
      result = await query(
        'DELETE FROM monthly_data WHERE user_id = $1 AND year = $2 AND month = $3 AND member_id = $4',
        [req.userId, year, month, memberId]
      );
    } else {
      result = await query(
        'DELETE FROM monthly_data WHERE user_id = $1 AND year = $2 AND month = $3',
        [req.userId, year, month]
      );
    }

    return res.status(200).json({ success: true, deleted: result.rowCount });
  } catch (err) {
    console.error('DELETE /monthly/:year/:month error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
