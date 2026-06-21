'use strict';

const express = require('express');
const { query } = require('../db');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

function monthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const membersRes = await query(
      'SELECT * FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY display_order ASC',
      [req.userId]
    );
    const members = membersRes.rows;

    const userRes = await query('SELECT family_name FROM users WHERE id = $1', [req.userId]);
    const familyName = userRes.rows[0] ? userRes.rows[0].family_name : 'Family';

    const last3Months = getLastNMonths(3);
    const monthlyContext = [];
    for (const { year, month } of last3Months) {
      const rowsRes = await query(
        'SELECT md.*, fm.name as member_name FROM monthly_data md JOIN family_members fm ON md.member_id = fm.id WHERE md.user_id = $1 AND md.year = $2 AND md.month = $3',
        [req.userId, year, month]
      );
      const rows = rowsRes.rows;
      if (rows.length > 0) {
        const label = monthLabel(year, month);
        const totalIncome = rows.reduce((s, r) => s + parseFloat(r.income), 0);
        const totalExpense = rows.reduce((s, r) => s + parseFloat(r.expenditure), 0);
        const totalInvestment = rows.reduce((s, r) => s + parseFloat(r.investments), 0);
        const totalSavings = totalIncome - totalExpense - totalInvestment;
        monthlyContext.push(
          `${label}: Income ₹${totalIncome.toLocaleString('en-IN')}, Expenses ₹${totalExpense.toLocaleString('en-IN')}, Investments ₹${totalInvestment.toLocaleString('en-IN')}, Savings ₹${totalSavings.toLocaleString('en-IN')}`
        );
      }
    }

    const allAssetsRes = await query(
      'SELECT pa.*, fm.name as member_name FROM portfolio_assets pa JOIN family_members fm ON pa.member_id = fm.id WHERE pa.user_id = $1 AND fm.is_active = 1',
      [req.userId]
    );
    const allAssets = allAssetsRes.rows;
    const totalNetWorth = allAssets.reduce((s, a) => s + parseFloat(a.current_value || 0), 0);
    const classMap = {};
    allAssets.forEach(a => {
      const cls = a.asset_class || 'Others';
      classMap[cls] = (classMap[cls] || 0) + parseFloat(a.current_value || 0);
    });
    const portfolioBreakdown = Object.entries(classMap)
      .map(([cls, val]) => `${cls}: ₹${val.toLocaleString('en-IN')} (${totalNetWorth > 0 ? ((val / totalNetWorth) * 100).toFixed(1) : 0}%)`)
      .join(', ');

    const goalsRes = await query(
      'SELECT * FROM goals WHERE user_id = $1 AND is_achieved = 0',
      [req.userId]
    );
    const goalsContext = goalsRes.rows.map(g => {
      const ta = parseFloat(g.target_amount);
      const ca = parseFloat(g.current_amount);
      const pct = ta > 0 ? ((ca / ta) * 100).toFixed(1) : 0;
      return `${g.name} (${g.goal_type}): Target ₹${ta.toLocaleString('en-IN')}, Current ₹${ca.toLocaleString('en-IN')} (${pct}%)`;
    }).join('; ');

    const lastMonth = getLastNMonths(1)[0];
    const lastMonthRes = await query(
      'SELECT SUM(income) as ti, SUM(expenditure) as te, SUM(investments) as tinv FROM monthly_data WHERE user_id = $1 AND year = $2 AND month = $3',
      [req.userId, lastMonth.year, lastMonth.month]
    );
    const lastMonthRows = lastMonthRes.rows[0];
    let savingsRateStr = 'No data for last month';
    if (lastMonthRows && parseFloat(lastMonthRows.ti) > 0) {
      const ti = parseFloat(lastMonthRows.ti);
      const te = parseFloat(lastMonthRows.te);
      const tinv = parseFloat(lastMonthRows.tinv);
      const savingsRate = (((ti - te) / ti) * 100).toFixed(1);
      const investmentRate = ((tinv / ti) * 100).toFixed(1);
      savingsRateStr = `Savings rate: ${savingsRate}%, Investment rate: ${investmentRate}%`;
    }

    const membersStr = members.map(m => `${m.name} (age ${m.age || 'N/A'}, ${m.risk_profile} risk)`).join(', ');
    const systemPrompt = `You are WealthBot, a personal financial advisor for an Indian family. You have access to their actual financial data below. Give specific, actionable advice based on their real numbers. Keep responses concise (2-3 paragraphs max). Use Indian financial terminology (SIP, mutual funds, PPF, ELSS, etc.).

Family Financial Summary:
- Family Name: ${familyName}
- Members: ${membersStr || 'None added yet'}
- Total Net Worth: ₹${totalNetWorth.toLocaleString('en-IN')}
- Portfolio Breakdown: ${portfolioBreakdown || 'No assets added yet'}
- Recent Monthly Data (last 3 months): ${monthlyContext.length > 0 ? monthlyContext.join(' | ') : 'No data available'}
- Current Month Metrics: ${savingsRateStr}
- Active Goals: ${goalsContext || 'No active goals'}`;

    const messages = [
      ...conversationHistory.filter(m => m.role && m.content),
      { role: 'user', content: message.trim() }
    ];

    const _k = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    const _b = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || process.env.ANTHROPIC_BASE_URL;
    const client = new Anthropic({ ...(_k && { apiKey: _k }), ...(_b && { baseURL: _b }) });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    });

    const reply = response.content && response.content[0] && response.content[0].text
      ? response.content[0].text
      : 'I apologize, I could not generate a response. Please try again.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('POST /wealthbot/chat error:', err);
    if (err.status) {
      return res.status(502).json({ error: 'AI service error: ' + (err.message || 'Unknown error') });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
