'use strict';

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'wealthos.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// Enable foreign key enforcement
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    family_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    role TEXT DEFAULT 'member',
    risk_profile TEXT DEFAULT 'moderate',
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS monthly_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    income REAL DEFAULT 0,
    expenditure REAL DEFAULT 0,
    investments REAL DEFAULT 0,
    income_breakup TEXT DEFAULT '[]',
    expense_breakup TEXT DEFAULT '[]',
    investment_breakup TEXT DEFAULT '[]',
    UNIQUE(user_id, member_id, year, month)
  );

  CREATE TABLE IF NOT EXISTS savings_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_class TEXT NOT NULL,
    sub_category TEXT DEFAULT '',
    amount REAL NOT NULL DEFAULT 0,
    frequency TEXT DEFAULT 'monthly',
    start_month TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS savings_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    equity_pct REAL DEFAULT 60,
    debt_pct REAL DEFAULT 30,
    gold_pct REAL DEFAULT 5,
    others_pct REAL DEFAULT 5,
    use_age_based INTEGER DEFAULT 1,
    UNIQUE(user_id, member_id)
  );

  CREATE TABLE IF NOT EXISTS portfolio_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    name TEXT NOT NULL,
    asset_class TEXT NOT NULL,
    purchase_value REAL DEFAULT 0,
    current_value REAL NOT NULL DEFAULT 0,
    units REAL DEFAULT 0,
    notes TEXT DEFAULT '',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal_type TEXT DEFAULT 'Other',
    target_amount REAL NOT NULL DEFAULT 0,
    current_amount REAL DEFAULT 0,
    monthly_contribution REAL DEFAULT 0,
    target_date TEXT DEFAULT '',
    assigned_members TEXT DEFAULT '[]',
    notes TEXT DEFAULT '',
    is_achieved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tax_planning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    tax_year TEXT NOT NULL,
    gross_salary REAL DEFAULT 0,
    hra_received REAL DEFAULT 0,
    hra_claimed REAL DEFAULT 0,
    sec_80c REAL DEFAULT 0,
    sec_80d REAL DEFAULT 0,
    sec_80ccd1b REAL DEFAULT 0,
    home_loan_interest REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    UNIQUE(user_id, member_id, tax_year)
  );

  CREATE TABLE IF NOT EXISTS setup_progress (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    family_done INTEGER DEFAULT 0,
    monthly_done INTEGER DEFAULT 0,
    savings_done INTEGER DEFAULT 0,
    portfolio_done INTEGER DEFAULT 0,
    goals_done INTEGER DEFAULT 0,
    planning_done INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS financial_plan (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    config TEXT DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrate: add year/month to portfolio_assets for per-month tracking
const portfolioCols = db.pragma('table_info(portfolio_assets)').map(c => c.name);
if (!portfolioCols.includes('year')) {
  db.exec(`ALTER TABLE portfolio_assets ADD COLUMN year INTEGER DEFAULT 0`);
}
if (!portfolioCols.includes('month')) {
  db.exec(`ALTER TABLE portfolio_assets ADD COLUMN month INTEGER DEFAULT 0`);
}
// Assign existing unset rows to current month
{
  const now = new Date();
  db.prepare('UPDATE portfolio_assets SET year = ?, month = ? WHERE year = 0').run(now.getFullYear(), now.getMonth() + 1);
}

// Migrate: add new investment detail columns if not present
const existingCols = db.pragma('table_info(savings_plan)').map(c => c.name);
if (!existingCols.includes('instrument_type')) {
  db.exec(`ALTER TABLE savings_plan ADD COLUMN instrument_type TEXT DEFAULT ''`);
}
if (!existingCols.includes('fund_house')) {
  db.exec(`ALTER TABLE savings_plan ADD COLUMN fund_house TEXT DEFAULT ''`);
}
if (!existingCols.includes('platform')) {
  db.exec(`ALTER TABLE savings_plan ADD COLUMN platform TEXT DEFAULT ''`);
}
if (!existingCols.includes('notes')) {
  db.exec(`ALTER TABLE savings_plan ADD COLUMN notes TEXT DEFAULT ''`);
}
if (!existingCols.includes('index_type')) {
  db.exec(`ALTER TABLE savings_plan ADD COLUMN index_type TEXT DEFAULT ''`);
}

// Migrate: add funding/inflation columns to goals if not present
const goalsCols = db.pragma('table_info(goals)').map(c => c.name);
if (!goalsCols.includes('funding_type')) {
  db.exec(`ALTER TABLE goals ADD COLUMN funding_type TEXT DEFAULT 'Savings'`);
}
if (!goalsCols.includes('inflation_rate')) {
  db.exec(`ALTER TABLE goals ADD COLUMN inflation_rate REAL DEFAULT 8`);
}
if (!goalsCols.includes('down_payment_pct')) {
  db.exec(`ALTER TABLE goals ADD COLUMN down_payment_pct REAL DEFAULT 0`);
}
if (!goalsCols.includes('loan_duration_yrs')) {
  db.exec(`ALTER TABLE goals ADD COLUMN loan_duration_yrs INTEGER DEFAULT 0`);
}
if (!goalsCols.includes('loan_roi')) {
  db.exec(`ALTER TABLE goals ADD COLUMN loan_roi REAL DEFAULT 8`);
}

// Migrate: add dob column to family_members if not present
const familyCols = db.pragma('table_info(family_members)').map(c => c.name);
if (!familyCols.includes('dob')) {
  db.exec(`ALTER TABLE family_members ADD COLUMN dob TEXT DEFAULT ''`);
}
if (!familyCols.includes('email')) {
  db.exec(`ALTER TABLE family_members ADD COLUMN email TEXT DEFAULT ''`);
}
if (!familyCols.includes('linked_user_id')) {
  db.exec(`ALTER TABLE family_members ADD COLUMN linked_user_id INTEGER`);
}

// Family invitations table
db.exec(`
  CREATE TABLE IF NOT EXISTS family_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    inviter_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
