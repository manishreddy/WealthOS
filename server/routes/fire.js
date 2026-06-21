'use strict';
const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/settings', async (req, res) => {
  try {
    const result = await query('SELECT * FROM fire_settings WHERE user_id = $1', [req.userId]);
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error('GET /api/fire/settings:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { retirement_age, current_age_override, pre_ret_return, post_ret_return, inflation, swr, lean_ratio, fat_ratio, barista_income, corpus, income, expenses, investments } = req.body;
    await query(`
      INSERT INTO fire_settings (user_id, retirement_age, current_age_override, pre_ret_return, post_ret_return, inflation, swr, lean_ratio, fat_ratio, barista_income, corpus, income, expenses, investments, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        retirement_age = EXCLUDED.retirement_age,
        current_age_override = EXCLUDED.current_age_override,
        pre_ret_return = EXCLUDED.pre_ret_return,
        post_ret_return = EXCLUDED.post_ret_return,
        inflation = EXCLUDED.inflation,
        swr = EXCLUDED.swr,
        lean_ratio = EXCLUDED.lean_ratio,
        fat_ratio = EXCLUDED.fat_ratio,
        barista_income = EXCLUDED.barista_income,
        corpus = EXCLUDED.corpus,
        income = EXCLUDED.income,
        expenses = EXCLUDED.expenses,
        investments = EXCLUDED.investments,
        updated_at = NOW()
    `, [req.userId, retirement_age, current_age_override, pre_ret_return, post_ret_return, inflation, swr, lean_ratio, fat_ratio, barista_income, corpus, income, expenses, investments]);
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/fire/settings:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

router.get('/member-snapshot/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });
    const member = memberRes.rows[0];

    const age = member.dob ? calcAge(member.dob) : (member.age || null);
    const retirementAge = member.retirement_age || 60;

    const corpusRes = await query(
      'SELECT COALESCE(SUM(current_value), 0) AS total FROM portfolio_assets WHERE user_id = $1 AND member_id = $2',
      [req.userId, memberId]
    );
    const corpus = parseFloat(corpusRes.rows[0].total) || 0;

    const now = new Date();
    const months = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    let totalIncome = 0, totalExpenses = 0, totalInvestments = 0, countMonths = 0;
    for (const { year, month } of months) {
      const row = await query(
        'SELECT income, expenditure, investments FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
        [req.userId, memberId, year, month]
      );
      if (row.rows[0]) {
        totalIncome += parseFloat(row.rows[0].income) || 0;
        totalExpenses += parseFloat(row.rows[0].expenditure) || 0;
        totalInvestments += parseFloat(row.rows[0].investments) || 0;
        countMonths++;
      }
    }
    const avg = v => countMonths > 0 ? Math.round(v / countMonths) : 0;

    res.json({
      memberId,
      memberName: member.name,
      age,
      retirement_age: retirementAge,
      corpus,
      income: avg(totalIncome),
      expenses: avg(totalExpenses),
      investments: avg(totalInvestments),
      hasTrackerData: countMonths > 0,
    });
  } catch (err) {
    console.error('GET /api/fire/member-snapshot/:memberId:', err);
    res.status(500).json({ error: 'Failed to load member snapshot' });
  }
});

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

router.delete('/settings', async (req, res) => {
  try {
    await query('DELETE FROM fire_settings WHERE user_id = $1', [req.userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/fire/settings:', err);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router;
