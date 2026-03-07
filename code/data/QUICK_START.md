# WealthOS Data Module - Quick Start Guide

## 5-Minute Setup

### Step 1: Include the Files
```html
<script src="data/sampleData.js"></script>
<script src="data/localStorage.js"></script>
```

### Step 2: Initialize Data (First Time Only)
```javascript
if (!WealthOSStorage.isInitialized()) {
    WealthOSStorage.initializeData();
}
```

### Step 3: Use the Data
```javascript
// Get family members
const members = WealthOSStorage.getFamilyMembers();

// Get assets
const assets = WealthOSStorage.getAssets();

// Get recent transactions
const transactions = WealthOSStorage.getTransactions({ limit: 10 });

// Get financial summary
const summary = window.WealthOSSummary;
```

## Common Use Cases

### 1. Display Net Worth
```javascript
const summary = window.WealthOSSummary;
console.log(`Net Worth: ₹${(summary.netWorth / 10000000).toFixed(2)} Cr`);
```

### 2. Show Monthly Expenses by Category
```javascript
const expenses = WealthOSStorage.getMonthlyExpenses('2025-02');
const byCategory = {};

expenses.forEach(exp => {
    if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
    }
    byCategory[exp.category] += exp.amount;
});

console.table(byCategory);
```

### 3. Calculate Total Asset Value
```javascript
const assets = WealthOSStorage.getAssets();
const total = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
console.log(`Total Assets: ₹${(total / 10000000).toFixed(2)} Cr`);
```

### 4. Get Assets by Type
```javascript
const mutualFunds = WealthOSStorage.getAssets('MutualFund');
const stocks = WealthOSStorage.getAssets('Stock');
const realEstate = WealthOSStorage.getAssets('RealEstate');
```

### 5. Track Goal Progress
```javascript
const goals = WealthOSStorage.getGoals();
goals.forEach(goal => {
    console.log(`${goal.name}: ${goal.progressPercentage.toFixed(2)}% complete`);
});
```

### 6. Add New Transaction
```javascript
WealthOSStorage.addTransaction({
    id: 'T' + Date.now(),
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
```

### 7. Update Asset Value
```javascript
WealthOSStorage.updateAsset('A001', {
    currentValue: 460000,
    nav: 87.85,
    returns: 100000,
    returnsPercentage: 27.78
});
```

### 8. Filter Transactions
```javascript
// Get all food expenses in February
const foodExpenses = WealthOSStorage.getTransactions({
    type: 'Expense',
    category: 'Food',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-28')
});

// Calculate total
const total = foodExpenses.reduce((sum, t) => sum + t.amount, 0);
console.log(`Food expenses in Feb: ₹${total.toLocaleString('en-IN')}`);
```

### 9. Get Monthly Income vs Expenses
```javascript
const income = WealthOSStorage.getMonthlyIncome('2025-02');
const expenses = WealthOSStorage.getMonthlyExpenses('2025-02');

const totalIncome = income.reduce((sum, i) => sum + i.total, 0);
const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
const savings = totalIncome - totalExpenses;

console.log(`Income: ₹${totalIncome.toLocaleString('en-IN')}`);
console.log(`Expenses: ₹${totalExpenses.toLocaleString('en-IN')}`);
console.log(`Savings: ₹${savings.toLocaleString('en-IN')}`);
console.log(`Savings Rate: ${((savings/totalIncome)*100).toFixed(2)}%`);
```

### 10. Export Data for Backup
```javascript
const backup = WealthOSStorage.exportAllData();
const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `wealthos-backup-${new Date().toISOString()}.json`;
a.click();
```

## Data Structure Quick Reference

### Family Member
```javascript
{
    id: 'FM001',
    name: 'Manish Reddy',
    relationship: 'Self',
    age: 35,
    occupation: 'Senior Software Engineer',
    annualIncome: 2400000
}
```

### Asset
```javascript
{
    id: 'A001',
    type: 'MutualFund', // or Stock, FD, PPF, NPS, EPF, RealEstate, Gold, Cash
    name: 'SBI Bluechip Fund',
    currentValue: 450000,
    investedAmount: 360000,
    returns: 90000,
    returnsPercentage: 25.0,
    ownerId: 'FM001'
}
```

### Transaction
```javascript
{
    id: 'T001',
    date: new Date('2025-02-17'),
    type: 'Expense', // or Income, Investment, Withdrawal
    category: 'Food',
    subcategory: 'Groceries',
    amount: 12000,
    description: 'Monthly groceries',
    paymentMethod: 'UPI',
    memberId: 'FM001',
    isRecurring: false
}
```

### Goal
```javascript
{
    id: 'G001',
    name: 'Buy Dream House',
    type: 'House',
    targetAmount: 12000000,
    currentAmount: 2500000,
    progressPercentage: 20.83,
    priority: 'High',
    status: 'OnTrack'
}
```

## Utility Functions

### Format Currency
```javascript
function formatCurrency(amount) {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
}
```

### Calculate Returns Percentage
```javascript
function calculateReturns(invested, current) {
    return ((current - invested) / invested * 100).toFixed(2);
}
```

### Get Month Name
```javascript
function getMonthName(monthStr) {
    // monthStr format: '2025-02'
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}
```

## Browser Console Commands

Open your browser console (F12) and try these:

```javascript
// View all data
console.table(WealthOSStorage.getFamilyMembers());
console.table(WealthOSStorage.getAssets());
console.table(WealthOSStorage.getTransactions({ limit: 10 }));

// Get summary
console.log(window.WealthOSSummary);

// Storage info
console.table(WealthOSStorage.getStorageInfo().breakdown);

// Test data access
WealthOSStorage.getAssets().forEach(asset => {
    console.log(`${asset.name}: ${formatCurrency(asset.currentValue)}`);
});
```

## Testing

Open `data/test-data.html` in your browser to:
- ✓ View all sample data
- ✓ Test storage functions
- ✓ Export/import data
- ✓ Monitor localStorage usage
- ✓ Verify data integrity

## Tips

1. **Always check initialization** before accessing data
2. **Use the provided getter functions** instead of direct localStorage access
3. **Backup data regularly** using `exportAllData()`
4. **Format currency** consistently using the utility function
5. **Filter data at the storage level** for better performance

## Next Steps

1. Build dashboard components
2. Create charts/visualizations
3. Add data entry forms
4. Implement goal tracking
5. Build transaction management
6. Add budget monitoring
7. Create reports/analytics

## Need Help?

- Check `data/README.md` for detailed documentation
- View `data/test-data.html` for working examples
- Inspect `data/sampleData.js` to see data structure
- Review `data/localStorage.js` for all available functions

## Sample Data Overview

**Family**: Manish (35, ₹24L/year) & Raghavi (33, ₹18L/year)

**Financial Status**:
- Net Worth: ₹1.24 Cr
- Total Assets: ₹1.67 Cr
- Monthly Income: ₹3.5L
- Monthly Savings: ₹1.76L (50% rate)

**Assets**: 22 assets across MF, Stocks, FD, PPF, NPS, EPF, Real Estate, Gold, Cash

**Goals**: 6 goals from house purchase to retirement

**Transactions**: 62 transactions over 3 months

Ready to build your wealth management dashboard!
