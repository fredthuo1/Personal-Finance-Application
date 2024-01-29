// controllers/transactionController.js
const Transaction = require('../models/TransactionModel');

// Create a new transaction
const createTransaction = async (req, res, next) => {
    try {
        // Parse request data and create a new transaction
        const transactionData = req.body;
        const newTransaction = new Transaction(transactionData);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        next(error);
    }
};

// Retrieve a transaction by ID
const getTransactionById = async (req, res, next) => {
    try {
        const transactionId = req.params.id;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

// Update a transaction by ID
const updateTransactionById = async (req, res, next) => {
    try {
        const transactionId = req.params.id;
        const updatedData = req.body;
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            updatedData,
            { new: true }
        );
        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(updatedTransaction);
    } catch (error) {
        next(error);
    }
};

// Delete a transaction by ID
const deleteTransactionById = async (req, res, next) => {
    try {
        const transactionId = req.params.id;
        const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
        next(error);
    }
};

// Retrieve transactions by user ID
const getTransactionsByUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const transactions = await Transaction.find({ UserID: userId });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

// Save transactions in bulk
const saveTransactionsInBulk = async (req, res, next) => {
    try {
        const userID = req.body.userID;
        const transactions = req.body.transactions.map(transaction => {
            return { ...transaction, UserID: userID };
        });

        await Transaction.insertMany(transactions);
        res.status(201).json({ message: 'Transactions saved successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransaction,
    getTransactionById,
    updateTransactionById,
    deleteTransactionById,
    getTransactionsByUser,
    saveTransactionsInBulk
};
