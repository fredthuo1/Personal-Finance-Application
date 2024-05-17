const Transaction = require('../models/TransactionModel');
const PDFDocument = require('pdfkit');
// const TransactionAnalyzer = require('../utils/TransactionAnalyzer'); 
// const analyzer = new TransactionAnalyzer();

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

// Retrieve transactions for the signed-in user
const getTransactionsByUser = async (req, res, next) => {
    try {
        // Get the user ID from the request object
        const userId = req.params.userId; // Assuming the user ID is attached to req.userId

        // Retrieve transactions belonging to the user
        const transactions = await Transaction.find({ UserID: userId });

        // Return the transactions in the response
        res.status(200).json(transactions);
    } catch (error) {
        // Pass any errors to the error handling middleware
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
            const amountString = transaction.Amount && typeof transaction.Amount === 'string' ? transaction.Amount.replace(/[^0-9.-]+/g, '').trim() : '0';
            const amount = parseFloat(amountString);

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
        const userId = req.params.userId;
        const transactions = await Transaction.find({ UserID: userId });
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Analyze and retrieve transactions by user ID
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

// Generate a PDF report for a user's transactions
const generateReport = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const transactions = await Transaction.find({ UserID: userId });

        // Create a new PDF document
        const doc = new PDFDocument();
        let filename = `Transaction_Report_${userId}.pdf`;
        filename = encodeURIComponent(filename);

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // Add content to the PDF
        doc.fontSize(18).text('Transaction Report', { align: 'center' });
        doc.moveDown();

        transactions.forEach(transaction => {
            doc.fontSize(12).text(`Date: ${transaction.Date}`);
            doc.text(`Description: ${transaction.Description}`);
            doc.text(`Amount: $${transaction.Amount}`);
            doc.text(`Category: ${transaction.Category}`);
            doc.moveDown();
        });

        // Finalize the PDF and end the stream
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
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
    generateReport 
};
