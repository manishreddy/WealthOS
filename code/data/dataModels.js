/**
 * WealthOS Data Models
 * TypeScript-style interfaces defined in JSDoc for JavaScript
 */

/**
 * @typedef {Object} FamilyMember
 * @property {string} id - Unique identifier
 * @property {string} name - Full name
 * @property {string} relationship - Relationship (Self, Spouse, Child, etc.)
 * @property {Date} dateOfBirth - Date of birth
 * @property {number} age - Current age
 * @property {string} [occupation] - Current occupation
 * @property {number} [annualIncome] - Annual income in INR
 * @property {string} [pan] - PAN number
 * @property {string} [aadhar] - Aadhar number
 */

/**
 * @typedef {Object} MonthlyIncome
 * @property {string} id - Unique identifier
 * @property {string} month - Month (YYYY-MM format)
 * @property {string} memberId - Family member ID
 * @property {number} salary - Salary amount in INR
 * @property {number} bonus - Bonus/incentive in INR
 * @property {number} other - Other income in INR
 * @property {number} total - Total income
 * @property {Date} recordedDate - Date recorded
 */

/**
 * @typedef {Object} MonthlyExpense
 * @property {string} id - Unique identifier
 * @property {string} month - Month (YYYY-MM format)
 * @property {string} category - Expense category
 * @property {string} subcategory - Subcategory
 * @property {number} amount - Amount in INR
 * @property {string} [description] - Description
 * @property {string} paymentMethod - Payment method (UPI, Card, Cash, etc.)
 * @property {Date} date - Transaction date
 */

/**
 * @typedef {Object} Asset
 * @property {string} id - Unique identifier
 * @property {string} type - Asset type (MutualFund, Stock, FD, PPF, NPS, EPF, RealEstate, Gold, Cash, etc.)
 * @property {string} name - Asset name
 * @property {string} [institution] - Financial institution
 * @property {number} currentValue - Current market value in INR
 * @property {number} investedAmount - Total invested amount
 * @property {number} returns - Absolute returns
 * @property {number} returnsPercentage - Returns percentage
 * @property {Date} purchaseDate - Purchase/investment date
 * @property {string} [folioNumber] - Folio/account number
 * @property {number} [units] - Number of units (for MF/stocks)
 * @property {number} [nav] - Current NAV (for MF)
 * @property {string} [assetClass] - Equity, Debt, Hybrid, etc.
 * @property {string} ownerId - Owner family member ID
 * @property {Date} lastUpdated - Last updated date
 */

/**
 * @typedef {Object} Liability
 * @property {string} id - Unique identifier
 * @property {string} type - Loan type (HomeLoan, CarLoan, PersonalLoan, CreditCard, etc.)
 * @property {string} name - Liability name
 * @property {string} institution - Lending institution
 * @property {number} principalAmount - Original loan amount
 * @property {number} outstandingAmount - Current outstanding amount
 * @property {number} monthlyEmi - Monthly EMI amount
 * @property {number} interestRate - Interest rate (%)
 * @property {Date} startDate - Loan start date
 * @property {Date} endDate - Loan end date
 * @property {number} tenure - Tenure in months
 * @property {number} remainingTenure - Remaining tenure in months
 * @property {string} borrowerId - Borrower family member ID
 * @property {Date} lastUpdated - Last updated date
 */

/**
 * @typedef {Object} FinancialGoal
 * @property {string} id - Unique identifier
 * @property {string} name - Goal name
 * @property {string} type - Goal type (Retirement, Education, House, Vacation, Emergency, etc.)
 * @property {number} targetAmount - Target amount in INR
 * @property {number} currentAmount - Current saved amount
 * @property {number} monthlyContribution - Monthly contribution
 * @property {Date} targetDate - Target date
 * @property {number} yearsRemaining - Years remaining
 * @property {number} progressPercentage - Progress percentage
 * @property {string} priority - Priority (High, Medium, Low)
 * @property {string} status - Status (OnTrack, Behind, Achieved)
 * @property {string[]} linkedAssets - Array of asset IDs linked to this goal
 * @property {string} [description] - Goal description
 * @property {number} [expectedReturn] - Expected annual return (%)
 * @property {Date} createdDate - Goal creation date
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier
 * @property {Date} date - Transaction date
 * @property {string} type - Transaction type (Income, Expense, Investment, Withdrawal)
 * @property {string} category - Category
 * @property {string} subcategory - Subcategory
 * @property {number} amount - Amount in INR
 * @property {string} description - Description
 * @property {string} paymentMethod - Payment method
 * @property {string} [institution] - Bank/institution
 * @property {string} [reference] - Reference number
 * @property {string} memberId - Family member ID
 * @property {string} [assetId] - Related asset ID (for investments)
 * @property {string} [goalId] - Related goal ID
 * @property {boolean} isRecurring - Is recurring transaction
 * @property {string} [tags] - Comma-separated tags
 */

/**
 * @typedef {Object} Budget
 * @property {string} id - Unique identifier
 * @property {string} month - Month (YYYY-MM format)
 * @property {string} category - Category
 * @property {number} budgetAmount - Budgeted amount
 * @property {number} spentAmount - Spent amount
 * @property {number} remaining - Remaining amount
 * @property {number} percentageUsed - Percentage used
 * @property {string} status - Status (Within, Warning, Exceeded)
 */

/**
 * @typedef {Object} InsurancePolicy
 * @property {string} id - Unique identifier
 * @property {string} type - Policy type (Life, Health, Vehicle, Home)
 * @property {string} provider - Insurance provider
 * @property {string} policyNumber - Policy number
 * @property {number} coverageAmount - Coverage amount
 * @property {number} premium - Premium amount
 * @property {string} frequency - Payment frequency (Monthly, Quarterly, Yearly)
 * @property {Date} startDate - Policy start date
 * @property {Date} maturityDate - Policy maturity date
 * @property {string} insuredMember - Insured family member ID
 * @property {Date} lastPremiumDate - Last premium payment date
 * @property {Date} nextPremiumDate - Next premium due date
 */

/**
 * @typedef {Object} TaxRecord
 * @property {string} id - Unique identifier
 * @property {string} financialYear - Financial year (FY2023-24)
 * @property {string} memberId - Family member ID
 * @property {number} grossIncome - Gross income
 * @property {number} deductions - Total deductions (80C, 80D, etc.)
 * @property {number} taxableIncome - Taxable income
 * @property {number} taxPaid - Tax paid
 * @property {number} taxDue - Tax due/refund
 * @property {Date} filingDate - ITR filing date
 * @property {string} status - Status (Filed, Pending, Processed)
 */

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // No runtime exports, this file is for JSDoc type definitions
    };
}
