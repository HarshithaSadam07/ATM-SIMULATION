const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function upsertUser({_id, cardNumber, pinHash, balance}) {
  await User.findOneAndUpdate(
    { _id },
    {
      $setOnInsert: {
        cardNumber,
        pinHash,
        balance,
        transactions: []
      }
    },
    { upsert: true, new: true }
  );
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not set in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const users = [
      {
        _id: new mongoose.Types.ObjectId('690709d49d01f67a7468ea14'),
        cardNumber: '9876543210',
        pinHash: '$2a$10$6RYiR8ZeM7/1wD7MO3tjIux2wN5waMarI2JHigCY0wRAN2aCkjzvO',
        balance: 500
      },
      {
        _id: new mongoose.Types.ObjectId('690709d49d01f67a7468ea16'),
        cardNumber: '1111222233',
        pinHash: '$2a$10$/EIVG.xVIxGc9QQyM3z6ueEwGaY9vhkp4.CL/bxALPpqF/EUD/DMO',
        balance: 800
      },
      {
        _id: new mongoose.Types.ObjectId('690709d49d01f67a7468ea18'),
        cardNumber: '5555666677',
        pinHash: '$2a$10$J8LAfanUZln66/0mH19sOeOnUVHBNi78kt7iIAhTYE5M8ccC76b7W',
        balance: 300
      }
    ];

    for (const u of users) {
      await upsertUser(u);
      console.log(`Upserted user ${u.cardNumber}`);
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
