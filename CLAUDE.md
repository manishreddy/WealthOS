# WealthOS — Agent Guide

This file is read automatically by Claude Code at the start of every session.
Follow every rule here before writing any CSS, HTML, or JS that touches visuals.

---

## Design Language (v2 — Booking.com inspired)

### Single source of truth
`code/design-system.css` defines all CSS custom properties. Load it first on every page, before `controls.css` or any page-specific styles.

### Brand palette
| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#0F172A` | Primary text, headings |
| `--text-secondary` | `#64748B` | Secondary text, labels |
| `--text-tertiary` | `#94A3B8` | Placeholder, muted text |
| `--accent` | `#8FE62C` | Brand lime — progress rings, active accents |
| `--bg` | `#F4F6F8` / `#0D1117` dark | Page canvas (cool gray, cards float on it) |
| `--border` | `#E5E8EC` | Card / input borders (solid, not rgba) |
| `--border-strong` | `#CBD5E1` | Stronger borders, input focus |
| `--sidebar-bg` | `#111827` | Sidebar background (dark navy) |
| `--sidebar-active-bg` | `rgba(143,230,44,0.12)` | Active nav item wash |
| `--sidebar-active-text` | `#8FE62C` | Active nav item text/icon |

### Card standard
Cards use `border-radius: var(--card-radius, 14px)`, `border: 1px solid var(--border, #E5E8EC)`, `box-shadow: var(--card-light-shadow)`.
**Do not use `border-radius: 20px` or `rgba(0,0,0,0.08)` borders — these are the old values.**

### Input standard
All `<input>`, `<select>`, `<textarea>` use class `wos-input` (defined in design-system.css) or match:
```css
border: 1.5px solid var(--input-border, #CBD5E1);
border-radius: var(--radius-input, 8px);
focus: border-color var(--input-focus-border, #8FE62C); box-shadow: 0 0 0 3px var(--input-focus-ring, rgba(143,230,44,0.15));
```

### Table standard
Use `class="wos-table"` (defined in design-system.css) for all data tables. Add `class="num"` to numeric columns. No vertical lines, no outer border. Header row uses gray background + uppercase labels.

---

## CTA Rule — enforce this on every task

**All primary action buttons must use `--cta-bg` (`#8FE62C`) with `--cta-text` (`#111111`).**

```css
/* Correct — use the token */
.action-btn.primary {
    background: var(--cta-bg, #8FE62C);
    color: var(--cta-text, #111);
}

/* Wrong — do not use black, gradients, or any other color for primary CTAs */
background: var(--text-primary);          /* ✗ */
background: linear-gradient(..., #111);   /* ✗ */
background: #4A9EFF;                      /* ✗ */
```

- **No per-page or per-section CTA color variation.** Every "do something" button is lime.
- **Nav/tab active states** (sub-tabs, person-tabs, chart-tabs) are NOT CTAs — they stay dark (`--text-primary`). Only action buttons change.
- Secondary buttons: transparent background, `--border-strong` border, `--text-primary` text.
- Danger buttons: transparent default, red tint on hover only.

---

## Data Visualization Palette

Use **only** `--viz-*` tokens for charts, sparklines, progress/allocation bars. Never introduce arbitrary hex values.

| Token | Value | Meaning |
|---|---|---|
| `--viz-growth` | `#8FE62C` | Savings rate, net worth, key growth metrics |
| `--viz-income` | `#5DC840` | Income, monthly savings, positive cashflow |
| `--viz-expense` | `#FF9500` | Expenses, spending, budget consumption |
| `--viz-investment` | `#3B73FF` | Investment balances, asset tracking |
| `--viz-neutral` | `#ABABAB` | Debt, other categories, secondary series |

### Dashboard metric card assignments
| Card | Token |
|---|---|
| Monthly Income | `--viz-income` |
| Monthly Expenses | `--viz-expense` |
| Savings Rate | `--viz-growth` |
| Net Worth | `--viz-growth` |
| Monthly Savings | `--viz-income` |
| Total Investments | `--viz-investment` |

### Asset allocation color map
| Class | Color |
|---|---|
| Equity | `#3B73FF` (`--viz-investment`) |
| Debt | `#6B6B6B` (`--viz-neutral`) |
| Hybrid | `#FF9500` (`--viz-expense`) |
| Cash | `#5DC840` (`--viz-income`) |
| Real Estate | `#5DC840` (`--viz-income`) |
| Commodity / Gold | `#d97706` |
| Other | `#ABABAB` (`--viz-neutral`) |

---

## Colors to never use

These are off-brand and must not be introduced:

- `#EBEBEB` — old page canvas, replaced by `#F4F6F8`
- `#111111` — old text primary, replaced by `#0F172A`
- `rgba(0,0,0,0.08)` — old border style, replaced by solid `#E5E8EC`
- `rgba(0,0,0,0.14)` — old strong border, replaced by `#CBD5E1`
- `#6366F1` or `#8b5cf6` — purple/indigo, not in palette
- `#4A9EFF` — sky blue, was a one-off family CTA, removed
- `rgba(0,102,255,...)` or `rgba(0,212,255,...)` — off-brand blues
- `rgba(168,85,247,...)` or `rgba(167,139,250,...)` — off-brand purple
- `#f59e0b` — amber, not in palette (use `#d97706` for gold/commodity only)
- `#ef4444` — only for danger/error UI states, never for data viz

---

## Shared style files

| File | Purpose |
|---|---|
| `code/design-system.css` | All tokens + base components incl. `.wos-table`, `.wos-input`, `.wos-badge`. Load first. |
| `code/controls.css` | Shared `.action-btn`, tabs, page headers, month nav. Load after design-system. |
| `code/dark-overrides.css` | Dark mode patches for hardcoded colors. |
| `code/sidebar.js` | JS-rendered sidebar — drop `<aside id="sidebar-root"></aside>` and include this script. |

If you add a new page or component:
- Override `.action-btn.primary` → always use `var(--cta-bg, #8FE62C)` — never hardcode a color.
- Use `class="wos-input"` for all form inputs — don't write custom input CSS.
- Use `class="wos-table"` for all data tables — don't write custom table CSS.
- Use `class="wos-badge positive|negative|neutral"` for status chips.

---

## Tech stack
- Node.js / Express backend (`server/server.js`)
- Static HTML/CSS/JS frontend served from `code/`
- Supabase for auth and data storage
- No build step — edit files directly
