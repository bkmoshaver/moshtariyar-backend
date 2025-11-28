/**
 * Seed Test Users
 * ایجاد کاربران تستی
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const testUsers = [
  {
    name: 'Admin Test',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin'
  },
  {
    name: 'User Test',
    email: 'user@test.com',
    password: '123456',
    role: 'user'
  }
];

async function seedUsers() {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // حذف کاربران قبلی
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // ایجاد کاربران تستی
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nTest Accounts:');
    console.log('1. Admin: admin@test.com / 123456');
    console.log('2. User: user@test.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedUsers();
