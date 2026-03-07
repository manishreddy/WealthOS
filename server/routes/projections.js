'use strict';

const express = require('express');
const db = require('../db');
const { getConfig, computeYearlyProjections, DEFAULT_CONFIG, round2 } = require('../utils/projections-calc');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

const client = new Anthropic();

// Helper: convert FY to list of {year, month} pairs (India: April-March)
function fyToMonths(fy) {
  const months = [];
  for (let m = 4; m <= 12; m++) months.push({ year: fy - 1, month: m });
  for (let m = 1; m <= 3; m++) months.push({ year: fy, month: m });
  return months;
}

// GET /api/projections/config
router.get('/config', (req, res) => {
  try {
    res.json(getConfig(req.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/projections/config
router.put('/config', (req, res) => {
  try {
    const current = getConfig(req.userId);
    const updated = { ...current, ...req.body };
    db.prepare(`
      INSERT INTO financial_plan (user_id, config, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET config = excluded.config, updated_at = CURRENT_TIMESTAMP
    `).run(req.userId, JSON.stringify(updated));
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projections/yearly - computed yearly projections
router.get('/yearly', (req, res) => {
  try {
    const cfg = getConfig(req.userId);
    res.json(computeYearlyProjections(cfg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projections/actuals?startFY=2024&endFY=2026
// Returns actual income/expense/savings aggregated by FY from monthly_data
router.get('/actuals', (req, res) => {
  try {
    const startFY = parseInt(req.query.startFY) || 2024;
    const endFY = parseInt(req.query.endFY) || 2026;
    const result = [];

    for (let fy = startFY; fy <= endFY; fy++) {
      const months = fyToMonths(fy);
      let totalIncome = 0, totalExpenditure = 0, totalInvestments = 0;
      let hasData = false;

      for (const { year, month } of months) {
        const rows = db.prepare(
          'SELECT SUM(income) as inc, SUM(expenditure) as exp, SUM(investments) as inv FROM monthly_data WHERE user_id = ? AND year = ? AND month = ?'
        ).get(req.userId, year, month);
        if (rows && (rows.inc || rows.exp || rows.inv)) {
          totalIncome += rows.inc || 0;
          totalExpenditure += rows.exp || 0;
          totalInvestments += rows.inv || 0;
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

// POST /api/projections/ai-parse — parse freeform financial plan text into config
router.post('/ai-parse', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

    const defaultKeys = JSON.stringify({
      manishIncomeFY2025: 'annual income for person 1 in Lakhs for FY2025',
      raghaviIncomeFY2025: 'annual income for person 2 in Lakhs for FY2025',
      otherIncomeFY2025: 'other income in Lakhs',
      manishGrowthRate: 'salary growth rate for person 1 as decimal e.g. 0.12 for 12%',
      raghaviGrowthRate: 'salary growth rate for person 2 as decimal',
      manishRetireFY: 'retirement FY year for person 1 e.g. 2045',
      raghaviRetireFY: 'retirement FY year for person 2',
      expenseInflationRate: 'general expense inflation as decimal',
      rentInflationRate: 'rent inflation as decimal',
      leisureInflationRate: 'leisure inflation as decimal',
      projectionEndFY: 'end FY year for projection e.g. 2065',
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
    // Extract JSON from response
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
