const User = require('../models/User');
const Tenant = require('../models/Tenant');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'این ایمیل قبلاً ثبت شده است'
      });
    }

    // Determine role: use provided role or default to 'client'
    // Security: prevent registering as 'super_admin' or 'tenant_admin' via this endpoint without checks
    // But for MVP, we allow 'client' or 'user'. 'tenant_admin' should go through tenant registration.
    let userRole = 'client';
    if (role && ['client', 'user'].includes(role)) {
      userRole = role;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطا در ثبت‌نام'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'لطفاً ایمیل و رمز عبور را وارد کنید'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'اطلاعات ورود نامعتبر است'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'اطلاعات ورود نامعتبر است'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ورود به سیستم'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات کاربر'
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  // Note: In a real app, this should be a method on the User model
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      data: {
        tokens: {
          accessToken: token
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenant: user.tenant
        }
      }
    });
};
