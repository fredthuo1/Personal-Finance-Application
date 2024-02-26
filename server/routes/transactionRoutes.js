const express = require('express');
const { createTransaction, getTransactionById, updateTransactionById, deleteTransactionById, getTransactionsByUser, saveTransactionsInBulk, getAllTransactions } = require('../controller/transactionController');

const router = express.Router();

router.post('/', createTransaction);

router.get('/transaction/:transactionId', getTransactionById);

router.put('/transaction/:transactionId', updateTransactionById);

router.delete('/transaction/:transactionId', deleteTransactionById);

router.get('/transaction/:userId/transactions', getTransactionsByUser);

router.post('/saveTransactionsInBulk', saveTransactionsInBulk);

router.get('/getAllTransactions', getAllTransactions);

module.exports = router;
