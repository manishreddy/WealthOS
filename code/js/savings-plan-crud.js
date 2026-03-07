/**
 * WealthOS - Savings Plan CRUD Functionality
 * Full Create, Read, Update, Delete operations for:
 * - Income sources
 * - Expenses (quick & detailed modes)
 * - Bank accounts
 * - Bill reminders
 * - Savings goals
 */

// ===================================
// STORAGE KEYS - Imported from localStorage.js
// ===================================
// Note: STORAGE_KEYS is defined in localStorage.js
// which must be loaded before this script

// ===================================
// DATA MODELS
// ===================================
let monthlyTrackingData = {};
let bankAccounts = [];
let billReminders = [];
let expenseCategories = [];
let savingsGoals = {};
let currentMonthIndex = 1; // February (0-based)
let currentYear = 2026;
const months = ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];

// ===================================
// UTILITY FUNCTIONS
// ===================================
function generateId() {
    return 'ID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentMonthKey() {
    return `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
}

function formatCurrency(amount) {
    const n = parseFloat(amount || 0);
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
    if (n >= 100000)   return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    return '₹' + n.toLocaleString('en-IN');
}

function parseCurrency(value) {
    if (typeof value === 'number') return value;
    return parseFloat(String(value).replace(/[₹,\s]/g, '')) || 0;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `Due: ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
}

function saveAllData() {
    try {
        localStorage.setItem(STORAGE_KEYS.MONTHLY_TRACKING, JSON.stringify(monthlyTrackingData));
        localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(bankAccounts));
        localStorage.setItem(STORAGE_KEYS.BILL_REMINDERS, JSON.stringify(billReminders));
        localStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(expenseCategories));
        localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(savingsGoals));
        console.log('✓ Data saved successfully');
        return true;
    } catch (error) {
        console.error('✗ Error saving data:', error);
        return false;
    }
}

// ===================================
// INITIALIZATION
// ===================================
function initializeData() {
    // Load or initialize monthly tracking data
    const savedTracking = localStorage.getItem(STORAGE_KEYS.MONTHLY_TRACKING);
    monthlyTrackingData = savedTracking ? JSON.parse(savedTracking) : {};

    // Load or initialize bank accounts
    const savedAccounts = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    bankAccounts = savedAccounts ? JSON.parse(savedAccounts) : [
        { id: 'BA001', name: 'HDFC Savings', number: '****4532', balance: 124500, icon: '🏦', type: 'bank' },
        { id: 'BA002', name: 'ICICI Salary', number: '****7821', balance: 85300, icon: '🏦', type: 'bank' },
        { id: 'BA003', name: 'Liquid Fund', number: 'HDFC Liquid', balance: 245000, icon: '💧', type: 'liquid' },
        { id: 'BA004', name: 'Wallet & Cash', number: 'Multiple sources', balance: 18200, icon: '💵', type: 'liquid' }
    ];

    // Load or initialize bill reminders
    const savedBills = localStorage.getItem(STORAGE_KEYS.BILL_REMINDERS);
    billReminders = savedBills ? JSON.parse(savedBills) : [
        { id: 'BR001', name: 'Electricity', icon: '💡', amount: 2340, dueDate: '2026-02-08', paid: false },
        { id: 'BR002', name: 'Mobile', icon: '📱', amount: 599, dueDate: '2026-02-12', paid: false },
        { id: 'BR003', name: 'Internet', icon: '🌐', amount: 999, dueDate: '2026-02-15', paid: false },
        { id: 'BR004', name: 'Streaming', icon: '📺', amount: 649, dueDate: '2026-02-18', paid: false },
        { id: 'BR005', name: 'Maintenance', icon: '🏠', amount: 4500, dueDate: '2026-02-28', paid: false }
    ];

    // Load or initialize expense categories
    const savedCategories = localStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES);
    expenseCategories = savedCategories ? JSON.parse(savedCategories) : [
        { id: 'EC001', name: 'Housing & Rent', icon: '🏠', amount: 35000 },
        { id: 'EC002', name: 'Food & Dining', icon: '🍔', amount: 18500 },
        { id: 'EC003', name: 'Transportation', icon: '🚗', amount: 12200 },
        { id: 'EC004', name: 'Shopping', icon: '🛒', amount: 15800 },
        { id: 'EC005', name: 'Healthcare', icon: '💊', amount: 8400 },
        { id: 'EC006', name: 'Entertainment', icon: '🎬', amount: 6500 },
        { id: 'EC007', name: 'Utilities & Bills', icon: '💡', amount: 9300 },
        { id: 'EC008', name: 'Education', icon: '🎓', amount: 25000 },
        { id: 'EC009', name: 'Others', icon: '🎁', amount: 21500 }
    ];

    // Load or initialize savings goals
    const savedGoals = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    savingsGoals = savedGoals ? JSON.parse(savedGoals) : {
        monthlyTarget: 72800,
        emergencyFundTarget: 6
    };

    // Initialize current month if not exists
    const monthKey = getCurrentMonthKey();
    if (!monthlyTrackingData[monthKey]) {
        monthlyTrackingData[monthKey] = {
            income: [
                { id: generateId(), emoji: '👨‍💼', name: 'Manish', amount: 125000 },
                { id: generateId(), emoji: '👩‍💼', name: 'Spouse', amount: 85000 },
                { id: generateId(), emoji: '💼', name: 'Freelance', amount: 15000 }
            ],
            expenses: {
                mode: 'quick',
                quickTotal: 152200,
                categories: JSON.parse(JSON.stringify(expenseCategories))
            }
        };
    }

    saveAllData();
    renderAll();
}

// ===================================
// MONTH NAVIGATION
// ===================================
function updateMonthDisplay() {
    document.getElementById('currentMonth').textContent = `${months[currentMonthIndex]} ${currentYear}`;
    loadMonthData();
}

function previousMonth() {
    currentMonthIndex--;
    if (currentMonthIndex < 0) {
        currentMonthIndex = 11;
        currentYear--;
    }
    updateMonthDisplay();
}

function nextMonth() {
    currentMonthIndex++;
    if (currentMonthIndex > 11) {
        currentMonthIndex = 0;
        currentYear++;
    }
    updateMonthDisplay();
}

function loadMonthData() {
    const monthKey = getCurrentMonthKey();

    // Initialize month data if it doesn't exist
    if (!monthlyTrackingData[monthKey]) {
        monthlyTrackingData[monthKey] = {
            income: [],
            expenses: {
                mode: 'quick',
                quickTotal: 0,
                categories: JSON.parse(JSON.stringify(expenseCategories))
            }
        };
        saveAllData();
    }

    renderAll();
}

// ===================================
// INCOME CRUD OPERATIONS
// ===================================
function renderIncomeEntries() {
    const monthKey = getCurrentMonthKey();
    const income = monthlyTrackingData[monthKey]?.income || [];
    const container = document.getElementById('incomeEntries');

    container.innerHTML = income.map(entry => `
        <div class="entry-row" data-id="${entry.id}">
            <div class="entry-emoji">${entry.emoji}</div>
            <input type="text" class="entry-input"
                   value="${entry.name}"
                   onchange="updateIncomeEntry('${entry.id}', 'name', this.value)"
                   placeholder="Income source name">
            <input type="text" class="entry-input amount"
                   value="${formatCurrency(entry.amount)}"
                   onchange="updateIncomeEntry('${entry.id}', 'amount', this.value)"
                   placeholder="₹ 0">
            <button class="delete-btn" onclick="deleteIncomeEntry('${entry.id}')" title="Delete">🗑️</button>
        </div>
    `).join('');
}

function addIncomeEntry() {
    const monthKey = getCurrentMonthKey();
    const newEntry = {
        id: generateId(),
        emoji: '💼',
        name: '',
        amount: 0
    };

    if (!monthlyTrackingData[monthKey]) {
        monthlyTrackingData[monthKey] = {
            income: [],
            expenses: { mode: 'quick', quickTotal: 0, categories: [] }
        };
    }

    monthlyTrackingData[monthKey].income.push(newEntry);
    saveAllData();
    renderIncomeEntries();
    calculateTotals();
}

function updateIncomeEntry(id, field, value) {
    const monthKey = getCurrentMonthKey();
    const income = monthlyTrackingData[monthKey].income;
    const entry = income.find(e => e.id === id);

    if (entry) {
        if (field === 'amount') {
            entry[field] = parseCurrency(value);
        } else {
            entry[field] = value;
        }
        saveAllData();
        calculateTotals();
    }
}

function deleteIncomeEntry(id) {
    if (!confirm('Delete this income source?')) return;

    const monthKey = getCurrentMonthKey();
    monthlyTrackingData[monthKey].income = monthlyTrackingData[monthKey].income.filter(e => e.id !== id);
    saveAllData();
    renderIncomeEntries();
    calculateTotals();
}

function copyFromLastMonth() {
    const monthKey = getCurrentMonthKey();
    const lastMonth = new Date(currentYear, currentMonthIndex - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    if (monthlyTrackingData[lastMonthKey]) {
        const lastMonthData = monthlyTrackingData[lastMonthKey];
        monthlyTrackingData[monthKey] = {
            income: JSON.parse(JSON.stringify(lastMonthData.income)),
            expenses: JSON.parse(JSON.stringify(lastMonthData.expenses))
        };
        saveAllData();
        renderAll();
        alert(`Copied data from ${months[lastMonth.getMonth()]} ${lastMonth.getFullYear()}`);
    } else {
        alert('No data available for previous month');
    }
}

// ===================================
// EXPENSE CRUD OPERATIONS
// ===================================
function switchExpenseMode(mode) {
    const monthKey = getCurrentMonthKey();
    const quickMode = document.getElementById('quickMode');
    const detailedMode = document.getElementById('detailedMode');
    const buttons = document.querySelectorAll('.mode-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (mode === 'quick') {
        quickMode.style.display = 'block';
        detailedMode.style.display = 'none';
        buttons[0].classList.add('active');
        monthlyTrackingData[monthKey].expenses.mode = 'quick';
    } else {
        quickMode.style.display = 'none';
        detailedMode.style.display = 'flex';
        buttons[1].classList.add('active');
        monthlyTrackingData[monthKey].expenses.mode = 'detailed';
        renderDetailedExpenses();
    }

    saveAllData();
}

function updateQuickExpense(value) {
    const monthKey = getCurrentMonthKey();
    const amount = parseCurrency(value);
    monthlyTrackingData[monthKey].expenses.quickTotal = amount;
    saveAllData();
    calculateTotals();
}

function renderDetailedExpenses() {
    const monthKey = getCurrentMonthKey();
    const categories = monthlyTrackingData[monthKey]?.expenses?.categories || expenseCategories;
    const container = document.getElementById('detailedMode');

    container.innerHTML = categories.map(cat => `
        <div class="category-item" data-id="${cat.id}">
            <div class="category-emoji">${cat.icon}</div>
            <div class="category-info">
                <div class="category-name">${cat.name}</div>
            </div>
            <input type="text" class="category-input"
                   value="${formatCurrency(cat.amount)}"
                   onchange="updateCategoryExpense('${cat.id}', this.value)"
                   placeholder="₹ 0">
            <button class="delete-btn-small" onclick="deleteExpenseCategory('${cat.id}')" title="Delete">🗑️</button>
        </div>
    `).join('') + `
        <button class="add-category-btn" onclick="addExpenseCategory()">
            <span>+</span>
            <span>Add custom category</span>
        </button>
    `;
}

function updateCategoryExpense(id, value) {
    const monthKey = getCurrentMonthKey();
    const categories = monthlyTrackingData[monthKey].expenses.categories;
    const category = categories.find(c => c.id === id);

    if (category) {
        category.amount = parseCurrency(value);
        saveAllData();
        calculateDetailedTotal();
    }
}

function deleteExpenseCategory(id) {
    if (!confirm('Delete this category?')) return;

    const monthKey = getCurrentMonthKey();
    monthlyTrackingData[monthKey].expenses.categories =
        monthlyTrackingData[monthKey].expenses.categories.filter(c => c.id !== id);
    saveAllData();
    renderDetailedExpenses();
    calculateDetailedTotal();
}

function addExpenseCategory() {
    const name = prompt('Enter category name:');
    if (!name) return;

    const icon = prompt('Enter emoji icon:', '📦');
    const monthKey = getCurrentMonthKey();

    const newCategory = {
        id: generateId(),
        name: name,
        icon: icon || '📦',
        amount: 0
    };

    monthlyTrackingData[monthKey].expenses.categories.push(newCategory);
    expenseCategories.push(newCategory);
    saveAllData();
    renderDetailedExpenses();
}

function calculateDetailedTotal() {
    const monthKey = getCurrentMonthKey();
    const categories = monthlyTrackingData[monthKey]?.expenses?.categories || [];
    const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

    monthlyTrackingData[monthKey].expenses.quickTotal = total;
    document.getElementById('quickExpenseInput').value = formatCurrency(total);
    saveAllData();
    calculateTotals();
}

// ===================================
// BANK ACCOUNT CRUD OPERATIONS
// ===================================
function renderBankAccounts() {
    const container = document.querySelector('.account-cards');

    container.innerHTML = bankAccounts.map(account => `
        <div class="account-card" data-id="${account.id}">
            <div class="account-header">
                <div class="account-info">
                    <div class="account-name">${account.name}</div>
                    <div class="account-number">${account.number}</div>
                </div>
                <div class="account-icon ${account.type}">${account.icon}</div>
            </div>
            <div class="account-balance" contenteditable="true"
                 onblur="updateAccountBalance('${account.id}', this.textContent)">${formatCurrency(account.balance)}</div>
            <div class="account-actions">
                <button class="quick-action-btn" onclick="editAccount('${account.id}')">Edit</button>
                <button class="quick-action-btn" onclick="deleteAccount('${account.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function addBankAccount() {
    const name = prompt('Account name:');
    if (!name) return;

    const number = prompt('Account number (last 4 digits):', '****0000');
    const balance = parseFloat(prompt('Current balance:', '0'));
    const icon = prompt('Icon:', '🏦');
    const type = prompt('Type (bank/liquid):', 'bank');

    const newAccount = {
        id: generateId(),
        name,
        number,
        balance: balance || 0,
        icon: icon || '🏦',
        type: type || 'bank'
    };

    bankAccounts.push(newAccount);
    saveAllData();
    renderBankAccounts();
    calculateTotalLiquid();
}

function editAccount(id) {
    const account = bankAccounts.find(a => a.id === id);
    if (!account) return;

    const name = prompt('Account name:', account.name);
    if (name) account.name = name;

    const number = prompt('Account number:', account.number);
    if (number) account.number = number;

    saveAllData();
    renderBankAccounts();
}

function updateAccountBalance(id, value) {
    const account = bankAccounts.find(a => a.id === id);
    if (account) {
        account.balance = parseCurrency(value);
        saveAllData();
        renderBankAccounts();
        calculateTotalLiquid();
    }
}

function deleteAccount(id) {
    if (!confirm('Delete this account?')) return;

    bankAccounts = bankAccounts.filter(a => a.id !== id);
    saveAllData();
    renderBankAccounts();
    calculateTotalLiquid();
}

function calculateTotalLiquid() {
    const total = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
    // Update emergency fund calculation if element exists
    const emergencyAmount = document.querySelector('.emergency-amount');
    if (emergencyAmount) {
        emergencyAmount.textContent = formatCurrency(total * 0.5); // Assume 50% is emergency fund
    }
}

// ===================================
// BILL REMINDER CRUD OPERATIONS
// ===================================
function renderBillReminders() {
    const container = document.querySelector('.bill-list');
    if (!container) return;

    container.innerHTML = billReminders.map(bill => `
        <div class="bill-item ${bill.paid ? 'paid' : ''}" data-id="${bill.id}">
            <div class="bill-icon">${bill.icon}</div>
            <div class="bill-info">
                <div class="bill-name">${bill.name}</div>
                <div class="bill-due">${formatDate(bill.dueDate)}</div>
            </div>
            <div class="bill-amount" contenteditable="true"
                 onblur="updateBillAmount('${bill.id}', this.textContent)">${formatCurrency(bill.amount)}</div>
            <button class="mark-paid-btn" onclick="toggleBillPaid('${bill.id}')">${bill.paid ? '✓' : '○'}</button>
            <button class="delete-btn-small" onclick="deleteBill('${bill.id}')">🗑️</button>
        </div>
    `).join('');
}

function addBillReminder() {
    const name = prompt('Bill name:');
    if (!name) return;

    const amount = parseFloat(prompt('Amount:', '0'));
    const dueDate = prompt('Due date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    const icon = prompt('Icon:', '💳');

    const newBill = {
        id: generateId(),
        name,
        icon: icon || '💳',
        amount: amount || 0,
        dueDate,
        paid: false
    };

    billReminders.push(newBill);
    saveAllData();
    renderBillReminders();
}

function updateBillAmount(id, value) {
    const bill = billReminders.find(b => b.id === id);
    if (bill) {
        bill.amount = parseCurrency(value);
        saveAllData();
        renderBillReminders();
    }
}

function toggleBillPaid(id) {
    const bill = billReminders.find(b => b.id === id);
    if (bill) {
        bill.paid = !bill.paid;
        saveAllData();
        renderBillReminders();
    }
}

function deleteBill(id) {
    if (!confirm('Delete this bill reminder?')) return;

    billReminders = billReminders.filter(b => b.id !== id);
    saveAllData();
    renderBillReminders();
}

// ===================================
// SAVINGS GOALS
// ===================================
function updateSavingsGoal() {
    const target = parseFloat(prompt('Monthly savings target:', savingsGoals.monthlyTarget));
    if (target) {
        savingsGoals.monthlyTarget = target;
        saveAllData();
        calculateTotals();
    }
}

function updateEmergencyFundGoal() {
    const months = parseFloat(prompt('Emergency fund target (months):', savingsGoals.emergencyFundTarget));
    if (months) {
        savingsGoals.emergencyFundTarget = months;
        saveAllData();
        calculateTotals();
    }
}

// ===================================
// CALCULATIONS
// ===================================
function calculateTotals() {
    const monthKey = getCurrentMonthKey();
    const data = monthlyTrackingData[monthKey];

    if (!data) return;

    // Calculate total income
    const totalIncome = data.income.reduce((sum, entry) => sum + entry.amount, 0);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);

    // Calculate total expenses
    const totalExpenses = data.expenses.mode === 'quick'
        ? data.expenses.quickTotal
        : data.expenses.categories.reduce((sum, cat) => sum + cat.amount, 0);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);

    // Calculate savings
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100) : 0;

    document.getElementById('monthlySavings').textContent = formatCurrency(savings);
    document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;

    // Update savings badge
    updateSavingsBadge(savingsRate);

    // Update vs target
    const vsTarget = savingsGoals.monthlyTarget > 0
        ? ((savings - savingsGoals.monthlyTarget) / savingsGoals.monthlyTarget * 100)
        : 0;
    document.getElementById('vsLastMonth').textContent =
        (vsTarget >= 0 ? '+' : '') + vsTarget.toFixed(1) + '%';
}

function updateSavingsBadge(rate) {
    const badge = document.getElementById('savingsBadge');
    if (!badge) return;

    badge.className = 'savings-badge';

    if (rate >= 30) {
        badge.classList.add('excellent');
        badge.innerHTML = '<span>🎉</span><span>Excellent</span>';
    } else if (rate >= 20) {
        badge.classList.add('good');
        badge.innerHTML = '<span>✓</span><span>Good</span>';
    } else if (rate >= 10) {
        badge.classList.add('average');
        badge.innerHTML = '<span>~</span><span>Average</span>';
    } else {
        badge.classList.add('poor');
        badge.innerHTML = '<span>!</span><span>Low</span>';
    }
}

// ===================================
// RENDER ALL
// ===================================
function renderAll() {
    renderIncomeEntries();
    renderBankAccounts();
    renderBillReminders();

    const monthKey = getCurrentMonthKey();
    const data = monthlyTrackingData[monthKey];

    if (data?.expenses?.mode === 'detailed') {
        renderDetailedExpenses();
        calculateDetailedTotal();
    } else {
        document.getElementById('quickExpenseInput').value =
            formatCurrency(data?.expenses?.quickTotal || 0);
    }

    calculateTotals();
}

// ===================================
// CURRENCY FORMATTING ON INPUT
// ===================================
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('amount') ||
        e.target.classList.contains('category-input') ||
        e.target.classList.contains('quick-input-large')) {

        let value = e.target.value.replace(/[₹,\s]/g, '');

        if (value && !isNaN(value)) {
            const formatted = parseFloat(value).toLocaleString('en-IN');
            const cursorPos = e.target.selectionStart;
            e.target.value = `₹ ${formatted}`;
        }
    }
});

// ===================================
// THEME MANAGEMENT
// ===================================
function toggleTheme() {
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }
}

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        document.getElementById('themeToggle')?.classList.add('active');
    }

    // Initialize data
    initializeData();

    console.log('✓ WealthOS Savings Plan initialized with full CRUD functionality');
});
