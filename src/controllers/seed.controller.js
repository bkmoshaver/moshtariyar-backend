/**
 * Seed Controller
 * ایجاد داده‌های تستی
 */

const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/errorResponse');

/**
 * ایجاد کاربران تستی
 * POST /api/seed/users
 */
const seedUsers = async (req, res, next) => {
  try {
    // حذف کاربران قبلی
    await User.deleteMany({});

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

    const createdUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        name: user.name,
        email: user.email,
        role: user.role
      });
    }

    res.json(
      successResponse({
        users: createdUsers,
        message: 'کاربران تستی با موفقیت ایجاد شدند'
      })
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  seedUsers
};
