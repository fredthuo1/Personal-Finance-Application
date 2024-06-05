const mongoose = require('mongoose');

const financialProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    assets: {
        cashAndSavings: { type: Number, default: 0 },
        investments: { type: Number, default: 0 },
        retirementAccounts: {
            type: Map,
            of: Number
        },
        realEstate: { type: Number, default: 0 },
        personalProperty: { type: Number, default: 0 },
        otherAssets: { type: Number, default: 0 },
        totalAssets: { type: Number, default: 0 }
    },

    liabilities: {
        loans: [{
            type: {
                type: String,
                enum: ['mortgage', 'student loan', 'car loan', 'personal loan', 'other'],
                required: true
            },
            balance: { type: Number, required: true, min: 0 },
            interestRate: Number,
            monthlyPayment: Number
        }],
        creditCardDebt: { type: Number, default: 0 },
        otherLiabilities: { type: Number, default: 0 },
        totalLiabilities: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('FinancialProfile', financialProfileSchema);
