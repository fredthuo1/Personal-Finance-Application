const Transaction = require('../models/TransactionModel');
const { createTransaction, getTransactionById, updateTransactionById, deleteTransactionById, getTransactionsByUser, saveTransactionsInBulk, getAllTransactions, generateReport } = require('../controller/transactionController');

const getTransactionComparisonData = async (req, res) => {
    try {
        const userId = req.params.userId;

        const userTransactions = await Transaction.find({ userId });

        if (!userTransactions.length) {
            return res.status(404).json({ error: 'User does not have transaction data' });
        }

        const userTransactionMetrics = aggregateTransactionMetrics(userTransactions);

        const allTransactions = await Transaction.find({ userId: { $ne: userId } });

        const averageTransactionMetrics = aggregateTransactionMetrics(allTransactions);

        res.status(200).json({
            userTransactionMetrics,
            averageTransactionMetrics
        });
    } catch (error) {
        console.error('Error fetching transaction comparison data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const aggregateTransactionMetrics = (transactions) => {
    const metrics = {};

    transactions.forEach(transaction => {
        const category = transaction.category || 'Other';
        if (!metrics[category]) {
            metrics[category] = 0;
        }
        metrics[category] += parseFloat(transaction.amount || 0);
    });

    const categories = Object.keys(metrics);
    categories.forEach(category => {
        metrics[category] = metrics[category] / transactions.length;
    });

    return metrics;
};

module.exports = { getTransactionComparisonData };
