/**
 * User Controller
 * مدیریت کاربران ساده
 */

const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * ثبت‌نام کاربر جدید
 * POST /api/auth/user/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // بررسی تکراری نبودن ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این ایمیل قبلاً ثبت شده است')
      );
    }

    // ایجاد کاربر
    const user = new User({
      name,
      email,
      password,
      role: 'user'
    });

    await user.save();

    // ساخت توکن‌ها
    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id
    });

    // پاسخ موفق
    res.status(201).json(
      successResponse({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }, 'ثبت‌نام با موفقیت انجام شد')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * ورود کاربر
 * POST /api/auth/user/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // یافتن کاربر
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json(
        errorResponse(ErrorCodes.INVALID_CREDENTIALS, 'ایمیل یا رمز عبور اشتباه است')
      );
    }

    // بررسی رمز عبور
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(
        errorResponse(ErrorCodes.INVALID_CREDENTIALS, 'ایمیل یا رمز عبور اشتباه است')
      );
    }

    // ساخت توکن‌ها
    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id
    });

    // پاسخ موفق
    res.json(
      successResponse({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }, 'ورود موفقیت‌آمیز بود')
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser
};
