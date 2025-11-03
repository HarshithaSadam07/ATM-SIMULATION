const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
    const { cardNumber, pin } = req.body;

    try {
        // Find or create user by card number
        let user = await User.findOne({ cardNumber });
        if (!user) {
            // Create new user with provided card number and PIN
            const pinHash = await bcrypt.hash(pin, 10);
            user = new User({
                cardNumber,
                pinHash,
                balance: 1000, // Initial balance for new users
                transactions: []
            });
            await user.save();
        } else {
            // Verify PIN for existing user
            const validPin = await bcrypt.compare(pin, user.pinHash);
            if (!validPin) {
                return res.status(400).json({ message: 'Invalid PIN for existing card' });
            }
        }

        // Create and assign token
        const token = jwt.sign(
            { _id: user._id, cardNumber: user.cardNumber },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            message: 'An error occurred during login. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;