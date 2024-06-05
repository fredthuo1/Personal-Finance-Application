const { analyzeFinancialData } = require('../utils/financialUtils');

const getWeeklyAdvice = async (req, res) => {
    try {
        const { financialData } = req.body;
        const advice = await analyzeFinancialData(financialData, 'weekly');
        res.json({ advice });
    } catch (error) {
        console.error('Error in getWeeklyAdvice:', error);
        res.status(500).json({ error: 'Failed to get weekly advice' });
    }
};

const getMonthlyAdvice = async (req, res) => {
    try {
        const { financialData } = req.body;
        const advice = await analyzeFinancialData(financialData, 'monthly');
        res.json({ advice });
    } catch (error) {
        console.error('Error in getMonthlyAdvice:', error);
        res.status(500).json({ error: 'Failed to get monthly advice' });
    }
};

const getYearlyAdvice = async (req, res) => {
    try {
        const { financialData } = req.body;
        const advice = await analyzeFinancialData(financialData, 'yearly');
        res.json({ advice });
    } catch (error) {
        console.error('Error in getYearlyAdvice:', error);
        res.status(500).json({ error: 'Failed to get yearly advice' });
    }
};

module.exports = { getWeeklyAdvice, getMonthlyAdvice, getYearlyAdvice };
