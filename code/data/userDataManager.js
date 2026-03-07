/**
 * WealthOS User-Specific Data Manager
 * Manages user data with proper isolation and real user information
 */

/// <reference path="./dataModels.js" />

// User-specific storage key prefix
const USER_DATA_PREFIX = 'wealthos_data_';

/**
 * Get storage key for current user
 * @returns {string} User-specific storage key
 */
function getUserDataKey() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('No logged-in user found');
        return null;
    }
    return USER_DATA_PREFIX + currentUser.id;
}

/**
 * Initialize user data structure
 * @returns {Object} Empty user data structure
 */
function createEmptyUserData() {
    return {
        assets: [],
        liabilities: [],
        goals: [],
        monthlyIncome: [],
        monthlyExpenses: [],
        transactions: [],
        budgets: [],
        insurance: [],
        familyMembers: [],
        preferences: {
            currency: 'INR',
            currencySymbol: '₹',
            dateFormat: 'DD/MM/YYYY',
            theme: 'light'
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Get current user's data
 * @returns {Object} User data object
 */
function getUserData() {
    const key = getUserDataKey();
    if (!key) return createEmptyUserData();

    try {
        const data = localStorage.getItem(key);
        if (!data) {
            // First time user - initialize empty data
            const emptyData = createEmptyUserData();
            saveUserData(emptyData);
            return emptyData;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading user data:', error);
        return createEmptyUserData();
    }
}

/**
 * Save current user's data
 * @param {Object} data - User data to save
 * @returns {boolean} Success status
 */
function saveUserData(data) {
    const key = getUserDataKey();
    if (!key) return false;

    try {
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        if (error.name === 'QuotaExceededError') {
            console.error('LocalStorage quota exceeded');
        }
        return false;
    }
}

/**
 * Get current user info from auth
 * @returns {Object} Current user object
 */
function getCurrentUserInfo() {
    const user = getCurrentUser();
    if (!user) return null;

    return {
        id: user.id,
        name: user.userName,
        familyName: user.familyName,
        email: user.email,
        createdAt: user.createdAt,
        onboardingComplete: user.onboardingComplete
    };
}

/**
 * Check if user has any data
 * @returns {boolean} True if user has entered data
 */
function hasUserData() {
    const data = getUserData();
    return (
        data.assets.length > 0 ||
        data.goals.length > 0 ||
        data.monthlyIncome.length > 0 ||
        data.monthlyExpenses.length > 0 ||
        data.transactions.length > 0
    );
}

/**
 * Get user's assets
 * @param {string} [ownerId] - Filter by owner (user or family member)
 * @returns {Array} Array of assets
 */
function getUserAssets(ownerId = null) {
    const data = getUserData();
    if (!ownerId) return data.assets;
    return data.assets.filter(asset => asset.ownerId === ownerId);
}

/**
 * Add asset for user
 * @param {Object} asset - Asset object
 * @returns {boolean} Success status
 */
function addUserAsset(asset) {
    const data = getUserData();
    asset.id = 'A' + Date.now();
    asset.lastUpdated = new Date().toISOString();
    data.assets.push(asset);
    return saveUserData(data);
}

/**
 * Update user asset
 * @param {string} assetId - Asset ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success status
 */
function updateUserAsset(assetId, updates) {
    const data = getUserData();
    const index = data.assets.findIndex(a => a.id === assetId);
    if (index === -1) return false;

    data.assets[index] = { ...data.assets[index], ...updates, lastUpdated: new Date().toISOString() };
    return saveUserData(data);
}

/**
 * Delete user asset
 * @param {string} assetId - Asset ID
 * @returns {boolean} Success status
 */
function deleteUserAsset(assetId) {
    const data = getUserData();
    data.assets = data.assets.filter(a => a.id !== assetId);
    return saveUserData(data);
}

/**
 * Get user's goals
 * @returns {Array} Array of goals
 */
function getUserGoals() {
    const data = getUserData();
    return data.goals;
}

/**
 * Add goal for user
 * @param {Object} goal - Goal object
 * @returns {boolean} Success status
 */
function addUserGoal(goal) {
    const data = getUserData();
    goal.id = 'G' + Date.now();
    goal.createdDate = new Date().toISOString();
    data.goals.push(goal);
    return saveUserData(data);
}

/**
 * Update user goal
 * @param {string} goalId - Goal ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success status
 */
function updateUserGoal(goalId, updates) {
    const data = getUserData();
    const index = data.goals.findIndex(g => g.id === goalId);
    if (index === -1) return false;

    data.goals[index] = { ...data.goals[index], ...updates };
    return saveUserData(data);
}

/**
 * Delete user goal
 * @param {string} goalId - Goal ID
 * @returns {boolean} Success status
 */
function deleteUserGoal(goalId) {
    const data = getUserData();
    data.goals = data.goals.filter(g => g.id !== goalId);
    return saveUserData(data);
}

/**
 * Get user's monthly income
 * @param {string} [month] - Filter by month (YYYY-MM)
 * @returns {Array} Array of income records
 */
function getUserMonthlyIncome(month = null) {
    const data = getUserData();
    if (!month) return data.monthlyIncome;
    return data.monthlyIncome.filter(i => i.month === month);
}

/**
 * Add monthly income
 * @param {Object} income - Income object
 * @returns {boolean} Success status
 */
function addUserMonthlyIncome(income) {
    const data = getUserData();
    income.id = 'MI' + Date.now();
    income.recordedDate = new Date().toISOString();
    data.monthlyIncome.push(income);
    return saveUserData(data);
}

/**
 * Get user's monthly expenses
 * @param {string} [month] - Filter by month (YYYY-MM)
 * @returns {Array} Array of expense records
 */
function getUserMonthlyExpenses(month = null) {
    const data = getUserData();
    if (!month) return data.monthlyExpenses;
    return data.monthlyExpenses.filter(e => e.month === month);
}

/**
 * Add monthly expense
 * @param {Object} expense - Expense object
 * @returns {boolean} Success status
 */
function addUserMonthlyExpense(expense) {
    const data = getUserData();
    expense.id = 'ME' + Date.now();
    expense.date = new Date().toISOString();
    data.monthlyExpenses.push(expense);
    return saveUserData(data);
}

/**
 * Get user's transactions
 * @param {Object} filters - Filter options
 * @returns {Array} Array of transactions
 */
function getUserTransactions(filters = {}) {
    const data = getUserData();
    let transactions = [...data.transactions];

    if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
    }
    if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category);
    }
    if (filters.limit) {
        transactions = transactions.slice(0, filters.limit);
    }

    return transactions;
}

/**
 * Add transaction
 * @param {Object} transaction - Transaction object
 * @returns {boolean} Success status
 */
function addUserTransaction(transaction) {
    const data = getUserData();
    transaction.id = 'T' + Date.now();
    transaction.date = new Date().toISOString();
    data.transactions.unshift(transaction); // Add to beginning
    return saveUserData(data);
}

/**
 * Get user's family members
 * @returns {Array} Array of family members
 */
function getUserFamilyMembers() {
    const data = getUserData();
    return data.familyMembers;
}

/**
 * Add family member
 * @param {Object} member - Family member object
 * @returns {boolean} Success status
 */
function addUserFamilyMember(member) {
    const data = getUserData();
    member.id = 'FM' + Date.now();
    member.addedDate = new Date().toISOString();
    data.familyMembers.push(member);
    return saveUserData(data);
}

/**
 * Calculate user's dashboard metrics
 * @returns {Object} Dashboard metrics
 */
function calculateDashboardMetrics() {
    const data = getUserData();
    const user = getCurrentUserInfo();

    // Calculate total assets
    const totalAssets = data.assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);

    // Calculate total liabilities
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + (liability.outstandingAmount || 0), 0);

    // Net worth
    const netWorth = totalAssets - totalLiabilities;

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Monthly income
    const monthlyIncome = data.monthlyIncome
        .filter(i => i.month === currentMonth)
        .reduce((sum, i) => sum + i.total, 0);

    // Monthly expenses
    const monthlyExpenses = data.monthlyExpenses
        .filter(e => e.month === currentMonth)
        .reduce((sum, e) => sum + e.amount, 0);

    // Savings
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome * 100) : 0;

    // Investments (excluding cash)
    const investments = data.assets
        .filter(a => a.assetClass !== 'Cash')
        .reduce((sum, asset) => sum + (asset.currentValue || 0), 0);

    // Cash
    const cash = data.assets
        .filter(a => a.assetClass === 'Cash')
        .reduce((sum, asset) => sum + (asset.currentValue || 0), 0);

    return {
        user,
        netWorth,
        totalAssets,
        totalLiabilities,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate: Math.round(savingsRate),
        investments,
        cash,
        totalGoals: data.goals.length,
        activeGoals: data.goals.filter(g => g.status === 'OnTrack').length,
        hasData: hasUserData()
    };
}

/**
 * Get asset allocation for charts
 * @returns {Array} Asset allocation data
 */
function getAssetAllocation() {
    const data = getUserData();
    const totalValue = data.assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);

    if (totalValue === 0) return [];

    // Group by asset class
    const allocation = {};
    data.assets.forEach(asset => {
        const assetClass = asset.assetClass || 'Other';
        if (!allocation[assetClass]) {
            allocation[assetClass] = 0;
        }
        allocation[assetClass] += asset.currentValue || 0;
    });

    // Convert to array with percentages
    return Object.entries(allocation).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalValue) * 100)
    }));
}

/**
 * Clear all user data (for testing/reset)
 * @returns {boolean} Success status
 */
function clearUserData() {
    const key = getUserDataKey();
    if (!key) return false;

    try {
        localStorage.removeItem(key);
        console.log('User data cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing user data:', error);
        return false;
    }
}

// Export functions for browser environment
if (typeof window !== 'undefined') {
    window.UserDataManager = {
        // Core functions
        getUserData,
        saveUserData,
        hasUserData,
        clearUserData,

        // User info
        getCurrentUserInfo,

        // Assets
        getUserAssets,
        addUserAsset,
        updateUserAsset,
        deleteUserAsset,

        // Goals
        getUserGoals,
        addUserGoal,
        updateUserGoal,
        deleteUserGoal,

        // Income & Expenses
        getUserMonthlyIncome,
        addUserMonthlyIncome,
        getUserMonthlyExpenses,
        addUserMonthlyExpense,

        // Transactions
        getUserTransactions,
        addUserTransaction,

        // Family
        getUserFamilyMembers,
        addUserFamilyMember,

        // Metrics & Analytics
        calculateDashboardMetrics,
        getAssetAllocation
    };
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getUserData,
        saveUserData,
        hasUserData,
        clearUserData,
        getCurrentUserInfo,
        getUserAssets,
        addUserAsset,
        updateUserAsset,
        deleteUserAsset,
        getUserGoals,
        addUserGoal,
        updateUserGoal,
        deleteUserGoal,
        getUserMonthlyIncome,
        addUserMonthlyIncome,
        getUserMonthlyExpenses,
        addUserMonthlyExpense,
        getUserTransactions,
        addUserTransaction,
        getUserFamilyMembers,
        addUserFamilyMember,
        calculateDashboardMetrics,
        getAssetAllocation
    };
}
