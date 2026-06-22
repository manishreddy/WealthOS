'use strict';

const { Pool } = require('pg');

// Node's URL parser treats # as a fragment delimiter, which breaks passwords
// containing #. Parse with regex so the full password is captured correctly
// regardless of whether # is encoded as %23 or left bare.
function parseDbUrl(url) {
  if (!url) return {};
  const m = url.match(/^postgres(?:ql)?:\/\/([^:@]+)(?::([^@]*))?@([^:\/]+)(?::(\d+))?\/([^?]+)/);
  if (!m) return { connectionString: url };
  const [, user, rawPwd, host, port, database] = m;
  const password = rawPwd != null ? decodeURIComponent(rawPwd.replace(/\+/g, '%2B')) : undefined;
  const ssl = host !== 'localhost' ? { rejectUnauthorized: false } : false;
  return { user, password, host, port: port ? parseInt(port, 10) : 5432, database, ssl };
}

const pool = new Pool({
  ...parseDbUrl(process.env.DATABASE_URL),
  max: 5,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 8000,
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
  if (process.env.SKIP_DB_INIT === 'true') { console.log('DB init skipped (production)'); return; }
  // users must exist before any foreign-key tables
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

  // users migrations (parallel — no interdependency)
  await Promise.all([
    query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS replit_user_id TEXT UNIQUE`),
    query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT`),
    query(`ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT ''`),
    query('ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_auth_id TEXT UNIQUE'),
  ]);

  // family_members must exist before tables that reference it
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

  // All tables that reference users + family_members (parallel)
  await Promise.all([
    query(`
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
    `),
    query(`
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
    `),
    query(`
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
    `),
    query(`
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
        category TEXT DEFAULT '',
        year INTEGER DEFAULT 0,
        month INTEGER DEFAULT 0,
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `),
    query(`
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
    `),
    query(`
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
    `),
    query(`
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
    `),
    query(`
      CREATE TABLE IF NOT EXISTS financial_plan (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        config TEXT DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `),
    query(`
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
    `),
    query(`
      CREATE TABLE IF NOT EXISTS fire_settings (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        retirement_age INTEGER DEFAULT 50,
        current_age_override INTEGER,
        pre_ret_return REAL DEFAULT 12,
        post_ret_return REAL DEFAULT 8,
        inflation REAL DEFAULT 6,
        swr REAL DEFAULT 4,
        lean_ratio REAL DEFAULT 70,
        fat_ratio REAL DEFAULT 150,
        barista_income REAL DEFAULT 0,
        corpus REAL,
        income REAL,
        expenses REAL,
        investments REAL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `),
    query(`
      CREATE TABLE IF NOT EXISTS liabilities (
        id                    SERIAL PRIMARY KEY,
        user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        member_id             INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        name                  TEXT NOT NULL,
        liability_type        TEXT NOT NULL DEFAULT 'Personal Loan',
        lender                TEXT DEFAULT '',
        principal_original    NUMERIC NOT NULL DEFAULT 0,
        principal_outstanding NUMERIC NOT NULL DEFAULT 0,
        interest_rate         NUMERIC NOT NULL DEFAULT 0,
        emi_monthly           NUMERIC DEFAULT 0,
        start_date            TEXT DEFAULT '',
        end_date              TEXT DEFAULT '',
        is_revolving          INTEGER DEFAULT 0,
        collateral            TEXT DEFAULT '',
        tax_benefit_section   TEXT DEFAULT '',
        notes                 TEXT DEFAULT '',
        is_active             INTEGER DEFAULT 1,
        created_at            TIMESTAMPTZ DEFAULT NOW()
      )
    `),
  ]);

  // Column migrations (parallel — all idempotent)
  await Promise.all([
    query(`ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT ''`),
    query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1`),
    query(`ALTER TABLE fire_settings ADD COLUMN IF NOT EXISTS corpus REAL`),
    query(`ALTER TABLE fire_settings ADD COLUMN IF NOT EXISTS income REAL`),
    query(`ALTER TABLE fire_settings ADD COLUMN IF NOT EXISTS expenses REAL`),
    query(`ALTER TABLE fire_settings ADD COLUMN IF NOT EXISTS investments REAL`),
    query(`ALTER TABLE family_members ADD COLUMN IF NOT EXISTS retirement_age INTEGER DEFAULT 60`),
  ]);

  // Data backfill after column add
  await query(`UPDATE goals SET is_active = 1 WHERE is_active IS NULL`);

  // Indexes for the most common WHERE clauses (parallel, all idempotent)
  await Promise.all([
    query(`CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`),
    query(`CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id)`),
    query(`CREATE INDEX IF NOT EXISTS idx_family_members_linked_user_id ON family_members(linked_user_id)`),
    query(`CREATE INDEX IF NOT EXISTS idx_monthly_data_user_id ON monthly_data(user_id)`),
    query(`CREATE INDEX IF NOT EXISTS idx_portfolio_assets_user_id ON portfolio_assets(user_id)`),
    query(`CREATE INDEX IF NOT EXISTS idx_savings_plan_user_id ON savings_plan(user_id)`),
  ]);

  console.log('Database initialized successfully');
}

module.exports = { pool, query, initDb };
