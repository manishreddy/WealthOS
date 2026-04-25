# WealthOS

WealthOS is a family financial planning web application built for Indian families. It helps track portfolio assets, monthly income/expenses, savings plans, financial goals, and provides AI-powered insights.

## Architecture

### Stack
- **Frontend**: Static HTML/JS files served from the `code/` directory
- **Backend**: Node.js + Express REST API (`server/`)
- **Database**: PostgreSQL (Replit hosted, via `pg` Pool)
- **Auth**: JWT tokens (jsonwebtoken + bcryptjs)
- **AI**: Anthropic Claude (for WealthBot and financial insights)
- **File parsing**: multer + xlsx (for Zerodha holdings import)

### Project Structure
```
code/          - Static frontend (HTML, CSS, JS)
server/
  server.js    - Express app entry point, calls initDb() on startup
  db.js        - PostgreSQL pool, query helper, initDb() schema creation
  middleware/
    auth.js    - JWT verifyToken middleware
  routes/
    auth.js       - Signup, login, invite flow
    family.js     - Family members CRUD + invite emails
    monthly.js    - Monthly income/expense/investment tracking
    savings.js    - Savings plan (SIPs etc.) CRUD
    portfolio.js  - Portfolio assets CRUD + Zerodha CSV import
    goals.js      - Financial goals CRUD
    planning.js   - Tax planning, retirement, AI insights
    projections.js - Long-term financial projections
    setup.js      - Onboarding progress tracking
    wealthbot.js  - AI chat endpoint
    import.js     - Bulk spreadsheet import via AI
    ai-parse.js   - AI text/vision parsing utility
  utils/
    projections-calc.js - Projection computation logic (async getConfig)
  email.js       - Email transport for invite emails
```

### Database
All tables are created automatically on startup via `initDb()` in `server/db.js`. Tables:
- `users` - Accounts with email/password/family_name
- `family_members` - Per-user family members
- `monthly_data` - Monthly financial data per member
- `savings_plan` - SIP/investment plans per member
- `savings_targets` - Asset allocation targets per member
- `portfolio_assets` - Portfolio holdings per member
- `goals` - Financial goals
- `tax_planning` - Annual tax planning data
- `setup_progress` - Onboarding progress tracking
- `financial_plan` - Projection config (JSON blob)
- `family_invitations` - Member invite tokens

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (Replit hosted)
- `JWT_SECRET` - Token signing secret
- `ANTHROPIC_API_KEY` - For AI features (WealthBot, AI insights)
- `SMTP_*` - Optional email settings for invite emails

## Development
The app runs on port 5000. Start with the "Start WealthOS" workflow.

## Deployment
Target: `autoscale` (configured in `.replit`)
Run command: `node server/server.js`
