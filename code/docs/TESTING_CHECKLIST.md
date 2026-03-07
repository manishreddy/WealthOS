# Portfolio CRUD - Testing Checklist

## Pre-Test Setup

- [ ] Open `portfolio-enhanced.html` in browser
- [ ] Open browser console (F12 or Cmd+Option+I)
- [ ] Verify no JavaScript errors
- [ ] Check that sample data is loaded
- [ ] Confirm 4 dashboard cards are visible

## Dashboard Tests

### Net Worth Summary
- [ ] Total Assets displays correct sum
- [ ] Total Liabilities displays correct sum
- [ ] Net Worth = Assets - Liabilities
- [ ] Total Returns = Sum of (Current - Invested)
- [ ] All values formatted as currency (₹ symbol)
- [ ] Large numbers show as Lakhs/Crores

## Asset CRUD Tests

### Create - Mutual Fund
- [ ] Click "Add Asset" button
- [ ] Modal opens successfully
- [ ] "Mutual Funds" tab is active by default
- [ ] Fill in all required fields:
  - [ ] Asset Name: "Test MF Fund"
  - [ ] Owner: "Manish"
  - [ ] Invested Amount: 100000
  - [ ] Current Value: 120000
- [ ] Fill optional fields:
  - [ ] Institution: "Test AMC"
  - [ ] Folio Number: "TEST123"
  - [ ] Asset Class: "Equity"
  - [ ] Units: 1000
  - [ ] NAV: 120
- [ ] Click "Save Asset"
- [ ] Success toast appears
- [ ] Modal closes automatically
- [ ] New card appears in holdings grid
- [ ] Dashboard totals update correctly
- [ ] Returns show as ₹20,000 (20%)
- [ ] Green arrow (↗) displayed for positive returns

### Create - Stock
- [ ] Click "Add Asset" button
- [ ] Click "Stocks" tab
- [ ] Fill required fields:
  - [ ] Asset Name: "Test Stock Ltd"
  - [ ] Owner: "Raghavi"
  - [ ] Invested: 50000
  - [ ] Current: 55000
- [ ] Fill stock-specific fields:
  - [ ] Stock Symbol: "TEST"
  - [ ] Quantity: 100
  - [ ] Avg Buy Price: 500
  - [ ] Current Price: 550
- [ ] Click "Save Asset"
- [ ] Asset added successfully
- [ ] Card shows stock-specific details

### Create - Fixed Deposit
- [ ] Click "Add Asset"
- [ ] Click "Fixed Deposits" tab
- [ ] Fill all fields including:
  - [ ] FD Number
  - [ ] Interest Rate
  - [ ] Start Date
  - [ ] Maturity Date
- [ ] Save successfully
- [ ] FD card displays with dates

### Create - PPF/NPS/EPF
- [ ] Click "Add Asset"
- [ ] Click "PPF/NPS/EPF" tab
- [ ] Add PPF account
- [ ] Verify account details saved
- [ ] Card displays correctly

### Create - Real Estate
- [ ] Click "Add Asset"
- [ ] Click "Real Estate" tab
- [ ] Add property details
- [ ] Save property
- [ ] Property card appears

### Create - Gold
- [ ] Click "Add Asset"
- [ ] Click "Gold" tab
- [ ] Add gold investment
- [ ] Save successfully
- [ ] Gold card visible

### Create - Cash/Bank
- [ ] Click "Add Asset"
- [ ] Click "Cash/Bank" tab
- [ ] Add bank account
- [ ] Save account details
- [ ] Account card shows

### Read - View Assets
- [ ] All asset cards display correctly
- [ ] Each card shows:
  - [ ] Asset name
  - [ ] Asset type label
  - [ ] Owner name
  - [ ] Current value
  - [ ] Returns (amount and %)
  - [ ] Invested amount
  - [ ] Institution
  - [ ] Type-specific details
- [ ] Edit icon (✏️) visible
- [ ] Delete icon (🗑️) visible

### Update - Edit Asset
- [ ] Click edit icon on any asset
- [ ] Modal opens with "Edit Asset" title
- [ ] All fields pre-filled with current data
- [ ] Asset type tab already selected
- [ ] Modify asset name
- [ ] Change current value
- [ ] Click "Update Asset"
- [ ] Success toast shows
- [ ] Modal closes
- [ ] Card updates immediately
- [ ] Dashboard recalculates
- [ ] Returns update correctly

### Update - Edit Different Asset Types
- [ ] Edit mutual fund - verify folio updates
- [ ] Edit stock - verify quantity changes
- [ ] Edit FD - verify interest rate changes
- [ ] Edit all asset types successfully

### Delete - Remove Asset
- [ ] Click delete icon on test asset
- [ ] Confirmation dialog appears
- [ ] Dialog shows correct asset name
- [ ] Warning message displayed
- [ ] Click "Cancel" - dialog closes, asset remains
- [ ] Click delete icon again
- [ ] Click "Delete" in confirmation
- [ ] Success toast appears
- [ ] Card disappears from grid
- [ ] Dashboard totals recalculate
- [ ] Net worth updates correctly

### Delete - Multiple Assets
- [ ] Delete 3 different assets
- [ ] Verify each deletion:
  - [ ] Confirmation shown
  - [ ] Asset removed
  - [ ] Dashboard updates
  - [ ] Toast notification

## Liability CRUD Tests

### Create - Home Loan
- [ ] Click "Add Liability" button
- [ ] Modal opens successfully
- [ ] Select "Home Loan" type
- [ ] Fill all required fields:
  - [ ] Name: "Test Home Loan"
  - [ ] Institution: "Test Bank"
  - [ ] Borrower: "Joint"
  - [ ] Principal: 5000000
  - [ ] Outstanding: 4500000
  - [ ] Monthly EMI: 45000
  - [ ] Interest Rate: 8.5
  - [ ] Start Date: 2020-01-01
  - [ ] End Date: 2040-01-01
- [ ] Click "Save Liability"
- [ ] Success toast appears
- [ ] Liability card appears
- [ ] Dashboard liabilities update
- [ ] Net worth decreases

### Create - Car Loan
- [ ] Add new car loan
- [ ] Verify all fields save
- [ ] Card displays correctly

### Create - Personal Loan
- [ ] Add personal loan
- [ ] Save successfully
- [ ] Appears in liabilities grid

### Read - View Liabilities
- [ ] All liability cards show:
  - [ ] Liability name
  - [ ] Liability type
  - [ ] Borrower name
  - [ ] Outstanding amount
  - [ ] Monthly EMI
  - [ ] Interest rate
  - [ ] Principal amount
  - [ ] Percentage paid
- [ ] Edit and delete icons visible

### Update - Edit Liability
- [ ] Click edit on liability
- [ ] Modal pre-filled with data
- [ ] Modify outstanding amount
- [ ] Change monthly EMI
- [ ] Click "Update Liability"
- [ ] Success toast
- [ ] Card updates
- [ ] Dashboard recalculates
- [ ] Percentage paid updates

### Delete - Remove Liability
- [ ] Click delete icon
- [ ] Confirmation appears
- [ ] Click "Delete"
- [ ] Liability removed
- [ ] Dashboard updates
- [ ] Net worth increases
- [ ] Toast notification shows

## Filter Tests

### Owner Filtering
- [ ] Click "All" filter - shows all assets
- [ ] "All" button highlighted
- [ ] Click "Manish" filter
- [ ] Only Manish's assets visible
- [ ] "Manish" button highlighted
- [ ] Other buttons not highlighted
- [ ] Click "Raghavi" filter
- [ ] Only Raghavi's assets visible
- [ ] "Raghavi" button highlighted
- [ ] Click "All" again - all assets return

### Empty Filter Results
- [ ] Filter by owner with no assets
- [ ] Empty state message appears
- [ ] "No Assets Found" displayed
- [ ] Friendly message shown

## Modal Tests

### Modal Opening/Closing
- [ ] Click "Add Asset" - modal opens
- [ ] Click X button - modal closes
- [ ] Click outside modal - modal closes
- [ ] Press ESC key - modal closes
- [ ] Click "Cancel" button - modal closes
- [ ] No data saved when canceling

### Modal Tab Switching
- [ ] Open Add Asset modal
- [ ] Click each asset type tab
- [ ] Correct fields show for each type
- [ ] Previous tab deactivates
- [ ] New tab activates (blue color)

### Form Validation
- [ ] Try to submit with empty name
- [ ] Error message shows
- [ ] Field highlighted in red
- [ ] Try to submit with empty owner
- [ ] Validation prevents submission
- [ ] Fill all required fields
- [ ] Form submits successfully

## Export/Import Tests

### Export Data
- [ ] Click "Export" button
- [ ] File download starts
- [ ] File name includes date
- [ ] File format is .json
- [ ] Open file in text editor
- [ ] JSON is valid and readable
- [ ] Contains all assets
- [ ] Contains all liabilities
- [ ] Contains family members
- [ ] Includes exportDate timestamp
- [ ] Success toast appears

### Import Data
- [ ] Create backup export first
- [ ] Delete some assets
- [ ] Click "Import" button
- [ ] File picker opens
- [ ] Select exported JSON file
- [ ] Confirmation dialog appears
- [ ] Warning about overwrite shown
- [ ] Click "Cancel" - nothing imported
- [ ] Click "Import" again
- [ ] Click "Confirm"
- [ ] Success toast appears
- [ ] All data restored
- [ ] Dashboard updates
- [ ] Holdings grid refreshes

### Import Invalid File
- [ ] Try to import .txt file
- [ ] Error toast appears
- [ ] "Invalid file format" message
- [ ] No data corrupted

## Toast Notification Tests

### Success Toasts
- [ ] Add asset - green toast
- [ ] Update asset - green toast
- [ ] Delete asset - green toast
- [ ] Add liability - green toast
- [ ] Update liability - green toast
- [ ] Delete liability - green toast
- [ ] Export data - green toast
- [ ] Import data - green toast
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Toast slides in from right

### Error Toasts
- [ ] Import invalid file - red toast
- [ ] Asset not found error - red toast
- [ ] Toast shows error icon

## Confirmation Dialog Tests

### Asset Deletion
- [ ] Delete confirmation shows asset name
- [ ] Warning message clear
- [ ] "Cancel" button works
- [ ] "Delete" button works
- [ ] ESC closes dialog
- [ ] Click outside closes dialog

### Import Confirmation
- [ ] Import shows overwrite warning
- [ ] Message explains data loss
- [ ] Both options work correctly

## Calculation Tests

### Returns Calculation
- [ ] Add asset: Invested 100K, Current 125K
- [ ] Returns show ₹25,000
- [ ] Percentage shows 25%
- [ ] Green arrow displayed
- [ ] Add asset: Invested 100K, Current 90K
- [ ] Returns show ₹-10,000
- [ ] Percentage shows -10%
- [ ] Red arrow displayed

### Dashboard Totals
- [ ] Add 5 assets with known values
- [ ] Verify total assets = sum of all
- [ ] Add 2 liabilities with known amounts
- [ ] Verify total liabilities = sum of all
- [ ] Verify net worth = assets - liabilities
- [ ] Calculate expected total returns
- [ ] Verify total returns matches

### Liability Calculations
- [ ] Add liability: Principal 1M, Outstanding 800K
- [ ] Verify paid percentage = 20%
- [ ] Edit to Outstanding 500K
- [ ] Verify paid percentage = 50%

## Empty State Tests

### No Assets
- [ ] Delete all assets
- [ ] Empty state message shows
- [ ] Friendly icon displayed
- [ ] "Add Asset" button in empty state
- [ ] Click button - modal opens

### No Liabilities
- [ ] Delete all liabilities
- [ ] "No Liabilities" message shows
- [ ] Empty state icon displayed

### No Filtered Results
- [ ] Filter by owner with no assets
- [ ] "No Assets Found" message
- [ ] Different message than "No Assets Yet"

## Currency Formatting Tests

- [ ] Value < ₹1,000: Shows ₹500.00
- [ ] Value < ₹1 Lakh: Shows ₹50.00 K
- [ ] Value < ₹1 Crore: Shows ₹5.50 L
- [ ] Value ≥ ₹1 Crore: Shows ₹1.25 Cr
- [ ] Test with various amounts:
  - [ ] ₹500 → ₹500.00
  - [ ] ₹5,000 → ₹5.00 K
  - [ ] ₹50,000 → ₹50.00 K
  - [ ] ₹5,00,000 → ₹5.00 L
  - [ ] ₹50,00,000 → ₹50.00 L
  - [ ] ₹5,00,00,000 → ₹5.00 Cr

## Data Persistence Tests

### LocalStorage Save
- [ ] Add new asset
- [ ] Open browser DevTools
- [ ] Check Application → LocalStorage
- [ ] Verify 'wealthos_assets' key exists
- [ ] Data is valid JSON
- [ ] Asset appears in data

### Page Reload
- [ ] Add 2 assets and 1 liability
- [ ] Note current net worth
- [ ] Reload page (F5)
- [ ] All data still present
- [ ] Dashboard shows same values
- [ ] Holdings grid has all cards

### Browser Session
- [ ] Add test data
- [ ] Close browser tab
- [ ] Open new tab
- [ ] Navigate to portfolio page
- [ ] All data persists

## Browser Compatibility Tests

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations
- [ ] Modal displays correctly

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Forms submit correctly

### Safari
- [ ] All features work
- [ ] Date picker works
- [ ] File import/export works

### Edge
- [ ] All features work
- [ ] Modal styling correct
- [ ] LocalStorage works

## Performance Tests

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] Sample data loads immediately
- [ ] No lag when rendering cards

### Operation Speed
- [ ] Add asset: Instant (< 100ms)
- [ ] Edit asset: Instant (< 100ms)
- [ ] Delete asset: Instant (< 100ms)
- [ ] Filter: Instant (< 50ms)
- [ ] Dashboard update: Instant

### Large Data Set
- [ ] Add 50 assets
- [ ] Page still responsive
- [ ] Filtering still fast
- [ ] Scrolling smooth

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through form fields
- [ ] Enter submits form
- [ ] ESC closes modal
- [ ] All interactive elements reachable

### Screen Reader
- [ ] Form labels read correctly
- [ ] Button purposes clear
- [ ] Error messages announced
- [ ] Success messages announced

### Visual
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Text readable at 100% zoom
- [ ] Icons have meaning without color

## Edge Cases Tests

### Invalid Input
- [ ] Enter negative amount - rejected
- [ ] Enter text in number field - rejected
- [ ] Leave required field empty - validation error
- [ ] Enter 0 for invested amount - rejected

### Extreme Values
- [ ] Enter very large number (1,00,00,00,000)
- [ ] Formats correctly as Crores
- [ ] Calculations still accurate
- [ ] Enter very small number (1)
- [ ] Displays correctly

### Date Edge Cases
- [ ] End date before start date - validation error
- [ ] Very old date (1900)
- [ ] Future date (2099)
- [ ] Today's date

### Special Characters
- [ ] Asset name with special chars: "ABC & Co."
- [ ] Saves correctly
- [ ] Displays correctly
- [ ] Institution name with apostrophe: "John's Bank"

## Integration Tests

### Full Workflow - Assets
1. [ ] Add 3 mutual funds
2. [ ] Add 2 stocks
3. [ ] Add 1 FD
4. [ ] Verify total assets correct
5. [ ] Edit 2 assets
6. [ ] Verify updates reflected
7. [ ] Filter by owner
8. [ ] Delete 1 asset
9. [ ] Verify totals recalculated
10. [ ] Export data
11. [ ] Delete all assets
12. [ ] Import data back
13. [ ] Verify all 5 assets restored

### Full Workflow - Liabilities
1. [ ] Add home loan
2. [ ] Add car loan
3. [ ] Add personal loan
4. [ ] Verify total liabilities
5. [ ] Edit home loan
6. [ ] Change outstanding amount
7. [ ] Verify net worth changes
8. [ ] Delete car loan
9. [ ] Verify calculations
10. [ ] Export data

### Mixed Operations
1. [ ] Add 2 assets
2. [ ] Add 1 liability
3. [ ] Edit 1 asset
4. [ ] Delete 1 asset
5. [ ] Edit liability
6. [ ] Filter holdings
7. [ ] Export data
8. [ ] Verify export has all changes

## Regression Tests

After any code changes:
- [ ] All basic CRUD operations still work
- [ ] Dashboard calculations accurate
- [ ] Export/Import functional
- [ ] Filtering works
- [ ] Modals open/close correctly
- [ ] Toasts appear
- [ ] Confirmations work
- [ ] Data persists
- [ ] No new console errors

## Bug Verification

### Common Issues to Check
- [ ] Modal doesn't close - verify all close methods
- [ ] Data not saving - check localStorage
- [ ] Calculations wrong - verify math
- [ ] Toast not showing - check timing
- [ ] Filter not working - verify state
- [ ] Export fails - check JSON serialization
- [ ] Import fails - check file validation
- [ ] Dates showing wrong - check timezone

## Final Checklist

### Before Release
- [ ] All test cases passed
- [ ] No console errors
- [ ] All features documented
- [ ] Sample data loads correctly
- [ ] Export/Import tested thoroughly
- [ ] Browser compatibility verified
- [ ] Performance acceptable
- [ ] Accessibility requirements met
- [ ] User guide created
- [ ] Known issues documented

### User Acceptance
- [ ] Stakeholder demo completed
- [ ] Feedback incorporated
- [ ] Training materials prepared
- [ ] Support documentation ready

---

## Test Results Summary

**Date Tested**: _______________

**Tester**: _______________

**Total Tests**: 200+

**Tests Passed**: _______________

**Tests Failed**: _______________

**Critical Issues**: _______________

**Minor Issues**: _______________

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________

**Sign-off**: _______________
