'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '',
      family_name TEXT NOT NULL DEFAULT 'My Family',
      replit_user_id TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS replit_user_id TEXT UNIQUE
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS full_name TEXT
  `);

  await query(`
    ALTER TABLE users
    ALTER COLUMN password_hash SET DEFAULT ''
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS family_members (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      age INTEGER,
      role TEXT DEFAULT 'member',
      risk_profile TEXT DEFAULT 'moderate',
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      dob TEXT DEFAULT '',
      email TEXT DEFAULT '',
      linked_user_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS monthly_data (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      income NUMERIC DEFAULT 0,
      expenditure NUMERIC DEFAULT 0,
      investments NUMERIC DEFAULT 0,
      income_breakup TEXT DEFAULT '[]',
      expense_breakup TEXT DEFAULT '[]',
      investment_breakup TEXT DEFAULT '[]',
      UNIQUE(user_id, member_id, year, month)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS savings_plan (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      asset_class TEXT NOT NULL,
      sub_category TEXT DEFAULT '',
      amount NUMERIC NOT NULL DEFAULT 0,
      frequency TEXT DEFAULT 'monthly',
      start_month TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      instrument_type TEXT DEFAULT '',
      fund_house TEXT DEFAULT '',
      platform TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      index_type TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS savings_targets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      equity_pct NUMERIC DEFAULT 60,
      debt_pct NUMERIC DEFAULT 30,
      gold_pct NUMERIC DEFAULT 5,
      others_pct NUMERIC DEFAULT 5,
      use_age_based INTEGER DEFAULT 1,
      UNIQUE(user_id, member_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS portfolio_assets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      asset_type TEXT NOT NULL,
      name TEXT NOT NULL,
      asset_class TEXT NOT NULL,
      purchase_value NUMERIC DEFAULT 0,
      current_value NUMERIC NOT NULL DEFAULT 0,
      units NUMERIC DEFAULT 0,
      notes TEXT DEFAULT '',
      year INTEGER DEFAULT 0,
      month INTEGER DEFAULT 0,
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      goal_type TEXT DEFAULT 'Other',
      target_amount NUMERIC NOT NULL DEFAULT 0,
      current_amount NUMERIC DEFAULT 0,
      monthly_contribution NUMERIC DEFAULT 0,
      target_date TEXT DEFAULT '',
      assigned_members TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      is_achieved INTEGER DEFAULT 0,
      funding_type TEXT DEFAULT 'Savings',
      inflation_rate NUMERIC DEFAULT 8,
      down_payment_pct NUMERIC DEFAULT 0,
      loan_duration_yrs INTEGER DEFAULT 0,
      loan_roi NUMERIC DEFAULT 8,
      is_milestone INTEGER DEFAULT 0,
      base_year INTEGER DEFAULT 2025,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tax_planning (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      tax_year TEXT NOT NULL,
      gross_salary NUMERIC DEFAULT 0,
      hra_received NUMERIC DEFAULT 0,
      hra_claimed NUMERIC DEFAULT 0,
      sec_80c NUMERIC DEFAULT 0,
      sec_80d NUMERIC DEFAULT 0,
      sec_80ccd1b NUMERIC DEFAULT 0,
      home_loan_interest NUMERIC DEFAULT 0,
      other_deductions NUMERIC DEFAULT 0,
      UNIQUE(user_id, member_id, tax_year)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS setup_progress (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      family_done INTEGER DEFAULT 0,
      monthly_done INTEGER DEFAULT 0,
      savings_done INTEGER DEFAULT 0,
      portfolio_done INTEGER DEFAULT 0,
      goals_done INTEGER DEFAULT 0,
      planning_done INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS financial_plan (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      config TEXT DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS family_invitations (
      id SERIAL PRIMARY KEY,
      family_member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      inviter_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log('Database initialized successfully');
}

module.exports = { pool, query, initDb };
