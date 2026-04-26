# WealthOS

A family financial planning web app built for Indian families.

## Tech Stack
- **Backend**: Node.js + Express (`server/server.js`), PostgreSQL via `pg` Pool (`server/db.js`)
- **Frontend**: Vanilla HTML/CSS/JS in `code/` directory served as static files
- **Auth**: Replit Auth (OpenID Connect via passport + openid-client v5), session-based (PostgreSQL-backed sessions)
- **AI**: Claude API via `/api/wealthbot/chat` endpoint
- **Port**: 5000

## Architecture
- `server/server.js` — Express server, initializes DB, serves `code/` as static
- `server/db.js` — PostgreSQL pool (`DATABASE_URL` env var)
- `code/` — All HTML pages, JS modules, and CSS
- `code/sidebar.js` — Shared sidebar component injected via `<aside id="sidebar-root"></aside>` on every inner page
- `code/api.js` — Frontend API client (`WealthAPI` global, no JWT — uses session cookies)
- `server/replit_auth.js` — Replit Auth OIDC setup, passport config, session management, user sync
- `code/design-system.css` — CSS design tokens (no responsive rules)
- `code/dark-overrides.css` — Dark mode variable overrides

## Design Language
- Background: `#EBEBEB` (neutral gray)
- Dark cards: `#111111`
- Light cards: `#FFFFFF`
- Accent: `#8FE62C` (lime green)
- Font: Inter
- Card radius: 20px
- No gradients on primary surfaces

## Pages
- `login.html`, `signup.html` — Auth pages (mobile-polished, Task #7)
- `dashboard.html` — Main family dashboard
- `monthly-tracker.html` — Income/expense tracker per family member
- `savings-plan.html` — Monthly investments, EMIs, emergency fund
- `portfolio.html` — Portfolio view with asset management
- `goals.html` — Financial goals with SIP tracking
- `planned.html` — Planned vs actual income/expense tables
- `financial-planning.html` — Retirement, tax planning, goal simulation
- `proj-vs-actuals.html` — Projected vs actual comparisons
- `wealthbot.html` — Claude-powered AI financial advisor chat
- `settings.html` — Family settings, members, preferences
- `onboarding.html` — First-run setup flow
- `invite.html` — Family member invite acceptance

## Mobile Responsiveness
- `sidebar.js` injects a fixed mobile top bar (56px) with hamburger button at ≤768px
- The sidebar becomes a slide-in drawer with an overlay backdrop
- All inner pages use `@media (max-width: 768px)` and `@media (max-width: 480px)` for content grids
- `sidebar.js` applies `.app-container { grid-template-columns: 1fr !important }` and `margin-top: 56px !important` on `.main-content` at ≤768px

## Workflows
- **Start WealthOS**: `cd server && PORT=5000 node server.js`

## Environment
- `DATABASE_URL` — PostgreSQL connection string (set in Replit secrets)
- `SESSION_SECRET` — Express session signing secret (set in Replit secrets)
- `REPL_ID` — Replit OIDC client ID (runtime-managed, set automatically by Replit)
- `REPLIT_DEV_DOMAIN` — Dev domain for OIDC redirect URI (runtime-managed)
- `ANTHROPIC_API_KEY` — Claude API key for WealthBot

## Auth Flow
- Login: redirect to `/api/login` → Replit OIDC → `/api/auth/callback` → user sync → dashboard
- Logout: `/api/logout` (destroys session)
- Session: stored in PostgreSQL `sessions` table via connect-pg-simple
- User sync: on first Replit login, matches by `replit_user_id`, falls back to email match, then creates new user
- Family invite: token stored in session before OIDC redirect, completed after return to `/invite.html?from_auth=1`

## Completed Tasks
- Task #6: Security vulnerabilities fixed (xlsx → exceljs)
- Task #7: Login/signup mobile responsive
- Task #38: Migrated auth to Replit Auth (OpenID Connect) — session-based, Google/GitHub/Apple/email support
- Task #8: Homepage scroll animations
- Task #12: Full inner-app mobile responsive (sidebar drawer + all page grids)

## Notes
- 2 moderate npm vulnerabilities remain (exceljs → uuid@8.x transitive dep), accepted risk
- `scripts/post-merge.sh` runs `cd server && npm install --prefer-offline` after merges
