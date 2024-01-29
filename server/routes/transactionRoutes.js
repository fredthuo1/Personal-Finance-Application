const express = require('express');
const { createTransaction, getTransactionById, updateTransactionById, deleteTransactionById, getTransactionsByUser, saveTransactionsInBulk } = require('../controller/transactionController');

const router = express.Router();

router.post('/', createTransaction);

router.get('/transaction/:transactionId', getTransactionById);

router.put('/transaction/:transactionId', updateTransactionById);

router.delete('/transaction/:transactionId', deleteTransactionById);

router.get('/transaction/:userId', getTransactionsByUser);

router.post('/saveTransactionsInBulk', saveTransactionsInBulk);

module.exports = router;

