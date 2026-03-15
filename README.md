# WealthOS

A personal financial planning app for Indian families — track your portfolio, plan goals, manage monthly budgets, and project your financial future with AI assistance.

## Features

- **Portfolio** — Track assets across equity, debt, real estate, gold, and more with allocation charts
- **Goals** — Plan financial goals (house, education, retirement, etc.) with EMI or SIP funding, inflation-adjusted projections, and year-wise payment breakdowns
- **Monthly Tracker** — Log income and expenses by category with predefined chips and custom entries
- **Monthly Investments** — Track SIPs, MFs, ETFs, stocks, and bonds with fund house/platform details and AI-powered import
- **Financial Planning** — 30-year yearly expense and savings rate projection, goal-derived EMI schedule, step-up SIP commitments, and down payment planning
- **Family** — Multi-member support with per-member portfolio and goal assignment
- **AI Import** — Paste text, upload CSV, or screenshot — Claude parses and populates your data automatically
- **Dark mode** — Full light/dark theme support

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Pure HTML/CSS/Vanilla JS |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (stored in localStorage) |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Email | Nodemailer |
| File Import | xlsx + multer |

## Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone the repo
git clone https://github.com/manishreddy/WealthOS.git
cd WealthOS

# Install server dependencies
cd server
npm install

# Create environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY and JWT_SECRET to .env
```

### Run

```bash
# From the server/ directory
npm run dev      # development (nodemon)
npm start        # production
```

Then open `http://localhost:3000` in your browser.

## Project Structure

```
WealthOS/
├── code/               # Frontend HTML pages
│   ├── dashboard.html
│   ├── portfolio.html
│   ├── goals.html
│   ├── planned.html    # Financial planning & projections
│   ├── savings-plan.html  # Monthly investments
│   ├── tracker.html    # Monthly income/expense tracker
│   ├── settings.html
│   └── api.js          # Client-side API wrapper
├── server/             # Backend
│   ├── server.js       # Express app entry
│   ├── db.js           # SQLite schema & migrations
│   ├── routes/         # API route handlers
│   └── email.js        # Email/invite helpers
└── start.sh            # Convenience start script
```

## Environment Variables

```
ANTHROPIC_API_KEY=your_key_here
JWT_SECRET=your_secret_here
PORT=3000
```
