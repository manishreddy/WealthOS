# Guide: Updating Other Pages to Use Real User Data

## Quick Reference Pattern

Every page should follow this pattern:

### 1. Include Required Scripts (in HTML `<head>` or before closing `</body>`)
```html
<script src="auth.js"></script>
<script src="data/userDataManager.js"></script>
```

### 2. Load Real User Data (in your JavaScript)
```javascript
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
});

function loadUserData() {
    // Get current user
    const user = getCurrentUserInfo();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Update page title with user's name
    document.getElementById('pageTitle').textContent = `${user.name}'s [Page Name]`;

    // Load specific data for this page
    const data = getUserAssets(); // or getUserGoals(), getUserMonthlyIncome(), etc.

    // Check for empty state
    if (!data || data.length === 0) {
        showEmptyState();
        return;
    }

    // Render the data
    renderData(data);
}
```

### 3. Empty State Template
```javascript
function showEmptyState() {
    const container = document.getElementById('mainContainer');
    container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 80px 20px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">📊</div>
            <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
                No [items] yet
            </div>
            <div style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 30px;">
                [Helpful message about what to do next]
            </div>
            <button class="action-btn primary" onclick="openAddModal()">
                + Add Your First [Item]
            </button>
        </div>
    `;
}
```

---

## Page-Specific Updates

### Portfolio Page (`portfolio.html`)

#### What to Change:
1. Remove hardcoded "Manish" and "Raghavi" filter buttons
2. Use `getUserAssets()` instead of sample data
3. Add empty state prompt

#### Code Changes:
```javascript
// OLD (Remove this)
const sampleAssets = [
    { name: 'HDFC Bank', owner: 'Manish', value: 100000 },
    { name: 'SBI MF', owner: 'Raghavi', value: 50000 }
];

// NEW (Use this)
function loadPortfolio() {
    const user = getCurrentUserInfo();
    const assets = getUserAssets();

    // Update title
    document.getElementById('pageTitle').textContent = `${user.name}'s Portfolio`;

    if (assets.length === 0) {
        showEmptyState('portfolio');
        return;
    }

    renderAssets(assets);
    renderAllocation(getAssetAllocation());
}

function showEmptyState(type) {
    const container = document.getElementById('assetsList');
    container.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 4rem; margin-bottom: 20px;">💼</div>
            <h2>No assets yet</h2>
            <p>Click 'Add Asset' to start tracking your portfolio</p>
            <button class="action-btn primary" onclick="openAddAssetModal()">
                + Add Your First Asset
            </button>
        </div>
    `;
}
```

#### Remove These Filters:
```html
<!-- REMOVE THESE -->
<button class="filter-btn" data-filter="manish">Manish</button>
<button class="filter-btn" data-filter="raghavi">Raghavi</button>

<!-- REPLACE WITH (only if user has family members) -->
<div id="assetFilters">
    <!-- Dynamically populated based on actual family members -->
</div>
```

---

### Goals Page (`goals.html`)

#### What to Change:
1. Use `getUserGoals()` instead of dummy data
2. Remove hardcoded goal icons and data
3. Add empty state

#### Code Changes:
```javascript
// NEW
function loadGoals() {
    const user = getCurrentUserInfo();
    const goals = getUserGoals();

    document.getElementById('pageTitle').textContent = `${user.name}'s Goals`;

    if (goals.length === 0) {
        showEmptyStateGoals();
        return;
    }

    renderGoals(goals);
}

function showEmptyStateGoals() {
    const container = document.getElementById('goalsList');
    container.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 4rem; margin-bottom: 20px;">🎯</div>
            <h2>No goals yet</h2>
            <p>Click 'Add Goal' to plan your financial future</p>
            <button class="action-btn primary" onclick="openGoalModal()">
                + Add Your First Goal
            </button>
        </div>
    `;
}

function renderGoals(goals) {
    const container = document.getElementById('goalsList');
    container.innerHTML = goals.map(goal => {
        const icon = getGoalIcon(goal.type);
        const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);

        return `
            <div class="goal-card">
                <div class="goal-icon">${icon}</div>
                <h3>${goal.name}</h3>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="progress-text">${percentage}% complete</div>
                </div>
                <div class="goal-stats">
                    <span>Current: ${formatCurrency(goal.currentAmount)}</span>
                    <span>Target: ${formatCurrency(goal.targetAmount)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getGoalIcon(type) {
    const icons = {
        'House': '🏠',
        'Education': '🎓',
        'Vacation': '🏖️',
        'Vehicle': '🚗',
        'Retirement': '🌴',
        'Emergency': '🛡️',
        'Wedding': '💍',
        'Other': '🎯'
    };
    return icons[type] || icons['Other'];
}
```

---

### Monthly Tracker (`monthly-tracker.html`)

#### What to Change:
1. Use `getUserMonthlyIncome()` and `getUserMonthlyExpenses()`
2. Remove dummy monthly data
3. Add empty state for first-time users

#### Code Changes:
```javascript
function loadMonthlyData() {
    const user = getCurrentUserInfo();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const income = getUserMonthlyIncome(currentMonth);
    const expenses = getUserMonthlyExpenses(currentMonth);

    document.getElementById('pageTitle').textContent = `${user.name}'s Monthly Tracker`;

    if (income.length === 0 && expenses.length === 0) {
        showEmptyStateMonthly();
        return;
    }

    renderMonthlyData(income, expenses);
}

function showEmptyStateMonthly() {
    const container = document.getElementById('monthlyData');
    container.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 4rem; margin-bottom: 20px;">📊</div>
            <h2>No monthly data yet</h2>
            <p>Enter your income and expenses to start tracking</p>
            <button class="action-btn primary" onclick="openIncomeModal()">
                + Add Income
            </button>
            <button class="action-btn secondary" onclick="openExpenseModal()">
                + Add Expense
            </button>
        </div>
    `;
}
```

---

### Savings Plan (`savings-plan.html`)

#### What to Change:
1. Use real budget data from `getUserData().budgets`
2. Remove dummy savings scenarios
3. Add empty state

#### Code Changes:
```javascript
function loadSavingsPlan() {
    const user = getCurrentUserInfo();
    const data = getUserData();
    const budgets = data.budgets || [];

    document.getElementById('pageTitle').textContent = `${user.name}'s Savings Plan`;

    if (budgets.length === 0) {
        showEmptyStateSavings();
        return;
    }

    renderSavingsPlan(budgets);
}

function showEmptyStateSavings() {
    const container = document.getElementById('savingsPlan');
    container.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 4rem; margin-bottom: 20px;">💰</div>
            <h2>No savings data yet</h2>
            <p>Set up your monthly budget to start saving</p>
            <button class="action-btn primary" onclick="openBudgetModal()">
                + Set Up Budget
            </button>
        </div>
    `;
}
```

---

### Settings Page (`settings.html`)

#### What to Add:
1. Family member management section
2. Add/remove family members
3. Display current user info

#### Code Changes:
```javascript
function loadSettings() {
    const user = getCurrentUserInfo();
    const familyMembers = getUserFamilyMembers();

    // Display user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('familyName').textContent = user.familyName;

    // Display family members
    renderFamilyMembers(familyMembers);
}

function renderFamilyMembers(members) {
    const container = document.getElementById('familyMembersList');

    if (members.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p>No family members added yet</p>
                <button onclick="openAddFamilyMemberModal()">+ Add Family Member</button>
            </div>
        `;
        return;
    }

    container.innerHTML = members.map(member => `
        <div class="family-member-card">
            <div class="member-info">
                <h4>${member.name}</h4>
                <p>${member.relationship}</p>
            </div>
            <button onclick="removeFamilyMember('${member.id}')">Remove</button>
        </div>
    `).join('');
}
```

---

## Common Helper Functions

Add these to any page that needs them:

```javascript
// Format currency consistently
function formatCurrency(value) {
    if (!value) return '₹0';
    if (value >= 10000000) {
        return '₹' + (value / 10000000).toFixed(2) + 'Cr';
    } else if (value >= 100000) {
        return '₹' + (value / 100000).toFixed(2) + 'L';
    } else if (value >= 1000) {
        return '₹' + (value / 1000).toFixed(2) + 'K';
    }
    return '₹' + value.toFixed(0);
}

// Check if user has data
function hasAnyData() {
    return hasUserData(); // From userDataManager.js
}

// Update user avatar
function updateUserAvatar() {
    const user = getCurrentUserInfo();
    const avatar = document.querySelector('.user-avatar');
    if (avatar && user) {
        avatar.textContent = user.name.charAt(0).toUpperCase();
    }
}
```

---

## Universal Empty State CSS

Add this to your stylesheet:

```css
.empty-state {
    text-align: center;
    padding: 80px 20px;
    background: var(--bg-tertiary);
    border-radius: 16px;
    border: 1px solid var(--border-color);
}

.empty-state h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
}

.empty-state p {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 30px;
}

.empty-state-small {
    text-align: center;
    padding: 40px 20px;
}

.empty-state-small p {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin-bottom: 16px;
}
```

---

## Testing Checklist for Each Page

After updating a page, test:

- [ ] Page loads without errors
- [ ] User's real name appears (not "Manish" or "Raghavi")
- [ ] Empty state shows when user has no data
- [ ] Empty state has helpful message and action button
- [ ] When data is added, empty state disappears
- [ ] Real data displays correctly
- [ ] No hardcoded dummy names anywhere
- [ ] View switcher only appears if family members exist
- [ ] User avatar shows correct initial

---

## Summary

**Pattern for Every Page:**
1. Include `auth.js` and `userDataManager.js`
2. Get current user with `getCurrentUserInfo()`
3. Load data with appropriate getter (`getUserAssets()`, `getUserGoals()`, etc.)
4. Check if data exists
5. Show empty state with helpful prompt if no data
6. Render real data if exists
7. Update page title with user's real name

**Never hardcode:**
- Names like "Manish" or "Raghavi"
- Sample data for metrics
- Fake transaction history
- Dummy family members

**Always show:**
- User's actual name
- Real data or empty states
- Helpful prompts for new users
- Clear action buttons to add data
