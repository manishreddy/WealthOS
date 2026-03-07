'use strict';

const express = require('express');
const db = require('../db');
const { getConfig, computeYearlyProjections } = require('../utils/projections-calc');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

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

// GET /api/planning/retirement/:memberId
router.get('/retirement/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const age = member.age || 30;

    // Get average monthly investment from last 6 months
    const last6Months = getLastNMonths(6);
    let totalInvestments = 0;
    let countMonths = 0;
    last6Months.forEach(({ year, month }) => {
      const row = db.prepare(
        'SELECT investments FROM monthly_data WHERE user_id = ? AND member_id = ? AND year = ? AND month = ?'
      ).get(req.userId, memberId, year, month);
      if (row) {
        totalInvestments += row.investments || 0;
        countMonths++;
      }
    });
    const avgMonthlyInvestment = countMonths > 0 ? totalInvestments / countMonths : 0;

    // Get total portfolio value for this member
    const portfolioRow = db.prepare(
      'SELECT SUM(current_value) as total FROM portfolio_assets WHERE user_id = ? AND member_id = ?'
    ).get(req.userId, memberId);
    const currentPortfolio = portfolioRow && portfolioRow.total ? portfolioRow.total : 0;

    // Determine return rate from risk_profile
    const riskProfile = member.risk_profile || 'moderate';
    let annualReturnRate;
    if (riskProfile === 'conservative') {
      annualReturnRate = 0.08;
    } else if (riskProfile === 'aggressive') {
      annualReturnRate = 0.15;
    } else {
      annualReturnRate = 0.12; // moderate
    }

    const yearsToRetirement = Math.max(60 - age, 1);
    const r = annualReturnRate;
    const n = yearsToRetirement;

    // Corpus = currentPortfolio * (1+r)^n + annualInvestment * ((1+r)^n - 1) / r
    const annualInvestment = avgMonthlyInvestment * 12;
    const growthFactor = Math.pow(1 + r, n);
    let corpusAtRetirement;
    if (r === 0) {
      corpusAtRetirement = currentPortfolio + annualInvestment * n;
    } else {
      corpusAtRetirement = currentPortfolio * growthFactor + annualInvestment * (growthFactor - 1) / r;
    }

    // Monthly pension using 4% safe withdrawal rate
    const monthlyPensionEstimate = (corpusAtRetirement * 0.04) / 12;

    return res.status(200).json({
      memberId,
      memberName: member.name,
      age,
      yearsToRetirement,
      currentPortfolio: parseFloat(currentPortfolio.toFixed(2)),
      avgMonthlyInvestment: parseFloat(avgMonthlyInvestment.toFixed(2)),
      annualReturnRate: r,
      corpusAtRetirement: parseFloat(corpusAtRetirement.toFixed(2)),
      monthlyPensionEstimate: parseFloat(monthlyPensionEstimate.toFixed(2))
    });
  } catch (err) {
    console.error('GET /planning/retirement/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: compute tax summary from a tax_planning record (or defaults)
function computeTaxSummary(data) {
  const grossSalary = data.gross_salary || 0;
  const hraReceived = data.hra_received || 0;
  const hraClaimed = data.hra_claimed || 0;
  const sec80c = data.sec_80c || 0;
  const sec80d = data.sec_80d || 0;
  const sec80ccd1b = data.sec_80ccd1b || 0;
  const homeLoanInterest = data.home_loan_interest || 0;
  const otherDeductions = data.other_deductions || 0;

  const standardDeduction = 50000;
  const effectiveHra = Math.min(hraReceived, hraReceived * 0.5); // simplified HRA
  const totalDeductions = standardDeduction
    + Math.min(sec80c, 150000)
    + Math.min(sec80d, 25000)
    + Math.min(sec80ccd1b, 50000)
    + homeLoanInterest
    + otherDeductions
    + effectiveHra;

  const taxableIncome = Math.max(grossSalary - totalDeductions, 0);
  const remaining80c = Math.max(150000 - sec80c, 0);
  const remaining80d = Math.max(25000 - sec80d, 0);
  const remaining80ccd1b = Math.max(50000 - sec80ccd1b, 0);

  return {
    taxYear: data.tax_year || '',
    grossSalary,
    hraReceived,
    hraClaimed,
    sec80c,
    sec80d,
    sec80ccd1b,
    homeLoanInterest,
    otherDeductions,
    standardDeduction,
    effectiveHra: parseFloat(effectiveHra.toFixed(2)),
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    taxableIncome: parseFloat(taxableIncome.toFixed(2)),
    remaining80c: parseFloat(remaining80c.toFixed(2)),
    remaining80d: parseFloat(remaining80d.toFixed(2)),
    remaining80ccd1b: parseFloat(remaining80ccd1b.toFixed(2))
  };
}

// GET /api/planning/tax/:memberId?year=FY2025-26
router.get('/tax/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const taxYear = req.query.year || 'FY2025-26';

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const taxData = db.prepare(
      'SELECT * FROM tax_planning WHERE user_id = ? AND member_id = ? AND tax_year = ?'
    ).get(req.userId, memberId, taxYear);

    const data = taxData || {
      tax_year: taxYear,
      gross_salary: 0,
      hra_received: 0,
      hra_claimed: 0,
      sec_80c: 0,
      sec_80d: 0,
      sec_80ccd1b: 0,
      home_loan_interest: 0,
      other_deductions: 0
    };

    return res.status(200).json(computeTaxSummary(data));
  } catch (err) {
    console.error('GET /planning/tax/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/planning/tax/:memberId - upsert tax planning data
router.put('/tax/:memberId', (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    // Verify member belongs to this user
    const member = db.prepare(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?'
    ).get(memberId, req.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const {
      taxYear = 'FY2025-26',
      grossSalary = 0,
      hraReceived = 0,
      hraClaimed = 0,
      sec80c = 0,
      sec80d = 0,
      sec80ccd1b = 0,
      homeLoanInterest = 0,
      otherDeductions = 0
    } = req.body;

    db.prepare(`
      INSERT INTO tax_planning (user_id, member_id, tax_year, gross_salary, hra_received, hra_claimed, sec_80c, sec_80d, sec_80ccd1b, home_loan_interest, other_deductions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, member_id, tax_year) DO UPDATE SET
        gross_salary = excluded.gross_salary,
        hra_received = excluded.hra_received,
        hra_claimed = excluded.hra_claimed,
        sec_80c = excluded.sec_80c,
        sec_80d = excluded.sec_80d,
        sec_80ccd1b = excluded.sec_80ccd1b,
        home_loan_interest = excluded.home_loan_interest,
        other_deductions = excluded.other_deductions
    `).run(
      req.userId, memberId, taxYear,
      parseFloat(grossSalary), parseFloat(hraReceived), parseFloat(hraClaimed),
      parseFloat(sec80c), parseFloat(sec80d), parseFloat(sec80ccd1b),
      parseFloat(homeLoanInterest), parseFloat(otherDeductions)
    );

    // Update setup progress
    db.prepare(
      'UPDATE setup_progress SET planning_done = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(req.userId);

    const saved = db.prepare(
      'SELECT * FROM tax_planning WHERE user_id = ? AND member_id = ? AND tax_year = ?'
    ).get(req.userId, memberId, taxYear);

    return res.status(200).json(computeTaxSummary(saved));
  } catch (err) {
    console.error('PUT /planning/tax/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/planning/networth-projection
router.get('/networth-projection', (req, res) => {
  try {
    // Get total current portfolio value
    const portfolioRow = db.prepare(
      'SELECT SUM(pa.current_value) as total FROM portfolio_assets pa JOIN family_members fm ON pa.member_id = fm.id WHERE pa.user_id = ? AND fm.is_active = 1'
    ).get(req.userId);
    const currentPortfolio = portfolioRow && portfolioRow.total ? portfolioRow.total : 0;

    // Get average total monthly investment from last 3 months (all members combined)
    const last3Months = getLastNMonths(3);
    let totalMonthlyInvestment = 0;
    let countMonths = 0;
    last3Months.forEach(({ year, month }) => {
      const row = db.prepare(
        'SELECT SUM(investments) as total_inv FROM monthly_data WHERE user_id = ? AND year = ? AND month = ?'
      ).get(req.userId, year, month);
      if (row && row.total_inv !== null) {
        totalMonthlyInvestment += row.total_inv;
        countMonths++;
      }
    });
    const avgMonthlyInvestment = countMonths > 0 ? totalMonthlyInvestment / countMonths : 0;
    const annualInvestment = avgMonthlyInvestment * 12;
    const r = 0.12;

    const currentYear = new Date().getFullYear();
    const projections = [];

    for (let y = 1; y <= 10; y++) {
      const growthFactor = Math.pow(1 + r, y);
      let projected;
      if (r === 0) {
        projected = currentPortfolio + annualInvestment * y;
      } else {
        projected = currentPortfolio * growthFactor + annualInvestment * (growthFactor - 1) / r;
      }
      projections.push({
        year: y,
        projected: parseFloat(projected.toFixed(2)),
        label: String(currentYear + y)
      });
    }

    return res.status(200).json(projections);
  } catch (err) {
    console.error('GET /planning/networth-projection error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Helper: last N months ──────────────────────────────────────────────────
function getLastNMonthsList(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

// ── Helper: months between now and target date ────────────────────────────
function calcMonthsRemaining(targetDate) {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;
  return Math.max((target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()), 0);
}

// ── Helper: required monthly SIP ─────────────────────────────────────────
function calcRequiredSip(targetAmount, currentAmount, months) {
  const remaining = Math.max(targetAmount - currentAmount, 0);
  if (months <= 0) return remaining;
  const rm = 0.12 / 12;
  const factor = Math.pow(1 + rm, months);
  if (factor === 1) return remaining / months;
  return (remaining * rm) / (factor - 1);
}

// GET /api/planning/comprehensive
router.get('/comprehensive', (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const currentFY = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();

    // 1. Members
    const members = db.prepare(
      'SELECT * FROM family_members WHERE user_id = ? AND is_active = 1 ORDER BY id'
    ).all(userId);

    // 2. Portfolio by member
    const portfolioRows = db.prepare(
      'SELECT member_id, SUM(current_value) as total FROM portfolio_assets WHERE user_id = ? GROUP BY member_id'
    ).all(userId);
    const portfolioByMember = {};
    portfolioRows.forEach(r => { portfolioByMember[r.member_id] = r.total || 0; });

    // 3. SIP by member (active savings_plan)
    const sipRows = db.prepare(
      'SELECT member_id, SUM(amount) as total FROM savings_plan WHERE user_id = ? AND is_active = 1 GROUP BY member_id'
    ).all(userId);
    const sipByMember = {};
    sipRows.forEach(r => { sipByMember[r.member_id] = r.total || 0; });

    // 4. Goals (not achieved)
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? AND is_achieved = 0 ORDER BY target_date ASC'
    ).all(userId);

    // 5. Projection config & yearly projections
    const projConfig = getConfig(userId);
    const yearlyProj = computeYearlyProjections(projConfig);
    const projByFY = {};
    yearlyProj.forEach(p => { projByFY[p.fy] = p; });

    // 6. Last month actuals (last 3 months for income/expense)
    const last3 = getLastNMonthsList(3);
    let lastIncome = 0, lastExpense = 0, dataMonths = 0;
    last3.forEach(({ year, month }) => {
      const row = db.prepare(
        'SELECT SUM(income) as inc, SUM(expenditure) as exp FROM monthly_data WHERE user_id = ? AND year = ? AND month = ?'
      ).get(userId, year, month);
      if (row && (row.inc || row.exp)) {
        lastIncome += row.inc || 0;
        lastExpense += row.exp || 0;
        dataMonths++;
      }
    });
    const totalMonthlyIncome = dataMonths > 0 ? lastIncome / dataMonths : 0;
    const totalMonthlyExpense = dataMonths > 0 ? lastExpense / dataMonths : 0;

    // Avg monthly investment per member from last 6 months (fallback for missing SIP data)
    const last6 = getLastNMonthsList(6);
    const avgFromMonthly = {};
    if (members.length > 0) {
      members.forEach(m => {
        let total = 0, cnt = 0;
        last6.forEach(({ year, month }) => {
          const row = db.prepare(
            'SELECT investments FROM monthly_data WHERE user_id = ? AND member_id = ? AND year = ? AND month = ?'
          ).get(userId, m.id, year, month);
          if (row && row.investments) { total += row.investments; cnt++; }
        });
        avgFromMonthly[m.id] = cnt > 0 ? total / cnt : 0;
      });
    }

    // 7. Per-member calculations
    const rateMap = { conservative: 0.08, moderate: 0.12, aggressive: 0.15 };
    const inflationRate = projConfig.expenseInflationRate || 0.06;

    const totalGoalSip = goals.reduce((s, g) => s + (g.monthly_contribution || 0), 0);

    const memberResults = members.map(member => {
      const riskProfile = member.risk_profile || 'moderate';
      const returnRate = rateMap[riskProfile] || 0.12;
      const age = member.age || 30;

      // Retire FY from config or default to 60
      const nameKey = (member.name || '').toLowerCase().replace(/\s+/g, '') + 'RetireFY';
      const retireFY = projConfig[nameKey] || (currentFY + Math.max(60 - age, 1));
      const yearsToRetire = Math.max(retireFY - currentFY, 1);

      const currentCorpus = portfolioByMember[member.id] || 0;
      const avgMonthlySip = sipByMember[member.id] || avgFromMonthly[member.id] || 0;
      const annualSip = avgMonthlySip * 12;

      const r = returnRate;
      const n = yearsToRetire;
      const gf = Math.pow(1 + r, n);
      const corpusAtRetire = r === 0
        ? currentCorpus + annualSip * n
        : currentCorpus * gf + annualSip * (gf - 1) / r;
      const monthlyPension = (corpusAtRetire * 0.04) / 12;

      // Post-retirement drawdown (30 years)
      const projAtRetire = projByFY[retireFY] || yearlyProj[yearlyProj.length - 1] || { totalExpenses: 0 };
      const baseMonthlyExpense = projAtRetire.totalExpenses * 100000 / 12;
      const postReturn = 0.07;
      const drawdown = [];
      let corpus = corpusAtRetire;
      let corpusDepletedAtYear = null;
      for (let y = 1; y <= 30; y++) {
        const annualExpense = baseMonthlyExpense * 12 * Math.pow(1 + inflationRate, y);
        corpus = corpus * (1 + postReturn) - annualExpense;
        drawdown.push({ year: y, corpus: Math.round(corpus), annualExpense: Math.round(annualExpense) });
        if (corpus <= 0 && corpusDepletedAtYear === null) {
          corpusDepletedAtYear = y;
          break;
        }
      }

      // Goal impact on corpus
      const numMembers = members.length || 1;
      const sipWithoutGoals = avgMonthlySip + totalGoalSip / numMembers;
      const corpusWithout = r === 0
        ? currentCorpus + (sipWithoutGoals * 12) * n
        : currentCorpus * gf + (sipWithoutGoals * 12) * (gf - 1) / r;
      const goalImpact = corpusWithout - corpusAtRetire;

      return {
        id: member.id,
        name: member.name,
        age,
        riskProfile,
        returnRate,
        retireFY,
        yearsToRetire,
        currentCorpus: Math.round(currentCorpus),
        avgMonthlySip: Math.round(avgMonthlySip),
        corpusAtRetirement: Math.round(corpusAtRetire),
        monthlyPension4pct: Math.round(monthlyPension),
        goalImpactOnCorpus: Math.round(goalImpact),
        postRetirementDrawdown: drawdown,
        corpusDepletedAtYear
      };
    });

    // 8. Per-goal calculations
    const goalResults = goals.map(goal => {
      const monthsLeft = calcMonthsRemaining(goal.target_date);
      const requiredSip = calcRequiredSip(goal.target_amount, goal.current_amount, monthsLeft);
      const isOnTrack = (goal.monthly_contribution || 0) >= requiredSip;
      const shortfall = Math.max(0, requiredSip - (goal.monthly_contribution || 0));
      const surplus = Math.max(0, (goal.monthly_contribution || 0) - requiredSip);
      const progressPct = goal.target_amount > 0
        ? parseFloat(((goal.current_amount / goal.target_amount) * 100).toFixed(2))
        : 0;

      let completionFY = null;
      if (goal.target_date) {
        const td = new Date(goal.target_date);
        completionFY = td.getMonth() >= 3 ? td.getFullYear() + 1 : td.getFullYear();
      }

      return {
        id: goal.id,
        name: goal.name,
        goalType: goal.goal_type,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        monthlyContribution: goal.monthly_contribution || 0,
        targetDate: goal.target_date,
        requiredMonthlySip: Math.round(requiredSip),
        isOnTrack,
        shortfall: Math.round(shortfall),
        surplus: Math.round(surplus),
        monthsRemaining: monthsLeft,
        completionFY,
        progressPct,
        sipFreedAtCompletion: goal.monthly_contribution || 0,
        assignedMembers: JSON.parse(goal.assigned_members || '[]'),
        notes: goal.notes
      };
    });

    // 9. Summary
    const totalFamilyCorpus = Object.values(portfolioByMember).reduce((s, v) => s + v, 0);
    const totalFamilyMonthlySip = Object.values(sipByMember).reduce((s, v) => s + v, 0);
    const totalGoalMonthlyCommit = goals.reduce((s, g) => s + (g.monthly_contribution || 0), 0);
    const freeMonthlySavings = totalMonthlyIncome - totalMonthlyExpense - totalFamilyMonthlySip - totalGoalMonthlyCommit;
    const goalsOnTrack = goalResults.filter(g => g.isOnTrack).length;
    const goalsOffTrack = goalResults.filter(g => !g.isOnTrack).length;

    // 10. Timeline
    const timeline = [];
    goalResults.forEach(g => {
      if (g.completionFY) {
        timeline.push({ fy: g.completionFY, type: 'goal_complete', goalName: g.name, sipFreed: g.sipFreedAtCompletion });
      }
    });
    memberResults.forEach(m => {
      timeline.push({ fy: m.retireFY, type: 'retirement', memberName: m.name, corpus: m.corpusAtRetirement });
    });
    timeline.sort((a, b) => a.fy - b.fy);

    return res.json({
      summary: {
        totalFamilyCorpus: Math.round(totalFamilyCorpus),
        totalMonthlyIncome: Math.round(totalMonthlyIncome),
        totalMonthlyExpense: Math.round(totalMonthlyExpense),
        totalFamilyMonthlySip: Math.round(totalFamilyMonthlySip),
        totalGoalMonthlyCommit: Math.round(totalGoalMonthlyCommit),
        freeMonthlySavings: Math.round(freeMonthlySavings),
        goalsOnTrack,
        goalsOffTrack,
        totalGoals: goals.length
      },
      members: memberResults,
      goals: goalResults,
      timeline,
      yearlyProjections: yearlyProj,
      config: projConfig
    });
  } catch (err) {
    console.error('GET /planning/comprehensive error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/planning/ai-insights
router.post('/ai-insights', async (req, res) => {
  try {
    const { comprehensiveData } = req.body;
    if (!comprehensiveData) return res.status(400).json({ error: 'comprehensiveData is required' });

    const { summary, members, goals } = comprehensiveData;
    const fmt = v => {
      if (v == null) return '₹0';
      const n = Number(v);
      if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
      if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
      return '₹' + n.toLocaleString('en-IN');
    };

    let contextStr = `FAMILY FINANCIAL SNAPSHOT\n`;
    contextStr += `Total Family Corpus: ${fmt(summary.totalFamilyCorpus)}\n`;
    contextStr += `Monthly Income: ${fmt(summary.totalMonthlyIncome)} | Expenses: ${fmt(summary.totalMonthlyExpense)}\n`;
    contextStr += `Family Monthly SIP: ${fmt(summary.totalFamilyMonthlySip)} | Goal SIP Commit: ${fmt(summary.totalGoalMonthlyCommit)}\n`;
    contextStr += `Free Monthly Savings: ${fmt(summary.freeMonthlySavings)}\n`;
    contextStr += `Goals: ${summary.totalGoals} total, ${summary.goalsOnTrack} on track, ${summary.goalsOffTrack} off track\n\n`;

    contextStr += `MEMBERS:\n`;
    members.forEach(m => {
      contextStr += `- ${m.name}: Age ${m.age}, ${m.riskProfile} risk (${(m.returnRate * 100).toFixed(0)}%), `;
      contextStr += `Retire FY${m.retireFY} (${m.yearsToRetire} yrs), Corpus: ${fmt(m.currentCorpus)}, `;
      contextStr += `Projected: ${fmt(m.corpusAtRetirement)}, Pension: ${fmt(m.monthlyPension4pct)}/mo`;
      if (m.corpusDepletedAtYear) contextStr += `, CORPUS DEPLETES at year ${m.corpusDepletedAtYear} post-retirement`;
      contextStr += `\n`;
    });

    contextStr += `\nGOALS:\n`;
    goals.forEach(g => {
      contextStr += `- ${g.name} (${g.goalType}): ${g.progressPct}% done, `;
      contextStr += `SIP: ${fmt(g.monthlyContribution)}/mo needed: ${fmt(g.requiredMonthlySip)}/mo, `;
      contextStr += `${g.isOnTrack ? 'ON TRACK' : 'OFF TRACK shortfall ' + fmt(g.shortfall) + '/mo'}, `;
      contextStr += `completes FY${g.completionFY}\n`;
    });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `${contextStr}\n\nAnalyze this family's financial situation and respond ONLY with a JSON array of exactly 5 insight objects. Each object must have: { "type": string (one of: goal_risk, retirement_health, sip_optimization, tax_opportunity, asset_allocation), "priority": "high"|"medium"|"low", "title": string (max 60 chars), "body": string (2-3 sentences, specific numbers), "action": string (1 specific actionable step), "impact": string (quantified impact if possible) }. No explanation, no markdown, only the JSON array.`
      }]
    });

    let insights = [];
    try {
      const text = response.content[0].text.trim();
      const match = text.match(/\[[\s\S]*\]/);
      insights = match ? JSON.parse(match[0]) : JSON.parse(text);
    } catch (e) {
      insights = [{ type: 'retirement_health', priority: 'medium', title: 'Analysis Complete', body: response.content[0].text, action: 'Review your financial plan', impact: 'Improved financial health' }];
    }

    return res.json({ insights, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('POST /planning/ai-insights error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
