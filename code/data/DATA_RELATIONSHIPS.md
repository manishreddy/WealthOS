# WealthOS Data Relationships & Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         WealthOS Application                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Uses
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      localStorage.js (16 KB)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Storage API: 30+ Functions                               │  │
│  │  - getFamilyMembers()    - updateAsset()                  │  │
│  │  - getAssets()           - addTransaction()               │  │
│  │  - getTransactions()     - exportAllData()                │  │
│  │  - getGoals()            - initializeData()               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                      ┌──────────┴──────────┐
                      │                     │
                      ▼                     ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Browser localStorage │  │   sampleData.js      │
        │  (Persisted Data)     │  │   (Initial Data)     │
        └──────────────────────┘  └──────────────────────┘
```

## Core Data Entities

```
┌────────────────┐
│ Family Members │────┐
│   (2 members)  │    │
└────────────────┘    │
                      │ owns
                      ▼
┌────────────────────────────────────────────────────────────┐
│                        Assets (22)                          │
│  ┌──────────┐  ┌──────┐  ┌────┐  ┌─────┐  ┌─────┐        │
│  │MutualFund│  │Stocks│  │ FD │  │ PPF │  │ EPF │  ...   │
│  │   (5)    │  │ (4)  │  │(2) │  │ (2) │  │ (2) │        │
│  └──────────┘  └──────┘  └────┘  └─────┘  └─────┘        │
└────────────────────────────────────────────────────────────┘
                      │ linked to
                      ▼
┌────────────────────────────────────────────────────────────┐
│                    Financial Goals (6)                      │
│  - Buy Dream House       - Emergency Fund                   │
│  - Child Education       - New Car                          │
│  - Retirement Corpus     - Europe Vacation                  │
└────────────────────────────────────────────────────────────┘
                      │
                      │ tracked via
                      ▼
┌────────────────────────────────────────────────────────────┐
│                   Transactions (62)                         │
│  Types: Income, Expense, Investment, Withdrawal             │
│  Period: Last 3 months                                      │
└────────────────────────────────────────────────────────────┘
```

## Entity Relationships

```
FamilyMember (1) ─────── owns ────────► (N) Assets
     │                                      │
     │                                      │
     │ has                          linked to
     │                                      │
     ▼                                      ▼
MonthlyIncome (N)                   Goals (N)
     │                                      │
     │                                      │
     │ generates                    tracked by
     │                                      │
     ▼                                      ▼
MonthlyExpense (N)                  Transactions (N)
     │                                      │
     └──────────────┬───────────────────────┘
                    │
                    │ tracked by
                    ▼
                 Budget (N)
```

## Data Flow: Typical Operations

### 1. Application Startup
```
┌──────────┐
│  Start   │
└────┬─────┘
     │
     ▼
┌───────────────────┐      NO     ┌──────────────────┐
│ isInitialized()?  │──────────►  │ initializeData() │
└───────┬───────────┘              └────────┬─────────┘
        │ YES                               │
        └───────────────┬───────────────────┘
                        ▼
                ┌──────────────┐
                │  Load Data   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Render UI    │
                └──────────────┘
```

### 2. Display Dashboard
```
┌─────────────────┐
│ getFamilyMembers│──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │
│   getAssets()   │──┤  Calculate
└─────────────────┘  │  Summary
                     ├──────────► Display
┌─────────────────┐  │            Cards
│getLiabilities() │──┤
└─────────────────┘  │
                     │
┌─────────────────┐  │
│getTransactions()│──┘
└─────────────────┘
```

### 3. Add Transaction
```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ▼
┌────────────────────┐
│ Create Transaction │
│    Object          │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ addTransaction()   │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐      ┌──────────────┐
│ Save to Storage    │─────►│ Update UI    │
└────────────────────┘      └──────────────┘
```

### 4. Update Asset Value
```
┌─────────────┐
│ New NAV     │
└──────┬──────┘
       │
       ▼
┌────────────────────┐
│ Calculate New      │
│ Current Value      │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Calculate Returns  │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ updateAsset(id, {  │
│   currentValue,    │
│   returns,         │
│   returnsPercent   │
│ })                 │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐      ┌──────────────┐
│ Save to Storage    │─────►│ Refresh UI   │
└────────────────────┘      └──────────────┘
```

## Data Dependencies

### Asset → Goal
```
Asset (A001)
    ↓
Goal (G001) ← linkedAssets: ['A001', 'A002', 'A010']
```

**Example**:
- SBI Bluechip Fund (A001) is linked to "Buy Dream House" goal (G001)
- When asset value increases, goal progress automatically reflects it

### Transaction → Asset/Goal
```
Transaction (T001)
    ├─→ assetId: 'A001'    (SIP investment)
    └─→ goalId: 'G001'     (Contributing to house goal)
```

**Example**:
- Monthly SIP transaction (T001) records:
  - Investment in specific asset (A001)
  - Contribution to goal (G001)

### FamilyMember → Income/Expense/Asset
```
FamilyMember (FM001: Manish)
    ├─→ MonthlyIncome (all income records)
    ├─→ Transactions (all transactions)
    └─→ Assets (owned assets)
```

## Storage Key Mapping

```
Browser localStorage
│
├── wealthos_family_members ────► FamilyMember[]
│
├── wealthos_monthly_income ────► MonthlyIncome[]
│
├── wealthos_monthly_expenses ──► MonthlyExpense[]
│
├── wealthos_assets ─────────────► Asset[]
│
├── wealthos_liabilities ────────► Liability[]
│
├── wealthos_goals ──────────────► FinancialGoal[]
│
├── wealthos_transactions ───────► Transaction[]
│
├── wealthos_insurance ──────────► InsurancePolicy[]
│
├── wealthos_budgets ────────────► Budget[]
│
├── wealthos_expense_categories ─► Object (categories)
│
├── wealthos_preferences ────────► Object (user settings)
│
├── wealthos_initialized ────────► Boolean
│
└── wealthos_last_updated ───────► ISO Date String
```

## Sample Data Hierarchy

```
WealthOS Data
│
├── Core Data
│   ├── Family Members (2)
│   │   ├── FM001: Manish Reddy
│   │   └── FM002: Raghavi Reddy
│   │
│   ├── Financial Summary
│   │   ├── Net Worth: ₹1.24 Cr
│   │   ├── Total Assets: ₹1.67 Cr
│   │   ├── Total Liabilities: ₹42.7 L
│   │   ├── Monthly Income: ₹3.5 L
│   │   ├── Monthly Expense: ₹1.74 L
│   │   └── Monthly Savings: ₹1.76 L (50%)
│   │
│   └── Time Period
│       ├── Income: Last 12 months
│       ├── Expenses: Last 3 months
│       └── Transactions: Last 3 months
│
├── Assets (₹1.67 Cr)
│   ├── Investments (₹1.18 Cr)
│   │   ├── Mutual Funds (₹17.5 L)
│   │   │   ├── A001: SBI Bluechip ─────► ₹4.5 L
│   │   │   ├── A002: Axis ELSS ────────► ₹3.2 L
│   │   │   ├── A003: HDFC Balanced ────► ₹2.8 L
│   │   │   ├── A004: Parag Parikh ─────► ₹5.5 L
│   │   │   └── A005: ICICI Liquid ─────► ₹1.5 L
│   │   │
│   │   ├── Stocks (₹10.2 L)
│   │   │   ├── A006: Reliance ─────────► ₹2.8 L
│   │   │   ├── A007: HDFC Bank ────────► ₹1.8 L
│   │   │   ├── A008: Infosys ──────────► ₹1.65 L
│   │   │   └── A009: TCS ──────────────► ₹3.95 L
│   │   │
│   │   ├── Fixed Deposits (₹8.35 L)
│   │   │   ├── A010: HDFC FD ──────────► ₹5.2 L
│   │   │   └── A011: ICICI FD ─────────► ₹3.15 L
│   │   │
│   │   ├── PPF (₹11 L)
│   │   │   ├── A012: SBI PPF ──────────► ₹6.8 L
│   │   │   └── A013: ICICI PPF ────────► ₹4.2 L
│   │   │
│   │   ├── NPS (₹6.3 L)
│   │   │   ├── A014: HDFC NPS ─────────► ₹3.8 L
│   │   │   └── A015: SBI NPS ──────────► ₹2.5 L
│   │   │
│   │   ├── EPF (₹20.5 L)
│   │   │   ├── A016: Manish EPF ───────► ₹12 L
│   │   │   └── A017: Raghavi EPF ──────► ₹8.5 L
│   │   │
│   │   └── Gold (₹4.6 L)
│   │       ├── A019: Physical Gold ────► ₹2.8 L
│   │       └── A020: Gold Bonds ───────► ₹1.8 L
│   │
│   ├── Real Estate (₹85 L)
│   │   └── A018: Whitefield Apartment ─► ₹85 L
│   │
│   └── Cash (₹4.3 L)
│       ├── A021: HDFC Savings ─────────► ₹2.5 L
│       └── A022: ICICI Savings ────────► ₹1.8 L
│
├── Liabilities (₹42.7 L)
│   ├── L001: Home Loan ────────────────► ₹38.5 L (EMI: ₹45K)
│   └── L002: Car Loan ─────────────────► ₹4.2 L (EMI: ₹18K)
│
├── Goals (6)
│   ├── G001: Buy Dream House ──────────► 20.8% (₹25L/₹1.2Cr)
│   ├── G002: Child Education ──────────► 16% (₹8L/₹50L)
│   ├── G003: Retirement ───────────────► 13% (₹65L/₹5Cr)
│   ├── G004: Europe Vacation ──────────► 31.25% (₹2.5L/₹8L)
│   ├── G005: Emergency Fund ───────────► 60.83% (₹7.3L/₹12L)
│   └── G006: New Car ──────────────────► 30% (₹4.5L/₹15L)
│
└── Transactions (62)
    ├── By Type
    │   ├── Income ─────────────────────► 12 entries
    │   ├── Expense ────────────────────► 40 entries
    │   └── Investment ─────────────────► 10 entries
    │
    └── By Category
        ├── Housing ────────────────────► ₹40.8K/month
        ├── EMI ────────────────────────► ₹63K/month
        ├── Food ───────────────────────► ₹19.3K/month
        ├── Transportation ─────────────► ₹10.7K/month
        └── Others ─────────────────────► ₹40.2K/month
```

## Access Patterns

### 1. Dashboard View
```javascript
// Get summary
const summary = window.WealthOSSummary;

// Get breakdown
const assets = WealthOSStorage.getAssets();
const liabilities = WealthOSStorage.getLiabilities();
const recentTxns = WealthOSStorage.getTransactions({ limit: 5 });
```

### 2. Portfolio View
```javascript
// Group by asset type
const assetTypes = ['MutualFund', 'Stock', 'FD', 'PPF', 'NPS', 'EPF'];
assetTypes.forEach(type => {
    const assets = WealthOSStorage.getAssets(type);
    // Display assets of this type
});
```

### 3. Spending Analysis
```javascript
// Get monthly expenses
const expenses = WealthOSStorage.getMonthlyExpenses('2025-02');

// Group by category
const byCategory = {};
expenses.forEach(exp => {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
});
```

### 4. Goal Tracking
```javascript
// Get all goals
const goals = WealthOSStorage.getGoals();

// For each goal, get linked assets
goals.forEach(goal => {
    goal.linkedAssets.forEach(assetId => {
        const asset = WealthOSStorage.getAssets().find(a => a.id === assetId);
        // Calculate contribution
    });
});
```

## Query Performance

| Operation | Time | Storage Access |
|-----------|------|----------------|
| Get all assets | < 5ms | 1 read |
| Filter assets by type | < 5ms | 1 read + filter |
| Get recent transactions | < 10ms | 1 read + sort + slice |
| Calculate summary | < 15ms | Multiple reads |
| Export all data | < 100ms | All reads |

## Data Validation Rules

### Asset
- `currentValue >= 0`
- `investedAmount > 0`
- `returns = currentValue - investedAmount`
- `returnsPercentage = (returns / investedAmount) * 100`

### Transaction
- `amount > 0`
- `date <= today`
- `memberId` must exist in FamilyMembers
- `assetId` must exist if type is 'Investment'

### Goal
- `targetAmount > 0`
- `currentAmount >= 0`
- `progressPercentage = (currentAmount / targetAmount) * 100`
- `status` based on progress vs timeline

### Budget
- `budgetAmount > 0`
- `spentAmount >= 0`
- `remaining = budgetAmount - spentAmount`
- `percentageUsed = (spentAmount / budgetAmount) * 100`

## Extension Points

### To Add New Asset Type
1. Add type to Asset in dataModels.js
2. Add sample data in sampleData.js
3. No code change needed in localStorage.js (generic)
4. Update UI to display new type

### To Add New Transaction Type
1. Add type to Transaction in dataModels.js
2. Add sample transactions in sampleData.js
3. Update filtering logic if needed
4. Update UI categories

### To Add New Goal Type
1. Add type to FinancialGoal in dataModels.js
2. Add sample goals in sampleData.js
3. Add icon/color mapping in UI
4. Update goal templates

## Best Practices

1. **Always use getter functions**: Don't access localStorage directly
2. **Filter at storage level**: More efficient than UI filtering
3. **Update with helper functions**: Use `updateAsset()`, not direct save
4. **Backup before major changes**: Use `exportAllData()`
5. **Validate data**: Check required fields before saving
6. **Parse dates**: Convert date strings when loading transactions
7. **Calculate on-the-fly**: Don't store calculated values (returns %, etc.)
8. **Use consistent IDs**: Prefix with type (FM, A, L, G, T, etc.)

---

*This document provides a comprehensive view of data relationships and architecture in WealthOS.*
