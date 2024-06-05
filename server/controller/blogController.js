const { analyzeFinancialData } = require('../utils/financialUtils');
const { fetchUserTransactions } = require('../utils/transactionUtils');

const getBlogData = async (req, res) => {
    try {
        const { userId } = req.params;
        const financialData = await fetchUserTransactions(userId);

        const weeklyAdvice = await analyzeFinancialData(financialData, 'weekly');
        const monthlyAdvice = await analyzeFinancialData(financialData, 'monthly');

        res.json({
            weeklyAdvice: {
                analysis: weeklyAdvice.analysis,
                prediction: weeklyAdvice.prediction,
                projection: weeklyAdvice.projection,
                tips: weeklyAdvice.tips
            },
            monthlyAdvice: {
                analysis: monthlyAdvice.analysis,
                prediction: monthlyAdvice.prediction,
                projection: monthlyAdvice.projection,
                tips: monthlyAdvice.tips
            }
        });
        console.log(weeklyAdvice.tips);
        console.log(monthlyAdvice.tips);
    } catch (error) {
        console.error('Error in getBlogData:', error);
        res.status(500).json({ error: 'Failed to get blog data' });
    }
};

module.exports = { getBlogData };
