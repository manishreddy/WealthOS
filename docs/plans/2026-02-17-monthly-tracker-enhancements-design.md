# Monthly Tracker & Savings Plan Enhancements Design

**Date:** 2026-02-17
**Status:** Approved for Implementation
**Approach:** Extend Existing Pages (Approach A)

## Overview

Enhance WealthOS Monthly Tracker and Savings Plan to support person-wise financial tracking for couples with comprehensive investment insights.

## Requirements

### 1. Person-wise Tracking
- Track finances for 2 people individually + combined household view
- All categories tracked separately: Income, Expenditure, Investments, Savings
- Combined view shows simple totals (Person 1 + Person 2)

### 2. Savings Plan Investment Insights
- Asset class allocation (Equity, Debt, Gold, Others)
- Equity breakdown (Large Cap, Mid Cap, Small Cap)
- Investment recommendations based on age-based defaults or custom targets
- Historical monthly investment tracking

### 3. UI/UX
- Tab navigation: Person 1 | Person 2 | Combined
- Both Monthly Tracker and Savings Plan have person-wise tabs
- Investment data flows: Monthly Tracker → Savings Plan (with manual categorization)

## Data Architecture

### localStorage Structure

```javascript
// Monthly Tracker Data
monthlyTracker = {
  "2026-02": {
    person1: {
      income: 385000,
      expenditure: 150000,
      investments: 80000,
      savings: 155000, // auto-calculated
      incomeBreakup: [{name: "Salary", amount: 385000}],
      expenditureBreakup: [],
      investmentsBreakup: [{name: "Nifty 50 SIP", amount: 25000}]
    },
    person2: { /* same structure */ },
    combined: { /* auto-calculated totals */ }
  }
}

// Savings Plan Data
savingsPlan = {
  person1: {
    investments: [
      {
        name: "Nifty 50 SIP",
        amount: 25000,
        assetClass: "Equity",
        subCategory: "Large Cap",
        monthAdded: "2026-02"
      }
    ],
    targets: {
      equity: 60,      // %
      debt: 30,
      gold: 5,
      others: 5,
      ageBasedDefaults: true
    }
  },
  person2: { /* same structure */ },
  combined: { /* aggregated view */ }
}

// Person Settings
personSettings = {
  person1Name: "Person 1",
  person2Name: "Person 2",
  person1Age: 30,
  person2Age: 28
}
```

## UI Components

### Monthly Tracker Page

**1. Tab Navigation**
- Add tabs: [Person 1] [Person 2] [Combined]
- Active tab changes all data displayed
- Tab labels use configured names

**2. Category Cards**
- Same 5 cards per tab (Income, Expenditure, Investments, Savings, Net)
- Independent data per person
- Combined tab shows summed totals

**3. Summary & History**
- Updates based on active tab
- Savings rate gauge reflects selected person/combined

### Savings Plan Page

**1. Tab Navigation**
- Same tab structure as Monthly Tracker

**2. Investment Import Section**
- Shows uncategorized investments from Monthly Tracker
- "Categorize" button opens modal with Asset Class + Sub-Category dropdowns

**3. Asset Allocation Dashboard**
- Current allocation pie chart or progress bars
- Equity, Debt, Gold, Others percentages

**4. Equity Breakdown**
- Large Cap, Mid Cap, Small Cap breakdown with amounts

**5. Recommendations Section**
- Compare current vs target allocations
- Show warnings for significant gaps (>5%)
- "Adjust Targets" button to customize

**6. Monthly Investment History**
- Table showing last 6 months
- Total invested + breakdown by asset class

## Investment Categories

### Asset Classes & Sub-categories

**Equity:**
- Large Cap
- Mid Cap
- Small Cap
- International

**Debt:**
- FD
- Bonds
- Debt Funds
- PPF

**Gold:**
- Physical
- Gold ETF
- Sovereign Gold Bonds

**Others:**
- Real Estate
- Crypto
- Commodities

## Recommendation Engine

### Age-based Default Targets

```
Age < 30:  Equity 80%, Debt 15%, Gold 5%, Others 0%
Age 30-40: Equity 70%, Debt 20%, Gold 5%, Others 5%
Age 40-50: Equity 60%, Debt 30%, Gold 5%, Others 5%
Age 50+:   Equity 40%, Debt 50%, Gold 5%, Others 5%
```

### Recommendation Logic
- Calculate current allocation percentages
- Compare with targets (age-based or custom)
- Show warnings if gap > 5%
- Suggest rebalancing actions

## Data Flow

1. **Monthly Tracker Entry:**
   - User enters investments with amounts and names (uncategorized)
   - Saved to `monthlyTracker[month][person].investmentsBreakup`

2. **Savings Plan Import:**
   - Read investments from Monthly Tracker
   - Check if already categorized in `savingsPlan[person].investments`
   - Show uncategorized investments in "Import" section

3. **Categorization:**
   - User clicks "Categorize"
   - Modal shows dropdowns for Asset Class + Sub-category
   - Save to `savingsPlan[person].investments` with category tags

4. **Analytics Calculation:**
   - Aggregate by asset class and sub-category
   - Calculate percentages
   - Compare with targets
   - Generate recommendations

5. **Historical Tracking:**
   - Each month's investments stored with `monthAdded` field
   - Historical view aggregates by month for trend analysis

## Implementation Scope

### Phase 1: Monthly Tracker Person-wise (Day 1-2)
- Add tab navigation component
- Extend data model for person1/person2/combined
- Person name configuration (modal + settings)
- Update all calculations to support person-wise data
- Update summary and history sections

### Phase 2: Savings Plan Investment Insights (Day 2-3)
- Add tab navigation
- Build investment import section
- Create categorization modal
- Implement asset allocation dashboard
- Build equity breakdown component
- Create recommendations engine
- Add monthly history table
- Add target customization UI

### Phase 3: Testing & Polish (Day 3)
- Test data flow between pages
- Test calculations
- Responsive design adjustments
- Browser compatibility testing

## Technical Decisions

- **Storage:** localStorage (no backend required)
- **Framework:** Vanilla JavaScript (consistent with existing codebase)
- **Styling:** Inline CSS using existing design system
- **Data persistence:** Auto-save on changes
- **Combined view:** Calculated on-the-fly (not stored)

## Success Criteria

✅ Can track income/expenses/investments for 2 people separately
✅ Combined view shows accurate totals
✅ Can categorize investments by asset class and sub-category
✅ Asset allocation displays correctly with percentages
✅ Recommendations based on targets show meaningful insights
✅ Historical data tracks monthly investment patterns
✅ Data persists across page refreshes
✅ UI matches existing WealthOS design language

## Future Enhancements (Out of Scope)

- Backend API for multi-device sync
- More sophisticated recommendation algorithms
- Cross-person comparison charts
- Export to Excel/PDF
- Mobile app version
- Multiple household support
