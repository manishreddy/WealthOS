/**
 * WealthOS Sample Data
 * Comprehensive Indian family financial data for Manish & Raghavi
 */

// Import type definitions (for JSDoc)
/// <reference path="./dataModels.js" />

// ========================================
// FAMILY STRUCTURE
// ========================================

/** @type {FamilyMember[]} */
const familyMembers = [
    {
        id: 'FM001',
        name: 'Manish Reddy',
        relationship: 'Self',
        dateOfBirth: new Date('1990-05-15'),
        age: 35,
        occupation: 'Senior Software Engineer',
        annualIncome: 2400000, // 24 LPA
        pan: 'ABCPM1234F',
        aadhar: '1234-5678-9012'
    },
    {
        id: 'FM002',
        name: 'Raghavi Reddy',
        relationship: 'Spouse',
        dateOfBirth: new Date('1992-08-20'),
        age: 33,
        occupation: 'Data Analyst',
        annualIncome: 1800000, // 18 LPA
        pan: 'DEFPR5678G',
        aadhar: '9876-5432-1098'
    }
];

// ========================================
// MONTHLY INCOME DATA (Last 12 months)
// ========================================

/** @type {MonthlyIncome[]} */
const monthlyIncome = [
    // Manish's Income - 2025
    { id: 'MI001', month: '2025-02', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2025-02-01') },
    { id: 'MI002', month: '2025-01', memberId: 'FM001', salary: 200000, bonus: 50000, other: 0, total: 250000, recordedDate: new Date('2025-01-01') },
    { id: 'MI003', month: '2024-12', memberId: 'FM001', salary: 200000, bonus: 0, other: 5000, total: 205000, recordedDate: new Date('2024-12-01') },
    { id: 'MI004', month: '2024-11', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2024-11-01') },
    { id: 'MI005', month: '2024-10', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2024-10-01') },
    { id: 'MI006', month: '2024-09', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2024-09-01') },
    { id: 'MI007', month: '2024-08', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2024-08-01') },
    { id: 'MI008', month: '2024-07', memberId: 'FM001', salary: 200000, bonus: 100000, other: 0, total: 300000, recordedDate: new Date('2024-07-01') },
    { id: 'MI009', month: '2024-06', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2024-06-01') },
    { id: 'MI010', month: '2024-05', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2024-05-01') },
    { id: 'MI011', month: '2024-04', memberId: 'FM001', salary: 200000, bonus: 0, other: 3000, total: 203000, recordedDate: new Date('2024-04-01') },
    { id: 'MI012', month: '2024-03', memberId: 'FM001', salary: 200000, bonus: 0, other: 0, total: 200000, recordedDate: new Date('2024-03-01') },

    // Raghavi's Income - 2025
    { id: 'MI013', month: '2025-02', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2025-02-01') },
    { id: 'MI014', month: '2025-01', memberId: 'FM002', salary: 150000, bonus: 30000, other: 0, total: 180000, recordedDate: new Date('2025-01-01') },
    { id: 'MI015', month: '2024-12', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-12-01') },
    { id: 'MI016', month: '2024-11', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-11-01') },
    { id: 'MI017', month: '2024-10', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-10-01') },
    { id: 'MI018', month: '2024-09', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-09-01') },
    { id: 'MI019', month: '2024-08', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-08-01') },
    { id: 'MI020', month: '2024-07', memberId: 'FM002', salary: 150000, bonus: 75000, other: 0, total: 225000, recordedDate: new Date('2024-07-01') },
    { id: 'MI021', month: '2024-06', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-06-01') },
    { id: 'MI022', month: '2024-05', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-05-01') },
    { id: 'MI023', month: '2024-04', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-04-01') },
    { id: 'MI024', month: '2024-03', memberId: 'FM002', salary: 150000, bonus: 0, other: 0, total: 150000, recordedDate: new Date('2024-03-01') }
];

// ========================================
// MONTHLY EXPENSES (Last 3 months with categories)
// ========================================

/** @type {MonthlyExpense[]} */
const monthlyExpenses = [
    // February 2025 Expenses
    { id: 'ME001', month: '2025-02', category: 'Housing', subcategory: 'Rent', amount: 35000, description: 'Monthly rent', paymentMethod: 'Bank Transfer', date: new Date('2025-02-01') },
    { id: 'ME002', month: '2025-02', category: 'Housing', subcategory: 'Electricity', amount: 2500, description: 'Electricity bill', paymentMethod: 'UPI', date: new Date('2025-02-05') },
    { id: 'ME003', month: '2025-02', category: 'Housing', subcategory: 'Water', amount: 800, description: 'Water bill', paymentMethod: 'UPI', date: new Date('2025-02-06') },
    { id: 'ME004', month: '2025-02', category: 'Housing', subcategory: 'Internet', amount: 1500, description: 'Broadband', paymentMethod: 'Auto-debit', date: new Date('2025-02-10') },
    { id: 'ME005', month: '2025-02', category: 'Food', subcategory: 'Groceries', amount: 12000, description: 'Monthly groceries', paymentMethod: 'Credit Card', date: new Date('2025-02-03') },
    { id: 'ME006', month: '2025-02', category: 'Food', subcategory: 'Dining Out', amount: 4500, description: 'Restaurants', paymentMethod: 'Credit Card', date: new Date('2025-02-08') },
    { id: 'ME007', month: '2025-02', category: 'Food', subcategory: 'Online Food', amount: 2800, description: 'Zomato/Swiggy', paymentMethod: 'UPI', date: new Date('2025-02-12') },
    { id: 'ME008', month: '2025-02', category: 'Transportation', subcategory: 'Fuel', amount: 6000, description: 'Petrol', paymentMethod: 'Credit Card', date: new Date('2025-02-04') },
    { id: 'ME009', month: '2025-02', category: 'Transportation', subcategory: 'Maintenance', amount: 3500, description: 'Car service', paymentMethod: 'UPI', date: new Date('2025-02-15') },
    { id: 'ME010', month: '2025-02', category: 'Transportation', subcategory: 'Cab/Auto', amount: 1200, description: 'Uber/Ola', paymentMethod: 'UPI', date: new Date('2025-02-07') },
    { id: 'ME011', month: '2025-02', category: 'EMI', subcategory: 'Home Loan', amount: 45000, description: 'Home loan EMI', paymentMethod: 'Auto-debit', date: new Date('2025-02-01') },
    { id: 'ME012', month: '2025-02', category: 'EMI', subcategory: 'Car Loan', amount: 18000, description: 'Car loan EMI', paymentMethod: 'Auto-debit', date: new Date('2025-02-01') },
    { id: 'ME013', month: '2025-02', category: 'Insurance', subcategory: 'Health', amount: 8000, description: 'Health insurance premium', paymentMethod: 'UPI', date: new Date('2025-02-02') },
    { id: 'ME014', month: '2025-02', category: 'Entertainment', subcategory: 'Subscriptions', amount: 1500, description: 'Netflix, Prime, Spotify', paymentMethod: 'Credit Card', date: new Date('2025-02-01') },
    { id: 'ME015', month: '2025-02', category: 'Entertainment', subcategory: 'Movies', amount: 2000, description: 'Cinema tickets', paymentMethod: 'UPI', date: new Date('2025-02-09') },
    { id: 'ME016', month: '2025-02', category: 'Healthcare', subcategory: 'Medical', amount: 3500, description: 'Doctor consultation & medicines', paymentMethod: 'Cash', date: new Date('2025-02-11') },
    { id: 'ME017', month: '2025-02', category: 'Personal Care', subcategory: 'Grooming', amount: 2000, description: 'Salon/parlor', paymentMethod: 'UPI', date: new Date('2025-02-14') },
    { id: 'ME018', month: '2025-02', category: 'Shopping', subcategory: 'Clothing', amount: 8000, description: 'New clothes', paymentMethod: 'Credit Card', date: new Date('2025-02-10') },
    { id: 'ME019', month: '2025-02', category: 'Shopping', subcategory: 'Electronics', amount: 15000, description: 'New phone accessories', paymentMethod: 'Credit Card', date: new Date('2025-02-13') },
    { id: 'ME020', month: '2025-02', category: 'Utilities', subcategory: 'Mobile', amount: 1200, description: 'Mobile recharge', paymentMethod: 'UPI', date: new Date('2025-02-05') },

    // January 2025 Expenses
    { id: 'ME021', month: '2025-01', category: 'Housing', subcategory: 'Rent', amount: 35000, description: 'Monthly rent', paymentMethod: 'Bank Transfer', date: new Date('2025-01-01') },
    { id: 'ME022', month: '2025-01', category: 'Housing', subcategory: 'Electricity', amount: 3200, description: 'Electricity bill', paymentMethod: 'UPI', date: new Date('2025-01-05') },
    { id: 'ME023', month: '2025-01', category: 'Housing', subcategory: 'Water', amount: 800, description: 'Water bill', paymentMethod: 'UPI', date: new Date('2025-01-06') },
    { id: 'ME024', month: '2025-01', category: 'Housing', subcategory: 'Internet', amount: 1500, description: 'Broadband', paymentMethod: 'Auto-debit', date: new Date('2025-01-10') },
    { id: 'ME025', month: '2025-01', category: 'Food', subcategory: 'Groceries', amount: 15000, description: 'Monthly groceries', paymentMethod: 'Credit Card', date: new Date('2025-01-03') },
    { id: 'ME026', month: '2025-01', category: 'Food', subcategory: 'Dining Out', amount: 6500, description: 'Restaurants', paymentMethod: 'Credit Card', date: new Date('2025-01-08') },
    { id: 'ME027', month: '2025-01', category: 'Food', subcategory: 'Online Food', amount: 3200, description: 'Zomato/Swiggy', paymentMethod: 'UPI', date: new Date('2025-01-12') },
    { id: 'ME028', month: '2025-01', category: 'Transportation', subcategory: 'Fuel', amount: 7000, description: 'Petrol', paymentMethod: 'Credit Card', date: new Date('2025-01-04') },
    { id: 'ME029', month: '2025-01', category: 'Transportation', subcategory: 'Cab/Auto', amount: 1500, description: 'Uber/Ola', paymentMethod: 'UPI', date: new Date('2025-01-07') },
    { id: 'ME030', month: '2025-01', category: 'EMI', subcategory: 'Home Loan', amount: 45000, description: 'Home loan EMI', paymentMethod: 'Auto-debit', date: new Date('2025-01-01') },
    { id: 'ME031', month: '2025-01', category: 'EMI', subcategory: 'Car Loan', amount: 18000, description: 'Car loan EMI', paymentMethod: 'Auto-debit', date: new Date('2025-01-01') },
    { id: 'ME032', month: '2025-01', category: 'Entertainment', subcategory: 'Subscriptions', amount: 1500, description: 'Netflix, Prime, Spotify', paymentMethod: 'Credit Card', date: new Date('2025-01-01') },
    { id: 'ME033', month: '2025-01', category: 'Shopping', subcategory: 'Clothing', amount: 12000, description: 'Winter clothes', paymentMethod: 'Credit Card', date: new Date('2025-01-15') },
    { id: 'ME034', month: '2025-01', category: 'Healthcare', subcategory: 'Medical', amount: 2500, description: 'Medicines', paymentMethod: 'UPI', date: new Date('2025-01-11') },
    { id: 'ME035', month: '2025-01', category: 'Personal Care', subcategory: 'Grooming', amount: 1500, description: 'Salon/parlor', paymentMethod: 'UPI', date: new Date('2025-01-14') },
    { id: 'ME036', month: '2025-01', category: 'Utilities', subcategory: 'Mobile', amount: 1200, description: 'Mobile recharge', paymentMethod: 'UPI', date: new Date('2025-01-05') },
    { id: 'ME037', month: '2025-01', category: 'Travel', subcategory: 'Vacation', amount: 45000, description: 'Goa trip', paymentMethod: 'Credit Card', date: new Date('2025-01-20') },

    // December 2024 Expenses
    { id: 'ME038', month: '2024-12', category: 'Housing', subcategory: 'Rent', amount: 35000, description: 'Monthly rent', paymentMethod: 'Bank Transfer', date: new Date('2024-12-01') },
    { id: 'ME039', month: '2024-12', category: 'Housing', subcategory: 'Electricity', amount: 2800, description: 'Electricity bill', paymentMethod: 'UPI', date: new Date('2024-12-05') },
    { id: 'ME040', month: '2024-12', category: 'Housing', subcategory: 'Water', amount: 800, description: 'Water bill', paymentMethod: 'UPI', date: new Date('2024-12-06') },
    { id: 'ME041', month: '2024-12', category: 'Housing', subcategory: 'Internet', amount: 1500, description: 'Broadband', paymentMethod: 'Auto-debit', date: new Date('2024-12-10') },
    { id: 'ME042', month: '2024-12', category: 'Food', subcategory: 'Groceries', amount: 18000, description: 'Monthly groceries', paymentMethod: 'Credit Card', date: new Date('2024-12-03') },
    { id: 'ME043', month: '2024-12', category: 'Food', subcategory: 'Dining Out', amount: 8500, description: 'Restaurants & parties', paymentMethod: 'Credit Card', date: new Date('2024-12-08') },
    { id: 'ME044', month: '2024-12', category: 'Food', subcategory: 'Online Food', amount: 4000, description: 'Zomato/Swiggy', paymentMethod: 'UPI', date: new Date('2024-12-12') },
    { id: 'ME045', month: '2024-12', category: 'Transportation', subcategory: 'Fuel', amount: 8000, description: 'Petrol', paymentMethod: 'Credit Card', date: new Date('2024-12-04') },
    { id: 'ME046', month: '2024-12', category: 'Transportation', subcategory: 'Cab/Auto', amount: 2000, description: 'Uber/Ola', paymentMethod: 'UPI', date: new Date('2024-12-07') },
    { id: 'ME047', month: '2024-12', category: 'EMI', subcategory: 'Home Loan', amount: 45000, description: 'Home loan EMI', paymentMethod: 'Auto-debit', date: new Date('2024-12-01') },
    { id: 'ME048', month: '2024-12', category: 'EMI', subcategory: 'Car Loan', amount: 18000, description: 'Car loan EMI', paymentMethod: 'Auto-debit', date: new Date('2024-12-01') },
    { id: 'ME049', month: '2024-12', category: 'Insurance', subcategory: 'Life', amount: 15000, description: 'Term insurance premium', paymentMethod: 'UPI', date: new Date('2024-12-02') },
    { id: 'ME050', month: '2024-12', category: 'Entertainment', subcategory: 'Subscriptions', amount: 1500, description: 'Netflix, Prime, Spotify', paymentMethod: 'Credit Card', date: new Date('2024-12-01') },
    { id: 'ME051', month: '2024-12', category: 'Shopping', subcategory: 'Gifts', amount: 25000, description: 'Christmas & New Year gifts', paymentMethod: 'Credit Card', date: new Date('2024-12-15') },
    { id: 'ME052', month: '2024-12', category: 'Shopping', subcategory: 'Electronics', amount: 45000, description: 'New laptop', paymentMethod: 'Credit Card', date: new Date('2024-12-20') },
    { id: 'ME053', month: '2024-12', category: 'Healthcare', subcategory: 'Medical', amount: 5000, description: 'Health checkup', paymentMethod: 'Credit Card', date: new Date('2024-12-11') },
    { id: 'ME054', month: '2024-12', category: 'Personal Care', subcategory: 'Grooming', amount: 2500, description: 'Salon/parlor', paymentMethod: 'UPI', date: new Date('2024-12-14') },
    { id: 'ME055', month: '2024-12', category: 'Utilities', subcategory: 'Mobile', amount: 1200, description: 'Mobile recharge', paymentMethod: 'UPI', date: new Date('2024-12-05') }
];

// ========================================
// ASSETS
// ========================================

/** @type {Asset[]} */
const assets = [
    // Mutual Funds
    {
        id: 'A001',
        type: 'MutualFund',
        name: 'SBI Bluechip Fund Direct Growth',
        institution: 'SBI Mutual Fund',
        currentValue: 450000,
        investedAmount: 360000,
        returns: 90000,
        returnsPercentage: 25.0,
        purchaseDate: new Date('2020-01-15'),
        folioNumber: 'SBI123456789',
        units: 5234.56,
        nav: 86.0,
        assetClass: 'Equity',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A002',
        type: 'MutualFund',
        name: 'Axis Long Term Equity Fund Direct Growth',
        institution: 'Axis Mutual Fund',
        currentValue: 320000,
        investedAmount: 240000,
        returns: 80000,
        returnsPercentage: 33.33,
        purchaseDate: new Date('2019-06-01'),
        folioNumber: 'AXIS987654321',
        units: 4321.09,
        nav: 74.05,
        assetClass: 'Equity',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A003',
        type: 'MutualFund',
        name: 'HDFC Balanced Advantage Fund Direct Growth',
        institution: 'HDFC Mutual Fund',
        currentValue: 280000,
        investedAmount: 250000,
        returns: 30000,
        returnsPercentage: 12.0,
        purchaseDate: new Date('2021-03-10'),
        folioNumber: 'HDFC445566778',
        units: 7654.32,
        nav: 36.58,
        assetClass: 'Hybrid',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A004',
        type: 'MutualFund',
        name: 'Parag Parikh Flexi Cap Fund Direct Growth',
        institution: 'PPFAS Mutual Fund',
        currentValue: 550000,
        investedAmount: 400000,
        returns: 150000,
        returnsPercentage: 37.5,
        purchaseDate: new Date('2018-11-20'),
        folioNumber: 'PPFAS112233445',
        units: 9876.54,
        nav: 55.68,
        assetClass: 'Equity',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A005',
        type: 'MutualFund',
        name: 'ICICI Prudential Liquid Fund Direct Growth',
        institution: 'ICICI Prudential MF',
        currentValue: 150000,
        investedAmount: 148000,
        returns: 2000,
        returnsPercentage: 1.35,
        purchaseDate: new Date('2024-06-01'),
        folioNumber: 'ICICI556677889',
        units: 4512.34,
        nav: 332.37,
        assetClass: 'Debt',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },

    // Stocks
    {
        id: 'A006',
        type: 'Stock',
        name: 'Reliance Industries',
        institution: 'Zerodha',
        currentValue: 280000,
        investedAmount: 220000,
        returns: 60000,
        returnsPercentage: 27.27,
        purchaseDate: new Date('2021-05-10'),
        folioNumber: 'ZER123456',
        units: 100,
        nav: 2800,
        assetClass: 'Equity',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A007',
        type: 'Stock',
        name: 'HDFC Bank',
        institution: 'Zerodha',
        currentValue: 180000,
        investedAmount: 150000,
        returns: 30000,
        returnsPercentage: 20.0,
        purchaseDate: new Date('2022-01-15'),
        folioNumber: 'ZER123456',
        units: 100,
        nav: 1800,
        assetClass: 'Equity',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A008',
        type: 'Stock',
        name: 'Infosys',
        institution: 'Zerodha',
        currentValue: 165000,
        investedAmount: 140000,
        returns: 25000,
        returnsPercentage: 17.86,
        purchaseDate: new Date('2022-08-20'),
        folioNumber: 'ZER123456',
        units: 100,
        nav: 1650,
        assetClass: 'Equity',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A009',
        type: 'Stock',
        name: 'TCS',
        institution: 'Zerodha',
        currentValue: 395000,
        investedAmount: 320000,
        returns: 75000,
        returnsPercentage: 23.44,
        purchaseDate: new Date('2021-11-05'),
        folioNumber: 'ZER123456',
        units: 100,
        nav: 3950,
        assetClass: 'Equity',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },

    // Fixed Deposits
    {
        id: 'A010',
        type: 'FD',
        name: 'HDFC Bank Fixed Deposit',
        institution: 'HDFC Bank',
        currentValue: 520000,
        investedAmount: 500000,
        returns: 20000,
        returnsPercentage: 4.0,
        purchaseDate: new Date('2024-04-01'),
        folioNumber: 'FD78945612301',
        assetClass: 'Debt',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A011',
        type: 'FD',
        name: 'ICICI Bank Fixed Deposit',
        institution: 'ICICI Bank',
        currentValue: 315000,
        investedAmount: 300000,
        returns: 15000,
        returnsPercentage: 5.0,
        purchaseDate: new Date('2023-09-15'),
        folioNumber: 'FD56123478901',
        assetClass: 'Debt',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },

    // PPF
    {
        id: 'A012',
        type: 'PPF',
        name: 'Public Provident Fund',
        institution: 'SBI',
        currentValue: 680000,
        investedAmount: 550000,
        returns: 130000,
        returnsPercentage: 23.64,
        purchaseDate: new Date('2018-04-01'),
        folioNumber: 'PPF12345678901234',
        assetClass: 'Debt',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A013',
        type: 'PPF',
        name: 'Public Provident Fund',
        institution: 'ICICI Bank',
        currentValue: 420000,
        investedAmount: 350000,
        returns: 70000,
        returnsPercentage: 20.0,
        purchaseDate: new Date('2019-07-01'),
        folioNumber: 'PPF98765432109876',
        assetClass: 'Debt',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },

    // NPS
    {
        id: 'A014',
        type: 'NPS',
        name: 'National Pension System',
        institution: 'HDFC Pension',
        currentValue: 380000,
        investedAmount: 300000,
        returns: 80000,
        returnsPercentage: 26.67,
        purchaseDate: new Date('2020-08-01'),
        folioNumber: 'NPS123456789012',
        assetClass: 'Hybrid',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A015',
        type: 'NPS',
        name: 'National Pension System',
        institution: 'SBI Pension',
        currentValue: 250000,
        investedAmount: 200000,
        returns: 50000,
        returnsPercentage: 25.0,
        purchaseDate: new Date('2021-04-01'),
        folioNumber: 'NPS987654321098',
        assetClass: 'Hybrid',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },

    // EPF
    {
        id: 'A016',
        type: 'EPF',
        name: 'Employee Provident Fund',
        institution: 'EPFO',
        currentValue: 1200000,
        investedAmount: 950000,
        returns: 250000,
        returnsPercentage: 26.32,
        purchaseDate: new Date('2015-06-01'),
        folioNumber: 'EPF/KA/BLR/1234567',
        assetClass: 'Debt',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A017',
        type: 'EPF',
        name: 'Employee Provident Fund',
        institution: 'EPFO',
        currentValue: 850000,
        investedAmount: 700000,
        returns: 150000,
        returnsPercentage: 21.43,
        purchaseDate: new Date('2017-08-01'),
        folioNumber: 'EPF/KA/BLR/7654321',
        assetClass: 'Debt',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },

    // Real Estate
    {
        id: 'A018',
        type: 'RealEstate',
        name: 'Apartment - Whitefield, Bangalore',
        institution: 'Prestige Lakeside Habitat',
        currentValue: 8500000,
        investedAmount: 6500000,
        returns: 2000000,
        returnsPercentage: 30.77,
        purchaseDate: new Date('2019-03-15'),
        assetClass: 'Real Estate',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },

    // Gold
    {
        id: 'A019',
        type: 'Gold',
        name: 'Physical Gold',
        institution: 'Tanishq',
        currentValue: 280000,
        investedAmount: 220000,
        returns: 60000,
        returnsPercentage: 27.27,
        purchaseDate: new Date('2020-11-05'),
        units: 45,
        assetClass: 'Commodity',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A020',
        type: 'Gold',
        name: 'Sovereign Gold Bonds',
        institution: 'RBI',
        currentValue: 180000,
        investedAmount: 150000,
        returns: 30000,
        returnsPercentage: 20.0,
        purchaseDate: new Date('2022-02-15'),
        folioNumber: 'SGB2022-23-I',
        units: 30,
        assetClass: 'Commodity',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },

    // Cash & Savings
    {
        id: 'A021',
        type: 'Cash',
        name: 'HDFC Savings Account',
        institution: 'HDFC Bank',
        currentValue: 250000,
        investedAmount: 250000,
        returns: 0,
        returnsPercentage: 0,
        purchaseDate: new Date('2015-01-01'),
        folioNumber: '12345678901234',
        assetClass: 'Cash',
        ownerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'A022',
        type: 'Cash',
        name: 'ICICI Savings Account',
        institution: 'ICICI Bank',
        currentValue: 180000,
        investedAmount: 180000,
        returns: 0,
        returnsPercentage: 0,
        purchaseDate: new Date('2016-05-01'),
        folioNumber: '98765432109876',
        assetClass: 'Cash',
        ownerId: 'FM002',
        lastUpdated: new Date('2025-02-17')
    }
];

// ========================================
// LIABILITIES
// ========================================

/** @type {Liability[]} */
const liabilities = [
    {
        id: 'L001',
        type: 'HomeLoan',
        name: 'Home Loan - Whitefield Apartment',
        institution: 'HDFC Bank',
        principalAmount: 5000000,
        outstandingAmount: 3850000,
        monthlyEmi: 45000,
        interestRate: 8.5,
        startDate: new Date('2019-04-01'),
        endDate: new Date('2034-03-31'),
        tenure: 180,
        remainingTenure: 110,
        borrowerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    },
    {
        id: 'L002',
        type: 'CarLoan',
        name: 'Car Loan - Honda City',
        institution: 'ICICI Bank',
        principalAmount: 800000,
        outstandingAmount: 420000,
        monthlyEmi: 18000,
        interestRate: 9.0,
        startDate: new Date('2022-06-01'),
        endDate: new Date('2027-05-31'),
        tenure: 60,
        remainingTenure: 27,
        borrowerId: 'FM001',
        lastUpdated: new Date('2025-02-17')
    }
];

// ========================================
// FINANCIAL GOALS
// ========================================

/** @type {FinancialGoal[]} */
const financialGoals = [
    {
        id: 'G001',
        name: 'Buy Dream House',
        type: 'House',
        targetAmount: 12000000,
        currentAmount: 2500000,
        monthlyContribution: 50000,
        targetDate: new Date('2030-12-31'),
        yearsRemaining: 5.87,
        progressPercentage: 20.83,
        priority: 'High',
        status: 'OnTrack',
        linkedAssets: ['A001', 'A002', 'A010'],
        description: '3 BHK villa in North Bangalore',
        expectedReturn: 12.0,
        createdDate: new Date('2023-01-15')
    },
    {
        id: 'G002',
        name: 'Child Education Fund',
        type: 'Education',
        targetAmount: 5000000,
        currentAmount: 800000,
        monthlyContribution: 30000,
        targetDate: new Date('2035-06-30'),
        yearsRemaining: 10.37,
        progressPercentage: 16.0,
        priority: 'High',
        status: 'OnTrack',
        linkedAssets: ['A003', 'A012'],
        description: 'Higher education fund for future children',
        expectedReturn: 10.0,
        createdDate: new Date('2023-06-01')
    },
    {
        id: 'G003',
        name: 'Retirement Corpus',
        type: 'Retirement',
        targetAmount: 50000000,
        currentAmount: 6500000,
        monthlyContribution: 70000,
        targetDate: new Date('2050-12-31'),
        yearsRemaining: 25.87,
        progressPercentage: 13.0,
        priority: 'High',
        status: 'OnTrack',
        linkedAssets: ['A014', 'A015', 'A016', 'A017', 'A012', 'A013'],
        description: 'Comfortable retirement at age 60',
        expectedReturn: 12.0,
        createdDate: new Date('2022-04-01')
    },
    {
        id: 'G004',
        name: 'Europe Vacation',
        type: 'Vacation',
        targetAmount: 800000,
        currentAmount: 250000,
        monthlyContribution: 15000,
        targetDate: new Date('2026-12-31'),
        yearsRemaining: 1.87,
        progressPercentage: 31.25,
        priority: 'Medium',
        status: 'OnTrack',
        linkedAssets: ['A005', 'A021'],
        description: '3-week Europe trip for family',
        expectedReturn: 6.0,
        createdDate: new Date('2024-01-10')
    },
    {
        id: 'G005',
        name: 'Emergency Fund',
        type: 'Emergency',
        targetAmount: 1200000,
        currentAmount: 730000,
        monthlyContribution: 20000,
        targetDate: new Date('2026-06-30'),
        yearsRemaining: 1.37,
        progressPercentage: 60.83,
        priority: 'High',
        status: 'OnTrack',
        linkedAssets: ['A021', 'A022', 'A005'],
        description: '6 months of expenses as emergency fund',
        expectedReturn: 5.0,
        createdDate: new Date('2023-01-01')
    },
    {
        id: 'G006',
        name: 'New Car',
        type: 'Vehicle',
        targetAmount: 1500000,
        currentAmount: 450000,
        monthlyContribution: 25000,
        targetDate: new Date('2027-12-31'),
        yearsRemaining: 2.87,
        progressPercentage: 30.0,
        priority: 'Medium',
        status: 'OnTrack',
        linkedAssets: ['A010', 'A011'],
        description: 'Upgrade to premium SUV',
        expectedReturn: 7.0,
        createdDate: new Date('2024-06-01')
    }
];

// ========================================
// TRANSACTIONS (Last 3 months)
// ========================================

/** @type {Transaction[]} */
const transactions = [
    // February 2025
    { id: 'T001', date: new Date('2025-02-17'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 30000, description: 'Monthly SIP - SBI Bluechip', paymentMethod: 'Auto-debit', institution: 'SBI MF', memberId: 'FM001', assetId: 'A001', goalId: 'G001', isRecurring: true, tags: 'investment,equity' },
    { id: 'T002', date: new Date('2025-02-17'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 20000, description: 'Monthly SIP - Axis ELSS', paymentMethod: 'Auto-debit', institution: 'Axis MF', memberId: 'FM001', assetId: 'A002', goalId: 'G001', isRecurring: true, tags: 'investment,equity,tax-saving' },
    { id: 'T003', date: new Date('2025-02-15'), type: 'Expense', category: 'Shopping', subcategory: 'Electronics', amount: 15000, description: 'Phone accessories', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'shopping,electronics' },
    { id: 'T004', date: new Date('2025-02-14'), type: 'Expense', category: 'Personal Care', subcategory: 'Grooming', amount: 2000, description: 'Salon visit', paymentMethod: 'UPI', memberId: 'FM002', isRecurring: false, tags: 'personal-care' },
    { id: 'T005', date: new Date('2025-02-13'), type: 'Expense', category: 'Transportation', subcategory: 'Maintenance', amount: 3500, description: 'Car service', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'car,maintenance' },
    { id: 'T006', date: new Date('2025-02-12'), type: 'Expense', category: 'Food', subcategory: 'Online Food', amount: 2800, description: 'Zomato orders', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'food,dining' },
    { id: 'T007', date: new Date('2025-02-11'), type: 'Expense', category: 'Healthcare', subcategory: 'Medical', amount: 3500, description: 'Doctor consultation', paymentMethod: 'Cash', memberId: 'FM002', isRecurring: false, tags: 'health,medical' },
    { id: 'T008', date: new Date('2025-02-10'), type: 'Expense', category: 'Shopping', subcategory: 'Clothing', amount: 8000, description: 'New clothes', paymentMethod: 'Credit Card', memberId: 'FM002', isRecurring: false, tags: 'shopping,clothing' },
    { id: 'T009', date: new Date('2025-02-10'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 15000, description: 'Monthly SIP - HDFC Balanced', paymentMethod: 'Auto-debit', institution: 'HDFC MF', memberId: 'FM002', assetId: 'A003', goalId: 'G002', isRecurring: true, tags: 'investment,hybrid' },
    { id: 'T010', date: new New Date('2025-02-09'), type: 'Expense', category: 'Entertainment', subcategory: 'Movies', amount: 2000, description: 'Movie tickets', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'entertainment' },
    { id: 'T011', date: new Date('2025-02-08'), type: 'Expense', category: 'Food', subcategory: 'Dining Out', amount: 4500, description: 'Restaurant dinner', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'food,dining' },
    { id: 'T012', date: new Date('2025-02-07'), type: 'Expense', category: 'Transportation', subcategory: 'Cab/Auto', amount: 1200, description: 'Uber rides', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'transportation' },
    { id: 'T013', date: new Date('2025-02-05'), type: 'Expense', category: 'Utilities', subcategory: 'Mobile', amount: 1200, description: 'Mobile recharge', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'utilities' },
    { id: 'T014', date: new Date('2025-02-05'), type: 'Expense', category: 'Housing', subcategory: 'Electricity', amount: 2500, description: 'Electricity bill', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'utilities,housing' },
    { id: 'T015', date: new Date('2025-02-04'), type: 'Expense', category: 'Transportation', subcategory: 'Fuel', amount: 6000, description: 'Petrol', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'car,fuel' },
    { id: 'T016', date: new Date('2025-02-03'), type: 'Expense', category: 'Food', subcategory: 'Groceries', amount: 12000, description: 'Monthly groceries', paymentMethod: 'Credit Card', memberId: 'FM002', isRecurring: true, tags: 'food,groceries' },
    { id: 'T017', date: new Date('2025-02-02'), type: 'Expense', category: 'Insurance', subcategory: 'Health', amount: 8000, description: 'Health insurance premium', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'insurance,health' },
    { id: 'T018', date: new Date('2025-02-01'), type: 'Income', category: 'Salary', subcategory: 'Monthly Salary', amount: 200000, description: 'February salary', paymentMethod: 'Bank Transfer', institution: 'HDFC Bank', memberId: 'FM001', isRecurring: true, tags: 'income,salary' },
    { id: 'T019', date: new Date('2025-02-01'), type: 'Income', category: 'Salary', subcategory: 'Monthly Salary', amount: 150000, description: 'February salary', paymentMethod: 'Bank Transfer', institution: 'ICICI Bank', memberId: 'FM002', isRecurring: true, tags: 'income,salary' },
    { id: 'T020', date: new Date('2025-02-01'), type: 'Expense', category: 'Housing', subcategory: 'Rent', amount: 35000, description: 'Monthly rent', paymentMethod: 'Bank Transfer', memberId: 'FM001', isRecurring: true, tags: 'housing,rent' },
    { id: 'T021', date: new Date('2025-02-01'), type: 'Expense', category: 'EMI', subcategory: 'Home Loan', amount: 45000, description: 'Home loan EMI', paymentMethod: 'Auto-debit', institution: 'HDFC Bank', memberId: 'FM001', isRecurring: true, tags: 'emi,loan' },
    { id: 'T022', date: new Date('2025-02-01'), type: 'Expense', category: 'EMI', subcategory: 'Car Loan', amount: 18000, description: 'Car loan EMI', paymentMethod: 'Auto-debit', institution: 'ICICI Bank', memberId: 'FM001', isRecurring: true, tags: 'emi,loan' },

    // January 2025
    { id: 'T023', date: new Date('2025-01-20'), type: 'Expense', category: 'Travel', subcategory: 'Vacation', amount: 45000, description: 'Goa trip', paymentMethod: 'Credit Card', memberId: 'FM001', goalId: 'G004', isRecurring: false, tags: 'travel,vacation' },
    { id: 'T024', date: new Date('2025-01-17'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 30000, description: 'Monthly SIP - SBI Bluechip', paymentMethod: 'Auto-debit', institution: 'SBI MF', memberId: 'FM001', assetId: 'A001', goalId: 'G001', isRecurring: true, tags: 'investment,equity' },
    { id: 'T025', date: new Date('2025-01-17'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 20000, description: 'Monthly SIP - Axis ELSS', paymentMethod: 'Auto-debit', institution: 'Axis MF', memberId: 'FM001', assetId: 'A002', goalId: 'G001', isRecurring: true, tags: 'investment,equity,tax-saving' },
    { id: 'T026', date: new Date('2025-01-15'), type: 'Expense', category: 'Shopping', subcategory: 'Clothing', amount: 12000, description: 'Winter clothes', paymentMethod: 'Credit Card', memberId: 'FM002', isRecurring: false, tags: 'shopping,clothing' },
    { id: 'T027', date: new Date('2025-01-14'), type: 'Expense', category: 'Personal Care', subcategory: 'Grooming', amount: 1500, description: 'Salon visit', paymentMethod: 'UPI', memberId: 'FM002', isRecurring: false, tags: 'personal-care' },
    { id: 'T028', date: new Date('2025-01-11'), type: 'Expense', category: 'Healthcare', subcategory: 'Medical', amount: 2500, description: 'Medicines', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'health,medical' },
    { id: 'T029', date: new Date('2025-01-10'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 15000, description: 'Monthly SIP - HDFC Balanced', paymentMethod: 'Auto-debit', institution: 'HDFC MF', memberId: 'FM002', assetId: 'A003', goalId: 'G002', isRecurring: true, tags: 'investment,hybrid' },
    { id: 'T030', date: new Date('2025-01-08'), type: 'Expense', category: 'Food', subcategory: 'Dining Out', amount: 6500, description: 'Restaurants', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'food,dining' },
    { id: 'T031', date: new Date('2025-01-07'), type: 'Expense', category: 'Transportation', subcategory: 'Cab/Auto', amount: 1500, description: 'Uber rides', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'transportation' },
    { id: 'T032', date: new Date('2025-01-05'), type: 'Expense', category: 'Utilities', subcategory: 'Mobile', amount: 1200, description: 'Mobile recharge', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'utilities' },
    { id: 'T033', date: new Date('2025-01-05'), type: 'Expense', category: 'Housing', subcategory: 'Electricity', amount: 3200, description: 'Electricity bill', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'utilities,housing' },
    { id: 'T034', date: new Date('2025-01-04'), type: 'Expense', category: 'Transportation', subcategory: 'Fuel', amount: 7000, description: 'Petrol', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'car,fuel' },
    { id: 'T035', date: new Date('2025-01-03'), type: 'Expense', category: 'Food', subcategory: 'Groceries', amount: 15000, description: 'Monthly groceries', paymentMethod: 'Credit Card', memberId: 'FM002', isRecurring: true, tags: 'food,groceries' },
    { id: 'T036', date: new Date('2025-01-01'), type: 'Income', category: 'Salary', subcategory: 'Monthly Salary', amount: 200000, description: 'January salary', paymentMethod: 'Bank Transfer', institution: 'HDFC Bank', memberId: 'FM001', isRecurring: true, tags: 'income,salary' },
    { id: 'T037', date: new Date('2025-01-01'), type: 'Income', category: 'Salary', subcategory: 'Bonus', amount: 50000, description: 'Performance bonus', paymentMethod: 'Bank Transfer', institution: 'HDFC Bank', memberId: 'FM001', isRecurring: false, tags: 'income,bonus' },
    { id: 'T038', date: new Date('2025-01-01'), type: 'Income', category: 'Salary', subcategory: 'Monthly Salary', amount: 150000, description: 'January salary', paymentMethod: 'Bank Transfer', institution: 'ICICI Bank', memberId: 'FM002', isRecurring: true, tags: 'income,salary' },
    { id: 'T039', date: new Date('2025-01-01'), type: 'Income', category: 'Salary', subcategory: 'Bonus', amount: 30000, description: 'Performance bonus', paymentMethod: 'Bank Transfer', institution: 'ICICI Bank', memberId: 'FM002', isRecurring: false, tags: 'income,bonus' },
    { id: 'T040', date: new Date('2025-01-01'), type: 'Expense', category: 'Housing', subcategory: 'Rent', amount: 35000, description: 'Monthly rent', paymentMethod: 'Bank Transfer', memberId: 'FM001', isRecurring: true, tags: 'housing,rent' },
    { id: 'T041', date: new Date('2025-01-01'), type: 'Expense', category: 'EMI', subcategory: 'Home Loan', amount: 45000, description: 'Home loan EMI', paymentMethod: 'Auto-debit', institution: 'HDFC Bank', memberId: 'FM001', isRecurring: true, tags: 'emi,loan' },
    { id: 'T042', date: new Date('2025-01-01'), type: 'Expense', category: 'EMI', subcategory: 'Car Loan', amount: 18000, description: 'Car loan EMI', paymentMethod: 'Auto-debit', institution: 'ICICI Bank', memberId: 'FM001', isRecurring: true, tags: 'emi,loan' },

    // December 2024
    { id: 'T043', date: new Date('2024-12-20'), type: 'Expense', category: 'Shopping', subcategory: 'Electronics', amount: 45000, description: 'New laptop', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'shopping,electronics' },
    { id: 'T044', date: new Date('2024-12-17'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 30000, description: 'Monthly SIP - SBI Bluechip', paymentMethod: 'Auto-debit', institution: 'SBI MF', memberId: 'FM001', assetId: 'A001', goalId: 'G001', isRecurring: true, tags: 'investment,equity' },
    { id: 'T045', date: new Date('2024-12-17'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 20000, description: 'Monthly SIP - Axis ELSS', paymentMethod: 'Auto-debit', institution: 'Axis MF', memberId: 'FM001', assetId: 'A002', goalId: 'G001', isRecurring: true, tags: 'investment,equity,tax-saving' },
    { id: 'T046', date: new Date('2024-12-15'), type: 'Expense', category: 'Shopping', subcategory: 'Gifts', amount: 25000, description: 'Christmas gifts', paymentMethod: 'Credit Card', memberId: 'FM002', isRecurring: false, tags: 'shopping,gifts' },
    { id: 'T047', date: new Date('2024-12-14'), type: 'Expense', category: 'Personal Care', subcategory: 'Grooming', amount: 2500, description: 'Salon visit', paymentMethod: 'UPI', memberId: 'FM002', isRecurring: false, tags: 'personal-care' },
    { id: 'T048', date: new Date('2024-12-11'), type: 'Expense', category: 'Healthcare', subcategory: 'Medical', amount: 5000, description: 'Health checkup', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'health,medical' },
    { id: 'T049', date: new Date('2024-12-10'), type: 'Investment', category: 'Mutual Fund', subcategory: 'SIP', amount: 15000, description: 'Monthly SIP - HDFC Balanced', paymentMethod: 'Auto-debit', institution: 'HDFC MF', memberId: 'FM002', assetId: 'A003', goalId: 'G002', isRecurring: true, tags: 'investment,hybrid' },
    { id: 'T050', date: new Date('2024-12-08'), type: 'Expense', category: 'Food', subcategory: 'Dining Out', amount: 8500, description: 'Party & restaurants', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'food,dining' },
    { id: 'T051', date: new Date('2024-12-07'), type: 'Expense', category: 'Transportation', subcategory: 'Cab/Auto', amount: 2000, description: 'Uber rides', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'transportation' },
    { id: 'T052', date: new Date('2024-12-05'), type: 'Expense', category: 'Utilities', subcategory: 'Mobile', amount: 1200, description: 'Mobile recharge', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'utilities' },
    { id: 'T053', date: new Date('2024-12-05'), type: 'Expense', category: 'Housing', subcategory: 'Electricity', amount: 2800, description: 'Electricity bill', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'utilities,housing' },
    { id: 'T054', date: new Date('2024-12-04'), type: 'Expense', category: 'Transportation', subcategory: 'Fuel', amount: 8000, description: 'Petrol', paymentMethod: 'Credit Card', memberId: 'FM001', isRecurring: false, tags: 'car,fuel' },
    { id: 'T055', date: new Date('2024-12-03'), type: 'Expense', category: 'Food', subcategory: 'Groceries', amount: 18000, description: 'Monthly groceries', paymentMethod: 'Credit Card', memberId: 'FM002', isRecurring: true, tags: 'food,groceries' },
    { id: 'T056', date: new Date('2024-12-02'), type: 'Expense', category: 'Insurance', subcategory: 'Life', amount: 15000, description: 'Term insurance premium', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: true, tags: 'insurance,life' },
    { id: 'T057', date: new Date('2024-12-01'), type: 'Income', category: 'Salary', subcategory: 'Monthly Salary', amount: 200000, description: 'December salary', paymentMethod: 'Bank Transfer', institution: 'HDFC Bank', memberId: 'FM001', isRecurring: true, tags: 'income,salary' },
    { id: 'T058', date: new Date('2024-12-01'), type: 'Income', category: 'Salary', subcategory: 'Monthly Salary', amount: 150000, description: 'December salary', paymentMethod: 'Bank Transfer', institution: 'ICICI Bank', memberId: 'FM002', isRecurring: true, tags: 'income,salary' },
    { id: 'T059', date: new Date('2024-12-01'), type: 'Income', category: 'Other', subcategory: 'Freelance', amount: 5000, description: 'Freelance work', paymentMethod: 'UPI', memberId: 'FM001', isRecurring: false, tags: 'income,other' },
    { id: 'T060', date: new Date('2024-12-01'), type: 'Expense', category: 'Housing', subcategory: 'Rent', amount: 35000, description: 'Monthly rent', paymentMethod: 'Bank Transfer', memberId: 'FM001', isRecurring: true, tags: 'housing,rent' },
    { id: 'T061', date: new Date('2024-12-01'), type: 'Expense', category: 'EMI', subcategory: 'Home Loan', amount: 45000, description: 'Home loan EMI', paymentMethod: 'Auto-debit', institution: 'HDFC Bank', memberId: 'FM001', isRecurring: true, tags: 'emi,loan' },
    { id: 'T062', date: new Date('2024-12-01'), type: 'Expense', category: 'EMI', subcategory: 'Car Loan', amount: 18000, description: 'Car loan EMI', paymentMethod: 'Auto-debit', institution: 'ICICI Bank', memberId: 'FM001', isRecurring: true, tags: 'emi,loan' }
];

// ========================================
// INSURANCE POLICIES
// ========================================

/** @type {InsurancePolicy[]} */
const insurancePolicies = [
    {
        id: 'INS001',
        type: 'Life',
        provider: 'HDFC Life',
        policyNumber: 'HDFC-TERM-123456',
        coverageAmount: 10000000,
        premium: 15000,
        frequency: 'Yearly',
        startDate: new Date('2020-01-01'),
        maturityDate: new Date('2050-01-01'),
        insuredMember: 'FM001',
        lastPremiumDate: new Date('2024-12-02'),
        nextPremiumDate: new Date('2025-12-02')
    },
    {
        id: 'INS002',
        type: 'Life',
        provider: 'ICICI Prudential',
        policyNumber: 'ICICI-TERM-789012',
        coverageAmount: 7500000,
        premium: 12000,
        frequency: 'Yearly',
        startDate: new Date('2021-03-15'),
        maturityDate: new Date('2051-03-15'),
        insuredMember: 'FM002',
        lastPremiumDate: new Date('2024-03-15'),
        nextPremiumDate: new Date('2025-03-15')
    },
    {
        id: 'INS003',
        type: 'Health',
        provider: 'Star Health Insurance',
        policyNumber: 'STAR-FAMILY-456789',
        coverageAmount: 2000000,
        premium: 32000,
        frequency: 'Yearly',
        startDate: new Date('2022-06-01'),
        maturityDate: new Date('2027-06-01'),
        insuredMember: 'FM001',
        lastPremiumDate: new Date('2024-06-01'),
        nextPremiumDate: new Date('2025-06-01')
    },
    {
        id: 'INS004',
        type: 'Vehicle',
        provider: 'ICICI Lombard',
        policyNumber: 'ICICI-CAR-123789',
        coverageAmount: 800000,
        premium: 18000,
        frequency: 'Yearly',
        startDate: new Date('2024-07-01'),
        maturityDate: new Date('2025-07-01'),
        insuredMember: 'FM001',
        lastPremiumDate: new Date('2024-07-01'),
        nextPremiumDate: new Date('2025-07-01')
    }
];

// ========================================
// BUDGETS
// ========================================

/** @type {Budget[]} */
const budgets = [
    { id: 'B001', month: '2025-02', category: 'Food', budgetAmount: 25000, spentAmount: 19300, remaining: 5700, percentageUsed: 77.2, status: 'Within' },
    { id: 'B002', month: '2025-02', category: 'Transportation', budgetAmount: 15000, spentAmount: 10700, remaining: 4300, percentageUsed: 71.3, status: 'Within' },
    { id: 'B003', month: '2025-02', category: 'Shopping', budgetAmount: 20000, spentAmount: 23000, remaining: -3000, percentageUsed: 115.0, status: 'Exceeded' },
    { id: 'B004', month: '2025-02', category: 'Entertainment', budgetAmount: 8000, spentAmount: 3500, remaining: 4500, percentageUsed: 43.8, status: 'Within' },
    { id: 'B005', month: '2025-02', category: 'Healthcare', budgetAmount: 10000, spentAmount: 3500, remaining: 6500, percentageUsed: 35.0, status: 'Within' },
    { id: 'B006', month: '2025-02', category: 'Personal Care', budgetAmount: 5000, spentAmount: 2000, remaining: 3000, percentageUsed: 40.0, status: 'Within' }
];

// ========================================
// EXPENSE CATEGORIES & SUBCATEGORIES
// ========================================

const expenseCategories = {
    'Housing': ['Rent', 'Electricity', 'Water', 'Internet', 'Maintenance', 'Property Tax'],
    'Food': ['Groceries', 'Dining Out', 'Online Food', 'Beverages'],
    'Transportation': ['Fuel', 'Maintenance', 'Cab/Auto', 'Parking', 'Toll'],
    'EMI': ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card'],
    'Insurance': ['Health', 'Life', 'Vehicle', 'Home'],
    'Entertainment': ['Movies', 'Events', 'Subscriptions', 'Hobbies'],
    'Healthcare': ['Medical', 'Medicines', 'Gym', 'Wellness'],
    'Personal Care': ['Grooming', 'Clothing', 'Accessories'],
    'Shopping': ['Clothing', 'Electronics', 'Home', 'Gifts', 'Books'],
    'Education': ['Courses', 'Books', 'Training', 'Certifications'],
    'Travel': ['Vacation', 'Business', 'Weekend Trips'],
    'Utilities': ['Mobile', 'DTH', 'Gas', 'Subscriptions'],
    'Others': ['Donations', 'Gifts', 'Miscellaneous']
};

// ========================================
// EXPORT ALL DATA
// ========================================

const sampleData = {
    familyMembers,
    monthlyIncome,
    monthlyExpenses,
    assets,
    liabilities,
    financialGoals,
    transactions,
    insurancePolicies,
    budgets,
    expenseCategories
};

// Calculate summary statistics
const calculateSummary = () => {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.outstandingAmount, 0);
    const netWorth = totalAssets - totalLiabilities;

    const monthlyIncomeFeb = monthlyIncome
        .filter(income => income.month === '2025-02')
        .reduce((sum, income) => sum + income.total, 0);

    const monthlyExpenseFeb = monthlyExpenses
        .filter(expense => expense.month === '2025-02')
        .reduce((sum, expense) => sum + expense.amount, 0);

    const monthlySavings = monthlyIncomeFeb - monthlyExpenseFeb;
    const savingsRate = (monthlySavings / monthlyIncomeFeb * 100).toFixed(2);

    return {
        totalAssets,
        totalLiabilities,
        netWorth,
        monthlyIncome: monthlyIncomeFeb,
        monthlyExpense: monthlyExpenseFeb,
        monthlySavings,
        savingsRate: `${savingsRate}%`,
        totalGoals: financialGoals.length,
        goalsOnTrack: financialGoals.filter(g => g.status === 'OnTrack').length,
        totalTransactions: transactions.length
    };
};

// Export for browser environment
if (typeof window !== 'undefined') {
    window.WealthOSData = sampleData;
    window.WealthOSSummary = calculateSummary();
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleData,
        calculateSummary
    };
}
