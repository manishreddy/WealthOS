'use strict';

const express = require('express');
const { query } = require('../db');
const { getConfig, migrateOldConfig, computeYearlyProjections, DEFAULT_CONFIG, round2 } = require('../utils/projections-calc');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

const client = new Anthropic();

function fyToMonths(fy) {
  const months = [];
  for (let m = 4; m <= 12; m++) months.push({ year: fy - 1, month: m });
  for (let m = 1; m <= 3; m++) months.push({ year: fy, month: m });
  return months;
}

async function getActiveMembers(userId) {
  const res = await query(
    'SELECT id, name FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY display_order, id',
    [userId]
  );
  return res.rows;
}

router.get('/config', async (req, res) => {
  try {
    const members = await getActiveMembers(req.userId);
    const cfg = await getConfig(req.userId);
    const migrated = migrateOldConfig(cfg, members);
    res.json({ ...migrated, _members: members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/config', async (req, res) => {
  try {
    const current = await getConfig(req.userId);
    const updated = { ...current, ...req.body };
    delete updated._members;
    await query(`
      INSERT INTO financial_plan (user_id, config, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()
    `, [req.userId, JSON.stringify(updated)]);
    const members = await getActiveMembers(req.userId);
    res.json({ ...updated, _members: members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/yearly', async (req, res) => {
  try {
    const members = await getActiveMembers(req.userId);
    const cfg = await getConfig(req.userId);
    const migrated = migrateOldConfig(cfg, members);
    res.json(computeYearlyProjections(migrated, members));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/actuals', async (req, res) => {
  try {
    const startFY = parseInt(req.query.startFY) || 2024;
    const endFY = parseInt(req.query.endFY) || 2026;
    const result = [];

    for (let fy = startFY; fy <= endFY; fy++) {
      const months = fyToMonths(fy);
      let totalIncome = 0, totalExpenditure = 0, totalInvestments = 0;
      let hasData = false;

      for (const { year, month } of months) {
        const rowsRes = await query(
          'SELECT SUM(income) as inc, SUM(expenditure) as exp, SUM(investments) as inv FROM monthly_data WHERE user_id = $1 AND year = $2 AND month = $3',
          [req.userId, year, month]
        );
        const rows = rowsRes.rows[0];
        if (rows && (rows.inc || rows.exp || rows.inv)) {
          totalIncome += parseFloat(rows.inc) || 0;
          totalExpenditure += parseFloat(rows.exp) || 0;
          totalInvestments += parseFloat(rows.inv) || 0;
          hasData = true;
        }
      }

      if (hasData) {
        result.push({
          fy,
          actualIncomeLakhs: round2(totalIncome / 100000),
          actualExpenseLakhs: round2((totalExpenditure + totalInvestments) / 100000),
          actualSavingsLakhs: round2((totalIncome - totalExpenditure - totalInvestments) / 100000)
        });
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/ai-parse', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

    const defaultKeys = JSON.stringify({
      otherIncomeFY: 'other income in Lakhs for the current FY',
      otherGrowthRate: 'other income growth rate as decimal e.g. 0.05 for 5%',
      expenseInflationRate: 'general expense inflation as decimal',
      rentInflationRate: 'rent inflation as decimal',
      leisureInflationRate: 'leisure inflation as decimal',
      projectionEndFY: 'end FY year for projection e.g. 2080',
      monthlyExpenses: {
        rent: 'monthly rent in rupees',
        food: 'monthly food in rupees',
        utilities: 'monthly utilities in rupees',
        commute: 'monthly commute in rupees',
        shopping: 'monthly shopping in rupees',
        travelFamily: 'monthly family travel in rupees',
        entertainment: 'monthly entertainment in rupees',
        travelDomestic: 'monthly domestic leisure travel in rupees',
        travelInternational: 'monthly international travel in rupees',
        medical: 'monthly medical in rupees',
        insurance: 'monthly insurance in rupees',
        misc: 'monthly misc in rupees',
        events: 'monthly events in rupees',
        giftsFnF: 'monthly gifts to family and friends in rupees',
        personalExpense: 'monthly personal expenses in rupees',
        giftsSelf: 'monthly gifts to self in rupees',
        kidsGeneral: 'monthly kids general expenses in rupees',
        kidsEducation: 'monthly kids education in rupees',
      }
    }, null, 2);

    const prompt = `You are a financial data parser. Extract financial plan values from the user's text and return ONLY a valid JSON object.

Config keys to extract (only include keys you find in the text):
${defaultKeys}

Rules:
- Income values should be in Lakhs (divide rupees by 100000 if given in rupees)
- Growth rates and inflation rates must be decimals (e.g., 12% → 0.12)
- FY years are integers like 2045
- Monthly expense values in rupees (multiply if given in thousands)
- If a value is not mentioned, omit that key entirely
- Return ONLY the JSON object, no explanation

User text:
${text}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0].text.trim();
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      content.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) return res.status(422).json({ error: 'Could not extract config from AI response' });

    const parsed = JSON.parse(jsonMatch[1]);
    res.json(parsed);
  } catch (err) {
    console.error('POST /projections/ai-parse error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
