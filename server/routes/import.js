'use strict';

const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../db');
const { readWorkbookFromBuffer, readCsvFromBuffer, sheetToArrayOfArrays, getSheetNames, getSheet } = require('../utils/excel');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const anthropic = new Anthropic();

async function sheetsToJson(workbook) {
  const result = {};
  for (const name of getSheetNames(workbook)) {
    const ws = getSheet(workbook, name);
    result[name] = sheetToArrayOfArrays(ws, null);
  }
  return result;
}

function buildSheetsDescription(sheetsJson) {
  let desc = '';
  for (const [name, rows] of Object.entries(sheetsJson)) {
    desc += `\n## Sheet: "${name}"\n`;
    const nonEmpty = rows.filter(r => r.some(v => v != null));
    nonEmpty.slice(0, 40).forEach((row, i) => {
      const vals = row.slice(0, 20).map(v => (v == null ? '' : String(v).substring(0, 40)));
      desc += `R${i + 1}: ${JSON.stringify(vals)}\n`;
    });
  }
  return desc;
}

router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = (req.file.originalname || '').split('.').pop().toLowerCase();
    let sheetsJson = {};

    if (ext === 'xlsx') {
      const wb = await readWorkbookFromBuffer(req.file.buffer);
      sheetsJson = await sheetsToJson(wb);
    } else if (ext === 'csv') {
      const wb = await readCsvFromBuffer(req.file.buffer);
      sheetsJson = await sheetsToJson(wb);
    } else if (ext === 'xls') {
      return res.status(400).json({ error: 'Legacy .xls format is not supported. Please save your file as .xlsx and try again.' });
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Upload .xlsx or .csv' });
    }

    const sheetDesc = buildSheetsDescription(sheetsJson);

    const membersRes = await query(
      'SELECT id, name, age FROM family_members WHERE user_id = $1 AND is_active = 1',
      [req.userId]
    );
    const members = membersRes.rows;
    const memberNames = members.map(m => m.name).join(', ');

    const prompt = `You are a financial data extraction expert for the WealthOS app.

The user has uploaded a financial planning spreadsheet. Family members in their account: ${memberNames || 'Manish, Raghavi'}.

Extract data into this exact JSON structure. Return ONLY the JSON object, no explanations.

{
  "portfolio": [
    {
      "memberId": null,
      "memberName": "string (exact name from family list, or 'Common' for shared)",
      "assetClass": "string (Mutual Funds | Stocks | FD/RD | PPF | NPS | EPF | Real Estate | Gold | ESOPs | Cash | Other)",
      "currentValue": number (in rupees, convert from lakhs if needed: multiply by 100000),
      "notes": "string or null"
    }
  ],
  "goals": [
    {
      "name": "string",
      "goalType": "string (Home Purchase | Vehicle | Education | Retirement | Child Expense | Emergency Fund | Other)",
      "targetAmount": number (in rupees),
      "currentAmount": number (in rupees, 0 if unknown),
      "targetDate": "YYYY" (just the year as string),
      "monthlyContribution": number (in rupees, 0 if unknown),
      "notes": "string or null"
    }
  ],
  "monthlyIncome": [
    {
      "memberName": "string (exact name from family list)",
      "yearlyIncome": number (in rupees for FY 2024 or earliest year),
      "monthlyIncome": number (in rupees)
    }
  ],
  "expenseCategories": [
    {
      "category": "string",
      "subcategory": "string",
      "monthlyAmount": number (in rupees, current/2024 value)
    }
  ],
  "retirementOverview": {
    "memberName": "string",
    "currentAge": number,
    "retirementAge": number,
    "corpusNeededLakhs": number
  }
}

Notes:
- All monetary values must be in RUPEES (multiply lakhs by 100000)
- For portfolio, split by member if data is available per member
- Goals are common (no memberName needed)
- For income, map column headers like "Manish", "Raghavi" to the respective members
- Include all goals found (House, Car, Education, Retirement, etc.)
- If a value is missing or unclear, use 0 or null

Here is the spreadsheet data:
${sheetDesc.substring(0, 8000)}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI could not parse the spreadsheet');

    const parsed = JSON.parse(jsonMatch[0]);

    const memberMap = {};
    for (const m of members) {
      memberMap[m.name.toLowerCase()] = m;
    }

    if (parsed.portfolio) {
      parsed.portfolio = parsed.portfolio.map(item => {
        const key = (item.memberName || '').toLowerCase();
        const member = memberMap[key];
        return { ...item, memberId: member ? member.id : null };
      });
    }
    if (parsed.monthlyIncome) {
      parsed.monthlyIncome = parsed.monthlyIncome.map(item => {
        const key = (item.memberName || '').toLowerCase();
        const member = memberMap[key];
        return { ...item, memberId: member ? member.id : null };
      });
    }

    return res.json({ success: true, data: parsed, members });
  } catch (err) {
    console.error('Import parse error:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse file' });
  }
});

router.post('/excel-to-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const wb = await readWorkbookFromBuffer(req.file.buffer);
    let text = '';

    for (const name of getSheetNames(wb)) {
      const ws = getSheet(wb, name);
      const rows = sheetToArrayOfArrays(ws, '');
      const nonEmpty = rows.filter(r => r.some(c => c !== '' && c != null));
      if (nonEmpty.length === 0) continue;
      text += `## Sheet: ${name}\n`;
      text += nonEmpty.map(r => r.map(c => String(c == null ? '' : c)).join('\t')).join('\n');
      text += '\n\n';
    }

    return res.json({ text: text.substring(0, 10000) });
  } catch (err) {
    console.error('excel-to-text error:', err);
    return res.status(500).json({ error: 'Failed to read file: ' + err.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { portfolio, goals, monthlyIncome, expenseCategories } = req.body;
    const userId = req.userId;
    const results = { portfolio: 0, goals: 0, monthlyIncome: 0 };
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (Array.isArray(portfolio)) {
      for (const item of portfolio) {
        if (!item.memberId || !item.assetClass) continue;
        const memberRes = await query('SELECT id FROM family_members WHERE id = $1 AND user_id = $2', [item.memberId, userId]);
        if (!memberRes.rows[0]) continue;

        await query(`
          INSERT INTO portfolio_assets (user_id, member_id, asset_type, name, asset_class, current_value, purchase_value, notes, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          userId,
          item.memberId,
          item.assetClass,
          item.assetClass,
          item.assetClass,
          Number(item.currentValue) || 0,
          Number(item.currentValue) || 0,
          item.notes || ''
        ]);
        results.portfolio++;
      }
      await query('UPDATE setup_progress SET portfolio_done = 1, updated_at = NOW() WHERE user_id = $1', [userId]);
    }

    if (Array.isArray(goals)) {
      for (const g of goals) {
        if (!g.name) continue;
        await query(`
          INSERT INTO goals (user_id, name, goal_type, target_amount, current_amount, monthly_contribution, target_date, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          userId,
          g.name,
          g.goalType || 'Other',
          Number(g.targetAmount) || 0,
          Number(g.currentAmount) || 0,
          Number(g.monthlyContribution) || 0,
          g.targetDate ? String(g.targetDate) : '',
          g.notes || ''
        ]);
        results.goals++;
      }
      await query('UPDATE setup_progress SET goals_done = 1, updated_at = NOW() WHERE user_id = $1', [userId]);
    }

    if (Array.isArray(monthlyIncome)) {
      for (const item of monthlyIncome) {
        if (!item.memberId) continue;
        const memberRes = await query('SELECT id FROM family_members WHERE id = $1 AND user_id = $2', [item.memberId, userId]);
        if (!memberRes.rows[0]) continue;

        const monthly = Number(item.monthlyIncome) || Math.round((Number(item.yearlyIncome) || 0) / 12);
        const incomeBreakup = JSON.stringify([{ id: 1, source: 'Salary', amount: monthly, type: 'salary' }]);

        const existingRes = await query(
          'SELECT id FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
          [userId, item.memberId, year, month]
        );

        if (existingRes.rows[0]) {
          await query('UPDATE monthly_data SET income = $1, income_breakup = $2 WHERE id = $3', [monthly, incomeBreakup, existingRes.rows[0].id]);
        } else {
          await query(`
            INSERT INTO monthly_data (user_id, member_id, year, month, income, income_breakup)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [userId, item.memberId, year, month, monthly, incomeBreakup]);
        }
        results.monthlyIncome++;
      }
      await query('UPDATE setup_progress SET monthly_done = 1, updated_at = NOW() WHERE user_id = $1', [userId]);
    }

    return res.json({ success: true, results });
  } catch (err) {
    console.error('Import save error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save import' });
  }
});

module.exports = router;
