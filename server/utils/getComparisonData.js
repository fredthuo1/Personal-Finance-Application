const FinancialProfile = require('../models/FinancialProfile');
const Transaction = require('../models/TransactionModel');

const getComparisonData = async (userId) => {
    try {
        const financialProfile = await FinancialProfile.findOne({ userId }).populate('userId');
        if (!financialProfile) {
            const error = new Error('User does not have a financial profile');
            error.statusCode = 404;
            throw error;
        }

        financialProfile.assets.totalAssets = calculateTotalAssets(financialProfile.assets);
        financialProfile.liabilities.totalLiabilities = calculateTotalLiabilities(financialProfile.liabilities);

        const allProfiles = await FinancialProfile.find({});

        const totalMetrics = allProfiles.reduce((totals, profile) => {
            const totalDebt = profile.liabilities.totalLiabilities || 0;
            const totalAssets = profile.assets.totalAssets || 0;

            return {
                totalDebt: totals.totalDebt + totalDebt,
                totalNetWorth: totals.totalNetWorth + (totalAssets - totalDebt),
                totalCashAndSavings: totals.totalCashAndSavings + (profile.assets.cashAndSavings || 0),
                totalInvestments: totals.totalInvestments + (profile.assets.investments || 0),
                totalRealEstate: totals.totalRealEstate + (profile.assets.realEstate || 0),
                totalPersonalProperty: totals.totalPersonalProperty + (profile.assets.personalProperty || 0),
                totalOtherAssets: totals.totalOtherAssets + (profile.assets.otherAssets || 0),
                count: totals.count + 1
            };
        }, {
                totalDebt: 0,
                totalNetWorth: 0,
                totalCashAndSavings: 0,
                totalInvestments: 0,
                totalRealEstate: 0,
                totalPersonalProperty: 0,
                totalOtherAssets: 0,
                count: 0
            });

        const averageComparisonMetrics = {
            debt: totalMetrics.count > 0 ? totalMetrics.totalDebt / totalMetrics.count : 0,
            netWorth: totalMetrics.count > 0 ? totalMetrics.totalNetWorth / totalMetrics.count : 0,
            cashAndSavings: totalMetrics.count > 0 ? totalMetrics.totalCashAndSavings / totalMetrics.count : 0,
            investments: totalMetrics.count > 0 ? totalMetrics.totalInvestments / totalMetrics.count : 0,
            realEstate: totalMetrics.count > 0 ? totalMetrics.totalRealEstate / totalMetrics.count : 0,
            personalProperty: totalMetrics.count > 0 ? totalMetrics.totalPersonalProperty / totalMetrics.count : 0,
            otherAssets: totalMetrics.count > 0 ? totalMetrics.totalOtherAssets / totalMetrics.count : 0
        };

        const userTransactions = await Transaction.find({ userId });
        const allTransactions = await Transaction.find({});

        const userCategoryTotals = calculateCategoryTotals(userTransactions);
        const allCategoryTotals = calculateCategoryTotals(allTransactions, true); 


        return {
            userMetrics: calculateMetricsFromProfile(financialProfile),
            averageComparisonMetrics,
            userCategoryTotals,
            allCategoryTotals
        };

    } catch (error) {
        console.error('Error fetching comparison data:', error);
        throw error;
    }
};

const calculateCategoryTotals = (transactions, isAverage = false) => {
    const categoryTotals = transactions.reduce((totals, transaction) => {
        const category = transaction.category || 'Uncategorized';
        const amount = parseFloat(transaction.amount) || 0;
        totals[category] = (totals[category] || 0) + amount;
        return totals;
    }, {});

    if (isAverage) {
        const transactionCount = transactions.length;
        for (let category in categoryTotals) {
            categoryTotals[category] = transactionCount > 0 ? categoryTotals[category] / transactionCount : 0;
        }
    }

    return categoryTotals;
};

const calculateMetricsFromProfile = (profile) => {
    const totalDebt = profile.liabilities.totalLiabilities || 0;
    const totalAssets = profile.assets.totalAssets || 0;

    return {
        userId: profile.userId._id,
        debt: totalDebt,
        netWorth: totalAssets - totalDebt,
        cashAndSavings: profile.assets.cashAndSavings || 0,
        investments: profile.assets.investments || 0,
        realEstate: profile.assets.realEstate || 0,
        personalProperty: profile.assets.personalProperty || 0,
        otherAssets: profile.assets.otherAssets || 0
    };
};

const calculateTotalAssets = (assets) => {
    const cashAndSavings = parseFloat(assets.cashAndSavings) || 0;
    const investments = parseFloat(assets.investments) || 0;
    const retirementAccounts = Object.values(assets.retirementAccounts || {}).reduce((sum, value) => sum + parseFloat(value), 0);
    const realEstate = parseFloat(assets.realEstate) || 0;
    const personalProperty = parseFloat(assets.personalProperty) || 0;
    const otherAssets = parseFloat(assets.otherAssets) || 0;

    return cashAndSavings + investments + retirementAccounts + realEstate + personalProperty + otherAssets;
};

const calculateTotalLiabilities = (liabilities) => {
    const loans = liabilities.loans.reduce((sum, loan) => sum + parseFloat(loan.balance), 0);
    const creditCardDebt = parseFloat(liabilities.creditCardDebt) || 0;
    const otherLiabilities = parseFloat(liabilities.otherLiabilities) || 0;

    return loans + creditCardDebt + otherLiabilities;
};

module.exports = { getComparisonData };
