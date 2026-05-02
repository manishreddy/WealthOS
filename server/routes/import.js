'use strict';

const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../db');
const { readWorkbookFromBuffer, readCsvFromBuffer, sheetToArrayOfArrays, getSheetNames, getSheet } = require('../utils/excel');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

function extractFirstJSON(raw) {
  const text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  const trimmed = text.trim();
  if (trimmed[0] === '[' || trimmed[0] === '{') {
    try { return JSON.parse(trimmed); } catch {}
  }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== '[' && ch !== '{') continue;
    let depth = 0, inStr = false, esc = false;
    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (esc)                 { esc = false; continue; }
      if (c === '\\' && inStr) { esc = true;  continue; }
      if (c === '"')           { inStr = !inStr; continue; }
      if (inStr)               { continue; }
      if (c === '[' || c === '{') depth++;
      else if (c === ']' || c === '}') {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(text.slice(i, j + 1)); } catch { break; }
        }
      }
    }
  }
  return null;
}

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

The user has uploaded a financial planning spreadsheet. Family members in their account: ${memberNames || 'family members'}.

Extract data into this exact JSON structure. Return ONLY the JSON object, no explanation or commentary.

{
  "portfolio": [
    {
      "memberId": null,
      "memberName": "string — must be exactly one of: ${memberNames || 'family members'}",
      "assetClass": "string — must be exactly one of: Mutual Funds | Stocks | FD/RD | PPF | NPS | EPF | Real Estate | Gold | ESOPs | Cash | Other",
      "currentValue": number (in rupees — convert lakhs ×100000, crores ×10000000),
      "notes": "string or null"
    }
  ],
  "goals": [
    {
      "name": "string",
      "goalType": "string — must be exactly one of: Home Purchase | Vehicle | Education | Retirement | Child Expense | Emergency Fund | Other",
      "targetAmount": number (in rupees),
      "currentAmount": number (in rupees, 0 if unknown),
      "targetDate": "YYYY (year only as string)",
      "monthlyContribution": number (in rupees, 0 if unknown),
      "notes": "string or null"
    }
  ],
  "monthlyIncome": [
    {
      "memberName": "string — must exactly match a name from: ${memberNames || 'family members'}",
      "yearlyIncome": number (in rupees for FY 2024 or earliest year),
      "monthlyIncome": number (in rupees)
    }
  ],
  "expenseCategories": [
    {
      "category": "string (e.g. Housing, Food, Transport, Entertainment, Healthcare, Education, Utilities, Other)",
      "subcategory": "string (e.g. Rent, Groceries, EMI — empty string if none)",
      "monthlyAmount": number (in rupees, current/2024 monthly value)
    }
  ],
  "retirementOverview": {
    "memberName": "string — must exactly match a name from: ${memberNames || 'family members'}",
    "currentAge": number,
    "retirementAge": number,
    "corpusNeededLakhs": number
  }
}

Rules:
- Return ONLY valid JSON. No explanation, no markdown, no extra text.
- All monetary values must be in RUPEES (multiply lakhs by 100000, crores by 10000000).
- memberName values must exactly match the names listed above.
- assetClass and goalType must be exactly one of the allowed enum values.
- For portfolio, split by member if per-member data is available.
- Goals are shared (no memberName needed for goals).
- If a value is missing or unclear, use 0 for numbers or null for strings.

Here is the spreadsheet data:
${sheetDesc.substring(0, 8000)}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content.filter(b => b.type === 'text').map(b => b.text).join('');
    console.log('[import/parse] raw AI response (first 600 chars):', raw.substring(0, 600));
    const parsed = extractFirstJSON(raw);
    if (!parsed) throw new Error('AI could not extract structured data from the spreadsheet. Please ensure the file contains recognisable financial data.');

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

    const ext = (req.file.originalname || '').split('.').pop().toLowerCase();
    if (ext === 'xls') {
      return res.status(400).json({ error: 'Legacy .xls format is not supported. Please save your file as .xlsx and try again.' });
    }

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
    const { portfolio, goals, monthlyIncome, expenseCategories, retirementOverview } = req.body;
    const userId = req.userId;
    const results = { portfolio: 0, goals: 0, monthlyIncome: 0, expenseCategories: 0, retirement: 0 };
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

    if (Array.isArray(expenseCategories) && expenseCategories.length > 0) {
      const expBreakup = expenseCategories.map((ec, i) => ({
        id: i + 1,
        source: ec.subcategory ? `${ec.category}: ${ec.subcategory}` : (ec.category || 'Expense'),
        amount: Number(ec.monthlyAmount) || 0,
        type: 'expense'
      })).filter(e => e.amount > 0);

      const totalExpense = expBreakup.reduce((s, e) => s + e.amount, 0);

      let targetMemberId = null;
      if (Array.isArray(monthlyIncome) && monthlyIncome.length > 0 && monthlyIncome[0].memberId) {
        targetMemberId = monthlyIncome[0].memberId;
      } else {
        const firstMember = await query(
          'SELECT id FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY display_order, id LIMIT 1',
          [userId]
        );
        if (firstMember.rows[0]) targetMemberId = firstMember.rows[0].id;
      }

      if (targetMemberId) {
        const existingRes = await query(
          'SELECT id FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
          [userId, targetMemberId, year, month]
        );
        if (existingRes.rows[0]) {
          await query(
            'UPDATE monthly_data SET expenditure = $1, expense_breakup = $2 WHERE id = $3',
            [totalExpense, JSON.stringify(expBreakup), existingRes.rows[0].id]
          );
        } else {
          await query(
            'INSERT INTO monthly_data (user_id, member_id, year, month, expenditure, expense_breakup) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, targetMemberId, year, month, totalExpense, JSON.stringify(expBreakup)]
          );
        }
        results.expenseCategories = expBreakup.length;
        await query('UPDATE setup_progress SET monthly_done = 1, updated_at = NOW() WHERE user_id = $1', [userId]);
      }
    }

    if (retirementOverview) {
      const items = Array.isArray(retirementOverview) ? retirementOverview : [retirementOverview];
      const membersRes = await query(
        'SELECT id, name FROM family_members WHERE user_id = $1 AND is_active = 1',
        [userId]
      );
      const memberList = membersRes.rows;

      const existingPlan = await query('SELECT config FROM financial_plan WHERE user_id = $1', [userId]);
      const currentConfig = existingPlan.rows[0]
        ? JSON.parse(existingPlan.rows[0].config || '{}')
        : {};

      for (const ro of items) {
        const name = (ro.memberName || '').toLowerCase();
        const member = memberList.find(m => m.name.toLowerCase() === name || m.name.toLowerCase().startsWith(name.split(' ')[0]));
        if (!member) continue;

        const firstName = member.name.split(' ')[0].toLowerCase();
        const currentAge = Number(ro.currentAge) || 0;
        const retirementAge = Number(ro.retirementAge) || 60;
        const yearsToRetire = Math.max(retirementAge - currentAge, 0);
        const retireFY = year + yearsToRetire;

        currentConfig[`${firstName}RetireFY`] = retireFY;
        if (ro.corpusNeededLakhs) {
          currentConfig[`${firstName}CorpusNeededLakhs`] = Number(ro.corpusNeededLakhs);
        }
        results.retirement++;
      }

      await query(
        `INSERT INTO financial_plan (user_id, config, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()`,
        [userId, JSON.stringify(currentConfig)]
      );
    }

    return res.json({ success: true, results });
  } catch (err) {
    console.error('Import save error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save import' });
  }
});

module.exports = router;
