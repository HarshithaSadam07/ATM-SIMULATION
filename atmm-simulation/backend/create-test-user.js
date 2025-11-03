const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Create a test user
        const hashedPin = await bcrypt.hash('1234', 10);
        const testUser = new User({
            cardNumber: '1234567890',
            pinHash: hashedPin,
            balance: 1000,
            transactions: []
        });

        await testUser.save();
        console.log('Test user created successfully!');
        console.log('Card Number: 1234567890');
        console.log('PIN: 1234');
        console.log('Initial Balance: ₹1000');
    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.connection.close();
    }
})();