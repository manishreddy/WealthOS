'use strict';

const express = require('express');
const db = require('../db');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

// Helper: get last N months as [{year, month}]
function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

// Helper: format month label
function monthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

// POST /api/wealthbot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build financial context from db
    // 1. Family members
    const members = db.prepare(
      'SELECT * FROM family_members WHERE user_id = ? AND is_active = 1 ORDER BY display_order ASC'
    ).all(req.userId);

    // 2. User info
    const user = db.prepare('SELECT family_name FROM users WHERE id = ?').get(req.userId);
    const familyName = user ? user.family_name : 'Family';

    // 3. Last 3 months of income/expense/savings (all members)
    const last3Months = getLastNMonths(3);
    const monthlyContext = [];
    last3Months.forEach(({ year, month }) => {
      const rows = db.prepare(
        'SELECT md.*, fm.name as member_name FROM monthly_data md JOIN family_members fm ON md.member_id = fm.id WHERE md.user_id = ? AND md.year = ? AND md.month = ?'
      ).all(req.userId, year, month);

      if (rows.length > 0) {
        const label = monthLabel(year, month);
        const totalIncome = rows.reduce((s, r) => s + r.income, 0);
        const totalExpense = rows.reduce((s, r) => s + r.expenditure, 0);
        const totalInvestment = rows.reduce((s, r) => s + r.investments, 0);
        const totalSavings = totalIncome - totalExpense - totalInvestment;
        monthlyContext.push(
          `${label}: Income ₹${totalIncome.toLocaleString('en-IN')}, Expenses ₹${totalExpense.toLocaleString('en-IN')}, Investments ₹${totalInvestment.toLocaleString('en-IN')}, Savings ₹${totalSavings.toLocaleString('en-IN')}`
        );
      }
    });

    // 4. Portfolio summary
    const allAssets = db.prepare(
      'SELECT pa.*, fm.name as member_name FROM portfolio_assets pa JOIN family_members fm ON pa.member_id = fm.id WHERE pa.user_id = ? AND fm.is_active = 1'
    ).all(req.userId);
    const totalNetWorth = allAssets.reduce((s, a) => s + (a.current_value || 0), 0);
    const classMap = {};
    allAssets.forEach(a => {
      const cls = a.asset_class || 'Others';
      classMap[cls] = (classMap[cls] || 0) + (a.current_value || 0);
    });
    const portfolioBreakdown = Object.entries(classMap)
      .map(([cls, val]) => `${cls}: ₹${val.toLocaleString('en-IN')} (${totalNetWorth > 0 ? ((val / totalNetWorth) * 100).toFixed(1) : 0}%)`)
      .join(', ');

    // 5. Goals with progress
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? AND is_achieved = 0'
    ).all(req.userId);
    const goalsContext = goals.map(g => {
      const pct = g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(1) : 0;
      return `${g.name} (${g.goal_type}): Target ₹${g.target_amount.toLocaleString('en-IN')}, Current ₹${g.current_amount.toLocaleString('en-IN')} (${pct}%)`;
    }).join('; ');

    // 6. Current savings rate (last month)
    const lastMonth = getLastNMonths(1)[0];
    const lastMonthRows = db.prepare(
      'SELECT SUM(income) as ti, SUM(expenditure) as te, SUM(investments) as tinv FROM monthly_data WHERE user_id = ? AND year = ? AND month = ?'
    ).get(req.userId, lastMonth.year, lastMonth.month);
    let savingsRateStr = 'No data for last month';
    if (lastMonthRows && lastMonthRows.ti > 0) {
      const savingsRate = (((lastMonthRows.ti - lastMonthRows.te) / lastMonthRows.ti) * 100).toFixed(1);
      const investmentRate = ((lastMonthRows.tinv / lastMonthRows.ti) * 100).toFixed(1);
      savingsRateStr = `Savings rate: ${savingsRate}%, Investment rate: ${investmentRate}%`;
    }

    // Build system prompt
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

    // Build messages array
    const messages = [
      ...conversationHistory.filter(m => m.role && m.content),
      { role: 'user', content: message.trim() }
    ];

    // Call Anthropic API
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
      // Anthropic API error
      return res.status(502).json({ error: 'AI service error: ' + (err.message || 'Unknown error') });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
