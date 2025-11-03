const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

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

module.exports = router;