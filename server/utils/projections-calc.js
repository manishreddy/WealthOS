'use strict';

const { query } = require('../db');

const DEFAULT_CONFIG = {
  baseFY: 2024,
  members: {},
  otherIncomeFY: 4,
  otherGrowthRate: 0.05,
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

  const memberEntries = [];
  const membersMap = cfg.members || {};
  if (members && members.length > 0) {
    members.forEach(m => {
      const data = membersMap[String(m.id)] || {};
      memberEntries.push({
        id: m.id,
        name: m.name,
        incomeFY: data.incomeFY || 0,
        growthRate: data.growthRate != null ? data.growthRate : 0.12,
        retireFY: data.retireFY || 2060,
        preFY2025Income: data.preFY2025Income
      });
    });
  } else {
    Object.entries(membersMap).forEach(([id, data]) => {
      memberEntries.push({
        id,
        name: 'Member ' + id,
        incomeFY: data.incomeFY || 0,
        growthRate: data.growthRate != null ? data.growthRate : 0.12,
        retireFY: data.retireFY || 2060,
        preFY2025Income: data.preFY2025Income
      });
    });
  }

  const otherBase = cfg.otherIncomeFY != null ? cfg.otherIncomeFY : 4;
  const otherGrow = cfg.otherGrowthRate != null ? cfg.otherGrowthRate : 0.05;

  const emiSchedule = cfg.emiSchedule || DEFAULT_CONFIG.emiSchedule;
  const me = cfg.monthlyExpenses || DEFAULT_CONFIG.monthlyExpenses;
  const expInflation = cfg.expenseInflationRate != null ? cfg.expenseInflationRate : 0.06;
  const rentInflation = cfg.rentInflationRate != null ? cfg.rentInflationRate : 0.10;
  const leisureInflation = cfg.leisureInflationRate != null ? cfg.leisureInflationRate : 0.08;

  const baseRent = me.rent || 0;
  const baseHousehold = (me.utilities||0)+(me.food||0)+(me.commute||0)+(me.shopping||0)+(me.travelFamily||0)+(me.events||0)+(me.giftsFnF||0);
  const baseLeisure = (me.entertainment||0)+(me.personalExpense||0)+(me.travelDomestic||0)+(me.travelInternational||0)+(me.giftsSelf||0)+(me.kidsGeneral||0);
  const baseKids = (me.kidsEducation||0);
  const baseOther = (me.medical||0)+(me.insurance||0)+(me.misc||0);

  const firstRetireFY = memberEntries.length > 0
    ? Math.min(...memberEntries.map(m => m.retireFY))
    : 9999;
  const lastRetireFY = memberEntries.length > 0
    ? Math.max(...memberEntries.map(m => m.retireFY))
    : 9999;

  for (let fy = baseFY; fy <= endFY; fy++) {
    const years = fy - baseFY;
    const yrs = fy - 2025;

    const memberIncomes = {};
    let totalMemberIncome = 0;
    if (fy < 2025) {
      memberEntries.forEach(m => {
        const inc = m.preFY2025Income != null ? m.preFY2025Income : 0;
        memberIncomes[String(m.id)] = inc;
        totalMemberIncome = round2(totalMemberIncome + inc);
      });
    } else {
      memberEntries.forEach(m => {
        const inc = fy >= m.retireFY ? 0 : round2(m.incomeFY * Math.pow(1 + m.growthRate, yrs));
        memberIncomes[String(m.id)] = inc;
        totalMemberIncome = round2(totalMemberIncome + inc);
      });
    }

    const allRetired = memberEntries.length > 0 && memberEntries.every(m => fy >= m.retireFY);
    const other = fy < 2025
      ? (cfg.preFY2025OtherIncome != null ? cfg.preFY2025OtherIncome : 0)
      : (allRetired ? 0 : round2(otherBase * Math.pow(1 + otherGrow, yrs)));
    const totalIncome = round2(totalMemberIncome + other);

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
      memberIncomes,
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
      isRetirementYear: fy === firstRetireFY,
      memberList: memberEntries.map(m => ({ id: m.id, name: m.name }))
    });
  }
  return rows;
}

module.exports = { DEFAULT_CONFIG, round2, getConfig, migrateOldConfig, computeYearlyProjections };
