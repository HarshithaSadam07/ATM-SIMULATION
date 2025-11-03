const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['deposit', 'withdraw', 'transfer'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    toCardNumber: {
        type: String,
    },
    fromCardNumber: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    cardNumber: {
        type: String,
        required: true,
        unique: true
    },
    pinHash: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [transactionSchema]
});

module.exports = mongoose.model('User', userSchema);