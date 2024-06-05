const express = require('express');
const { createTransaction, getTransactionById, updateTransactionById, deleteTransactionById, getTransactionsByUser, saveTransactionsInBulk, getAllTransactions, generateReport, getTransactionComparisonData } = require('../controller/transactionController');
const { analyzeTransactions } = require('../utils/transactionAnalysisService');

const router = express.Router();

router.post('/', createTransaction);

router.get('/transaction/:transactionId', getTransactionById);

router.put('/transaction/:transactionId', updateTransactionById);

router.delete('/transaction/:transactionId', deleteTransactionById);

router.get('/transaction/:userId/transactions', getTransactionsByUser);

router.post('/saveTransactionsInBulk', saveTransactionsInBulk);

router.get('/getAllTransactions', getAllTransactions);

router.get('/generateReport/:userId', generateReport); 

router.get('/:userId/comparison', getTransactionComparisonData);

router.post('/analyze', async (req, res) => {
    try {
        const { transactions } = req.body;
        const result = await analyzeTransactions(transactions);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error analyzing transactions:", error);
        res.status(500).json({ error: 'Failed to analyze transactions' });
    }
});

module.exports = router;
