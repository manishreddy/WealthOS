'use strict';

const { query } = require('../db');

const DEFAULT_CONFIG = {
  baseFY: 2024,
  members: {},
  otherIncomeFY: 0,
  otherGrowthRate: 0.05,
  emiSchedule: [],
  monthlyExpenses: {
    rent: 70000,
    utilities: 20000,
    food: 20000,
    commute: 10000,
    shopping: 10000,
    travelFamily: 10000,
    events: 0,
    giftsFnF: 10000,
    entertainment: 10000,
    personalExpense: 10000,
    travelDomestic: 20000,
    travelInternational: 30000,
    giftsSelf: 10000,
    kidsGeneral: 0,
    kidsEducation: 0,
    medical: 10000,
    insurance: 10000,
    misc: 5000
  },
  expenseInflationRate: 0.06,
  rentInflationRate: 0.10,
  leisureInflationRate: 0.08,
  projectionEndFY: 2080
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function getConfig(userId) {
  const result = await query('SELECT config FROM financial_plan WHERE user_id = $1', [userId]);
  const row = result.rows[0];
  if (!row || !row.config || row.config === '{}') return { ...DEFAULT_CONFIG };
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(row.config) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function migrateOldConfig(cfg, members) {
  if (cfg.members && Object.keys(cfg.members).length > 0) return cfg;
  if (!cfg.manishIncomeFY2025 && !cfg.raghaviIncomeFY2025) return cfg;

  const newCfg = { ...cfg, members: {} };
  if (members && members[0]) {
    newCfg.members[String(members[0].id)] = {
      incomeFY: cfg.manishIncomeFY2025 || 46,
      growthRate: cfg.manishGrowthRate != null ? cfg.manishGrowthRate : 0.12,
      retireFY: cfg.manishRetireFY || 2045,
      preFY2025Income: 0
    };
  }
  if (members && members[1]) {
    newCfg.members[String(members[1].id)] = {
      incomeFY: cfg.raghaviIncomeFY2025 || 24,
      growthRate: cfg.raghaviGrowthRate != null ? cfg.raghaviGrowthRate : 0.12,
      retireFY: cfg.raghaviRetireFY || 2065,
      preFY2025Income: 21
    };
  }
  newCfg.otherIncomeFY = cfg.otherIncomeFY2025 != null ? cfg.otherIncomeFY2025 : (cfg.otherIncomeFY || 4);
  newCfg.otherGrowthRate = cfg.otherGrowthRate != null ? cfg.otherGrowthRate : 0.05;
  newCfg.preFY2025OtherIncome = 5;
  return newCfg;
}

function computeYearlyProjections(cfg, members) {
  const rows = [];
  const baseFY = cfg.baseFY || 2024;
  const endFY = cfg.projectionEndFY || 2065;

  // Indian FY: Apr–Mar. currentFY is the FY that is currently underway.
  const now = new Date();
  const currentFY = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();

  const membersMap = cfg.members || {};
  const forecastOverrides = cfg.forecastOverrides || {};

  // Life Plan mode: any member has monthly_income entered
  const lifePlanMode = Object.values(membersMap).some(d => d.monthly_income > 0);

  const memberEntries = [];
  const buildEntry = (id, name, data) => {
    const growthRate = data.incomeGrowthRate != null ? data.incomeGrowthRate
                     : data.growthRate != null ? data.growthRate : 0.12;

    // In Life Plan mode, store current annual income at currentFY directly (no back-calculation).
    // Legacy mode: use incomeFY (FY2025 base) as-is.
    const currentAnnualIncomeL = lifePlanMode && data.monthly_income > 0
      ? round2(data.monthly_income * 12 / 100000)
      : null;
    const incomeFY2025 = currentAnnualIncomeL == null ? (data.incomeFY || 0) : null;

    let retireFY;
    if (data.birthYear && data.retireAge) {
      retireFY = data.birthYear + data.retireAge + 1;
    } else {
      retireFY = data.retireFY || 2060;
    }
    if (data.status === 'Retired' || data.status === 'Not Working') retireFY = currentFY;

    return {
      id, name, growthRate, retireFY,
      currentAnnualIncomeL,   // Life Plan: annual income in lakhs at currentFY
      incomeFY2025,           // Legacy: annual income in lakhs at FY2025 base
      preFY2025Income: data.preFY2025Income,
      otherIncCurrentL: data.monthly_otherInc > 0 ? round2(data.monthly_otherInc * 12 / 100000) : null,
      otherGrowthRate: data.otherGrowthRate != null ? data.otherGrowthRate : 0.05,
      expCurrentMonthly: data.monthly_expenses || 0,
      expInflationMember: data.expenseInflation != null ? data.expenseInflation : null,
    };
  };

  if (members && members.length > 0) {
    members.forEach(m => memberEntries.push(buildEntry(String(m.id), m.name, membersMap[String(m.id)] || {})));
  } else {
    Object.entries(membersMap).forEach(([id, data]) => memberEntries.push(buildEntry(id, 'Member ' + id, data)));
  }

  // Other income
  const lifePlanHasOther = memberEntries.some(m => m.otherIncCurrentL > 0);
  const totalOtherCurrentL = lifePlanHasOther
    ? memberEntries.reduce((s, m) => s + (m.otherIncCurrentL || 0), 0)
    : null;
  // Legacy: otherIncomeFY (FY2025 base)
  const legacyOtherBase = cfg.otherIncomeFY != null ? cfg.otherIncomeFY : 0;
  const legacyOtherGrow = cfg.otherGrowthRate != null ? cfg.otherGrowthRate : 0.05;

  // Expenses
  const lifePlanHasExp = lifePlanMode && memberEntries.some(m => m.expCurrentMonthly > 0);
  const totalExpCurrentMonthly = lifePlanHasExp
    ? memberEntries.reduce((s, m) => s + m.expCurrentMonthly, 0)
    : 0;
  const firstExpInfl = memberEntries.find(m => m.expInflationMember != null);
  const lifePlanExpInflation = firstExpInfl
    ? firstExpInfl.expInflationMember
    : (cfg.expenseInflationRate != null ? cfg.expenseInflationRate : 0.06);

  // Legacy category breakdown — fall back to DEFAULT_CONFIG if stored values are all zero
  const emiSchedule = cfg.emiSchedule || DEFAULT_CONFIG.emiSchedule;
  const storedMe = cfg.monthlyExpenses || {};
  const storedMeSum = Object.values(storedMe).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const me = storedMeSum > 0 ? storedMe : DEFAULT_CONFIG.monthlyExpenses;
  const expInflation = cfg.expenseInflationRate != null ? cfg.expenseInflationRate : 0.06;
  const rentInflation = cfg.rentInflationRate != null ? cfg.rentInflationRate : 0.10;
  const leisureInflation = cfg.leisureInflationRate != null ? cfg.leisureInflationRate : 0.08;

  const baseRent = me.rent || 0;
  const baseHousehold = (me.utilities||0)+(me.food||0)+(me.commute||0)+(me.shopping||0)+(me.travelFamily||0)+(me.events||0)+(me.giftsFnF||0);
  const baseLeisure = (me.entertainment||0)+(me.personalExpense||0)+(me.travelDomestic||0)+(me.travelInternational||0)+(me.giftsSelf||0)+(me.kidsGeneral||0);
  const baseKids = me.kidsEducation || 0;
  const baseOther = (me.medical||0)+(me.insurance||0)+(me.misc||0);

  const firstRetireFY = memberEntries.length > 0
    ? Math.min(...memberEntries.map(m => m.retireFY))
    : 9999;

  for (let fy = baseFY; fy <= endFY; fy++) {
    const years = fy - baseFY;
    // calYear: calendar year at the start of this FY (FY2027 starts Apr 2026 → calYear 2026)
    const calYear = fy - 1;

    // ── Income ──────────────────────────────────────────────────────────────
    const memberIncomes = {};
    let totalMemberIncome = 0;

    if (lifePlanMode) {
      // Grow from currentFY base (matches Life Plan's computeForecastRows formula)
      const n = fy - currentFY;
      memberEntries.forEach(m => {
        const base = m.currentAnnualIncomeL || 0;
        const inc = fy >= m.retireFY ? 0 : round2(base * Math.pow(1 + m.growthRate, n));
        memberIncomes[String(m.id)] = inc;
        totalMemberIncome = round2(totalMemberIncome + inc);
      });
    } else if (fy < 2025) {
      memberEntries.forEach(m => {
        const inc = m.preFY2025Income != null ? m.preFY2025Income : 0;
        memberIncomes[String(m.id)] = inc;
        totalMemberIncome = round2(totalMemberIncome + inc);
      });
    } else {
      const yrs = fy - 2025;
      memberEntries.forEach(m => {
        const inc = fy >= m.retireFY ? 0 : round2((m.incomeFY2025 || 0) * Math.pow(1 + m.growthRate, yrs));
        memberIncomes[String(m.id)] = inc;
        totalMemberIncome = round2(totalMemberIncome + inc);
      });
    }

    // ── Other income ────────────────────────────────────────────────────────
    const allRetired = memberEntries.length > 0 && memberEntries.every(m => fy >= m.retireFY);
    let other;
    if (lifePlanHasOther) {
      const n = fy - currentFY;
      const firstMemberOtherGrow = memberEntries.find(m => m.otherIncCurrentL > 0);
      const otherGrowRate = firstMemberOtherGrow ? firstMemberOtherGrow.otherGrowthRate : 0.05;
      other = allRetired ? 0 : round2(totalOtherCurrentL * Math.pow(1 + otherGrowRate, n));
    } else if (fy < 2025) {
      other = cfg.preFY2025OtherIncome != null ? cfg.preFY2025OtherIncome : 0;
    } else {
      const yrs = fy - 2025;
      other = allRetired ? 0 : round2(legacyOtherBase * Math.pow(1 + legacyOtherGrow, yrs));
    }

    let totalIncome = round2(totalMemberIncome + other);

    // ── EMI schedule ────────────────────────────────────────────────────────
    let emiYearly = 0;
    for (const slot of emiSchedule) {
      if (fy >= slot.fromFY && fy <= slot.toFY) { emiYearly = slot.yearlyLakhs; break; }
    }

    // ── Expenses ────────────────────────────────────────────────────────────
    let totalExpenses;
    if (lifePlanHasExp) {
      const n = fy - currentFY;
      totalExpenses = round2(emiYearly + totalExpCurrentMonthly * 12 * Math.pow(1 + lifePlanExpInflation, n) / 100000);
    } else {
      const yrsFromBase = fy - baseFY;
      const rentYearly      = round2(baseRent      * 12 * Math.pow(1 + rentInflation,    yrsFromBase) / 100000);
      const householdYearly = round2(baseHousehold  * 12 * Math.pow(1 + expInflation,     yrsFromBase) / 100000);
      const leisureYearly   = round2(baseLeisure    * 12 * Math.pow(1 + leisureInflation, yrsFromBase) / 100000);
      const kidsYearly      = round2(baseKids       * 12 * Math.pow(1 + expInflation,     yrsFromBase) / 100000);
      const otherExp        = round2(baseOther       * 12 * Math.pow(1 + expInflation,     yrsFromBase) / 100000);
      totalExpenses = round2(emiYearly + rentYearly + householdYearly + leisureYearly + kidsYearly + otherExp);
    }

    // ── forecastOverrides (Life Plan cell-level edits, keyed by calendar year) ──
    const ov = forecastOverrides[calYear] || forecastOverrides[String(calYear)] || {};
    if (ov.income != null || ov.otherInc != null) {
      const ovIncome = ov.income != null ? ov.income : totalMemberIncome;
      const ovOther  = ov.otherInc != null ? ov.otherInc : other;
      totalIncome = round2(ovIncome + ovOther);
    }
    if (ov.expenses != null) totalExpenses = round2(emiYearly + ov.expenses);

    const netSavings  = round2(totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    rows.push({
      fy,
      years,
      totalIncome,
      memberIncomes,
      other,
      emiYearly: round2(emiYearly),
      totalExpenses,
      netSavings,
      savingsRate,
      monthlyIncome:  round2(totalIncome   / 12 * 10) / 10,
      monthlyExpense: round2(totalExpenses / 12 * 10) / 10,
      monthlySavings: round2(netSavings    / 12 * 10) / 10,
      isRetirementYear: fy === firstRetireFY,
      memberList: memberEntries.map(m => ({ id: m.id, name: m.name }))
    });
  }
  return rows;
}

// Converts liability rows into an emiSchedule array compatible with computeYearlyProjections.
// Pure function — no DB calls. Called by /liabilities/sync-to-projections.
function buildEmiScheduleFromLiabilities(liabilityRows) {
  if (!liabilityRows || liabilityRows.length === 0) return [];

  const now = new Date();
  const currentFY = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();

  // Group EMI by FY range: for each FY, sum all active liabilities' yearly EMI
  const fyEmiMap = {};

  for (const row of liabilityRows) {
    const emiMonthly = parseFloat(row.emi_monthly) || 0;
    if (emiMonthly <= 0) continue;

    let fromFY = currentFY;
    if (row.start_date) {
      const sd = new Date(row.start_date);
      if (!isNaN(sd.getTime())) {
        fromFY = sd.getMonth() >= 3 ? sd.getFullYear() + 1 : sd.getFullYear();
      }
    }

    let toFY;
    if (row.is_revolving) {
      toFY = currentFY + 5;
    } else if (row.end_date) {
      const ed = new Date(row.end_date);
      if (!isNaN(ed.getTime())) {
        toFY = ed.getMonth() >= 3 ? ed.getFullYear() + 1 : ed.getFullYear();
      } else {
        toFY = currentFY + 1;
      }
    } else {
      toFY = currentFY + 1;
    }

    fromFY = Math.max(fromFY, currentFY);
    const yearlyLakhs = round2(emiMonthly * 12 / 100000);

    for (let fy = fromFY; fy <= toFY; fy++) {
      fyEmiMap[fy] = round2((fyEmiMap[fy] || 0) + yearlyLakhs);
    }
  }

  const fys = Object.keys(fyEmiMap).map(Number).sort((a, b) => a - b);
  if (fys.length === 0) return [];

  // Compress into contiguous ranges with same yearlyLakhs
  const schedule = [];
  let rangeStart = fys[0];
  let rangeVal = fyEmiMap[fys[0]];

  for (let i = 1; i < fys.length; i++) {
    const fy = fys[i];
    const val = fyEmiMap[fy];
    if (fys[i] !== fys[i - 1] + 1 || val !== rangeVal) {
      schedule.push({ fromFY: rangeStart, toFY: fys[i - 1], yearlyLakhs: rangeVal });
      rangeStart = fy;
      rangeVal = val;
    }
  }
  schedule.push({ fromFY: rangeStart, toFY: fys[fys.length - 1], yearlyLakhs: rangeVal });

  return schedule;
}

module.exports = { DEFAULT_CONFIG, round2, getConfig, migrateOldConfig, computeYearlyProjections, buildEmiScheduleFromLiabilities };
