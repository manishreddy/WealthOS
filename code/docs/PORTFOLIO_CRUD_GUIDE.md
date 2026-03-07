# Portfolio CRUD Functionality Guide

## Overview

The enhanced Portfolio page (`portfolio-enhanced.html`) now includes comprehensive CRUD (Create, Read, Update, Delete) operations for all asset types and liabilities. This guide explains all the features and how to use them.

## Features Implemented

### 1. Asset Management (CRUD)

#### Add New Assets
- **Button**: "Add Asset" button prominently displayed in the header
- **Modal Interface**: Tabbed modal with 7 asset type categories
- **Asset Types Supported**:
  - Mutual Funds
  - Stocks
  - Fixed Deposits
  - PPF/NPS/EPF
  - Real Estate
  - Gold
  - Cash/Bank Accounts

#### Asset Form Fields

**Common Fields (All Asset Types)**:
- Asset Name (required)
- Owner (Manish/Raghavi/Joint) (required)
- Institution
- Invested Amount (required)
- Current Value (required)
- Purchase Date
- Notes

**Mutual Fund Specific**:
- Folio Number
- Asset Class (Equity/Debt/Hybrid/Gold)
- Units
- NAV (Net Asset Value)

**Stock Specific**:
- Stock Symbol
- Quantity
- Average Buy Price
- Current Price

**Fixed Deposit Specific**:
- FD Number
- Interest Rate (%)
- Start Date
- Maturity Date

#### Edit Assets
- Edit icon (✏️) on each holding card
- Opens same modal pre-filled with existing data
- All fields are editable
- Changes saved to localStorage immediately
- Real-time dashboard updates

#### Delete Assets
- Delete button (🗑️) on each holding card
- Confirmation dialog with warning message
- "Are you sure?" prompt before deletion
- Immediate UI updates after confirmation
- Changes persist in localStorage

### 2. Liability Management (CRUD)

#### Add New Liabilities
- "Add Liability" button in liabilities section
- Dedicated modal for liability details
- **Liability Types**:
  - Home Loan
  - Car Loan
  - Personal Loan
  - Education Loan
  - Credit Card

#### Liability Form Fields
- Liability Type (required)
- Name/Description (required)
- Institution (required)
- Borrower (Manish/Raghavi/Joint) (required)
- Principal Amount (required)
- Outstanding Amount (required)
- Monthly EMI (required)
- Interest Rate (%) (required)
- Start Date (required)
- End Date (required)
- Loan Account Number
- Notes

#### Edit Liabilities
- Edit icon on each liability card
- Pre-filled form with existing data
- Update all fields
- Auto-calculates tenure and remaining period
- Immediate updates

#### Delete Liabilities
- Delete button on each liability card
- Confirmation dialog
- Removes from localStorage
- Real-time UI refresh

### 3. Real-time Calculations

All financial calculations update automatically:

- **Total Assets**: Sum of all asset current values
- **Total Liabilities**: Sum of all outstanding amounts
- **Net Worth**: Assets - Liabilities
- **Total Returns**: Sum of (Current Value - Invested Amount)
- **Returns Percentage**: Per-asset calculation with color coding
  - Green (↗) for positive returns
  - Red (↘) for negative returns

### 4. Filtering & Sorting

#### Owner Filter
- Filter by "All", "Manish", or "Raghavi"
- Real-time filtering without page reload
- Visual button states (active/inactive)
- Empty state messages when no results

### 5. Data Persistence

#### LocalStorage Integration
- All operations save to browser's localStorage
- Data persists across page reloads
- Automatic initialization on first load
- Last updated timestamp tracking

#### Export/Import Functionality
- **Export**: Download portfolio as JSON file
  - Includes all assets, liabilities, and metadata
  - Timestamped filename
  - Full backup of portfolio data

- **Import**: Upload previously exported JSON
  - Confirmation dialog before overwrite
  - Validates file format
  - Restores all data
  - Immediate UI refresh

### 6. User Experience Enhancements

#### Toast Notifications
- Success messages (green):
  - "Asset added successfully!"
  - "Asset updated successfully!"
  - "Asset deleted successfully!"
  - "Liability added successfully!"
  - etc.

- Error messages (red):
  - "Asset not found"
  - "Failed to import data"
  - etc.

- Auto-dismiss after 3 seconds
- Slide-in animation from right

#### Confirmation Dialogs
- Prominent warning icon (⚠️)
- Clear messaging
- Two-button choice (Cancel/Delete)
- Prevents accidental deletions
- Closes on ESC key

#### Form Validation
- Required field indicators (*)
- Real-time validation
- Error messages below fields
- Visual error states (red borders)
- Helpful placeholder text
- Field descriptions

#### Modal UX
- Click outside to close
- ESC key to close
- Smooth animations
- Tabbed interface for asset types
- Responsive layout
- Scrollable content area

#### Empty States
- Friendly messages when no data
- Visual icons
- Call-to-action buttons
- Different messages for:
  - No assets at all
  - No filtered results
  - No liabilities

### 7. Responsive Design

- Grid layouts adapt to screen size
- Mobile-friendly modals
- Touch-friendly buttons
- Scrollable sections
- Flexible card layouts

## File Structure

```
WealthOS/
├── portfolio-enhanced.html          # Enhanced portfolio with CRUD
├── data/
│   ├── sampleData.js               # Sample data structure
│   ├── localStorage.js             # Storage utilities
│   └── dataModels.js               # Data type definitions
└── PORTFOLIO_CRUD_GUIDE.md         # This guide
```

## Usage Instructions

### Adding Your First Asset

1. Click "Add Asset" button in the header
2. Select asset type from tabs (e.g., "Mutual Funds")
3. Fill in required fields:
   - Asset Name: "SBI Bluechip Fund Direct Growth"
   - Owner: "Manish"
   - Invested Amount: 100000
   - Current Value: 125000
4. Fill optional fields (Folio number, units, etc.)
5. Click "Save Asset"
6. See success toast notification
7. Asset appears in holdings grid

### Editing an Asset

1. Locate the asset card in holdings grid
2. Click the edit icon (✏️) on the card
3. Modal opens with pre-filled data
4. Modify any fields
5. Click "Update Asset"
6. See success notification
7. Card updates immediately

### Deleting an Asset

1. Click delete icon (🗑️) on asset card
2. Confirmation dialog appears
3. Read the warning message
4. Click "Delete" to confirm (or "Cancel")
5. Asset removed immediately
6. Dashboard totals recalculate

### Filtering by Owner

1. Look for filter buttons above holdings grid
2. Click "Manish", "Raghavi", or "All"
3. Holdings filter instantly
4. Active filter button highlighted

### Exporting Portfolio Data

1. Click "Export" button in header
2. JSON file downloads automatically
3. Filename includes date: `wealthos-portfolio-2026-02-17.json`
4. Save file for backup or transfer

### Importing Portfolio Data

1. Click "Import" button in header
2. File picker opens
3. Select previously exported JSON file
4. Confirmation dialog appears
5. Click confirm to import
6. All data restored
7. Page refreshes with imported data

## Data Models

### Asset Structure
```javascript
{
  id: 'A001',
  type: 'MutualFund',
  name: 'SBI Bluechip Fund',
  ownerId: 'FM001',
  institution: 'SBI Mutual Fund',
  investedAmount: 100000,
  currentValue: 125000,
  returns: 25000,
  returnsPercentage: 25.0,
  purchaseDate: Date,
  folioNumber: 'SBI123456',
  units: 1234.56,
  nav: 101.25,
  assetClass: 'Equity',
  lastUpdated: Date
}
```

### Liability Structure
```javascript
{
  id: 'L001',
  type: 'HomeLoan',
  name: 'Home Loan - SBI',
  institution: 'SBI',
  borrowerId: 'FM001',
  principalAmount: 5000000,
  outstandingAmount: 4500000,
  monthlyEmi: 45000,
  interestRate: 8.5,
  startDate: Date,
  endDate: Date,
  tenure: 240,
  remainingTenure: 180,
  lastUpdated: Date
}
```

## LocalStorage Keys

All data is stored with the following keys:

```javascript
STORAGE_KEYS = {
  ASSETS: 'wealthos_assets',
  LIABILITIES: 'wealthos_liabilities',
  FAMILY_MEMBERS: 'wealthos_family_members',
  APP_INITIALIZED: 'wealthos_initialized',
  LAST_UPDATED: 'wealthos_last_updated'
}
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- LocalStorage support
- ES6+ JavaScript
- CSS Grid & Flexbox

## Performance Considerations

- All operations are instant (client-side)
- No network requests
- LocalStorage limit: ~5-10MB
- Thousands of assets supported
- Efficient re-rendering
- No page reloads needed

## Security Notes

- Data stored locally in browser
- No server transmission
- Export files are unencrypted JSON
- Recommended: Keep backup exports secure
- Clear browser data will erase portfolio

## Troubleshooting

### Issue: Data not saving
**Solution**: Check browser localStorage is enabled and not full

### Issue: Modal not opening
**Solution**: Check browser console for JavaScript errors

### Issue: Import fails
**Solution**: Ensure JSON file is valid WealthOS export format

### Issue: Numbers showing incorrectly
**Solution**: Clear browser cache and reload page

## Future Enhancements

Potential additions:
1. Bulk import from CSV/Excel
2. Asset performance charts
3. Automated NAV updates via API
4. Asset category rebalancing suggestions
5. Tax calculation per asset
6. Document attachment support
7. Asset notes and tags
8. Advanced search and filters
9. Multi-currency support
10. Asset goal linking

## API Reference

### Core Functions

```javascript
// Load all data
loadDashboardData()
loadHoldings()
loadLiabilities()

// Asset operations
openAddAssetModal()
editAsset(assetId)
saveAsset(event)
deleteAsset(assetId)

// Liability operations
openAddLiabilityModal()
editLiability(liabilityId)
saveLiability(event)
deleteLiability(liabilityId)

// UI operations
filterHoldings(filter, button)
showToast(message, type)
showConfirmDialog(title, message, callback)

// Data operations
exportData()
importData()

// Utilities
formatCurrency(amount)
getAssetTypeLabel(type)
getLiabilityTypeLabel(type)
```

### LocalStorage Functions

```javascript
// From localStorage.js
WealthOSStorage.saveData(key, data)
WealthOSStorage.loadData(key, defaultValue)
WealthOSStorage.getAssets(type, ownerId)
WealthOSStorage.getLiabilities(type)
WealthOSStorage.exportAllData()
WealthOSStorage.importData(data)
```

## Testing Checklist

- [ ] Add mutual fund asset
- [ ] Add stock asset
- [ ] Add fixed deposit
- [ ] Add PPF asset
- [ ] Edit asset details
- [ ] Delete asset with confirmation
- [ ] Cancel delete operation
- [ ] Filter by Manish
- [ ] Filter by Raghavi
- [ ] Filter by All
- [ ] Add home loan liability
- [ ] Edit liability
- [ ] Delete liability
- [ ] Export portfolio data
- [ ] Import portfolio data
- [ ] Verify dashboard calculations
- [ ] Test modal close (ESC key)
- [ ] Test modal close (outside click)
- [ ] Test modal close (X button)
- [ ] Verify toast notifications
- [ ] Test form validation
- [ ] Verify data persistence (reload page)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Try clearing browser cache
4. Check file paths are correct
5. Ensure all dependencies loaded (Chart.js, localStorage.js, sampleData.js)

## Version History

### v1.0.0 (2026-02-17)
- Initial CRUD implementation
- All 7 asset types supported
- Full liability management
- Export/Import functionality
- Real-time calculations
- Toast notifications
- Confirmation dialogs
- Form validation
- Owner filtering
- Empty states
- Responsive design

---

**Created by**: WealthOS Team
**Last Updated**: 2026-02-17
**License**: Private Use
