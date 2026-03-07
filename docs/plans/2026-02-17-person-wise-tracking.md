# Person-wise Financial Tracking & Investment Insights Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add person-wise tracking (Person 1 | Person 2 | Combined) to Monthly Tracker and enhance Savings Plan with investment categorization and insights.

**Architecture:** Extend existing HTML pages with tab navigation, localStorage data model for multi-person tracking, and investment analytics engine. No backend - pure frontend implementation.

**Tech Stack:** Vanilla JavaScript, HTML5, CSS3, localStorage API

---

## Phase 1: Monthly Tracker Person-wise Tracking

### Task 1: Create Person Data Management Module

**Files:**
- Create: `code/js/person-data.js`

**Step 1: Create person data module with initialization**

```javascript
// person-data.js
const PersonData = {
    // Initialize person settings
    initializePersonSettings() {
        const settings = localStorage.getItem('personSettings');
        if (!settings) {
            const defaultSettings = {
                person1Name: 'Person 1',
                person2Name: 'Person 2',
                person1Age: 30,
                person2Age: 30
            };
            localStorage.setItem('personSettings', JSON.stringify(defaultSettings));
            return defaultSettings;
        }
        return JSON.parse(settings);
    },

    // Get person settings
    getPersonSettings() {
        return JSON.parse(localStorage.getItem('personSettings')) || this.initializePersonSettings();
    },

    // Update person settings
    updatePersonSettings(settings) {
        localStorage.setItem('personSettings', JSON.stringify(settings));
    },

    // Get monthly data for specific person and month
    getMonthData(yearMonth, person) {
        const key = `monthlyTracker_${yearMonth}`;
        const data = localStorage.getItem(key);
        if (!data) {
            return this.getEmptyMonthData();
        }
        const parsed = JSON.parse(data);
        return parsed[person] || this.getEmptyMonthData();
    },

    // Get empty month data structure
    getEmptyMonthData() {
        return {
            income: 0,
            expenditure: 0,
            investments: 0,
            savings: 0,
            net: 0,
            incomeBreakup: [],
            expenditureBreakup: [],
            investmentsBreakup: []
        };
    },

    // Save month data for specific person
    saveMonthData(yearMonth, person, data) {
        const key = `monthlyTracker_${yearMonth}`;
        let allData = localStorage.getItem(key);
        allData = allData ? JSON.parse(allData) : {};
        allData[person] = data;

        // Calculate combined if both persons have data
        if (allData.person1 && allData.person2) {
            allData.combined = this.calculateCombined(allData.person1, allData.person2);
        }

        localStorage.setItem(key, JSON.stringify(allData));
    },

    // Calculate combined data from person1 and person2
    calculateCombined(person1Data, person2Data) {
        return {
            income: person1Data.income + person2Data.income,
            expenditure: person1Data.expenditure + person2Data.expenditure,
            investments: person1Data.investments + person2Data.investments,
            savings: person1Data.savings + person2Data.savings,
            net: person1Data.net + person2Data.net,
            incomeBreakup: [...person1Data.incomeBreakup, ...person2Data.incomeBreakup],
            expenditureBreakup: [...person1Data.expenditureBreakup, ...person2Data.expenditureBreakup],
            investmentsBreakup: [...person1Data.investmentsBreakup, ...person2Data.investmentsBreakup]
        };
    },

    // Get current year-month string
    getCurrentYearMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
};

// Make it available globally
window.PersonData = PersonData;
```

**Step 2: Test the module manually**

Open browser console and test:
```javascript
PersonData.initializePersonSettings();
PersonData.getPersonSettings();
PersonData.getMonthData('2026-02', 'person1');
```
Expected: Returns default settings and empty month data

**Step 3: Commit**

```bash
git add code/js/person-data.js
git commit -m "feat: add person data management module for multi-person tracking"
```

---

### Task 2: Add Tab Navigation Component to Monthly Tracker

**Files:**
- Modify: `code/monthly-tracker.html` (after line 942, before category cards)

**Step 1: Add tab navigation HTML**

Insert after line 942 (after page subtitle, before month selector):

```html
            <!-- Person Tabs -->
            <div class="person-tabs-container">
                <div class="person-tabs">
                    <button class="person-tab active" data-person="person1" id="person1Tab">
                        <span class="tab-label" id="person1Label">Person 1</span>
                    </button>
                    <button class="person-tab" data-person="person2" id="person2Tab">
                        <span class="tab-label" id="person2Label">Person 2</span>
                    </button>
                    <button class="person-tab" data-person="combined" id="combinedTab">
                        <span class="tab-label">Combined</span>
                    </button>
                </div>
                <button class="settings-link-btn" onclick="showPersonSettingsModal()">
                    ⚙️ Configure Names
                </button>
            </div>
```

**Step 2: Add tab navigation CSS**

Add to `<style>` section (after line 863, before responsive section):

```css
        /* Person Tabs */
        .person-tabs-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding: 16px 24px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            box-shadow: var(--card-shadow);
        }

        .person-tabs {
            display: flex;
            gap: 8px;
            background: var(--bg-secondary);
            padding: 6px;
            border-radius: 12px;
        }

        .person-tab {
            padding: 10px 24px;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'DM Sans', sans-serif;
        }

        .person-tab:hover {
            background: var(--hover-bg);
            color: var(--text-primary);
        }

        .person-tab.active {
            background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
        }

        .settings-link-btn {
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-elevated);
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'DM Sans', sans-serif;
        }

        .settings-link-btn:hover {
            background: var(--hover-bg);
            color: var(--text-primary);
            border-color: var(--accent-primary);
        }
```

**Step 3: Commit**

```bash
git add code/monthly-tracker.html
git commit -m "feat: add tab navigation UI for person-wise tracking"
```

---

### Task 3: Add Person Settings Modal

**Files:**
- Modify: `code/monthly-tracker.html` (before closing `</body>` tag)

**Step 1: Add modal HTML**

Insert before `</body>` tag:

```html
    <!-- Person Settings Modal -->
    <div class="modal-overlay" id="personSettingsModal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Configure Person Names & Ages</h3>
                <button class="modal-close" onclick="closePersonSettingsModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Person 1 Name</label>
                    <input type="text" class="form-input" id="person1NameInput" placeholder="e.g., Manish">
                </div>
                <div class="form-group">
                    <label class="form-label">Person 1 Age</label>
                    <input type="number" class="form-input" id="person1AgeInput" placeholder="30">
                </div>
                <div class="form-group">
                    <label class="form-label">Person 2 Name</label>
                    <input type="text" class="form-input" id="person2NameInput" placeholder="e.g., Partner">
                </div>
                <div class="form-group">
                    <label class="form-label">Person 2 Age</label>
                    <input type="number" class="form-input" id="person2AgeInput" placeholder="28">
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn secondary" onclick="closePersonSettingsModal()">Cancel</button>
                <button class="action-btn primary" onclick="savePersonSettings()">Save</button>
            </div>
        </div>
    </div>
```

**Step 2: Add modal CSS**

Add to `<style>` section:

```css
        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
        }

        .modal-content {
            background: var(--bg-elevated);
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
        }

        .modal-header {
            padding: 24px 32px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .modal-close {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .modal-close:hover {
            background: var(--hover-bg);
            color: var(--text-primary);
        }

        .modal-body {
            padding: 32px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 8px;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 0.9375rem;
            font-family: 'DM Sans', sans-serif;
            transition: all 0.2s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--accent-primary);
            background: var(--bg-elevated);
            box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .modal-footer {
            padding: 20px 32px;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
```

**Step 3: Commit**

```bash
git add code/monthly-tracker.html
git commit -m "feat: add person settings modal UI"
```

---

### Task 4: Implement Tab Switching Logic

**Files:**
- Modify: `code/monthly-tracker.html` (in `<script>` section after line 1258)

**Step 1: Add global state and tab switching**

Add after line 1271 (after currentMonthData definition):

```javascript
        // Current active person
        let currentPerson = 'person1';

        // Initialize person data on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Load person-data.js module
            const script = document.createElement('script');
            script.src = 'js/person-data.js';
            script.onload = function() {
                initializePersonTabs();
                loadSampleData();
                calculateNet();
                updateGauge();
            };
            document.head.appendChild(script);
        });

        // Initialize person tabs
        function initializePersonTabs() {
            const settings = PersonData.getPersonSettings();

            // Update tab labels
            document.getElementById('person1Label').textContent = settings.person1Name;
            document.getElementById('person2Label').textContent = settings.person2Name;

            // Add click handlers
            document.querySelectorAll('.person-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const person = this.getAttribute('data-person');
                    switchToPerson(person);
                });
            });

            // Load data for current person
            loadPersonData(currentPerson);
        }

        // Switch to different person view
        function switchToPerson(person) {
            // Save current person data before switching
            saveCurrentPersonData();

            // Update current person
            currentPerson = person;

            // Update tab active state
            document.querySelectorAll('.person-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelector(`[data-person="${person}"]`).classList.add('active');

            // Load new person data
            loadPersonData(person);

            // Recalculate and update UI
            calculateNet();
            updateGauge();
        }

        // Load data for specific person
        function loadPersonData(person) {
            const yearMonth = PersonData.getCurrentYearMonth();
            const data = PersonData.getMonthData(yearMonth, person);

            // Update input fields
            document.getElementById('incomeInput').value = data.income ? formatCurrency(data.income) : '';
            document.getElementById('expenditureInput').value = data.expenditure ? formatCurrency(data.expenditure) : '';
            document.getElementById('investmentsInput').value = data.investments ? formatCurrency(data.investments) : '';

            // Load breakups
            loadBreakupData('income', data.incomeBreakup);
            loadBreakupData('expenditure', data.expenditureBreakup);
            loadBreakupData('investments', data.investmentsBreakup);

            // Update breakup totals
            updateBreakupTotal('income');
            updateBreakupTotal('expenditure');
            updateBreakupTotal('investments');
        }

        // Load breakup data into UI
        function loadBreakupData(category, breakupArray) {
            const list = document.getElementById(category + 'BreakupList');
            list.innerHTML = '';

            breakupArray.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'breakup-item';
                itemDiv.innerHTML = `
                    <input type="text" class="breakup-name-input" value="${item.name}">
                    <input type="text" class="breakup-amount-input" value="${formatCurrency(item.amount)}" oninput="formatCurrencyInput(this); updateBreakupTotal('${category}')">
                    <button class="remove-item-btn" onclick="removeBreakupItem(this)">×</button>
                `;
                list.appendChild(itemDiv);
            });
        }

        // Save current person data
        function saveCurrentPersonData() {
            const yearMonth = PersonData.getCurrentYearMonth();

            const data = {
                income: parseCurrency(document.getElementById('incomeInput').value),
                expenditure: parseCurrency(document.getElementById('expenditureInput').value),
                investments: parseCurrency(document.getElementById('investmentsInput').value),
                savings: parseCurrency(document.getElementById('savingsInput').value),
                net: parseCurrency(document.getElementById('netInput').value),
                incomeBreakup: getBreakupData('income'),
                expenditureBreakup: getBreakupData('expenditure'),
                investmentsBreakup: getBreakupData('investments')
            };

            PersonData.saveMonthData(yearMonth, currentPerson, data);
        }

        // Get breakup data from UI
        function getBreakupData(category) {
            const list = document.getElementById(category + 'BreakupList');
            const items = list.querySelectorAll('.breakup-item');
            const breakup = [];

            items.forEach(item => {
                const name = item.querySelector('.breakup-name-input').value;
                const amount = parseCurrency(item.querySelector('.breakup-amount-input').value);
                if (name && amount > 0) {
                    breakup.push({ name, amount });
                }
            });

            return breakup;
        }
```

**Step 2: Update saveMonth function to use person data**

Replace the existing `saveMonth()` function (around line 1466):

```javascript
        function saveMonth() {
            // Save current person data
            saveCurrentPersonData();

            // Show success message
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Saved!';
            btn.style.background = 'linear-gradient(135deg, #00C805 0%, #22c55e 100%)';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        }
```

**Step 3: Test tab switching**

Open `monthly-tracker.html` in browser:
1. Enter data in Person 1
2. Click "Person 2" tab - should show empty fields
3. Enter data in Person 2
4. Click "Person 1" tab - should show Person 1 data
5. Click "Combined" tab - should show summed values

Expected: Tab switching works, data persists per person

**Step 4: Commit**

```bash
git add code/monthly-tracker.html
git commit -m "feat: implement tab switching logic with data persistence"
```

---

### Task 5: Add Person Settings Modal Functions

**Files:**
- Modify: `code/monthly-tracker.html` (in `<script>` section)

**Step 1: Add modal functions**

Add before closing `</script>` tag (around line 1547):

```javascript
        // Show person settings modal
        function showPersonSettingsModal() {
            const settings = PersonData.getPersonSettings();

            // Populate current values
            document.getElementById('person1NameInput').value = settings.person1Name;
            document.getElementById('person1AgeInput').value = settings.person1Age;
            document.getElementById('person2NameInput').value = settings.person2Name;
            document.getElementById('person2AgeInput').value = settings.person2Age;

            // Show modal
            document.getElementById('personSettingsModal').style.display = 'flex';
        }

        // Close person settings modal
        function closePersonSettingsModal() {
            document.getElementById('personSettingsModal').style.display = 'none';
        }

        // Save person settings
        function savePersonSettings() {
            const settings = {
                person1Name: document.getElementById('person1NameInput').value || 'Person 1',
                person1Age: parseInt(document.getElementById('person1AgeInput').value) || 30,
                person2Name: document.getElementById('person2NameInput').value || 'Person 2',
                person2Age: parseInt(document.getElementById('person2AgeInput').value) || 30
            };

            PersonData.updatePersonSettings(settings);

            // Update tab labels
            document.getElementById('person1Label').textContent = settings.person1Name;
            document.getElementById('person2Label').textContent = settings.person2Name;

            closePersonSettingsModal();

            // Show success notification
            alert('Settings saved successfully!');
        }

        // Show settings modal on first load
        document.addEventListener('DOMContentLoaded', function() {
            const settings = PersonData.getPersonSettings();
            if (settings.person1Name === 'Person 1' && settings.person2Name === 'Person 2') {
                // First time - show modal
                setTimeout(() => showPersonSettingsModal(), 1000);
            }
        });
```

**Step 2: Test modal functionality**

Test in browser:
1. Click "⚙️ Configure Names" button - modal should open
2. Enter names and ages
3. Click "Save" - modal should close, tab labels should update
4. Refresh page - settings should persist

Expected: Modal works, settings saved to localStorage

**Step 3: Commit**

```bash
git add code/monthly-tracker.html
git commit -m "feat: add person settings modal functionality"
```

---

## Phase 2: Savings Plan Investment Insights

### Task 6: Create Investment Analytics Module

**Files:**
- Create: `code/js/investment-analytics.js`

**Step 1: Create analytics module**

```javascript
// investment-analytics.js
const InvestmentAnalytics = {
    // Asset class categories and subcategories
    categories: {
        Equity: ['Large Cap', 'Mid Cap', 'Small Cap', 'International'],
        Debt: ['FD', 'Bonds', 'Debt Funds', 'PPF'],
        Gold: ['Physical', 'Gold ETF', 'Sovereign Gold Bonds'],
        Others: ['Real Estate', 'Crypto', 'Commodities']
    },

    // Age-based default targets
    getDefaultTargets(age) {
        if (age < 30) {
            return { equity: 80, debt: 15, gold: 5, others: 0 };
        } else if (age < 40) {
            return { equity: 70, debt: 20, gold: 5, others: 5 };
        } else if (age < 50) {
            return { equity: 60, debt: 30, gold: 5, others: 5 };
        } else {
            return { equity: 40, debt: 50, gold: 5, others: 5 };
        }
    },

    // Get savings plan data for person
    getSavingsPlanData(person) {
        const key = `savingsPlan_${person}`;
        const data = localStorage.getItem(key);
        if (!data) {
            return this.getEmptySavingsPlan();
        }
        return JSON.parse(data);
    },

    // Get empty savings plan structure
    getEmptySavingsPlan() {
        return {
            investments: [],
            targets: null,
            useAgeBasedDefaults: true
        };
    },

    // Save savings plan data
    saveSavingsPlanData(person, data) {
        const key = `savingsPlan_${person}`;
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Get uncategorized investments from Monthly Tracker
    getUncategorizedInvestments(person, yearMonth) {
        // Get investments from Monthly Tracker
        const monthData = PersonData.getMonthData(yearMonth, person);
        const monthlyInvestments = monthData.investmentsBreakup;

        // Get already categorized investments
        const savingsPlan = this.getSavingsPlanData(person);
        const categorizedNames = savingsPlan.investments.map(inv => inv.name);

        // Filter uncategorized
        return monthlyInvestments.filter(inv => !categorizedNames.includes(inv.name));
    },

    // Add categorized investment
    categorizeInvestment(person, investment) {
        const savingsPlan = this.getSavingsPlanData(person);

        // Check if already exists
        const existingIndex = savingsPlan.investments.findIndex(inv => inv.name === investment.name);
        if (existingIndex >= 0) {
            // Update existing
            savingsPlan.investments[existingIndex] = investment;
        } else {
            // Add new
            savingsPlan.investments.push(investment);
        }

        this.saveSavingsPlanData(person, savingsPlan);
    },

    // Calculate asset allocation
    calculateAssetAllocation(person) {
        const savingsPlan = this.getSavingsPlanData(person);
        const investments = savingsPlan.investments;

        if (investments.length === 0) {
            return { Equity: 0, Debt: 0, Gold: 0, Others: 0 };
        }

        const totals = { Equity: 0, Debt: 0, Gold: 0, Others: 0 };
        let grandTotal = 0;

        investments.forEach(inv => {
            totals[inv.assetClass] = (totals[inv.assetClass] || 0) + inv.amount;
            grandTotal += inv.amount;
        });

        // Convert to percentages
        const percentages = {};
        Object.keys(totals).forEach(key => {
            percentages[key] = grandTotal > 0 ? Math.round((totals[key] / grandTotal) * 100) : 0;
        });

        return { percentages, totals, grandTotal };
    },

    // Calculate equity breakdown
    calculateEquityBreakdown(person) {
        const savingsPlan = this.getSavingsPlanData(person);
        const equityInvestments = savingsPlan.investments.filter(inv => inv.assetClass === 'Equity');

        if (equityInvestments.length === 0) {
            return { 'Large Cap': 0, 'Mid Cap': 0, 'Small Cap': 0, 'International': 0 };
        }

        const totals = { 'Large Cap': 0, 'Mid Cap': 0, 'Small Cap': 0, 'International': 0 };
        let equityTotal = 0;

        equityInvestments.forEach(inv => {
            totals[inv.subCategory] = (totals[inv.subCategory] || 0) + inv.amount;
            equityTotal += inv.amount;
        });

        // Convert to percentages
        const percentages = {};
        Object.keys(totals).forEach(key => {
            percentages[key] = equityTotal > 0 ? Math.round((totals[key] / equityTotal) * 100) : 0;
        });

        return { percentages, totals, equityTotal };
    },

    // Get targets for person
    getTargets(person) {
        const settings = PersonData.getPersonSettings();
        const savingsPlan = this.getSavingsPlanData(person);

        if (savingsPlan.useAgeBasedDefaults || !savingsPlan.targets) {
            // Use age-based defaults
            const age = person === 'person1' ? settings.person1Age : settings.person2Age;
            return this.getDefaultTargets(age);
        }

        return savingsPlan.targets;
    },

    // Generate recommendations
    generateRecommendations(person) {
        const allocation = this.calculateAssetAllocation(person);
        const targets = this.getTargets(person);
        const recommendations = [];

        // Compare each asset class with target
        Object.keys(targets).forEach(assetClass => {
            const current = allocation.percentages[assetClass.charAt(0).toUpperCase() + assetClass.slice(1)] || 0;
            const target = targets[assetClass];
            const diff = current - target;

            if (Math.abs(diff) > 5) {
                const assetClassName = assetClass.charAt(0).toUpperCase() + assetClass.slice(1);
                if (diff > 0) {
                    recommendations.push({
                        type: 'warning',
                        message: `${assetClassName} allocation is ${Math.abs(diff)}% above target (${current}% vs ${target}% target)`
                    });
                } else {
                    recommendations.push({
                        type: 'warning',
                        message: `${assetClassName} allocation is ${Math.abs(diff)}% below target (${current}% vs ${target}% target)`
                    });
                }
            } else if (Math.abs(diff) <= 5 && Math.abs(diff) > 0) {
                const assetClassName = assetClass.charAt(0).toUpperCase() + assetClass.slice(1);
                recommendations.push({
                    type: 'success',
                    message: `${assetClassName} allocation is on track (${current}% vs ${target}% target)`
                });
            }
        });

        return recommendations;
    },

    // Get monthly investment history (last 6 months)
    getMonthlyHistory(person) {
        const history = [];
        const currentDate = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            const monthData = PersonData.getMonthData(yearMonth, person);
            const savingsPlan = this.getSavingsPlanData(person);

            // Filter investments for this month
            const monthInvestments = savingsPlan.investments.filter(inv => inv.monthAdded === yearMonth);

            // Calculate totals by asset class
            const totals = { Equity: 0, Debt: 0, Gold: 0, Others: 0 };
            let total = monthData.investments;

            monthInvestments.forEach(inv => {
                totals[inv.assetClass] = (totals[inv.assetClass] || 0) + inv.amount;
            });

            history.push({
                month: yearMonth,
                displayMonth: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                total,
                breakdown: totals
            });
        }

        return history.reverse(); // Oldest first
    }
};

// Make it available globally
window.InvestmentAnalytics = InvestmentAnalytics;
```

**Step 2: Test analytics module**

Open browser console:
```javascript
InvestmentAnalytics.getDefaultTargets(30);
InvestmentAnalytics.calculateAssetAllocation('person1');
```
Expected: Returns default targets and empty allocation

**Step 3: Commit**

```bash
git add code/js/investment-analytics.js
git commit -m "feat: add investment analytics module with allocation calculations"
```

---

### Task 7: Add Tab Navigation to Savings Plan

**Files:**
- Modify: `code/savings-plan.html`

**Step 1: Add tab navigation HTML**

Insert after page subtitle (find similar location as monthly-tracker):

```html
            <!-- Person Tabs -->
            <div class="person-tabs-container">
                <div class="person-tabs">
                    <button class="person-tab active" data-person="person1" id="person1Tab">
                        <span class="tab-label" id="person1Label">Person 1</span>
                    </button>
                    <button class="person-tab" data-person="person2" id="person2Tab">
                        <span class="tab-label" id="person2Label">Person 2</span>
                    </button>
                    <button class="person-tab" data-person="combined" id="combinedTab">
                        <span class="tab-label">Combined</span>
                    </button>
                </div>
            </div>
```

**Step 2: Copy tab CSS from monthly-tracker.html**

Copy the person tabs CSS from monthly-tracker.html to savings-plan.html `<style>` section

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: add person tabs to savings plan page"
```

---

### Task 8: Add Investment Import Section

**Files:**
- Modify: `code/savings-plan.html` (after tabs, before existing content)

**Step 1: Add import section HTML**

```html
            <!-- Uncategorized Investments -->
            <div class="import-section" id="importSection">
                <div class="section-header">
                    <h2 class="section-title">📥 Uncategorized Investments</h2>
                    <p class="section-subtitle">From your Monthly Tracker - click to categorize</p>
                </div>
                <div class="uncategorized-list" id="uncategorizedList">
                    <div class="empty-state">
                        <p>✓ All investments are categorized!</p>
                    </div>
                </div>
            </div>
```

**Step 2: Add CSS**

```css
        /* Import Section */
        .import-section {
            background: var(--bg-elevated);
            border: 2px dashed var(--border-color);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
        }

        .section-header {
            margin-bottom: 24px;
        }

        .section-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 8px;
        }

        .section-subtitle {
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .uncategorized-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .uncategorized-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            transition: all 0.2s ease;
        }

        .uncategorized-item:hover {
            border-color: var(--accent-primary);
            transform: translateX(4px);
        }

        .investment-info {
            flex: 1;
        }

        .investment-name {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .investment-amount {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-primary);
        }

        .categorize-btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
            color: #ffffff;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .categorize-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 102, 255, 0.3);
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-tertiary);
            font-size: 0.9375rem;
        }
```

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: add investment import section UI"
```

---

### Task 9: Add Categorization Modal

**Files:**
- Modify: `code/savings-plan.html` (before `</body>`)

**Step 1: Add modal HTML**

```html
    <!-- Categorization Modal -->
    <div class="modal-overlay" id="categorizationModal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Categorize Investment</h3>
                <button class="modal-close" onclick="closeCategorizationModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="investment-details">
                    <div class="detail-row">
                        <span class="detail-label">Investment:</span>
                        <span class="detail-value" id="modalInvestmentName">-</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value" id="modalInvestmentAmount">₹0</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Asset Class</label>
                    <select class="form-select" id="assetClassSelect" onchange="updateSubcategoryOptions()">
                        <option value="">Select Asset Class</option>
                        <option value="Equity">Equity</option>
                        <option value="Debt">Debt</option>
                        <option value="Gold">Gold</option>
                        <option value="Others">Others</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Sub-Category</label>
                    <select class="form-select" id="subCategorySelect">
                        <option value="">Select Sub-Category</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn secondary" onclick="closeCategorizationModal()">Cancel</button>
                <button class="action-btn primary" onclick="saveInvestmentCategory()">Save</button>
            </div>
        </div>
    </div>
```

**Step 2: Add additional CSS**

```css
        .investment-details {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .detail-row:last-child {
            margin-bottom: 0;
        }

        .detail-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
        }

        .detail-value {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .form-select {
            width: 100%;
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 0.9375rem;
            font-family: 'DM Sans', sans-serif;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .form-select:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }
```

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: add investment categorization modal UI"
```

---

### Task 10: Add Asset Allocation Dashboard

**Files:**
- Modify: `code/savings-plan.html` (after import section)

**Step 1: Add allocation dashboard HTML**

```html
            <!-- Asset Allocation Dashboard -->
            <div class="allocation-dashboard">
                <div class="dashboard-card">
                    <h2 class="card-title">📊 Current Allocation</h2>
                    <div class="allocation-bars" id="allocationBars">
                        <div class="allocation-row">
                            <div class="allocation-label">Equity</div>
                            <div class="allocation-bar-container">
                                <div class="allocation-bar equity" id="equityBar" style="width: 0%"></div>
                            </div>
                            <div class="allocation-value" id="equityValue">0%</div>
                        </div>
                        <div class="allocation-row">
                            <div class="allocation-label">Debt</div>
                            <div class="allocation-bar-container">
                                <div class="allocation-bar debt" id="debtBar" style="width: 0%"></div>
                            </div>
                            <div class="allocation-value" id="debtValue">0%</div>
                        </div>
                        <div class="allocation-row">
                            <div class="allocation-label">Gold</div>
                            <div class="allocation-bar-container">
                                <div class="allocation-bar gold" id="goldBar" style="width: 0%"></div>
                            </div>
                            <div class="allocation-value" id="goldValue">0%</div>
                        </div>
                        <div class="allocation-row">
                            <div class="allocation-label">Others</div>
                            <div class="allocation-bar-container">
                                <div class="allocation-bar others" id="othersBar" style="width: 0%"></div>
                            </div>
                            <div class="allocation-value" id="othersValue">0%</div>
                        </div>
                    </div>

                    <div class="total-invested">
                        <span class="total-label">Total Invested:</span>
                        <span class="total-value" id="totalInvestedValue">₹0</span>
                    </div>
                </div>

                <!-- Equity Breakdown -->
                <div class="dashboard-card">
                    <h2 class="card-title">📈 Equity Breakdown</h2>
                    <div class="equity-breakdown" id="equityBreakdown">
                        <div class="breakdown-row">
                            <div class="breakdown-label">
                                <div class="breakdown-dot large-cap"></div>
                                Large Cap
                            </div>
                            <div class="breakdown-value" id="largeCapValue">₹0 (0%)</div>
                        </div>
                        <div class="breakdown-row">
                            <div class="breakdown-label">
                                <div class="breakdown-dot mid-cap"></div>
                                Mid Cap
                            </div>
                            <div class="breakdown-value" id="midCapValue">₹0 (0%)</div>
                        </div>
                        <div class="breakdown-row">
                            <div class="breakdown-label">
                                <div class="breakdown-dot small-cap"></div>
                                Small Cap
                            </div>
                            <div class="breakdown-value" id="smallCapValue">₹0 (0%)</div>
                        </div>
                        <div class="breakdown-row">
                            <div class="breakdown-label">
                                <div class="breakdown-dot international"></div>
                                International
                            </div>
                            <div class="breakdown-value" id="internationalValue">₹0 (0%)</div>
                        </div>
                    </div>
                </div>
            </div>
```

**Step 2: Add CSS**

```css
        /* Allocation Dashboard */
        .allocation-dashboard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
        }

        .dashboard-card {
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 32px;
            box-shadow: var(--card-shadow);
        }

        .card-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 24px;
        }

        .allocation-bars {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .allocation-row {
            display: grid;
            grid-template-columns: 80px 1fr 60px;
            gap: 16px;
            align-items: center;
        }

        .allocation-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
        }

        .allocation-bar-container {
            height: 24px;
            background: var(--bg-secondary);
            border-radius: 12px;
            overflow: hidden;
        }

        .allocation-bar {
            height: 100%;
            border-radius: 12px;
            transition: width 0.5s ease;
        }

        .allocation-bar.equity {
            background: linear-gradient(90deg, #0066ff, #00d4ff);
        }

        .allocation-bar.debt {
            background: linear-gradient(90deg, #fb923c, #fbbf24);
        }

        .allocation-bar.gold {
            background: linear-gradient(90deg, #eab308, #fde047);
        }

        .allocation-bar.others {
            background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .allocation-value {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.9375rem;
            font-weight: 700;
            color: var(--text-primary);
            text-align: right;
        }

        .total-invested {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .total-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
        }

        .total-value {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        /* Equity Breakdown */
        .equity-breakdown {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .breakdown-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: var(--bg-secondary);
            border-radius: 10px;
        }

        .breakdown-label {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .breakdown-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .breakdown-dot.large-cap {
            background: #0066ff;
        }

        .breakdown-dot.mid-cap {
            background: #00d4ff;
        }

        .breakdown-dot.small-cap {
            background: #fb923c;
        }

        .breakdown-dot.international {
            background: #8b5cf6;
        }

        .breakdown-value {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.9375rem;
            font-weight: 700;
            color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
            .allocation-dashboard {
                grid-template-columns: 1fr;
            }
        }
```

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: add asset allocation dashboard with equity breakdown"
```

---

### Task 11: Add Recommendations Section

**Files:**
- Modify: `code/savings-plan.html` (after allocation dashboard)

**Step 1: Add recommendations HTML**

```html
            <!-- Recommendations -->
            <div class="recommendations-section">
                <div class="recommendations-header">
                    <h2 class="section-title">💡 Investment Recommendations</h2>
                    <button class="action-btn secondary" onclick="showTargetsModal()">Adjust Targets</button>
                </div>

                <div class="targets-info" id="targetsInfo">
                    <p class="targets-text">Based on <strong id="targetBasis">age-based defaults</strong></p>
                </div>

                <div class="recommendations-list" id="recommendationsList">
                    <div class="empty-state">
                        <p>Add and categorize investments to get recommendations</p>
                    </div>
                </div>
            </div>
```

**Step 2: Add CSS**

```css
        /* Recommendations */
        .recommendations-section {
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            box-shadow: var(--card-shadow);
        }

        .recommendations-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .targets-info {
            margin-bottom: 24px;
            padding: 16px;
            background: var(--bg-secondary);
            border-radius: 10px;
        }

        .targets-text {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .recommendations-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .recommendation-item {
            padding: 16px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.9375rem;
        }

        .recommendation-item.warning {
            background: rgba(255, 149, 0, 0.1);
            border: 1px solid rgba(255, 149, 0, 0.3);
            color: var(--warning);
        }

        .recommendation-item.success {
            background: rgba(0, 200, 5, 0.1);
            border: 1px solid rgba(0, 200, 5, 0.3);
            color: var(--success);
        }

        .recommendation-icon {
            font-size: 1.25rem;
        }

        .recommendation-text {
            flex: 1;
            font-weight: 500;
        }
```

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: add investment recommendations section"
```

---

### Task 12: Add Monthly History Table

**Files:**
- Modify: `code/savings-plan.html` (after recommendations)

**Step 1: Add history HTML**

```html
            <!-- Monthly History -->
            <div class="history-section">
                <h2 class="section-title">📅 Monthly Investment History</h2>
                <div class="history-table-container">
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Total</th>
                                <th>Equity</th>
                                <th>Debt</th>
                                <th>Gold</th>
                                <th>Others</th>
                            </tr>
                        </thead>
                        <tbody id="historyTableBody">
                            <tr>
                                <td colspan="6" class="empty-cell">No investment history available</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
```

**Step 2: Add CSS**

```css
        /* History Table */
        .history-section {
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 32px;
            box-shadow: var(--card-shadow);
        }

        .history-table-container {
            overflow-x: auto;
            margin-top: 20px;
        }

        .history-table {
            width: 100%;
            border-collapse: collapse;
        }

        .history-table thead {
            background: var(--bg-secondary);
        }

        .history-table th {
            padding: 12px 16px;
            text-align: left;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .history-table th:first-child {
            border-top-left-radius: 10px;
            border-bottom-left-radius: 10px;
        }

        .history-table th:last-child {
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
        }

        .history-table td {
            padding: 16px;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.9375rem;
            color: var(--text-primary);
        }

        .history-table tbody tr:hover {
            background: var(--hover-bg);
        }

        .history-table tbody tr:last-child td {
            border-bottom: none;
        }

        .empty-cell {
            text-align: center;
            color: var(--text-tertiary);
            padding: 40px 20px !important;
        }

        .history-table td:first-child {
            font-weight: 600;
        }

        .history-table td:not(:first-child) {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
        }
```

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: add monthly investment history table"
```

---

### Task 13: Implement Savings Plan JavaScript Logic

**Files:**
- Modify: `code/savings-plan.html` (in `<script>` section)

**Step 1: Add initialization and state management**

Replace or add to the existing script section:

```javascript
        // Current active person
        let currentPerson = 'person1';
        let currentInvestment = null; // For categorization modal

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Load required modules
            loadScript('js/person-data.js', () => {
                loadScript('js/investment-analytics.js', () => {
                    initializeSavingsPlan();
                });
            });
        });

        // Load script dynamically
        function loadScript(src, callback) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = callback;
            document.head.appendChild(script);
        }

        // Initialize savings plan page
        function initializeSavingsPlan() {
            const settings = PersonData.getPersonSettings();

            // Update tab labels
            document.getElementById('person1Label').textContent = settings.person1Name;
            document.getElementById('person2Label').textContent = settings.person2Name;

            // Add tab click handlers
            document.querySelectorAll('.person-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const person = this.getAttribute('data-person');
                    switchToPerson(person);
                });
            });

            // Load initial data
            loadSavingsPlanData(currentPerson);
        }

        // Switch to different person
        function switchToPerson(person) {
            currentPerson = person;

            // Update tab active state
            document.querySelectorAll('.person-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelector(`[data-person="${person}"]`).classList.add('active');

            // Load data for person
            loadSavingsPlanData(person);
        }

        // Load all savings plan data for person
        function loadSavingsPlanData(person) {
            if (person === 'combined') {
                loadCombinedData();
                return;
            }

            // Load uncategorized investments
            loadUncategorizedInvestments(person);

            // Load allocation data
            loadAssetAllocation(person);

            // Load equity breakdown
            loadEquityBreakdown(person);

            // Load recommendations
            loadRecommendations(person);

            // Load history
            loadMonthlyHistory(person);
        }

        // Load uncategorized investments
        function loadUncategorizedInvestments(person) {
            const yearMonth = PersonData.getCurrentYearMonth();
            const uncategorized = InvestmentAnalytics.getUncategorizedInvestments(person, yearMonth);

            const listEl = document.getElementById('uncategorizedList');

            if (uncategorized.length === 0) {
                listEl.innerHTML = '<div class="empty-state"><p>✓ All investments are categorized!</p></div>';
                return;
            }

            listEl.innerHTML = uncategorized.map(inv => `
                <div class="uncategorized-item">
                    <div class="investment-info">
                        <div class="investment-name">${inv.name}</div>
                        <div class="investment-amount">₹${inv.amount.toLocaleString('en-IN')}</div>
                    </div>
                    <button class="categorize-btn" onclick="openCategorizationModal('${inv.name}', ${inv.amount})">
                        Categorize
                    </button>
                </div>
            `).join('');
        }

        // Load asset allocation
        function loadAssetAllocation(person) {
            const allocation = InvestmentAnalytics.calculateAssetAllocation(person);

            // Update bars
            document.getElementById('equityBar').style.width = allocation.percentages.Equity + '%';
            document.getElementById('debtBar').style.width = allocation.percentages.Debt + '%';
            document.getElementById('goldBar').style.width = allocation.percentages.Gold + '%';
            document.getElementById('othersBar').style.width = allocation.percentages.Others + '%';

            // Update values
            document.getElementById('equityValue').textContent = allocation.percentages.Equity + '%';
            document.getElementById('debtValue').textContent = allocation.percentages.Debt + '%';
            document.getElementById('goldValue').textContent = allocation.percentages.Gold + '%';
            document.getElementById('othersValue').textContent = allocation.percentages.Others + '%';

            // Update total
            document.getElementById('totalInvestedValue').textContent = '₹' + (allocation.grandTotal || 0).toLocaleString('en-IN');
        }

        // Load equity breakdown
        function loadEquityBreakdown(person) {
            const breakdown = InvestmentAnalytics.calculateEquityBreakdown(person);

            document.getElementById('largeCapValue').textContent =
                `₹${(breakdown.totals['Large Cap'] || 0).toLocaleString('en-IN')} (${breakdown.percentages['Large Cap'] || 0}%)`;
            document.getElementById('midCapValue').textContent =
                `₹${(breakdown.totals['Mid Cap'] || 0).toLocaleString('en-IN')} (${breakdown.percentages['Mid Cap'] || 0}%)`;
            document.getElementById('smallCapValue').textContent =
                `₹${(breakdown.totals['Small Cap'] || 0).toLocaleString('en-IN')} (${breakdown.percentages['Small Cap'] || 0}%)`;
            document.getElementById('internationalValue').textContent =
                `₹${(breakdown.totals['International'] || 0).toLocaleString('en-IN')} (${breakdown.percentages['International'] || 0}%)`;
        }

        // Load recommendations
        function loadRecommendations(person) {
            const recommendations = InvestmentAnalytics.generateRecommendations(person);
            const listEl = document.getElementById('recommendationsList');

            if (recommendations.length === 0) {
                listEl.innerHTML = '<div class="empty-state"><p>Add and categorize investments to get recommendations</p></div>';
                return;
            }

            listEl.innerHTML = recommendations.map(rec => `
                <div class="recommendation-item ${rec.type}">
                    <span class="recommendation-icon">${rec.type === 'success' ? '✓' : '⚠️'}</span>
                    <span class="recommendation-text">${rec.message}</span>
                </div>
            `).join('');
        }

        // Load monthly history
        function loadMonthlyHistory(person) {
            const history = InvestmentAnalytics.getMonthlyHistory(person);
            const tbody = document.getElementById('historyTableBody');

            if (history.length === 0 || history.every(h => h.total === 0)) {
                tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No investment history available</td></tr>';
                return;
            }

            tbody.innerHTML = history.map(h => `
                <tr>
                    <td>${h.displayMonth}</td>
                    <td>₹${h.total.toLocaleString('en-IN')}</td>
                    <td>₹${(h.breakdown.Equity || 0).toLocaleString('en-IN')}</td>
                    <td>₹${(h.breakdown.Debt || 0).toLocaleString('en-IN')}</td>
                    <td>₹${(h.breakdown.Gold || 0).toLocaleString('en-IN')}</td>
                    <td>₹${(h.breakdown.Others || 0).toLocaleString('en-IN')}</td>
                </tr>
            `).join('');
        }

        // Load combined data
        function loadCombinedData() {
            // Aggregate data from both persons
            const person1Allocation = InvestmentAnalytics.calculateAssetAllocation('person1');
            const person2Allocation = InvestmentAnalytics.calculateAssetAllocation('person2');

            const combined = {
                Equity: (person1Allocation.totals.Equity || 0) + (person2Allocation.totals.Equity || 0),
                Debt: (person1Allocation.totals.Debt || 0) + (person2Allocation.totals.Debt || 0),
                Gold: (person1Allocation.totals.Gold || 0) + (person2Allocation.totals.Gold || 0),
                Others: (person1Allocation.totals.Others || 0) + (person2Allocation.totals.Others || 0)
            };

            const grandTotal = combined.Equity + combined.Debt + combined.Gold + combined.Others;

            const percentages = {
                Equity: grandTotal > 0 ? Math.round((combined.Equity / grandTotal) * 100) : 0,
                Debt: grandTotal > 0 ? Math.round((combined.Debt / grandTotal) * 100) : 0,
                Gold: grandTotal > 0 ? Math.round((combined.Gold / grandTotal) * 100) : 0,
                Others: grandTotal > 0 ? Math.round((combined.Others / grandTotal) * 100) : 0
            };

            // Update UI with combined data
            document.getElementById('equityBar').style.width = percentages.Equity + '%';
            document.getElementById('debtBar').style.width = percentages.Debt + '%';
            document.getElementById('goldBar').style.width = percentages.Gold + '%';
            document.getElementById('othersBar').style.width = percentages.Others + '%';

            document.getElementById('equityValue').textContent = percentages.Equity + '%';
            document.getElementById('debtValue').textContent = percentages.Debt + '%';
            document.getElementById('goldValue').textContent = percentages.Gold + '%';
            document.getElementById('othersValue').textContent = percentages.Others + '%';

            document.getElementById('totalInvestedValue').textContent = '₹' + grandTotal.toLocaleString('en-IN');

            // Hide uncategorized section for combined view
            document.getElementById('importSection').style.display = 'none';
            document.querySelector('.recommendations-section').style.display = 'none';

            // Load combined equity breakdown and history
            // (simplified - could be enhanced)
        }
```

**Step 2: Test data loading**

Open savings-plan.html in browser and verify:
1. Uncategorized investments section shows data from Monthly Tracker
2. Asset allocation bars display (even if 0%)
3. Tabs switch between persons

Expected: UI loads without errors

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: implement savings plan data loading and display logic"
```

---

### Task 14: Implement Categorization Modal Logic

**Files:**
- Modify: `code/savings-plan.html` (add to script section)

**Step 1: Add modal functions**

```javascript
        // Open categorization modal
        function openCategorizationModal(name, amount) {
            currentInvestment = { name, amount };

            document.getElementById('modalInvestmentName').textContent = name;
            document.getElementById('modalInvestmentAmount').textContent = '₹' + amount.toLocaleString('en-IN');

            // Reset selects
            document.getElementById('assetClassSelect').value = '';
            document.getElementById('subCategorySelect').innerHTML = '<option value="">Select Sub-Category</option>';

            document.getElementById('categorizationModal').style.display = 'flex';
        }

        // Close categorization modal
        function closeCategorizationModal() {
            document.getElementById('categorizationModal').style.display = 'none';
            currentInvestment = null;
        }

        // Update subcategory options based on asset class
        function updateSubcategoryOptions() {
            const assetClass = document.getElementById('assetClassSelect').value;
            const subCategorySelect = document.getElementById('subCategorySelect');

            if (!assetClass) {
                subCategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';
                return;
            }

            const subcategories = InvestmentAnalytics.categories[assetClass];
            subCategorySelect.innerHTML = '<option value="">Select Sub-Category</option>' +
                subcategories.map(sub => `<option value="${sub}">${sub}</option>`).join('');
        }

        // Save investment category
        function saveInvestmentCategory() {
            const assetClass = document.getElementById('assetClassSelect').value;
            const subCategory = document.getElementById('subCategorySelect').value;

            if (!assetClass || !subCategory) {
                alert('Please select both Asset Class and Sub-Category');
                return;
            }

            const investment = {
                name: currentInvestment.name,
                amount: currentInvestment.amount,
                assetClass: assetClass,
                subCategory: subCategory,
                monthAdded: PersonData.getCurrentYearMonth()
            };

            InvestmentAnalytics.categorizeInvestment(currentPerson, investment);

            closeCategorizationModal();

            // Reload data
            loadSavingsPlanData(currentPerson);

            // Show success message
            showSuccessToast('Investment categorized successfully!');
        }

        // Show success toast
        function showSuccessToast(message) {
            // Simple alert for now - could be enhanced with a proper toast notification
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00C805 0%, #22c55e 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-weight: 600;
                box-shadow: 0 8px 20px rgba(0, 200, 5, 0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            toast.textContent = '✓ ' + message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }
```

**Step 2: Test categorization**

1. Add investments in Monthly Tracker
2. Open Savings Plan
3. Click "Categorize" on an uncategorized investment
4. Select Asset Class and Sub-Category
5. Click "Save"
6. Verify investment disappears from uncategorized list
7. Verify allocation bars update

Expected: Categorization works, data persists, UI updates

**Step 3: Commit**

```bash
git add code/savings-plan.html
git commit -m "feat: implement investment categorization modal logic"
```

---

## Phase 3: Testing & Polish

### Task 15: End-to-End Testing

**Files:**
- No file changes, testing only

**Step 1: Test Monthly Tracker person-wise flow**

1. Open monthly-tracker.html
2. Configure person names (if first time)
3. Enter data for Person 1: Income, Expenditure, Investments with breakups
4. Switch to Person 2 tab
5. Enter data for Person 2
6. Switch to Combined tab - verify totals are correct
7. Click "Save Month" for each person
8. Refresh page - verify data persists
9. Test month navigation - verify data loads correctly

Expected: All data entry, switching, saving, and loading works correctly

**Step 2: Test Savings Plan flow**

1. Open savings-plan.html
2. Verify uncategorized investments appear from Monthly Tracker
3. Categorize each investment
4. Verify asset allocation bars update correctly
5. Verify equity breakdown shows correct values
6. Check recommendations appear
7. Verify monthly history table shows data
8. Switch to Person 2 tab and repeat
9. Switch to Combined tab - verify aggregated data

Expected: All categorization, calculations, and displays work correctly

**Step 3: Test data flow between pages**

1. Add new investments in Monthly Tracker
2. Save month
3. Navigate to Savings Plan
4. Verify new investments appear in uncategorized list
5. Categorize them
6. Go back to Monthly Tracker
7. Update investment amounts
8. Return to Savings Plan
9. Verify amounts are updated (may need to recategorize)

Expected: Data flows correctly between pages

**Step 4: Test edge cases**

1. Enter zero amounts
2. Enter very large amounts
3. Delete all breakup items
4. Switch persons without saving
5. Test with only one person having data
6. Test Combined view with missing person data

Expected: No errors, graceful handling of edge cases

**Step 5: Document any bugs found**

Create a bugs.md file listing any issues discovered

---

### Task 16: Responsive Design Testing

**Files:**
- Modify: `code/monthly-tracker.html` and `code/savings-plan.html` (CSS adjustments as needed)

**Step 1: Test on different screen sizes**

Test both pages at:
- Desktop: 1920px
- Laptop: 1366px
- Tablet: 768px
- Mobile: 375px

**Step 2: Fix responsive issues**

Common fixes needed:
- Adjust grid columns for smaller screens
- Stack allocation dashboard vertically
- Make tabs scrollable on mobile
- Adjust font sizes
- Fix table overflow

**Step 3: Test and verify**

Ensure all features work on all screen sizes

**Step 4: Commit responsive fixes**

```bash
git add code/monthly-tracker.html code/savings-plan.html
git commit -m "fix: responsive design improvements for mobile and tablet"
```

---

### Task 17: Browser Compatibility Testing

**Files:**
- Testing only

**Step 1: Test in multiple browsers**

Test in:
- Chrome
- Firefox
- Safari
- Edge

**Step 2: Fix browser-specific issues**

Common issues:
- CSS gradients
- localStorage differences
- Date handling
- Input styling

**Step 3: Document compatibility**

Note any browser-specific limitations

---

### Task 18: Performance Optimization

**Files:**
- Modify: `code/js/person-data.js`, `code/js/investment-analytics.js`

**Step 1: Add caching to avoid repeated calculations**

Add caching mechanisms for:
- Asset allocation calculations
- Monthly history data
- Recommendation generation

**Step 2: Optimize localStorage reads/writes**

- Batch updates where possible
- Minimize stringify/parse operations
- Add debouncing for auto-save

**Step 3: Test performance**

- Check page load times
- Verify smooth tab switching
- Test with large datasets (multiple months)

**Step 4: Commit optimizations**

```bash
git add code/js/person-data.js code/js/investment-analytics.js
git commit -m "perf: optimize calculations and localStorage operations"
```

---

### Task 19: Documentation

**Files:**
- Create: `docs/USER_GUIDE_PERSON_WISE.md`

**Step 1: Write user guide**

Create comprehensive user guide covering:
- Setting up person names
- Tracking individual finances
- Categorizing investments
- Understanding recommendations
- Reading allocation insights
- Using combined view

**Step 2: Add screenshots**

Take screenshots of:
- Person tabs
- Settings modal
- Categorization modal
- Allocation dashboard
- Recommendations

**Step 3: Commit documentation**

```bash
git add docs/USER_GUIDE_PERSON_WISE.md
git commit -m "docs: add user guide for person-wise tracking"
```

---

### Task 20: Final Review and Deployment

**Files:**
- All modified files

**Step 1: Code review checklist**

- [ ] All JavaScript modules work independently
- [ ] No console errors
- [ ] localStorage data structure is consistent
- [ ] CSS follows existing design system
- [ ] All calculations are accurate
- [ ] Error handling is in place
- [ ] Comments added for complex logic

**Step 2: Create summary document**

Document:
- Features implemented
- Files modified/created
- Known limitations
- Future enhancement ideas

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete person-wise tracking and investment insights implementation

- Person 1/Person 2/Combined tabs in Monthly Tracker
- Investment categorization in Savings Plan
- Asset allocation dashboard with progress bars
- Equity breakdown by market cap
- Age-based and custom target recommendations
- Monthly investment history tracking
- Responsive design for all screen sizes
- Complete localStorage-based data persistence

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria Checklist

✅ Person-wise tracking works for 2 people
✅ Combined view shows accurate totals
✅ Investment categorization by asset class & sub-category
✅ Asset allocation displays with percentages
✅ Equity breakdown shows market cap distribution
✅ Recommendations based on targets
✅ Age-based default targets implemented
✅ Custom targets can be set
✅ Monthly investment history tracked
✅ Data persists across page refreshes
✅ Responsive design works on all devices
✅ No console errors
✅ All edge cases handled gracefully

## Future Enhancements (Out of Scope)

- Backend API for multi-device sync
- Data export to Excel/PDF
- Advanced charts and visualizations
- Cross-person comparison analytics
- Budget vs actual tracking
- Tax planning insights
- Investment performance tracking
- Multi-year historical analysis
