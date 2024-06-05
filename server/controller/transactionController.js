const Transaction = require('../models/TransactionModel');
const classifyTransaction = require('../utils/classification');
const PDFDocument = require('pdfkit');

const createTransaction = async (req, res, next) => {
    try {
        const { Description, Category, ...rest } = req.body;
        const enrichedCategory = classifyTransaction(Description, Category);

        const transactionData = {
            ...rest,
            Description,
            Category,
            EnrichedCategory: enrichedCategory,
            UserID: req.body.userID || 'Default User'
        };

        const newTransaction = new Transaction(transactionData);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        next(error);
    }
};

const updateTransactionById = async (req, res, next) => {
    try {
        const transactionId = req.params.id;
        const { Description, Category, ...rest } = req.body;
        const enrichedCategory = classifyTransaction(Description, Category);

        const updatedData = {
            ...rest,
            Description,
            Category,
            EnrichedCategory: enrichedCategory,
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

const saveTransactionsInBulk = async (req, res, next) => {
    try {
        const userID = req.body.userID;
        const transactions = req.body.transactions;

        const validTransactions = transactions.map(transaction => {
            const amountString = transaction.Amount && typeof transaction.Amount === 'string' ? transaction.Amount.replace(/[^0-9.-]+/g, '').trim() : '0';
            const amount = parseFloat(amountString);

            if (isNaN(amount)) {
                console.log(`Dropping transaction with invalid amount: ${transaction.Amount}`);
                return null;
            }

            const enrichedCategory = classifyTransaction(transaction.Description, transaction.Category);

            return {
                ...transaction,
                Amount: amount,
                UserID: userID,
                EnrichedCategory: enrichedCategory
            };
        }).filter(transaction => transaction !== null);

        await Transaction.insertMany(validTransactions);
        res.status(201).json({ message: 'Transactions saved successfully' });
    } catch (error) {
        console.error('Error saving transactions:', error);
        res.status(500).json({ message: 'Error saving transactions' });
    }
};

const getTransactionsByUser = async (req, res, next) => {
    try {
        const userId = req.params.userId; 

        const transactions = await Transaction.find({ UserID: userId });

        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

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

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json({ transactions, analysis, prediction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const analyzeAndRetrieveTransactions = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const transactions = await Transaction.find({ UserID: userId });

        const analyzedTransactions = await Promise.all(transactions.map(async transaction => {
            const analysisResult = await analyzer.analyzeTransaction(transaction);
            return { ...transaction.toObject(), analysis: analysisResult };
        }));

        res.status(200).json(analyzedTransactions);
    } catch (error) {
        console.error('Error analyzing transactions:', error);
        next(error);
    }
};

const generateReport = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const transactions = await Transaction.find({ UserID: userId });

        const doc = new PDFDocument();
        let filename = `Transaction_Report_${userId}.pdf`;
        filename = encodeURIComponent(filename);

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.fontSize(18).text('Transaction Report', { align: 'center' });
        doc.moveDown();

        transactions.forEach(transaction => {
            doc.fontSize(12).text(`Date: ${transaction.Date}`);
            doc.text(`Description: ${transaction.Description}`);
            doc.text(`Amount: $${transaction.Amount}`);
            doc.text(`Category: ${transaction.Category}`);
            doc.moveDown();
        });

         doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

const getTransactionComparisonData = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`Fetching transactions for user: ${userId}`);

        const userTransactions = await Transaction.find({ UserID: userId });
        console.log(`User transactions: ${JSON.stringify(userTransactions)}`);

        if (!userTransactions.length) {
            console.log('No transactions found for user');
            return res.status(404).json({ error: 'User does not have transaction data' });
        }

        const allTransactions = await Transaction.find();
        console.log(`All transactions: ${JSON.stringify(allTransactions)}`);

        const categorizeTransactions = (transactions) => {
            return transactions.reduce((acc, transaction) => {
                const category = transaction.Category || 'Uncategorized';
                if (!acc[category]) {
                    acc[category] = { amount: 0, count: 0 };
                }
                acc[category].amount += transaction.Amount;
                acc[category].count += 1;
                return acc;
            }, {});
        };

        const userCategories = categorizeTransactions(userTransactions);
        const allCategories = categorizeTransactions(allTransactions);

        const averageCategories = Object.keys(allCategories).reduce((acc, category) => {
            acc[category] = {
                averageAmount: allCategories[category].amount / allCategories[category].count,
            };
            return acc;
        }, {});

        res.status(200).json({ userCategories, averageCategories });
    } catch (error) {
        console.error('Error fetching transaction comparison data:', error);
        res.status(500).json({ message: 'Error fetching transaction comparison data' });
    }
};


module.exports = {
    createTransaction,
    getTransactionsByUser,
    getTransactionById,
    updateTransactionById,
    deleteTransactionById,
    saveTransactionsInBulk,
    getAllTransactions,
    analyzeAndRetrieveTransactions,
    generateReport,
    getTransactionComparisonData
};
