const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    Date: {
        type: Date,
    },
    Description: {
        type: String,
    },
    Amount: {
        type: Number,
    },
    TransactionType: {
        type: String,
    },
    Category: {
        type: String,
    },
    AccountName: {
        type: String,
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
