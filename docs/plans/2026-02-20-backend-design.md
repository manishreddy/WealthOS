# WealthOS Backend Design
**Date:** 2026-02-20
**Status:** Approved

---

## Overview

Transform WealthOS from a localStorage-only prototype into a real application with a Node.js/Express REST API backend, SQLite database, centralized family config, guided setup flow, and Claude AI-powered WealthBot.

---

## Architecture

```
WealthOS/
├── server/
│   ├── server.js              # Express app, port 3000
│   ├── db.js                  # SQLite setup, schema creation, migrations
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js            # POST /api/auth/login, /signup, /logout
│   │   ├── family.js          # GET/PUT /api/family, GET/POST/PUT/DELETE /api/family/members
│   │   ├── monthly.js         # GET/POST/PUT /api/monthly/:year/:month/:memberId
│   │   ├── savings.js         # GET/POST/PUT/DELETE /api/savings/:memberId
│   │   ├── portfolio.js       # GET/POST/PUT/DELETE /api/portfolio/:memberId
│   │   ├── goals.js           # GET/POST/PUT/DELETE /api/goals
│   │   ├── planning.js        # GET /api/planning/retirement, /api/planning/tax
│   │   ├── setup.js           # GET /api/setup/progress, PUT /api/setup/progress
│   │   └── wealthbot.js       # POST /api/wealthbot/chat
│   └── package.json
└── code/
    ├── api.js                 # NEW: centralized API client (replaces all localStorage calls)
    └── ...existing HTML pages (updated to use api.js)
```

---

## Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** SQLite via `better-sqlite3` (synchronous, no async complexity)
- **Auth:** JWT (`jsonwebtoken`) + bcrypt for password hashing
- **AI:** Anthropic SDK (`@anthropic-ai/sdk`) for WealthBot
- **CORS:** `cors` middleware for localhost dev
- **Dependencies:** `express`, `better-sqlite3`, `jsonwebtoken`, `bcryptjs`, `@anthropic-ai/sdk`, `cors`, `dotenv`

---

## SQLite Schema

```sql
-- Users (authentication)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  family_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Family members (single source of truth)
CREATE TABLE family_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  age INTEGER,
  role TEXT,          -- 'primary', 'spouse', 'dependent', 'parent'
  risk_profile TEXT,  -- 'conservative', 'moderate', 'aggressive'
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Monthly tracking data
CREATE TABLE monthly_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  member_id INTEGER REFERENCES family_members(id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,  -- 1-12
  income REAL DEFAULT 0,
  expenditure REAL DEFAULT 0,
  investments REAL DEFAULT 0,
  savings REAL GENERATED ALWAYS AS (income - expenditure - investments) VIRTUAL,
  income_breakup TEXT DEFAULT '[]',      -- JSON array
  expense_breakup TEXT DEFAULT '[]',     -- JSON array
  investment_breakup TEXT DEFAULT '[]',  -- JSON array
  UNIQUE(user_id, member_id, year, month)
);

-- Savings/investment plan per member
CREATE TABLE savings_plan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  member_id INTEGER REFERENCES family_members(id),
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL,   -- 'Equity', 'Debt', 'Gold', 'Others'
  sub_category TEXT,           -- 'Large Cap', 'PPF', 'Sovereign Gold Bond', etc.
  amount REAL NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  start_month TEXT,            -- 'YYYY-MM'
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Savings plan allocation targets per member
CREATE TABLE savings_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  member_id INTEGER REFERENCES family_members(id),
  equity_pct REAL DEFAULT 60,
  debt_pct REAL DEFAULT 30,
  gold_pct REAL DEFAULT 5,
  others_pct REAL DEFAULT 5,
  use_age_based INTEGER DEFAULT 1,
  UNIQUE(user_id, member_id)
);

-- Portfolio assets
CREATE TABLE portfolio_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  member_id INTEGER REFERENCES family_members(id),
  asset_type TEXT NOT NULL,    -- 'stocks', 'mutual-funds', 'fd', 'gold', 'real-estate', 'crypto', 'cash'
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL,   -- 'Equity', 'Debt', 'Gold', 'Real Estate', 'Cash', 'Commodity'
  purchase_value REAL DEFAULT 0,
  current_value REAL NOT NULL,
  units REAL,
  notes TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Financial goals
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  goal_type TEXT,              -- 'House', 'Education', 'Vacation', 'Vehicle', 'Retirement', 'Emergency'
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  monthly_contribution REAL DEFAULT 0,
  target_date TEXT,            -- 'YYYY-MM-DD'
  assigned_members TEXT DEFAULT '[]',  -- JSON array of member_ids
  notes TEXT,
  is_achieved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tax planning inputs (for financial planning page)
CREATE TABLE tax_planning (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  member_id INTEGER REFERENCES family_members(id),
  tax_year TEXT NOT NULL,      -- 'FY2025-26'
  gross_salary REAL DEFAULT 0,
  hra_received REAL DEFAULT 0,
  hra_claimed REAL DEFAULT 0,
  sec_80c REAL DEFAULT 0,      -- ELSS, PPF, LIC, PF etc.
  sec_80d REAL DEFAULT 0,      -- Health insurance premium
  sec_80ccd1b REAL DEFAULT 0,  -- NPS additional
  home_loan_interest REAL DEFAULT 0,
  other_deductions REAL DEFAULT 0,
  UNIQUE(user_id, member_id, tax_year)
);

-- Setup progress tracker
CREATE TABLE setup_progress (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  family_done INTEGER DEFAULT 0,
  monthly_done INTEGER DEFAULT 0,
  savings_done INTEGER DEFAULT 0,
  portfolio_done INTEGER DEFAULT 0,
  goals_done INTEGER DEFAULT 0,
  planning_done INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Auth
- `POST /api/auth/signup` — create account, return JWT
- `POST /api/auth/login` — verify credentials, return JWT
- `POST /api/auth/logout` — client clears token
- `GET /api/auth/me` — get current user info

### Family
- `GET /api/family` — get family config + all members
- `PUT /api/family` — update family name
- `GET /api/family/members` — list active members
- `POST /api/family/members` — add member
- `PUT /api/family/members/:id` — update member
- `DELETE /api/family/members/:id` — soft-delete (set is_active=0)

### Monthly Tracker
- `GET /api/monthly/:year/:month` — get all members' data for a month
- `GET /api/monthly/:year/:month/:memberId` — get one member's data
- `PUT /api/monthly/:year/:month/:memberId` — upsert monthly data (income, expenses, investments + breakup)
- `GET /api/monthly/history/:memberId?months=6` — last N months for charts

### Savings Plan
- `GET /api/savings/:memberId` — get investment list + targets
- `POST /api/savings/:memberId` — add investment item
- `PUT /api/savings/:memberId/:id` — update investment item
- `DELETE /api/savings/:memberId/:id` — remove investment item
- `PUT /api/savings/:memberId/targets` — update allocation targets

### Portfolio
- `GET /api/portfolio` — all assets, grouped by member
- `GET /api/portfolio/:memberId` — assets for one member
- `POST /api/portfolio/:memberId` — add asset
- `PUT /api/portfolio/:memberId/:id` — update asset value
- `DELETE /api/portfolio/:memberId/:id` — remove asset
- `GET /api/portfolio/summary` — net worth, asset class breakdown

### Goals
- `GET /api/goals` — all goals with progress
- `POST /api/goals` — create goal
- `PUT /api/goals/:id` — update goal (amount, contribution, date)
- `DELETE /api/goals/:id` — delete goal

### Financial Planning
- `GET /api/planning/retirement/:memberId` — retirement projections
- `GET /api/planning/tax/:memberId?year=FY2025-26` — tax summary + savings opportunities
- `PUT /api/planning/tax/:memberId` — update tax inputs
- `GET /api/planning/networth-projection` — year-by-year projection

### Setup Progress
- `GET /api/setup/progress` — get setup completion status (0-6 steps)
- `PUT /api/setup/progress` — update a step (auto-updated by routes on data save)

### WealthBot
- `POST /api/wealthbot/chat` — send message, get Claude response with user's financial context injected

---

## Frontend: api.js

A centralized module all pages import:

```javascript
const API = {
  baseURL: 'http://localhost:3000/api',

  // Auth header from localStorage JWT token
  headers() { ... },

  // Generic fetch wrapper with error handling
  async get(path) { ... },
  async post(path, body) { ... },
  async put(path, body) { ... },
  async delete(path) { ... },

  // Convenience methods
  family: { getMembers(), addMember(), updateMember(), deleteMember() },
  monthly: { get(year, month), save(year, month, memberId, data), history(memberId) },
  savings: { get(memberId), add(memberId, item), update(), delete() },
  portfolio: { getAll(), add(memberId, asset), update(), delete(), summary() },
  goals: { getAll(), add(goal), update(), delete() },
  planning: { retirement(memberId), tax(memberId), updateTax(), projection() },
  setup: { getProgress(), updateStep(step) },
  wealthbot: { chat(messages) }
}
```

---

## Guided Setup + Handholding

### Setup steps (in nav order):
1. **Family** (Settings) — Add at least one family member with name and age
2. **Monthly Tracker** — Enter income and expenses for current month
3. **Savings Plan** — Add at least one SIP or investment
4. **Portfolio** — Add at least one asset
5. **Goals** — Define at least one financial goal

### Dashboard continuation:
- After login, fetch `/api/setup/progress`
- If any step incomplete: show banner "Setup X% complete → Continue: [step name]" with button linking to the relevant page
- Banner shows the **next incomplete step** (sequential order)
- Progress bar shows overall % (steps done / 5)

### Per-page guidance:
- Each page checks if its data is empty
- If empty: shows a styled guidance card explaining what to enter and why
- Once data exists: guidance card disappears (or shows as a small "?" help icon)
- Example guidance text:
  - Monthly Tracker: "Add your income, monthly expenses, and investments here. We'll calculate your savings rate and show you trends over time."
  - Savings Plan: "List your monthly SIPs and investments here. We'll track your actual vs target allocation by asset class."
  - Portfolio: "Add your current holdings — stocks, mutual funds, FDs, gold, real estate. We'll calculate your net worth."
  - Goals: "Define what you're saving for — a house, education, retirement. We'll tell you if you're on track."

---

## WealthBot Design

**System prompt includes:**
- Family members (names, ages, roles)
- Last 3 months of income/expense/savings
- Portfolio net worth and asset allocation
- Goals and their progress
- Current month savings rate

**Claude model:** `claude-sonnet-4-6`

**API key:** Stored in `server/.env` as `ANTHROPIC_API_KEY`

**Conversation:** Stateless per message (context injected fresh each time) — no conversation history stored server-side (keep it simple for v1)

---

## Security

- Passwords hashed with `bcryptjs` (10 salt rounds) — no more plaintext
- JWT tokens (7-day expiry) stored in `localStorage` on frontend
- All API routes protected by `verifyToken` middleware (except /auth/login, /auth/signup)
- No user can access another user's data (user_id from JWT on every query)
- Input validation on all POST/PUT routes

---

## What Gets Removed / Replaced

- All hardcoded dummy data in HTML pages
- All direct `localStorage` calls in page scripts (replaced by `api.js` calls)
- Hardcoded "Person 1 / Person 2" labels (replaced by live family member names from API)
- `data/sampleData.js` — removed
- `data/localStorage.js` — removed (data/userDataManager.js replaced by API)
- `js/person-data.js` — replaced by `api.family.getMembers()`

---

## Implementation Phases

1. **Server foundation** — `server.js`, `db.js` (schema), auth routes, JWT middleware
2. **Family API + Settings page** — family members CRUD, settings page wired to API
3. **api.js client** — centralized frontend API module
4. **Monthly Tracker** — wired to real API, person switcher from family API
5. **Savings Plan** — wired to real API
6. **Portfolio** — wired to real API, net worth calculation
7. **Goals** — wired to real API, on-track calculation
8. **Financial Planning** — retirement projector, tax planning (real calculations)
9. **Dashboard** — all metrics from real data, setup progress banner
10. **WealthBot** — Claude API integration with financial context
11. **Cleanup** — remove all dummy data, remove old localStorage code
