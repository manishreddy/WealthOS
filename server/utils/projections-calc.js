'use strict';

const { query } = require('../db');

const DEFAULT_CONFIG = {
  baseFY: 2024,
  manishIncomeFY2025: 46,
  raghaviIncomeFY2025: 24,
  otherIncomeFY2025: 4,
  manishGrowthRate: 0.12,
  raghaviGrowthRate: 0.12,
  otherGrowthRate: 0.05,
  manishRetireFY: 2045,
  raghaviRetireFY: 2065,
  emiSchedule: [
    { fromFY: 2024, toFY: 2025, yearlyLakhs: 6.3 },
    { fromFY: 2026, toFY: 2029, yearlyLakhs: 12.4 },
    { fromFY: 2030, toFY: 2036, yearlyLakhs: 38.2 },
    { fromFY: 2037, toFY: 2045, yearlyLakhs: 48.1 }
  ],
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

function computeYearlyProjections(cfg) {
  const rows = [];
  const baseFY = cfg.baseFY || 2024;
  const endFY = cfg.projectionEndFY || 2065;

  const manishBase = cfg.manishIncomeFY2025 || 46;
  const raghaviBase = cfg.raghaviIncomeFY2025 || 24;
  const otherBase = cfg.otherIncomeFY2025 || 4;
  const manishGrow = cfg.manishGrowthRate ?? 0.12;
  const raghaviGrow = cfg.raghaviGrowthRate ?? 0.12;
  const otherGrow = cfg.otherGrowthRate ?? 0.05;
  const manishRetire = cfg.manishRetireFY || 2045;
  const raghaviRetire = cfg.raghaviRetireFY || 2065;

  const emiSchedule = cfg.emiSchedule || DEFAULT_CONFIG.emiSchedule;
  const me = cfg.monthlyExpenses || DEFAULT_CONFIG.monthlyExpenses;
  const expInflation = cfg.expenseInflationRate ?? 0.06;
  const rentInflation = cfg.rentInflationRate ?? 0.10;
  const leisureInflation = cfg.leisureInflationRate ?? 0.08;

  const baseRent = me.rent || 0;
  const baseHousehold = (me.utilities||0)+(me.food||0)+(me.commute||0)+(me.shopping||0)+(me.travelFamily||0)+(me.events||0)+(me.giftsFnF||0);
  const baseLeisure = (me.entertainment||0)+(me.personalExpense||0)+(me.travelDomestic||0)+(me.travelInternational||0)+(me.giftsSelf||0)+(me.kidsGeneral||0);
  const baseKids = (me.kidsEducation||0);
  const baseOther = (me.medical||0)+(me.insurance||0)+(me.misc||0);

  for (let fy = baseFY; fy <= endFY; fy++) {
    const years = fy - baseFY;

    let manish, raghavi, other;
    if (fy < 2025) {
      manish = 0;
      raghavi = 21;
      other = 5;
    } else {
      const yrs = fy - 2025;
      manish = fy >= manishRetire ? 0 : round2(manishBase * Math.pow(1 + manishGrow, yrs));
      raghavi = fy >= raghaviRetire ? 0 : round2(raghaviBase * Math.pow(1 + raghaviGrow, yrs));
      other = fy >= manishRetire && fy >= raghaviRetire ? 0 : round2(otherBase * Math.pow(1 + otherGrow, yrs));
    }
    const totalIncome = round2(manish + raghavi + other);

    let emiYearly = 0;
    for (const slot of emiSchedule) {
      if (fy >= slot.fromFY && fy <= slot.toFY) {
        emiYearly = slot.yearlyLakhs;
        break;
      }
    }

    const yrsFromBase = fy - baseFY;
    const rentYearly = round2(baseRent * 12 * Math.pow(1 + rentInflation, yrsFromBase) / 100000);
    const householdYearly = round2(baseHousehold * 12 * Math.pow(1 + expInflation, yrsFromBase) / 100000);
    const leisureYearly = round2(baseLeisure * 12 * Math.pow(1 + leisureInflation, yrsFromBase) / 100000);
    const kidsYearly = round2(baseKids * 12 * Math.pow(1 + expInflation, yrsFromBase) / 100000);
    const otherExp = round2(baseOther * 12 * Math.pow(1 + expInflation, yrsFromBase) / 100000);

    const totalExpenses = round2(emiYearly + rentYearly + householdYearly + leisureYearly + kidsYearly + otherExp);
    const netSavings = round2(totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    const monthlyIncome = round2(totalIncome / 12 * 10) / 10;
    const monthlyExpense = round2(totalExpenses / 12 * 10) / 10;
    const monthlySavings = round2(netSavings / 12 * 10) / 10;

    rows.push({
      fy,
      years,
      totalIncome,
      manish,
      raghavi,
      other,
      emiYearly: round2(emiYearly),
      rentYearly,
      householdYearly,
      leisureYearly,
      kidsYearly,
      otherExp,
      totalExpenses,
      netSavings,
      savingsRate,
      monthlyIncome,
      monthlyExpense,
      monthlySavings,
      isRetirementYear: fy === manishRetire
    });
  }
  return rows;
}

module.exports = { DEFAULT_CONFIG, round2, getConfig, computeYearlyProjections };
