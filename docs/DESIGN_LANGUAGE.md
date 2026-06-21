# WealthOS Design Language

Single source of truth for colors, buttons, and data visualization across the product.
All tokens live in `code/design-system.css`.

---

## Brand Palette

| Role | Token | Light value | Dark value |
|---|---|---|---|
| Page background | `--bg` | `#EBEBEB` | `#0A0A0A` |
| Primary dark | `--text-primary` | `#111111` | `#F0F0F0` |
| Brand accent (lime) | `--accent` | `#8FE62C` | `#8FE62C` |
| Accent dark (links) | `--accent-dark` | `#6CC41A` | — |
| Card surface (light) | `--card-light-bg` | `#FFFFFF` | `#1C1C1C` |
| Card surface (dark) | `--card-dark-bg` | `#111111` | `#1A1A1A` |

---

## Call-to-Action Standard

**Every primary action button uses the same lime green.** No exceptions per page, per tab, or per section.

| Token | Value | Purpose |
|---|---|---|
| `--cta-bg` | `#8FE62C` | Background of all primary buttons |
| `--cta-text` | `#111111` | Text color on primary buttons |

```css
/* Primary CTA */
background: var(--cta-bg);   /* #8FE62C */
color: var(--cta-text);      /* #111111 */

/* Secondary CTA */
background: transparent;
color: var(--text-primary);
border: 1.5px solid var(--border-strong);

/* Danger */
background: transparent;  /* red tint applied on :hover only */
```

> **Note:** Navigation tab active states (sub-tabs, chart period tabs, person tabs) use `--text-primary` (dark) for their selected state — these are selectors, not action buttons, and are intentionally different from CTAs.

---

## Semantic Colors

Reserved for specific meanings — do not use outside their context.

| Token | Value | Use |
|---|---|---|
| `--positive` | `#5DC840` | Gains, on-track, success states |
| `--negative` | `#FF3B3B` | Losses, danger, errors |
| `--warning` | `#FF9500` | Over-budget, caution states |

---

## Data Visualization Palette

Use **only** these tokens for charts, sparklines, progress bars, and allocation bars.

| Token | Value | Semantic meaning |
|---|---|---|
| `--viz-growth` | `#8FE62C` | Savings rate, net worth, key growth metrics |
| `--viz-income` | `#5DC840` | Income, monthly savings, positive cashflow |
| `--viz-expense` | `#FF9500` | Expenses, spending, budget consumption |
| `--viz-investment` | `#3B73FF` | Investment balances, asset class tracking |
| `--viz-neutral` | `#ABABAB` | Debt, other categories, secondary data series |

### Metric card assignments

| Card | Token |
|---|---|
| Monthly Income | `--viz-income` |
| Monthly Expenses | `--viz-expense` |
| Savings Rate | `--viz-growth` |
| Net Worth | `--viz-growth` |
| Monthly Savings | `--viz-income` |
| Total Investments | `--viz-investment` |

### Asset allocation map

| Asset class | Color |
|---|---|
| Equity | `#3B73FF` |
| Debt | `#6B6B6B` |
| Hybrid | `#FF9500` |
| Cash | `#5DC840` |
| Real Estate | `#5DC840` |
| Commodity | `#d97706` |
| Gold | `#d97706` |
| Other | `#ABABAB` |

---

## Typography

Font: **Inter** (loaded from Google Fonts)

| Token | Size | Weight | Use |
|---|---|---|---|
| `--font` | — | — | Body and UI text |
| `.ds-display` | 3.5rem | 800 | Hero numbers |
| `.ds-h1` | 2.25rem | 700 | Page titles |
| `.ds-h2` | 1.5rem | 700 | Section headings |
| `.ds-h3` | 1.125rem | 600 | Card titles |
| `.ds-label` | 0.75rem | 500 | Uppercase labels |
| `.ds-caption` | 0.6875rem | — | Metadata, timestamps |

Number displays use `font-feature-settings: 'tnum' 1` (tabular figures) for alignment.

---

## Shadows & Borders

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.06)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.12)` |
| `--border` | `rgba(0,0,0,0.08)` |
| `--border-strong` | `rgba(0,0,0,0.14)` |
| `--card-radius` | `20px` |

---

## File Map

```
code/
  design-system.css   ← all tokens + base components (load first)
  controls.css        ← shared action-btn, tabs, page headers
  dark-overrides.css  ← dark mode patches for hardcoded values
  user-menu.css       ← user avatar / dropdown
```

Every page must load `design-system.css` before its own styles. Pages that
define `.action-btn.primary` locally must use `var(--cta-bg, #8FE62C)`.

---

## Prohibited colors

Do not introduce these — they are off-brand or semantically misused:

| Color | Reason |
|---|---|
| `#6366F1`, `#8b5cf6` | Purple/indigo — not in palette |
| `#4A9EFF` | One-off blue CTA, removed |
| `#f59e0b` | Amber — use `#d97706` for gold/commodity only |
| `#ef4444` | Use `--negative` (`#FF3B3B`) instead |
| Any black gradient for CTAs | CTAs are lime, not dark |
