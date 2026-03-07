# Portfolio CRUD - Quick Start Guide

## Get Started in 3 Steps

### Step 1: Open the Enhanced Portfolio Page

```bash
# Navigate to your project directory
cd /Users/manishreddy/Desktop/AI_Projects/WealthOS

# Open the enhanced portfolio page in your browser
open portfolio-enhanced.html
```

Or simply double-click `portfolio-enhanced.html` in Finder.

### Step 2: Initialize Sample Data (First Time Only)

When you first open the page:

1. Open browser console (F12 or Cmd+Option+I)
2. Check if data is initialized
3. If not, run:
   ```javascript
   WealthOSStorage.initializeData()
   ```
4. Reload the page

The page should now display sample assets and liabilities!

### Step 3: Start Managing Your Portfolio

You're all set! Try these actions:

1. **Add Your First Asset**
   - Click "Add Asset" button (top right)
   - Choose "Mutual Funds" tab
   - Fill in details
   - Click "Save Asset"

2. **Edit an Existing Asset**
   - Find any asset card
   - Click the edit icon (✏️)
   - Modify values
   - Click "Update Asset"

3. **Delete an Asset**
   - Click the delete icon (🗑️) on any card
   - Confirm deletion
   - Watch it disappear!

4. **Filter by Owner**
   - Click "Manish" or "Raghavi" buttons
   - See filtered results

5. **Export Your Data**
   - Click "Export" button
   - JSON file downloads
   - Safe backup created!

## Common Actions

### Add a Mutual Fund

```
1. Click "Add Asset"
2. Select "Mutual Funds" tab
3. Fill in:
   - Name: Axis Long Term Equity Fund
   - Owner: Manish
   - Institution: Axis Mutual Fund
   - Invested: 50000
   - Current Value: 62000
   - Folio: AXIS123456
   - Asset Class: Equity
   - Units: 500
   - NAV: 124.00
4. Click "Save Asset"
```

### Add a Stock

```
1. Click "Add Asset"
2. Select "Stocks" tab
3. Fill in:
   - Name: Reliance Industries
   - Owner: Raghavi
   - Institution: Zerodha
   - Invested: 250000
   - Current Value: 280000
   - Stock Symbol: RELIANCE
   - Quantity: 100
   - Avg Buy Price: 2500
   - Current Price: 2800
4. Click "Save Asset"
```

### Add a Home Loan

```
1. Click "Add Liability"
2. Fill in:
   - Type: Home Loan
   - Name: Home Loan - HDFC
   - Institution: HDFC Bank
   - Borrower: Joint
   - Principal: 5000000
   - Outstanding: 4200000
   - Monthly EMI: 45000
   - Interest Rate: 8.5
   - Start Date: 2020-01-01
   - End Date: 2040-01-01
3. Click "Save Liability"
```

## Keyboard Shortcuts

- **ESC**: Close any open modal
- **Click outside modal**: Close modal

## Visual Indicators

- ✏️ Edit icon - Opens edit modal
- 🗑️ Delete icon - Triggers delete confirmation
- ↗ Green arrow - Positive returns
- ↘ Red arrow - Negative returns
- ✓ Green toast - Success message
- ✗ Red toast - Error message

## Data Format Examples

### When Importing Data

Your JSON export will look like this:

```json
{
  "assets": [
    {
      "id": "A001",
      "type": "MutualFund",
      "name": "SBI Bluechip Fund",
      "ownerId": "FM001",
      "investedAmount": 100000,
      "currentValue": 125000,
      ...
    }
  ],
  "liabilities": [
    {
      "id": "L001",
      "type": "HomeLoan",
      "name": "Home Loan - SBI",
      "principalAmount": 5000000,
      "outstandingAmount": 4500000,
      ...
    }
  ],
  "exportDate": "2026-02-17T10:30:00.000Z"
}
```

## Troubleshooting

### Problem: Page shows no data

**Solution**:
```javascript
// In browser console:
WealthOSStorage.initializeData(true)  // Force reset
location.reload()  // Reload page
```

### Problem: Can't add assets

**Solution**:
1. Check browser console for errors
2. Ensure all script files are loaded:
   - sampleData.js
   - localStorage.js
3. Verify localStorage is enabled in browser

### Problem: Data disappeared

**Solution**:
```javascript
// Check if data exists:
WealthOSStorage.getStorageInfo()

// Import from backup:
// Click Import button and select your .json backup file
```

### Problem: Numbers showing wrong

**Solution**:
```bash
# Clear browser cache and reload
# Or force reload: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

## Tips & Tricks

1. **Regular Backups**: Export your data weekly
2. **Naming Convention**: Use consistent names for easy filtering
3. **Update Values**: Keep current values updated for accurate net worth
4. **Owner Tags**: Use owner field to track individual vs joint assets
5. **Notes Field**: Use for important details like lock-in periods

## Browser Console Commands

### View all assets
```javascript
WealthOSStorage.getAssets()
```

### View all liabilities
```javascript
WealthOSStorage.getLiabilities()
```

### Get storage info
```javascript
WealthOSStorage.getStorageInfo()
```

### Clear all data (careful!)
```javascript
WealthOSStorage.clearData(true)
```

### Export data programmatically
```javascript
const data = WealthOSStorage.exportAllData()
console.log(JSON.stringify(data, null, 2))
```

### Get assets by owner
```javascript
// Manish's assets
WealthOSStorage.getAssets(null, 'FM001')

// Raghavi's assets
WealthOSStorage.getAssets(null, 'FM002')
```

### Get assets by type
```javascript
// All mutual funds
WealthOSStorage.getAssets('MutualFund')

// All stocks
WealthOSStorage.getAssets('Stock')
```

## Next Steps

Once you're comfortable with basic CRUD:

1. Try different asset types (FD, PPF, Gold, Real Estate)
2. Add multiple liabilities
3. Filter and sort your holdings
4. Export and re-import your data
5. Customize asset details in notes
6. Track your net worth growth

## Asset Type Specific Fields

### Mutual Funds
- Folio Number
- Asset Class (Equity/Debt/Hybrid/Gold)
- Units
- NAV

### Stocks
- Stock Symbol
- Quantity
- Average Buy Price
- Current Price

### Fixed Deposits
- FD Number
- Interest Rate
- Start Date
- Maturity Date

### PPF/NPS/EPF
- Account Number
- Annual Contribution
- Maturity Date

### Real Estate
- Property Type
- Location
- Area (sq ft)
- Purchase Price

### Gold
- Form (Physical/Digital)
- Weight (grams)
- Purity

### Cash/Bank
- Account Type
- Bank Name
- Account Number

## Sample Data Overview

The system comes with pre-loaded sample data:

- **2 Family Members**: Manish & Raghavi
- **10+ Assets**: Mixed portfolio across types
- **3 Liabilities**: Home loan, car loan, personal loan
- **Monthly Income**: Last 12 months
- **Monthly Expenses**: Last 3 months
- **Financial Goals**: Various goals with tracking

## Currency Format

- Below ₹1,000: ₹500.00
- Below ₹1 Lakh: ₹50.00 K
- Below ₹1 Crore: ₹5.50 L
- Above ₹1 Crore: ₹1.25 Cr

## File Dependencies

Make sure these files are in the same directory:

```
WealthOS/
├── portfolio-enhanced.html    ← Open this file
├── data/
│   ├── sampleData.js         ← Required
│   ├── localStorage.js       ← Required
│   └── dataModels.js         ← Reference only
```

## Performance Tips

1. **LocalStorage Limit**: ~5-10MB per domain
2. **Max Assets**: Thousands supported, but UI best with <500
3. **Export Regularly**: Prevents data loss
4. **Browser Choice**: Chrome/Firefox recommended for best performance

## Security Reminder

- All data stored locally in your browser
- No server/cloud sync
- Backup your exports in a secure location
- Clearing browser data will erase portfolio
- Export files are plain JSON (not encrypted)

## Getting Help

1. Check `PORTFOLIO_CRUD_GUIDE.md` for detailed documentation
2. Look at browser console for error messages
3. Verify all dependencies are loaded
4. Try clearing cache and reloading
5. Check localStorage is enabled

## Success Checklist

After setup, verify:

- [ ] Page loads without errors
- [ ] Dashboard shows 4 summary cards
- [ ] Holdings grid displays assets
- [ ] Liabilities section displays loans
- [ ] "Add Asset" button works
- [ ] Edit icon opens pre-filled modal
- [ ] Delete shows confirmation
- [ ] Filter buttons work
- [ ] Export downloads JSON file
- [ ] Import restores data
- [ ] Toast notifications appear
- [ ] All calculations are correct

## Happy Portfolio Management!

You're now ready to manage your complete financial portfolio with full CRUD capabilities. Start by adding your real assets and tracking your wealth!

---

Need help? Check the full guide: `PORTFOLIO_CRUD_GUIDE.md`
