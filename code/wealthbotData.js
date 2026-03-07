// WealthBot AI Data & Response Logic
// This file contains all the intelligent responses and data for the WealthBot assistant

// Mock Financial Data (from the WealthOS dashboard)
const financialData = {
    netWorth: 5523000,
    assets: {
        mutualFunds: 2850000,
        stocks: 1200000,
        ppf: 850000,
        fd: 450000,
        gold: 173000
    },
    monthlyIncome: 185000,
    monthlyExpenses: 87000,
    monthlySavings: 98000,
    savingsRate: 53,
    goals: {
        houseDownPayment: {
            target: 5000000,
            current: 2800000,
            progress: 56,
            deadline: '2027'
        },
        retirement: {
            target: 50000000,
            current: 3500000,
            progress: 7,
            deadline: '2050'
        },
        emergencyFund: {
            target: 500000,
            current: 450000,
            progress: 90,
            deadline: 'Ongoing'
        }
    },
    investments: {
        sip: 45000,
        sipBreakdown: {
            equity: 30000,
            debt: 10000,
            hybrid: 5000
        }
    },
    spending: {
        categories: {
            rent: 35000,
            groceries: 12000,
            dining: 8000,
            transport: 6000,
            utilities: 5000,
            entertainment: 7000,
            shopping: 9000,
            miscellaneous: 5000
        }
    },
    recentTransactions: [
        { type: 'SIP', amount: 45000, date: '2026-02-01' },
        { type: 'Salary', amount: 185000, date: '2026-02-01' },
        { type: 'Rent', amount: -35000, date: '2026-02-05' }
    ],
    taxSavings: {
        section80C: 150000,
        section80CUsed: 120000,
        nps: 50000,
        npsUsed: 30000,
        healthInsurance: 25000,
        healthInsuranceUsed: 25000
    },
    portfolio: {
        returns: {
            ytd: 10.5,
            oneYear: 18.2,
            threeYear: 15.8,
            xirr: 16.4
        },
        allocation: {
            equity: 73,
            debt: 18,
            gold: 3,
            cash: 6
        }
    }
};

// Response Templates
const responses = {
    // 1. Net Worth Query
    netWorth: {
        keywords: ['net worth', 'total wealth', 'how much', 'portfolio value', 'total assets'],
        response: {
            text: "Here's your complete wealth overview:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💰</span>
                        <span>Net Worth Summary</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Net Worth</span>
                        <span class="metric-value">₹55.23 lakhs</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Mutual Funds</span>
                        <span class="metric-value">₹28.5 lakhs</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Stocks</span>
                        <span class="metric-value">₹12 lakhs</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">PPF</span>
                        <span class="metric-value">₹8.5 lakhs</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Fixed Deposits</span>
                        <span class="metric-value">₹4.5 lakhs</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Gold</span>
                        <span class="metric-value">₹1.73 lakhs</span>
                    </div>
                    <div class="chart-container">
                        <div class="chart-bar" style="height: 85%;" title="Mutual Funds"></div>
                        <div class="chart-bar" style="height: 40%;" title="Stocks"></div>
                        <div class="chart-bar" style="height: 30%;" title="PPF"></div>
                        <div class="chart-bar" style="height: 18%;" title="FD"></div>
                        <div class="chart-bar" style="height: 10%;" title="Gold"></div>
                    </div>
                    <div class="insight-box">
                        💡 Your net worth grew by ₹4.8 lakhs (9.5%) in the last quarter. You're on track to reach ₹60 lakhs by mid-2026!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Opening detailed breakdown...')">View Details</button>
                        <button class="action-btn secondary" onclick="alert('Downloading report...')">Download Report</button>
                    </div>
                </div>
            `
        }
    },

    // 2. Spending Analysis
    spending: {
        keywords: ['spending', 'expenses', 'where money', 'spent', 'expenditure'],
        response: {
            text: "Here's your spending breakdown for this month:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">📊</span>
                        <span>Monthly Spending Analysis</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Expenses</span>
                        <span class="metric-value">₹87,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Rent (40%)</span>
                        <span class="metric-value">₹35,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Groceries (14%)</span>
                        <span class="metric-value">₹12,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Shopping (10%)</span>
                        <span class="metric-value">₹9,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Dining (9%)</span>
                        <span class="metric-value">₹8,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Other Categories</span>
                        <span class="metric-value">₹23,000</span>
                    </div>
                    <div class="insight-box">
                        📈 Your spending is up 8% vs last month, mainly due to increased shopping (₹3,000 more). Consider setting a monthly limit of ₹6,000 for discretionary spending.
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Setting budget alert...')">Set Budget Alert</button>
                    </div>
                </div>
            `
        }
    },

    // 3. Goals Progress
    goals: {
        keywords: ['goals', 'targets', 'progress', 'achieve', 'house', 'retirement'],
        response: {
            text: "Here's your progress on financial goals:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">🎯</span>
                        <span>Goals Progress</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">House Down Payment (2027)</span>
                        <span class="metric-value">56% complete</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 56%;"></div>
                    </div>
                    <div style="margin-top: 16px;">
                        <div class="metric-row">
                            <span class="metric-label">Current: ₹28 lakhs</span>
                            <span class="metric-label">Target: ₹50 lakhs</span>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <div class="metric-row">
                            <span class="metric-label">Emergency Fund (2026)</span>
                            <span class="metric-value positive">90% complete</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 90%;"></div>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <div class="metric-row">
                            <span class="metric-label">Retirement Fund (2050)</span>
                            <span class="metric-value">7% complete</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 7%;"></div>
                        </div>
                    </div>

                    <div class="insight-box">
                        🎉 Great news! At your current savings rate, you'll reach your house down payment goal 4 months early. Your emergency fund is almost complete!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Viewing goal details...')">View Timeline</button>
                        <button class="action-btn secondary" onclick="alert('Adding new goal...')">Add Goal</button>
                    </div>
                </div>
            `
        }
    },

    // 4. Tax Saving Tips
    taxTips: {
        keywords: ['tax', '80c', 'save tax', 'deduction', 'tax saving'],
        response: {
            text: "Here are personalized tax saving opportunities for you:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💡</span>
                        <span>Tax Optimization</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Section 80C (Used)</span>
                        <span class="metric-value">₹1.2L / ₹1.5L</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 80%;"></div>
                    </div>

                    <div style="margin-top: 16px;">
                        <div class="metric-row">
                            <span class="metric-label">NPS (Used)</span>
                            <span class="metric-value">₹30K / ₹50K</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 60%;"></div>
                        </div>
                    </div>

                    <div class="insight-box">
                        💰 <strong>Potential Savings: ₹20,800</strong><br><br>
                        1. Invest ₹30K more in ELSS/PPF for 80C (save ₹9,360)<br>
                        2. Add ₹20K to NPS for 80CCD(1B) (save ₹6,240)<br>
                        3. Health insurance premium paid ✓ (saved ₹7,800)
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Recommending tax-saving funds...')">View ELSS Funds</button>
                        <button class="action-btn secondary" onclick="alert('Opening tax calculator...')">Tax Calculator</button>
                    </div>
                </div>
            `
        }
    },

    // 5. Are We Saving Enough?
    savingEnough: {
        keywords: ['saving enough', 'should i save', 'savings rate', 'am i doing well'],
        response: {
            text: "Let me analyze your savings pattern:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">🎯</span>
                        <span>Savings Health Check</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Monthly Income</span>
                        <span class="metric-value">₹1,85,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Monthly Expenses</span>
                        <span class="metric-value">₹87,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Monthly Savings</span>
                        <span class="metric-value positive">₹98,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Savings Rate</span>
                        <span class="metric-value positive">53%</span>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Your Rate</div>
                            <div class="comparison-value" style="color: #10b981;">53%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Recommended</div>
                            <div class="comparison-value">30-40%</div>
                        </div>
                    </div>
                    <div class="insight-box">
                        🌟 <strong>Excellent!</strong> Your 53% savings rate is significantly above the recommended 30-40%. You're saving ₹11.76 lakhs per year, putting you on track to achieve early financial independence. Keep up the great work!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Viewing projections...')">Future Projections</button>
                    </div>
                </div>
            `
        }
    },

    // 6. What-If: Increase SIP
    whatIfSip: {
        keywords: ['increase sip', 'sip by', 'add to sip', 'raise sip', 'what if sip'],
        response: {
            text: "Let me calculate the impact of increasing your SIP:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">📈</span>
                        <span>SIP Increase Impact Analysis</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Current Monthly SIP</span>
                        <span class="metric-value">₹45,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Proposed SIP</span>
                        <span class="metric-value positive">₹65,000 (+₹20K)</span>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">10 Year Value (Current)</div>
                            <div class="comparison-value">₹1.04 Cr</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">10 Year Value (New)</div>
                            <div class="comparison-value" style="color: #10b981;">₹1.50 Cr</div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <div class="chart-bar" style="height: 50%;" title="Current"></div>
                        <div class="chart-bar" style="height: 75%;" title="With Increase"></div>
                        <div class="chart-bar" style="height: 95%;" title="With Returns"></div>
                    </div>
                    <div class="insight-box">
                        💰 By increasing your SIP by ₹20K, you'll accumulate an <strong>additional ₹46 lakhs</strong> in 10 years (assuming 12% returns). This could help you reach your retirement goal 5 years earlier!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Setting up increased SIP...')">Apply Change</button>
                        <button class="action-btn secondary" onclick="alert('Opening calculator...')">Try Other Amounts</button>
                    </div>
                </div>
            `
        }
    },

    // 7. Bonus Investment Recommendation
    bonusInvest: {
        keywords: ['bonus', 'windfall', 'extra money', 'lump sum', 'invest bonus'],
        response: {
            text: "Here's how I recommend allocating your bonus:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💡</span>
                        <span>Smart Bonus Allocation</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Bonus Amount</span>
                        <span class="metric-value">₹2,00,000</span>
                    </div>
                    <div style="margin-top: 16px;">
                        <div class="metric-row">
                            <span class="metric-label">Emergency Fund (Complete it!)</span>
                            <span class="metric-value">₹50,000 (25%)</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">House Down Payment Goal</span>
                            <span class="metric-value">₹80,000 (40%)</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Tax Saving Investments</span>
                            <span class="metric-value">₹30,000 (15%)</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Index Funds (Long-term)</span>
                            <span class="metric-value">₹30,000 (15%)</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Treat Yourself!</span>
                            <span class="metric-value">₹10,000 (5%)</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <div class="chart-bar" style="height: 60%;" title="Emergency Fund"></div>
                        <div class="chart-bar" style="height: 95%;" title="House Goal"></div>
                        <div class="chart-bar" style="height: 45%;" title="Tax Saving"></div>
                        <div class="chart-bar" style="height: 45%;" title="Index Funds"></div>
                        <div class="chart-bar" style="height: 20%;" title="Fun Money"></div>
                    </div>
                    <div class="insight-box">
                        🎯 This allocation completes your emergency fund (goal achieved!), accelerates your house goal by 2 months, and maximizes tax benefits. The 5% fun money ensures you enjoy your hard work!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Creating investment plan...')">Apply Strategy</button>
                        <button class="action-btn secondary" onclick="alert('Customizing allocation...')">Customize</button>
                    </div>
                </div>
            `
        }
    },

    // 8. XIRR Explanation
    xirrExplain: {
        keywords: ['xirr', 'what is xirr', 'explain xirr', 'returns calculation'],
        response: {
            text: "Let me explain XIRR in simple terms:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">📚</span>
                        <span>Understanding XIRR</span>
                    </div>
                    <div class="insight-box" style="margin-top: 0;">
                        <strong>XIRR (Extended Internal Rate of Return)</strong> measures your actual investment returns considering:<br><br>
                        ✓ Multiple investments at different times<br>
                        ✓ Different investment amounts<br>
                        ✓ Timing of cash flows<br><br>
                        Unlike simple returns, XIRR gives you the TRUE annualized return rate.
                    </div>
                    <div class="metric-row" style="margin-top: 16px;">
                        <span class="metric-label">Your Portfolio XIRR</span>
                        <span class="metric-value positive">16.4% p.a.</span>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Your XIRR</div>
                            <div class="comparison-value" style="color: #10b981;">16.4%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Nifty 50 Returns</div>
                            <div class="comparison-value">14.2%</div>
                        </div>
                    </div>
                    <div class="insight-box">
                        🎯 <strong>Example:</strong> If you invested ₹10K in Jan, ₹15K in Apr, and ₹20K in Aug, XIRR calculates your true return considering the timing and amount of each investment. Your 16.4% XIRR means you're beating the market!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Opening XIRR calculator...')">Calculate XIRR</button>
                    </div>
                </div>
            `
        }
    },

    // 9. Portfolio Rebalancing
    rebalance: {
        keywords: ['rebalance', 'allocation', 'portfolio mix', 'asset allocation'],
        response: {
            text: "Let me check your portfolio allocation:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">⚖️</span>
                        <span>Portfolio Rebalancing</span>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Equity (Current)</div>
                            <div class="comparison-value">73%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Equity (Target)</div>
                            <div class="comparison-value">70%</div>
                        </div>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Debt (Current)</div>
                            <div class="comparison-value">18%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Debt (Target)</div>
                            <div class="comparison-value">20%</div>
                        </div>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Gold (Current)</div>
                            <div class="comparison-value">3%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Gold (Target)</div>
                            <div class="comparison-value">5%</div>
                        </div>
                    </div>
                    <div class="insight-box">
                        ⚠️ Your equity allocation is 3% higher than target due to recent market gains. Consider:<br><br>
                        • Move ₹1.65L from equity to debt funds<br>
                        • Increase gold allocation by ₹1.10L<br>
                        • Next SIP: ₹30K debt, ₹10K gold, ₹5K equity
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Creating rebalancing plan...')">Rebalance Now</button>
                        <button class="action-btn secondary" onclick="alert('Setting auto-rebalance...')">Auto-Rebalance</button>
                    </div>
                </div>
            `
        }
    },

    // 10. Best Performing Funds
    topFunds: {
        keywords: ['best funds', 'top performing', 'which funds', 'fund performance'],
        response: {
            text: "Here are your top performing investments:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">⭐</span>
                        <span>Top Performers (YTD)</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Parag Parikh Flexi Cap</span>
                        <span class="metric-value positive">+24.3%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Axis Small Cap Fund</span>
                        <span class="metric-value positive">+21.7%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">HDFC Index Nifty 50</span>
                        <span class="metric-value positive">+18.5%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Mirae Asset Large Cap</span>
                        <span class="metric-value positive">+17.2%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Axis Bluechip Fund</span>
                        <span class="metric-value positive">+15.8%</span>
                    </div>
                    <div class="chart-container">
                        <div class="chart-bar" style="height: 95%;" title="Parag Parikh"></div>
                        <div class="chart-bar" style="height: 85%;" title="Axis Small Cap"></div>
                        <div class="chart-bar" style="height: 75%;" title="Nifty 50"></div>
                        <div class="chart-bar" style="height: 65%;" title="Mirae"></div>
                        <div class="chart-bar" style="height: 60%;" title="Axis Blue"></div>
                    </div>
                    <div class="insight-box">
                        🎉 Your portfolio is outperforming! All equity funds are beating their benchmarks. Consider staying invested and continuing your SIP discipline.
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Viewing detailed performance...')">View Details</button>
                    </div>
                </div>
            `
        }
    },

    // 11. Retirement Planning
    retirement: {
        keywords: ['retire', 'retirement', 'when can i retire', 'early retirement', 'financial independence'],
        response: {
            text: "Let me project your retirement timeline:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">🏖️</span>
                        <span>Retirement Planning</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Current Age</span>
                        <span class="metric-value">32 years</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Target Retirement Corpus</span>
                        <span class="metric-value">₹5 Crores</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Current Savings</span>
                        <span class="metric-value">₹35 lakhs</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Monthly SIP</span>
                        <span class="metric-value">₹45,000</span>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">At Current Rate</div>
                            <div class="comparison-value">Age 48</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">With ₹20K Increase</div>
                            <div class="comparison-value" style="color: #10b981;">Age 45</div>
                        </div>
                    </div>
                    <div class="insight-box">
                        🎯 You're on track to achieve financial independence by age 48! With your 53% savings rate and 16.4% returns, you could retire 18 years earlier than traditional retirement age. Consider increasing SIP by ₹20K to retire by 45.
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Opening retirement calculator...')">Detailed Plan</button>
                        <button class="action-btn secondary" onclick="alert('Exploring FIRE strategies...')">FIRE Strategy</button>
                    </div>
                </div>
            `
        }
    },

    // 12. Emergency Fund Check
    emergencyFund: {
        keywords: ['emergency', 'emergency fund', 'rainy day', 'contingency'],
        response: {
            text: "Let me check your emergency fund status:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">🛡️</span>
                        <span>Emergency Fund Status</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Target Amount</span>
                        <span class="metric-value">₹5,00,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Current Balance</span>
                        <span class="metric-value positive">₹4,50,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Remaining</span>
                        <span class="metric-value">₹50,000</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 90%;"></div>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Months Covered</div>
                            <div class="comparison-value">5.2 months</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Recommended</div>
                            <div class="comparison-value">6 months</div>
                        </div>
                    </div>
                    <div class="insight-box">
                        🎯 You're 90% there! Your emergency fund covers 5.2 months of expenses (₹87K/month). You need just ₹50,000 more to reach the recommended 6-month cushion. Consider allocating your next bonus to complete this goal.
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Setting up auto-transfer...')">Complete Fund</button>
                    </div>
                </div>
            `
        }
    },

    // 13. Insurance Check
    insurance: {
        keywords: ['insurance', 'life insurance', 'health insurance', 'term insurance', 'coverage'],
        response: {
            text: "Here's your insurance coverage status:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">🛡️</span>
                        <span>Insurance Coverage</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Term Insurance</span>
                        <span class="metric-value positive">₹1 Crore ✓</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Health Insurance (Self)</span>
                        <span class="metric-value positive">₹10 Lakhs ✓</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Health Insurance (Parents)</span>
                        <span class="metric-value positive">₹5 Lakhs ✓</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Critical Illness Cover</span>
                        <span class="metric-value negative">Not Covered ⚠️</span>
                    </div>
                    <div class="insight-box">
                        ⚠️ Your basic coverage is good, but consider adding:<br><br>
                        • <strong>Critical Illness Cover:</strong> ₹25 lakhs (₹7K/year)<br>
                        • <strong>Increase Term Insurance:</strong> to ₹1.5 Cr as income grows<br>
                        • <strong>Super Top-up:</strong> ₹15L health cover (₹5K/year)
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Getting insurance quotes...')">Get Quotes</button>
                        <button class="action-btn secondary" onclick="alert('Viewing policies...')">My Policies</button>
                    </div>
                </div>
            `
        }
    },

    // 14. Debt Analysis
    debt: {
        keywords: ['loan', 'debt', 'emi', 'credit', 'liabilities'],
        response: {
            text: "Here's your debt overview:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💳</span>
                        <span>Debt Analysis</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Outstanding Debt</span>
                        <span class="metric-value positive">₹0</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Monthly EMIs</span>
                        <span class="metric-value positive">₹0</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Credit Card Outstanding</span>
                        <span class="metric-value positive">₹0</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Debt-to-Income Ratio</span>
                        <span class="metric-value positive">0%</span>
                    </div>
                    <div class="insight-box">
                        🎉 <strong>Excellent!</strong> You're completely debt-free with zero EMIs. This is a huge advantage for wealth building. Your debt-free status allows you to invest 53% of your income and accelerates your path to financial independence.
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Viewing credit score...')">Check Credit Score</button>
                    </div>
                </div>
            `
        }
    },

    // 15. Monthly Cash Flow
    cashFlow: {
        keywords: ['cash flow', 'monthly summary', 'income expense', 'breakdown'],
        response: {
            text: "Here's your monthly cash flow summary:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💰</span>
                        <span>Monthly Cash Flow</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Income</span>
                        <span class="metric-value positive">₹1,85,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Fixed Expenses</span>
                        <span class="metric-value negative">-₹50,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Variable Expenses</span>
                        <span class="metric-value negative">-₹37,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Investments (SIP)</span>
                        <span class="metric-value negative">-₹45,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Net Surplus</span>
                        <span class="metric-value positive">+₹53,000</span>
                    </div>
                    <div class="chart-container">
                        <div class="chart-bar" style="height: 100%;" title="Income"></div>
                        <div class="chart-bar" style="height: 27%;" title="Fixed"></div>
                        <div class="chart-bar" style="height: 20%;" title="Variable"></div>
                        <div class="chart-bar" style="height: 24%;" title="SIP"></div>
                        <div class="chart-bar" style="height: 29%;" title="Surplus"></div>
                    </div>
                    <div class="insight-box">
                        💡 You have ₹53K monthly surplus after all expenses and investments. Consider:<br>
                        • Increase SIP by ₹20K<br>
                        • Add ₹10K to PPF for tax savings<br>
                        • Keep ₹23K as flexible savings
                    </div>
                </div>
            `
        }
    },

    // 16. Investment Ideas
    investmentIdeas: {
        keywords: ['invest', 'where to invest', 'investment ideas', 'opportunities'],
        response: {
            text: "Based on your profile, here are personalized investment ideas:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💡</span>
                        <span>Investment Opportunities</span>
                    </div>
                    <div class="insight-box" style="margin-top: 0;">
                        <strong>1. Index Funds (High Priority)</strong><br>
                        Add Nifty Next 50 or Midcap 150 index funds to your portfolio for diversification and lower expense ratios.
                    </div>
                    <div class="insight-box">
                        <strong>2. International Funds</strong><br>
                        Consider S&P 500 index fund (10% of equity) for global diversification and currency hedge.
                    </div>
                    <div class="insight-box">
                        <strong>3. Gold Bonds (SGBs)</strong><br>
                        Next tranche opens soon. Better than physical/digital gold with 2.5% interest + capital appreciation.
                    </div>
                    <div class="insight-box">
                        <strong>4. NPS Tax Saver</strong><br>
                        Increase NPS by ₹20K/month for additional ₹50K 80CCD deduction (save ₹15.6K tax).
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Viewing fund recommendations...')">View Funds</button>
                        <button class="action-btn secondary" onclick="alert('Setting reminders...')">Remind Me</button>
                    </div>
                </div>
            `
        }
    },

    // 17. Market Commentary
    market: {
        keywords: ['market', 'sensex', 'nifty', 'stock market', 'market today'],
        response: {
            text: "Here's what's happening in the markets:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">📈</span>
                        <span>Market Update</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Nifty 50</span>
                        <span class="metric-value positive">22,847 (+1.2%)</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Sensex</span>
                        <span class="metric-value positive">75,410 (+1.1%)</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Your Portfolio Impact</span>
                        <span class="metric-value positive">+₹38,450 today</span>
                    </div>
                    <div class="insight-box">
                        📊 Markets are up on positive earnings and economic data. Your equity portfolio gained ₹38K today. <strong>Remember:</strong> Stay invested, ignore short-term volatility, and continue your SIP discipline. Time in the market beats timing the market!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Viewing portfolio impact...')">Portfolio Impact</button>
                    </div>
                </div>
            `
        }
    },

    // 18. Credit Card Optimization
    creditCard: {
        keywords: ['credit card', 'card rewards', 'cashback', 'card benefits'],
        response: {
            text: "Let me analyze your credit card usage:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💳</span>
                        <span>Credit Card Optimization</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Monthly Spend</span>
                        <span class="metric-value">₹45,000</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Rewards Earned (This Month)</span>
                        <span class="metric-value positive">2,150 points</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Value</span>
                        <span class="metric-value">~₹1,075</span>
                    </div>
                    <div class="insight-box">
                        💡 <strong>Optimization Tips:</strong><br><br>
                        • Your current card gives 2.4% rewards<br>
                        • Consider premium cards for 5% on dining (₹8K/month)<br>
                        • Potential additional savings: ₹3,600/year<br>
                        • Always pay full balance - never carry debt!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Comparing cards...')">Compare Cards</button>
                    </div>
                </div>
            `
        }
    },

    // 19. Financial Fitness Score
    fitnessScore: {
        keywords: ['score', 'rating', 'how am i doing', 'financial health', 'fitness'],
        response: {
            text: "Here's your overall financial fitness score:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">⭐</span>
                        <span>Financial Fitness Score</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Overall Score</span>
                        <span class="metric-value positive" style="font-size: 24px;">8.7/10</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Savings Rate</span>
                        <span class="metric-value positive">10/10 ⭐</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 100%;"></div>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Investment Discipline</span>
                        <span class="metric-value positive">9/10 ⭐</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 90%;"></div>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Emergency Fund</span>
                        <span class="metric-value positive">9/10 ⭐</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 90%;"></div>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Insurance Coverage</span>
                        <span class="metric-value">7/10</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 70%;"></div>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Debt Management</span>
                        <span class="metric-value positive">10/10 ⭐</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 100%;"></div>
                    </div>
                    <div class="insight-box">
                        🏆 <strong>Excellent!</strong> You're in the top 5% of earners in your age group. Your financial discipline is outstanding. Focus on improving insurance coverage to reach 9.5/10!
                    </div>
                </div>
            `
        }
    },

    // 20. Budget Recommendation
    budget: {
        keywords: ['budget', 'budgeting', 'spending plan', 'allocate money'],
        response: {
            text: "Here's a recommended budget based on the 50-30-20 rule:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">📊</span>
                        <span>Smart Budget Plan</span>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Needs (Target: 50%)</div>
                            <div class="comparison-value" style="color: #10b981;">47%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Recommended</div>
                            <div class="comparison-value">₹92,500</div>
                        </div>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Wants (Target: 30%)</div>
                            <div class="comparison-value" style="color: #f59e0b;">20%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Recommended</div>
                            <div class="comparison-value">₹55,500</div>
                        </div>
                    </div>
                    <div class="comparison-grid">
                        <div class="comparison-item">
                            <div class="comparison-label">Savings (Target: 20%)</div>
                            <div class="comparison-value" style="color: #10b981;">53%</div>
                        </div>
                        <div class="comparison-item">
                            <div class="comparison-label">Recommended</div>
                            <div class="comparison-value">₹37,000</div>
                        </div>
                    </div>
                    <div class="insight-box">
                        🌟 You're crushing it! You're saving 53% vs the recommended 20%. You're living well below your means (47% on needs, 20% on wants). You could afford to treat yourself more - increase 'wants' budget to 25% while maintaining 50% savings!
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="alert('Setting budget alerts...')">Set Alerts</button>
                        <button class="action-btn secondary" onclick="alert('Customizing budget...')">Customize</button>
                    </div>
                </div>
            `
        }
    },

    // Default response
    default: {
        response: {
            text: "I can help you with:",
            card: `
                <div class="response-card">
                    <div class="card-header">
                        <span class="card-icon">💬</span>
                        <span>Ask Me About</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <span class="tag">Net worth</span>
                        <span class="tag">Spending analysis</span>
                        <span class="tag">Goals progress</span>
                        <span class="tag">Tax optimization</span>
                        <span class="tag">Investment advice</span>
                        <span class="tag">Retirement planning</span>
                        <span class="tag">What-if scenarios</span>
                        <span class="tag">Market updates</span>
                        <span class="tag">Budget planning</span>
                        <span class="tag">Insurance review</span>
                        <span class="tag">Financial concepts</span>
                    </div>
                    <div class="insight-box">
                        Try asking: "What's my net worth?", "Are we saving enough?", "What if I increase my SIP?", or "How should I invest my bonus?"
                    </div>
                </div>
            `
        }
    }
};

// Response matching function
function matchResponse(message) {
    // Check each category
    for (const [key, category] of Object.entries(responses)) {
        if (key === 'default') continue;

        if (category.keywords.some(keyword => message.includes(keyword))) {
            return category.response;
        }
    }

    // Return default if no match
    return responses.default.response;
}

// Format currency
function formatCurrency(amount) {
    const n = Number(amount || 0);
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
    if (n >= 100000)   return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    return '₹' + n.toLocaleString('en-IN');
}

// Calculate percentage
function calculatePercentage(current, target) {
    return Math.round((current / target) * 100);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { responses, matchResponse, financialData };
}
