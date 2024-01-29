const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    Date: {
        type: Date,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    },
    TransactionType: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    AccountName: {
        type: String,
        required: true
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
