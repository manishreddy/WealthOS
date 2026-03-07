# WealthOS Data Module

Comprehensive sample data and storage utilities for WealthOS application.

## Overview

This data module provides realistic Indian family financial data and localStorage utilities to power the WealthOS application. It includes sample data for Manish & Raghavi with complete financial information spanning assets, liabilities, goals, transactions, and more.

## Files

### 1. `dataModels.js`
TypeScript-style interfaces defined in JSDoc for all data models including:
- FamilyMember
- MonthlyIncome
- MonthlyExpense
- Asset
- Liability
- FinancialGoal
- Transaction
- Budget
- InsurancePolicy
- TaxRecord

### 2. `sampleData.js`
Comprehensive sample data including:
- **Family Structure**: 2 members (Manish & Raghavi)
- **Monthly Income**: Last 12 months of salary and bonus data
- **Monthly Expenses**: Last 3 months with detailed categorization
- **Assets**: ₹1.67 Cr total value
  - Mutual Funds (5 funds)
  - Stocks (4 stocks via Zerodha)
  - Fixed Deposits (2 FDs)
  - PPF (2 accounts)
  - NPS (2 accounts)
  - EPF (2 accounts)
  - Real Estate (1 apartment)
  - Gold (Physical + SGB)
  - Cash/Savings (2 bank accounts)
- **Liabilities**: ₹42.7 Lakhs total
  - Home Loan (₹38.5 L outstanding)
  - Car Loan (₹4.2 L outstanding)
- **Goals**: 6 financial goals
  - Buy Dream House
  - Child Education Fund
  - Retirement Corpus
  - Europe Vacation
  - Emergency Fund
  - New Car
- **Transactions**: 62 transactions over last 3 months
- **Insurance**: 4 policies (Life, Health, Vehicle)
- **Budgets**: Monthly budget tracking

### 3. `localStorage.js`
Complete localStorage utility functions:

#### Core Functions
```javascript
// Initialize app with sample data
WealthOSStorage.initializeData();

// Reset with fresh data
WealthOSStorage.initializeData(true);

// Clear all data
WealthOSStorage.clearData(true);

// Check initialization status
WealthOSStorage.isInitialized();
```

#### Data Retrieval
```javascript
// Get family members
const members = WealthOSStorage.getFamilyMembers();

// Get monthly income (with optional filters)
const income = WealthOSStorage.getMonthlyIncome('2025-02', 'FM001');

// Get monthly expenses (with optional filters)
const expenses = WealthOSStorage.getMonthlyExpenses('2025-02', 'Food');

// Get assets (with optional filters)
const assets = WealthOSStorage.getAssets('MutualFund', 'FM001');

// Get liabilities
const liabilities = WealthOSStorage.getLiabilities('HomeLoan');

// Get financial goals (with optional status filter)
const goals = WealthOSStorage.getGoals('OnTrack');

// Get transactions (with filters)
const transactions = WealthOSStorage.getTransactions({
    type: 'Expense',
    category: 'Food',
    memberId: 'FM001',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-02-17'),
    limit: 10
});

// Get insurance policies
const insurance = WealthOSStorage.getInsurance('Life');

// Get budgets
const budgets = WealthOSStorage.getBudgets('2025-02');

// Get expense categories
const categories = WealthOSStorage.getExpenseCategories();

// Get user preferences
const prefs = WealthOSStorage.getUserPreferences();
```

#### Data Updates
```javascript
// Add new transaction
WealthOSStorage.addTransaction({
    id: 'T063',
    date: new Date(),
    type: 'Expense',
    category: 'Food',
    subcategory: 'Groceries',
    amount: 5000,
    description: 'Weekly groceries',
    paymentMethod: 'UPI',
    memberId: 'FM001',
    isRecurring: false,
    tags: 'food,groceries'
});

// Update asset
WealthOSStorage.updateAsset('A001', {
    currentValue: 460000,
    nav: 87.85
});

// Update goal
WealthOSStorage.updateGoal('G001', {
    currentAmount: 2600000,
    progressPercentage: 21.67
});

// Update preferences
WealthOSStorage.updatePreferences({
    theme: 'dark',
    dashboardView: 'minimal'
});
```

#### Utilities
```javascript
// Get storage information
const info = WealthOSStorage.getStorageInfo();
console.log(`Total storage: ${info.totalSizeKB} KB`);

// Export all data as JSON
const backup = WealthOSStorage.exportAllData();
console.log(JSON.stringify(backup, null, 2));

// Import data from JSON
WealthOSStorage.importData(backup);

// Direct save/load
WealthOSStorage.saveData('custom_key', myData);
const myData = WealthOSStorage.loadData('custom_key', defaultValue);
```

## Usage in HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>WealthOS</title>
</head>
<body>
    <!-- Load data models (optional, for type definitions) -->
    <script src="data/dataModels.js"></script>

    <!-- Load sample data -->
    <script src="data/sampleData.js"></script>

    <!-- Load storage utilities -->
    <script src="data/localStorage.js"></script>

    <script>
        // Initialize on first load
        if (!WealthOSStorage.isInitialized()) {
            WealthOSStorage.initializeData();
        }

        // Use the data
        const members = WealthOSStorage.getFamilyMembers();
        const assets = WealthOSStorage.getAssets();
        const summary = window.WealthOSSummary;

        console.log('Family:', members);
        console.log('Net Worth:', summary.netWorth);
        console.log('Monthly Savings:', summary.monthlySavings);
    </script>
</body>
</html>
```

## Sample Data Summary

### Financial Overview
- **Total Assets**: ₹1.67 Crores
- **Total Liabilities**: ₹42.7 Lakhs
- **Net Worth**: ₹1.24 Crores
- **Monthly Income**: ₹3.5 Lakhs (combined)
- **Monthly Expenses**: ₹1.74 Lakhs (average)
- **Monthly Savings**: ₹1.76 Lakhs
- **Savings Rate**: ~50%

### Asset Breakdown
- Equity (Stocks + MF): ₹54.4 Lakhs (32.5%)
- Debt (FD + PPF): ₹22.45 Lakhs (13.4%)
- Retirement (EPF + NPS): ₹26.8 Lakhs (16.0%)
- Real Estate: ₹85 Lakhs (50.7%)
- Gold: ₹4.6 Lakhs (2.7%)
- Cash: ₹4.3 Lakhs (2.6%)

### Monthly Expense Categories
- Housing: ₹40.8K (23.4%)
- EMI: ₹63K (36.2%)
- Food: ₹19.3K (11.1%)
- Transportation: ₹10.7K (6.1%)
- Insurance: ₹8K (4.6%)
- Shopping: ₹23K (13.2%)
- Others: ₹9.2K (5.4%)

### Goals Progress
1. **Buy Dream House**: 20.8% complete (₹25L / ₹1.2Cr)
2. **Child Education Fund**: 16.0% complete (₹8L / ₹50L)
3. **Retirement Corpus**: 13.0% complete (₹65L / ₹5Cr)
4. **Europe Vacation**: 31.25% complete (₹2.5L / ₹8L)
5. **Emergency Fund**: 60.8% complete (₹7.3L / ₹12L)
6. **New Car**: 30.0% complete (₹4.5L / ₹15L)

## Data Customization

### Adding New Data
```javascript
// Add your own assets
const myAssets = WealthOSStorage.getAssets();
myAssets.push({
    id: 'A023',
    type: 'MutualFund',
    name: 'My Fund',
    currentValue: 100000,
    investedAmount: 80000,
    returns: 20000,
    returnsPercentage: 25.0,
    // ... other fields
});
WealthOSStorage.saveData(WealthOSStorage.STORAGE_KEYS.ASSETS, myAssets);
```

### Modifying Sample Data
Edit `sampleData.js` to change:
- Family member names and details
- Income amounts
- Expense categories
- Asset values
- Goal targets
- Transaction history

Then reset the app:
```javascript
WealthOSStorage.initializeData(true);
```

## Storage Keys

All data is stored with prefixed keys to avoid conflicts:
- `wealthos_family_members`
- `wealthos_monthly_income`
- `wealthos_monthly_expenses`
- `wealthos_assets`
- `wealthos_liabilities`
- `wealthos_goals`
- `wealthos_transactions`
- `wealthos_insurance`
- `wealthos_budgets`
- `wealthos_expense_categories`
- `wealthos_initialized`
- `wealthos_last_updated`
- `wealthos_preferences`

## Browser Console Commands

Open browser console (F12) and try:

```javascript
// View all data
console.table(WealthOSStorage.getFamilyMembers());
console.table(WealthOSStorage.getAssets());

// View summary
console.log(window.WealthOSSummary);

// View storage info
console.table(WealthOSStorage.getStorageInfo().breakdown);

// Export backup
const backup = WealthOSStorage.exportAllData();
console.log(JSON.stringify(backup, null, 2));

// Download backup as file
const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `wealthos-backup-${new Date().toISOString()}.json`;
a.click();
```

## Notes

- All amounts are in INR (Indian Rupees)
- Dates are in ISO format
- Sample data represents realistic Indian family finances
- Uses Indian financial institutions (HDFC, ICICI, SBI, Zerodha, etc.)
- Includes typical Indian investment types (PPF, EPF, NPS, ELSS)
- Expense categories match Indian spending patterns
- All data persists in browser localStorage
- No server or database required
- Works completely offline

## Next Steps

1. Load these scripts in your HTML files
2. Initialize data on first load
3. Build UI components that consume this data
4. Add features to update and manage data
5. Implement analytics and visualizations
6. Add export/import for backups

## Support

For issues or questions about the data module, refer to the main project documentation or check the implementation in the HTML files.
