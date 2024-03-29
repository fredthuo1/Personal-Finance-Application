const Transaction = require('../models/TransactionModel');

// Create a new transaction
const createTransaction = async (req, res, next) => {
    try {
        // Parse request data and create a new transaction
        const transactionData = {
            ...req.body,
            UserID: req.body.userID || 'Default User'
        };
        const newTransaction = new Transaction(transactionData);
        await newTransaction.save();
        res.status(201).json(newTransaction);
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
        const updatedData = {
            ...req.body,
            UserID: req.body.userID || 'Default User'
        };
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

// Save transactions in bulk
const saveTransactionsInBulk = async (req, res, next) => {
    console.log('Request body Server Side');

    try {
        const userID = req.body.userID;
        const transactions = req.body.transactions;

        const validTransactions = transactions.map(transaction => {
            const cleanedAmount = transaction.Amount.replace(/[^0-9.-]+/g, '').trim();
            const amount = parseFloat(cleanedAmount);

            if (isNaN(amount)) {
                console.log(`Dropping transaction with invalid amount: ${transaction.Amount}`);
                return null;
            }

            return {
                ...transaction,
                Amount: amount,
                UserID: userID  
            };
        }).filter(transaction => transaction !== null);

        console.log(validTransactions);

        await Transaction.insertMany(validTransactions);
        res.status(201).json({ message: 'Transactions saved successfully' });
    } catch (error) {
        console.error('Error saving transactions:', error);
        res.status(500).json({ message: 'Error saving transactions' });
    }
};

// Fetch all transactions
const getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createTransaction,
    getTransactionsByUser,
    getTransactionById,
    updateTransactionById,
    deleteTransactionById,
    saveTransactionsInBulk,
    getAllTransactions
};
