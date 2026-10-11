
import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/daystar-forms';

const seedUsers = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding.');

    const users = [
      {
        email: 'superadmin@daystarng.org',
        password: 'password123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superAdmin',
      },
      {
        email: 'admin@daystarng.org',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      },
      {
        email: 'pastor@daystarng.org',
        password: 'password123',
        firstName: 'Pastor',
        lastName: 'User',
        role: 'pastorate',
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists.`);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`User with role ${userData.role} created successfully.`);
      }
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedUsers();
