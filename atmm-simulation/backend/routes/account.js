const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get account balance
router.get('/balance', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ balance: user.balance });
    } catch (err) {
        console.error('Error fetching balance:', err);
        res.status(500).json({
            message: 'Failed to fetch balance. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Deposit money
router.post('/deposit', auth, async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
        const user = await User.findById(req.user._id);
        user.balance += amount;
        user.transactions.push({
            type: 'deposit',
            amount
        });
        await user.save();
        res.json({ balance: user.balance });
    } catch (err) {
        console.error('Error processing deposit:', err);
        res.status(500).json({
            message: 'Failed to process deposit. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Withdraw money
router.post('/withdraw', auth, async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
        const user = await User.findById(req.user._id);
        
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        user.balance -= amount;
        user.transactions.push({
            type: 'withdraw',
            amount
        });
        await user.save();
        res.json({ balance: user.balance });
    } catch (err) {
        console.error('Error processing withdrawal:', err);
        res.status(500).json({
            message: 'Failed to process withdrawal. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ transactions: user.transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({
            message: 'Failed to fetch transactions. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Transfer money to another user's cardNumber
router.post('/transfer', auth, async (req, res) => {
    const { toCardNumber, amount } = req.body;

    if (!toCardNumber || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid transfer details' });
    }

    if (!/^[0-9]{6,}$/.test(String(toCardNumber))) {
        return res.status(400).json({ message: 'Invalid destination card number' });
    }

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const sender = await User.findById(req.user._id).session(session).exec();
            if (!sender) throw new Error('Sender not found');

            if (sender.cardNumber === String(toCardNumber)) {
                throw new Error('Cannot transfer to the same account');
            }

            const recipient = await User.findOne({ cardNumber: String(toCardNumber) }).session(session).exec();
            if (!recipient) {
                throw new Error('Recipient account not found');
            }

            if (sender.balance < amount) {
                throw new Error('Insufficient balance');
            }

            sender.balance -= amount;
            sender.transactions.push({
                type: 'transfer',
                amount,
                toCardNumber: String(toCardNumber)
            });
            await sender.save({ session });

            recipient.balance += amount;
            recipient.transactions.push({
                type: 'transfer',
                amount,
                fromCardNumber: sender.cardNumber
            });
            await recipient.save({ session });
        });

        res.json({ message: 'Transfer successful' });
    } catch (err) {
        console.error('Error processing transfer:', err);
        const message = err.message || 'Failed to process transfer. Please try again.';
        res.status(400).json({ message });
    } finally {
        session.endSession();
    }
});

module.exports = router;