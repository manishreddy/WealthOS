'use strict';

const express = require('express');
const { query } = require('../db');
const { getConfig, migrateOldConfig, computeYearlyProjections } = require('../utils/projections-calc');
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

router.get('/retirement/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });
    const member = memberRes.rows[0];
    const age = member.age || 30;

    const last6Months = getLastNMonths(6);
    let totalInvestments = 0;
    let countMonths = 0;
    for (const { year, month } of last6Months) {
      const rowRes = await query(
        'SELECT investments FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
        [req.userId, memberId, year, month]
      );
      const row = rowRes.rows[0];
      if (row) {
        totalInvestments += parseFloat(row.investments) || 0;
        countMonths++;
      }
    }
    const avgMonthlyInvestment = countMonths > 0 ? totalInvestments / countMonths : 0;

    const portfolioRes = await query(
      'SELECT SUM(current_value) as total FROM portfolio_assets WHERE user_id = $1 AND member_id = $2',
      [req.userId, memberId]
    );
    const currentPortfolio = portfolioRes.rows[0] && portfolioRes.rows[0].total ? parseFloat(portfolioRes.rows[0].total) : 0;

    const riskProfile = member.risk_profile || 'moderate';
    let annualReturnRate;
    if (riskProfile === 'conservative') {
      annualReturnRate = 0.08;
    } else if (riskProfile === 'aggressive') {
      annualReturnRate = 0.15;
    } else {
      annualReturnRate = 0.12;
    }

    const retireAt = member.retirement_age || 60;
    const yearsToRetirement = Math.max(retireAt - age, 1);
    const r = annualReturnRate;
    const n = yearsToRetirement;
    const annualInvestment = avgMonthlyInvestment * 12;
    const growthFactor = Math.pow(1 + r, n);
    let corpusAtRetirement;
    if (r === 0) {
      corpusAtRetirement = currentPortfolio + annualInvestment * n;
    } else {
      corpusAtRetirement = currentPortfolio * growthFactor + annualInvestment * (growthFactor - 1) / r;
    }

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

function computeTaxSummary(data) {
  const grossSalary = parseFloat(data.gross_salary) || 0;
  const hraReceived = parseFloat(data.hra_received) || 0;
  const hraClaimed = parseFloat(data.hra_claimed) || 0;
  const sec80c = parseFloat(data.sec_80c) || 0;
  const sec80d = parseFloat(data.sec_80d) || 0;
  const sec80ccd1b = parseFloat(data.sec_80ccd1b) || 0;
  const homeLoanInterest = parseFloat(data.home_loan_interest) || 0;
  const otherDeductions = parseFloat(data.other_deductions) || 0;

  const standardDeduction = 50000;
  const effectiveHra = Math.min(hraReceived, hraReceived * 0.5);
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

router.get('/tax/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const taxYear = req.query.year || 'FY2025-26';

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

    const taxRes = await query(
      'SELECT * FROM tax_planning WHERE user_id = $1 AND member_id = $2 AND tax_year = $3',
      [req.userId, memberId, taxYear]
    );
    const taxData = taxRes.rows[0];

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

router.put('/config', async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Request body must be a config object' });
    }
    const existing = await getConfig(req.userId);
    const merged = { ...existing, ...updates };
    await query(`
      INSERT INTO financial_plan (user_id, config, updated_at) VALUES ($1, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()
    `, [req.userId, JSON.stringify(merged)]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('PUT /planning/config error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/tax/:memberId', async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    const memberRes = await query(
      'SELECT * FROM family_members WHERE id = $1 AND user_id = $2',
      [memberId, req.userId]
    );
    if (!memberRes.rows[0]) return res.status(404).json({ error: 'Member not found' });

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

    await query(`
      INSERT INTO tax_planning (user_id, member_id, tax_year, gross_salary, hra_received, hra_claimed, sec_80c, sec_80d, sec_80ccd1b, home_loan_interest, other_deductions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id, member_id, tax_year) DO UPDATE SET
        gross_salary = EXCLUDED.gross_salary,
        hra_received = EXCLUDED.hra_received,
        hra_claimed = EXCLUDED.hra_claimed,
        sec_80c = EXCLUDED.sec_80c,
        sec_80d = EXCLUDED.sec_80d,
        sec_80ccd1b = EXCLUDED.sec_80ccd1b,
        home_loan_interest = EXCLUDED.home_loan_interest,
        other_deductions = EXCLUDED.other_deductions
    `, [
      req.userId, memberId, taxYear,
      parseFloat(grossSalary), parseFloat(hraReceived), parseFloat(hraClaimed),
      parseFloat(sec80c), parseFloat(sec80d), parseFloat(sec80ccd1b),
      parseFloat(homeLoanInterest), parseFloat(otherDeductions)
    ]);

    await query(
      'UPDATE setup_progress SET planning_done = 1, updated_at = NOW() WHERE user_id = $1',
      [req.userId]
    );

    const savedRes = await query(
      'SELECT * FROM tax_planning WHERE user_id = $1 AND member_id = $2 AND tax_year = $3',
      [req.userId, memberId, taxYear]
    );

    return res.status(200).json(computeTaxSummary(savedRes.rows[0]));
  } catch (err) {
    console.error('PUT /planning/tax/:memberId error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/networth-projection', async (req, res) => {
  try {
    const portfolioRes = await query(
      'SELECT SUM(pa.current_value) as total FROM portfolio_assets pa JOIN family_members fm ON pa.member_id = fm.id WHERE pa.user_id = $1 AND fm.is_active = 1',
      [req.userId]
    );
    const currentPortfolio = portfolioRes.rows[0] && portfolioRes.rows[0].total ? parseFloat(portfolioRes.rows[0].total) : 0;

    const last3Months = getLastNMonths(3);
    let totalMonthlyInvestment = 0;
    let countMonths = 0;
    for (const { year, month } of last3Months) {
      const rowRes = await query(
        'SELECT SUM(investments) as total_inv FROM monthly_data WHERE user_id = $1 AND year = $2 AND month = $3',
        [req.userId, year, month]
      );
      const row = rowRes.rows[0];
      if (row && row.total_inv !== null) {
        totalMonthlyInvestment += parseFloat(row.total_inv);
        countMonths++;
      }
    }
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

function getLastNMonthsList(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

function calcMonthsRemaining(targetDate) {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;
  return Math.max((target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()), 0);
}

function calcRequiredSip(targetAmount, currentAmount, months) {
  const remaining = Math.max(targetAmount - currentAmount, 0);
  if (months <= 0) return remaining;
  const rm = 0.12 / 12;
  const factor = Math.pow(1 + rm, months);
  if (factor === 1) return remaining / months;
  return (remaining * rm) / (factor - 1);
}

router.get('/comprehensive', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const currentFY = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();

    const membersRes = await query(
      'SELECT * FROM family_members WHERE user_id = $1 AND is_active = 1 ORDER BY id',
      [userId]
    );
    const members = membersRes.rows;

    // Find the most recent month/year with portfolio data for this user
    const latestSnapshotRes = await query(
      'SELECT year, month FROM portfolio_assets WHERE user_id = $1 ORDER BY year DESC, month DESC LIMIT 1',
      [userId]
    );
    const latestSnapshot = latestSnapshotRes.rows[0];
    const snapshotYear = latestSnapshot ? latestSnapshot.year : now.getFullYear();
    const snapshotMonth = latestSnapshot ? latestSnapshot.month : (now.getMonth() + 1);

    const portfolioRowsRes = await query(
      'SELECT member_id, SUM(current_value) as total FROM portfolio_assets WHERE user_id = $1 AND year = $2 AND month = $3 GROUP BY member_id',
      [userId, snapshotYear, snapshotMonth]
    );
    const portfolioByMember = {};
    portfolioRowsRes.rows.forEach(r => { portfolioByMember[r.member_id] = parseFloat(r.total) || 0; });

    const sipRowsRes = await query(
      'SELECT member_id, SUM(amount) as total FROM savings_plan WHERE user_id = $1 AND is_active = 1 GROUP BY member_id',
      [userId]
    );
    const sipByMember = {};
    sipRowsRes.rows.forEach(r => { sipByMember[r.member_id] = parseFloat(r.total) || 0; });

    const goalsRes = await query(
      'SELECT * FROM goals WHERE user_id = $1 AND is_achieved = 0 AND is_active = 1 ORDER BY target_date ASC',
      [userId]
    );
    const goals = goalsRes.rows;

    const projConfigRaw = await getConfig(userId);
    const projConfig = migrateOldConfig(projConfigRaw, members);
    const yearlyProj = computeYearlyProjections(projConfig, members);
    const projByFY = {};
    yearlyProj.forEach(p => { projByFY[p.fy] = p; });

    const last3 = getLastNMonthsList(3);
    let lastIncome = 0, lastExpense = 0, dataMonths = 0;
    for (const { year, month } of last3) {
      const rowRes = await query(
        'SELECT SUM(income) as inc, SUM(expenditure) as exp FROM monthly_data WHERE user_id = $1 AND year = $2 AND month = $3',
        [userId, year, month]
      );
      const row = rowRes.rows[0];
      if (row && (row.inc || row.exp)) {
        lastIncome += parseFloat(row.inc) || 0;
        lastExpense += parseFloat(row.exp) || 0;
        dataMonths++;
      }
    }
    const totalMonthlyIncome = dataMonths > 0 ? lastIncome / dataMonths : 0;
    const totalMonthlyExpense = dataMonths > 0 ? lastExpense / dataMonths : 0;

    const last6 = getLastNMonthsList(6);
    const avgFromMonthly = {};
    for (const m of members) {
      let total = 0, cnt = 0;
      for (const { year, month } of last6) {
        const rowRes = await query(
          'SELECT investments FROM monthly_data WHERE user_id = $1 AND member_id = $2 AND year = $3 AND month = $4',
          [userId, m.id, year, month]
        );
        const row = rowRes.rows[0];
        if (row && row.investments) { total += parseFloat(row.investments); cnt++; }
      }
      avgFromMonthly[m.id] = cnt > 0 ? total / cnt : 0;
    }

    const rateMap = { conservative: 0.08, moderate: 0.12, aggressive: 0.15 };
    const inflationRate = projConfig.expenseInflationRate || 0.06;

    const totalGoalSip = goals.reduce((s, g) => s + parseFloat(g.monthly_contribution || 0), 0);

    const memberResults = members.map(member => {
      const riskProfile = member.risk_profile || 'moderate';
      const returnRate = rateMap[riskProfile] || 0.12;
      const age = member.age || 30;

      const memberCfg = (projConfig.members || {})[String(member.id)] || {};
      let retireFY;
      if (memberCfg.birthYear && memberCfg.retireAge) {
        retireFY = memberCfg.birthYear + memberCfg.retireAge + 1;
      } else if (memberCfg.status === 'Retired' || memberCfg.status === 'Not Working') {
        retireFY = currentFY;
      } else {
        retireFY = memberCfg.retireFY || (currentFY + Math.max(60 - age, 1));
      }
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

    const goalResults = goals.map(goal => {
      const monthsLeft = calcMonthsRemaining(goal.target_date);
      const ta = parseFloat(goal.target_amount);
      const ca = parseFloat(goal.current_amount);
      const mc = parseFloat(goal.monthly_contribution) || 0;
      const requiredSip = calcRequiredSip(ta, ca, monthsLeft);
      const isOnTrack = mc >= requiredSip;
      const shortfall = Math.max(0, requiredSip - mc);
      const surplus = Math.max(0, mc - requiredSip);
      const progressPct = ta > 0 ? parseFloat(((ca / ta) * 100).toFixed(2)) : 0;

      let completionFY = null;
      if (goal.target_date) {
        const td = new Date(goal.target_date);
        completionFY = td.getMonth() >= 3 ? td.getFullYear() + 1 : td.getFullYear();
      }

      const inflationRateGoal = (goal.inflation_rate != null ? parseFloat(goal.inflation_rate) : 8) / 100;
      const goalBaseYear = goal.base_year || new Date().getFullYear();
      const goalTargetYear = goal.target_date ? new Date(goal.target_date).getFullYear() : goalBaseYear;
      const yrsFromBase = Math.max(goalTargetYear - goalBaseYear, 0);
      const futureValue = Math.round(ta * Math.pow(1 + inflationRateGoal, yrsFromBase));
      const fundingType = goal.funding_type || 'Savings';
      const dpPct = parseFloat(goal.down_payment_pct) || (fundingType === 'EMI' ? 20 : 0);
      const downPaymentAmount = fundingType === 'EMI'
        ? Math.round(futureValue * dpPct / 100)
        : 0;

      // Compute ongoing EMI for EMI goals (same formula as enrichGoal in goals.js)
      let monthlyEmi = 0;
      let loanEndsFY = null;
      if (fundingType === 'EMI' && completionFY) {
        const loanAmount = futureValue - downPaymentAmount;
        const roiMonthly = (parseFloat(goal.loan_roi) || 8.5) / 100 / 12;
        const loanMonths = (parseInt(goal.loan_duration_yrs) || 20) * 12;
        if (loanAmount > 0 && roiMonthly > 0) {
          const factor = Math.pow(1 + roiMonthly, loanMonths);
          monthlyEmi = Math.round(loanAmount * roiMonthly * factor / (factor - 1));
        } else if (loanAmount > 0) {
          monthlyEmi = Math.round(loanAmount / loanMonths);
        }
        loanEndsFY = completionFY + (parseInt(goal.loan_duration_yrs) || 20);
      }

      return {
        id: goal.id,
        name: goal.name,
        goalType: goal.goal_type,
        targetAmount: ta,
        currentAmount: ca,
        monthlyContribution: mc,
        targetDate: goal.target_date,
        requiredMonthlySip: Math.round(requiredSip),
        isOnTrack,
        shortfall: Math.round(shortfall),
        surplus: Math.round(surplus),
        monthsRemaining: monthsLeft,
        completionFY,
        progressPct,
        sipFreedAtCompletion: mc,
        assignedMembers: JSON.parse(goal.assigned_members || '[]'),
        notes: goal.notes,
        fundingType,
        isMilestone: goal.is_milestone === 1,
        downPaymentPct: dpPct,
        inflationRate: goal.inflation_rate != null ? parseFloat(goal.inflation_rate) : 8,
        futureValue,
        downPaymentAmount,
        monthlyEmi,
        loanEndsFY,
        loanDurationYrs: parseInt(goal.loan_duration_yrs) || 20,
      };
    });

    const totalFamilyCorpus = Object.values(portfolioByMember).reduce((s, v) => s + v, 0);
    const totalFamilyMonthlySip = Object.values(sipByMember).reduce((s, v) => s + v, 0);
    const totalGoalMonthlyCommit = goals.reduce((s, g) => s + parseFloat(g.monthly_contribution || 0), 0);
    const freeMonthlySavings = totalMonthlyIncome - totalMonthlyExpense - totalFamilyMonthlySip - totalGoalMonthlyCommit;
    const goalsOnTrack = goalResults.filter(g => g.isOnTrack).length;
    const goalsOffTrack = goalResults.filter(g => !g.isOnTrack).length;

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
      config: projConfig,
      snapshotMonth,
      snapshotYear
    });
  } catch (err) {
    console.error('GET /planning/comprehensive error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

    const client = new Anthropic({
      apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    });
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
