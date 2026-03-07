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
