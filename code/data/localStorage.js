/**
 * WealthOS LocalStorage Utility Functions
 * Handles data persistence using browser's localStorage
 */

/// <reference path="./sampleData.js" />

// Storage keys
const STORAGE_KEYS = {
    FAMILY_MEMBERS: 'wealthos_family_members',
    MONTHLY_INCOME: 'wealthos_monthly_income',
    MONTHLY_EXPENSES: 'wealthos_monthly_expenses',
    ASSETS: 'wealthos_assets',
    LIABILITIES: 'wealthos_liabilities',
    GOALS: 'wealthos_goals',
    TRANSACTIONS: 'wealthos_transactions',
    INSURANCE: 'wealthos_insurance',
    BUDGETS: 'wealthos_budgets',
    EXPENSE_CATEGORIES: 'wealthos_expense_categories',
    APP_INITIALIZED: 'wealthos_initialized',
    LAST_UPDATED: 'wealthos_last_updated',
    USER_PREFERENCES: 'wealthos_preferences'
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {boolean} Success status
 */
function saveData(key, data) {
    try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(key, jsonData);
        localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
        console.log(`✓ Saved data to ${key}`);
        return true;
    } catch (error) {
        console.error(`✗ Error saving data to ${key}:`, error);
        if (error.name === 'QuotaExceededError') {
            console.error('LocalStorage quota exceeded. Consider clearing old data.');
        }
        return false;
    }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Parsed data or default value
 */
function loadData(key, defaultValue = null) {
    try {
        const jsonData = localStorage.getItem(key);
        if (jsonData === null) {
            return defaultValue;
        }
        return JSON.parse(jsonData);
    } catch (error) {
        console.error(`✗ Error loading data from ${key}:`, error);
        return defaultValue;
    }
}

/**
 * Check if app is initialized
 * @returns {boolean} Initialization status
 */
function isInitialized() {
    return localStorage.getItem(STORAGE_KEYS.APP_INITIALIZED) === 'true';
}

/**
 * Initialize app with sample data
 * @param {boolean} forceReset - Force reset even if already initialized
 * @returns {boolean} Success status
 */
function initializeData(forceReset = false) {
    if (isInitialized() && !forceReset) {
        console.log('✓ App already initialized. Use initializeData(true) to force reset.');
        return true;
    }

    try {
        console.log('Initializing WealthOS with sample data...');

        // Check if sampleData is available
        if (typeof window === 'undefined' || !window.WealthOSData) {
            console.error('✗ Sample data not loaded. Please include sampleData.js first.');
            return false;
        }

        const data = window.WealthOSData;

        // Save all data modules
        saveData(STORAGE_KEYS.FAMILY_MEMBERS, data.familyMembers);
        saveData(STORAGE_KEYS.MONTHLY_INCOME, data.monthlyIncome);
        saveData(STORAGE_KEYS.MONTHLY_EXPENSES, data.monthlyExpenses);
        saveData(STORAGE_KEYS.ASSETS, data.assets);
        saveData(STORAGE_KEYS.LIABILITIES, data.liabilities);
        saveData(STORAGE_KEYS.GOALS, data.financialGoals);
        saveData(STORAGE_KEYS.TRANSACTIONS, data.transactions);
        saveData(STORAGE_KEYS.INSURANCE, data.insurancePolicies);
        saveData(STORAGE_KEYS.BUDGETS, data.budgets);
        saveData(STORAGE_KEYS.EXPENSE_CATEGORIES, data.expenseCategories);

        // Set default user preferences
        const defaultPreferences = {
            currency: 'INR',
            currencySymbol: '₹',
            dateFormat: 'DD/MM/YYYY',
            theme: 'light',
            dashboardView: 'comprehensive',
            notifications: true
        };
        saveData(STORAGE_KEYS.USER_PREFERENCES, defaultPreferences);

        // Mark as initialized
        localStorage.setItem(STORAGE_KEYS.APP_INITIALIZED, 'true');
        localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());

        console.log('✓ WealthOS initialized successfully!');
        console.log(`✓ Loaded data for: ${data.familyMembers.map(m => m.name).join(', ')}`);
        console.log(`✓ Total Assets: ₹${(data.assets.reduce((sum, a) => sum + a.currentValue, 0) / 100000).toFixed(2)} Lakhs`);
        console.log(`✓ Total Liabilities: ₹${(data.liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0) / 100000).toFixed(2)} Lakhs`);
        console.log(`✓ Total Transactions: ${data.transactions.length}`);

        return true;
    } catch (error) {
        console.error('✗ Error initializing data:', error);
        return false;
    }
}

/**
 * Clear all WealthOS data from localStorage
 * @param {boolean} confirm - Confirmation flag
 * @returns {boolean} Success status
 */
function clearData(confirm = false) {
    if (!confirm) {
        console.warn('⚠ This will delete all data. Call clearData(true) to confirm.');
        return false;
    }

    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('✓ All WealthOS data cleared from localStorage');
        return true;
    } catch (error) {
        console.error('✗ Error clearing data:', error);
        return false;
    }
}

/**
 * Get all family members
 * @returns {FamilyMember[]} Array of family members
 */
function getFamilyMembers() {
    return loadData(STORAGE_KEYS.FAMILY_MEMBERS, []);
}

/**
 * Get monthly income data
 * @param {string} [month] - Optional month filter (YYYY-MM format)
 * @param {string} [memberId] - Optional member ID filter
 * @returns {MonthlyIncome[]} Array of income records
 */
function getMonthlyIncome(month = null, memberId = null) {
    let income = loadData(STORAGE_KEYS.MONTHLY_INCOME, []);

    if (month) {
        income = income.filter(i => i.month === month);
    }

    if (memberId) {
        income = income.filter(i => i.memberId === memberId);
    }

    return income;
}

/**
 * Get monthly expenses
 * @param {string} [month] - Optional month filter (YYYY-MM format)
 * @param {string} [category] - Optional category filter
 * @returns {MonthlyExpense[]} Array of expense records
 */
function getMonthlyExpenses(month = null, category = null) {
    let expenses = loadData(STORAGE_KEYS.MONTHLY_EXPENSES, []);

    if (month) {
        expenses = expenses.filter(e => e.month === month);
    }

    if (category) {
        expenses = expenses.filter(e => e.category === category);
    }

    return expenses;
}

/**
 * Get assets
 * @param {string} [type] - Optional asset type filter
 * @param {string} [ownerId] - Optional owner ID filter
 * @returns {Asset[]} Array of assets
 */
function getAssets(type = null, ownerId = null) {
    let assets = loadData(STORAGE_KEYS.ASSETS, []);

    if (type) {
        assets = assets.filter(a => a.type === type);
    }

    if (ownerId) {
        assets = assets.filter(a => a.ownerId === ownerId);
    }

    return assets;
}

/**
 * Get liabilities
 * @param {string} [type] - Optional liability type filter
 * @returns {Liability[]} Array of liabilities
 */
function getLiabilities(type = null) {
    let liabilities = loadData(STORAGE_KEYS.LIABILITIES, []);

    if (type) {
        liabilities = liabilities.filter(l => l.type === type);
    }

    return liabilities;
}

/**
 * Get financial goals
 * @param {string} [status] - Optional status filter (OnTrack, Behind, Achieved)
 * @returns {FinancialGoal[]} Array of goals
 */
function getGoals(status = null) {
    let goals = loadData(STORAGE_KEYS.GOALS, []);

    if (status) {
        goals = goals.filter(g => g.status === status);
    }

    return goals;
}

/**
 * Get transactions
 * @param {Object} filters - Filter options
 * @param {string} [filters.type] - Transaction type
 * @param {string} [filters.category] - Category
 * @param {string} [filters.memberId] - Member ID
 * @param {Date} [filters.startDate] - Start date
 * @param {Date} [filters.endDate] - End date
 * @param {number} [filters.limit] - Limit number of results
 * @returns {Transaction[]} Array of transactions
 */
function getTransactions(filters = {}) {
    let transactions = loadData(STORAGE_KEYS.TRANSACTIONS, []);

    // Parse date strings back to Date objects
    transactions = transactions.map(t => ({
        ...t,
        date: new Date(t.date)
    }));

    if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
    }

    if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category);
    }

    if (filters.memberId) {
        transactions = transactions.filter(t => t.memberId === filters.memberId);
    }

    if (filters.startDate) {
        transactions = transactions.filter(t => t.date >= new Date(filters.startDate));
    }

    if (filters.endDate) {
        transactions = transactions.filter(t => t.date <= new Date(filters.endDate));
    }

    // Sort by date descending (newest first)
    transactions.sort((a, b) => b.date - a.date);

    if (filters.limit) {
        transactions = transactions.slice(0, filters.limit);
    }

    return transactions;
}

/**
 * Get insurance policies
 * @param {string} [type] - Optional policy type filter
 * @returns {InsurancePolicy[]} Array of insurance policies
 */
function getInsurance(type = null) {
    let policies = loadData(STORAGE_KEYS.INSURANCE, []);

    if (type) {
        policies = policies.filter(p => p.type === type);
    }

    return policies;
}

/**
 * Get budgets
 * @param {string} [month] - Optional month filter (YYYY-MM format)
 * @returns {Budget[]} Array of budgets
 */
function getBudgets(month = null) {
    let budgets = loadData(STORAGE_KEYS.BUDGETS, []);

    if (month) {
        budgets = budgets.filter(b => b.month === month);
    }

    return budgets;
}

/**
 * Get expense categories
 * @returns {Object} Expense categories object
 */
function getExpenseCategories() {
    return loadData(STORAGE_KEYS.EXPENSE_CATEGORIES, {});
}

/**
 * Get user preferences
 * @returns {Object} User preferences
 */
function getUserPreferences() {
    return loadData(STORAGE_KEYS.USER_PREFERENCES, {
        currency: 'INR',
        currencySymbol: '₹',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        dashboardView: 'comprehensive',
        notifications: true
    });
}

/**
 * Update user preferences
 * @param {Object} preferences - Preferences to update
 * @returns {boolean} Success status
 */
function updatePreferences(preferences) {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    return saveData(STORAGE_KEYS.USER_PREFERENCES, updated);
}

/**
 * Add new transaction
 * @param {Transaction} transaction - Transaction object
 * @returns {boolean} Success status
 */
function addTransaction(transaction) {
    const transactions = getTransactions();
    transactions.unshift(transaction); // Add to beginning
    return saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
}

/**
 * Update asset
 * @param {string} assetId - Asset ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success status
 */
function updateAsset(assetId, updates) {
    const assets = getAssets();
    const index = assets.findIndex(a => a.id === assetId);

    if (index === -1) {
        console.error(`Asset ${assetId} not found`);
        return false;
    }

    assets[index] = { ...assets[index], ...updates, lastUpdated: new Date() };
    return saveData(STORAGE_KEYS.ASSETS, assets);
}

/**
 * Update goal
 * @param {string} goalId - Goal ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success status
 */
function updateGoal(goalId, updates) {
    const goals = getGoals();
    const index = goals.findIndex(g => g.id === goalId);

    if (index === -1) {
        console.error(`Goal ${goalId} not found`);
        return false;
    }

    goals[index] = { ...goals[index], ...updates };
    return saveData(STORAGE_KEYS.GOALS, goals);
}

/**
 * Get storage info
 * @returns {Object} Storage information
 */
function getStorageInfo() {
    try {
        const keys = Object.values(STORAGE_KEYS);
        let totalSize = 0;
        const breakdown = {};

        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                const size = new Blob([data]).size;
                totalSize += size;
                breakdown[key] = {
                    size: size,
                    sizeKB: (size / 1024).toFixed(2),
                    records: JSON.parse(data).length || 1
                };
            }
        });

        return {
            totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
            initialized: isInitialized(),
            lastUpdated: localStorage.getItem(STORAGE_KEYS.LAST_UPDATED),
            breakdown
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return null;
    }
}

/**
 * Export all data as JSON
 * @returns {Object} All data
 */
function exportAllData() {
    return {
        familyMembers: getFamilyMembers(),
        monthlyIncome: getMonthlyIncome(),
        monthlyExpenses: getMonthlyExpenses(),
        assets: getAssets(),
        liabilities: getLiabilities(),
        goals: getGoals(),
        transactions: getTransactions(),
        insurance: getInsurance(),
        budgets: getBudgets(),
        expenseCategories: getExpenseCategories(),
        preferences: getUserPreferences(),
        exportDate: new Date().toISOString()
    };
}

/**
 * Import data from JSON
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
function importData(data) {
    try {
        if (data.familyMembers) saveData(STORAGE_KEYS.FAMILY_MEMBERS, data.familyMembers);
        if (data.monthlyIncome) saveData(STORAGE_KEYS.MONTHLY_INCOME, data.monthlyIncome);
        if (data.monthlyExpenses) saveData(STORAGE_KEYS.MONTHLY_EXPENSES, data.monthlyExpenses);
        if (data.assets) saveData(STORAGE_KEYS.ASSETS, data.assets);
        if (data.liabilities) saveData(STORAGE_KEYS.LIABILITIES, data.liabilities);
        if (data.goals) saveData(STORAGE_KEYS.GOALS, data.goals);
        if (data.transactions) saveData(STORAGE_KEYS.TRANSACTIONS, data.transactions);
        if (data.insurance) saveData(STORAGE_KEYS.INSURANCE, data.insurance);
        if (data.budgets) saveData(STORAGE_KEYS.BUDGETS, data.budgets);
        if (data.expenseCategories) saveData(STORAGE_KEYS.EXPENSE_CATEGORIES, data.expenseCategories);
        if (data.preferences) saveData(STORAGE_KEYS.USER_PREFERENCES, data.preferences);

        console.log('✓ Data imported successfully');
        return true;
    } catch (error) {
        console.error('✗ Error importing data:', error);
        return false;
    }
}

// Export for browser environment
if (typeof window !== 'undefined') {
    window.WealthOSStorage = {
        // Core functions
        saveData,
        loadData,
        isInitialized,
        initializeData,
        clearData,

        // Getters
        getFamilyMembers,
        getMonthlyIncome,
        getMonthlyExpenses,
        getAssets,
        getLiabilities,
        getGoals,
        getTransactions,
        getInsurance,
        getBudgets,
        getExpenseCategories,
        getUserPreferences,

        // Updaters
        updatePreferences,
        addTransaction,
        updateAsset,
        updateGoal,

        // Utilities
        getStorageInfo,
        exportAllData,
        importData,

        // Constants
        STORAGE_KEYS
    };

    // Auto-initialize on first load
    if (!isInitialized()) {
        console.log('🚀 First time setup - initializing WealthOS...');
        console.log('💡 Tip: Use WealthOSStorage.initializeData(true) to reset data anytime');
    }
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveData,
        loadData,
        isInitialized,
        initializeData,
        clearData,
        getFamilyMembers,
        getMonthlyIncome,
        getMonthlyExpenses,
        getAssets,
        getLiabilities,
        getGoals,
        getTransactions,
        getInsurance,
        getBudgets,
        getExpenseCategories,
        getUserPreferences,
        updatePreferences,
        addTransaction,
        updateAsset,
        updateGoal,
        getStorageInfo,
        exportAllData,
        importData,
        STORAGE_KEYS
    };
}
