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
    const { name, email, password, role } = req.body;

    // بررسی تکراری نبودن ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این ایمیل قبلاً ثبت شده است')
      );
    }

    // تعیین نقش کاربر
    // اگر نقش ارسال شده باشد و معتبر باشد (client یا user)، از آن استفاده می‌کنیم
    // در غیر این صورت پیش‌فرض 'client' است (قبلاً staff بود که باعث خطا می‌شد)
    let userRole = 'client';
    if (role && ['client', 'user'].includes(role)) {
      userRole = role;
    }

    // ایجاد کاربر
    const user = new User({
      name,
      email,
      password,
      role: userRole
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

/**
 * دریافت لیست کاربران (فقط ادمین)
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    
    res.json(
      successResponse({
        users
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * ایجاد کاربر جدید توسط ادمین
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

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
      role: role || 'client' // Default to client instead of staff
    });

    await user.save();

    res.status(201).json(
      successResponse({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }, 'کاربر با موفقیت ایجاد شد')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * حذف کاربر (فقط ادمین)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'کاربر یافت نشد')
      );
    }

    // جلوگیری از حذف خود ادمین
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json(
        errorResponse(ErrorCodes.BAD_REQUEST, 'شما نمی‌توانید حساب خود را حذف کنید')
      );
    }

    await user.deleteOne();

    res.json(
      successResponse(null, 'کاربر با موفقیت حذف شد')
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  createUser,
  deleteUser
};
