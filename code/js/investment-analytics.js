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
            return {
                percentages: { Equity: 0, Debt: 0, Gold: 0, Others: 0 },
                totals: { Equity: 0, Debt: 0, Gold: 0, Others: 0 },
                grandTotal: 0
            };
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
            return {
                percentages: { 'Large Cap': 0, 'Mid Cap': 0, 'Small Cap': 0, 'International': 0 },
                totals: { 'Large Cap': 0, 'Mid Cap': 0, 'Small Cap': 0, 'International': 0 },
                equityTotal: 0
            };
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
            const assetClassName = assetClass.charAt(0).toUpperCase() + assetClass.slice(1);
            const current = allocation.percentages[assetClassName] || 0;
            const target = targets[assetClass];
            const diff = current - target;

            if (Math.abs(diff) > 5) {
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
