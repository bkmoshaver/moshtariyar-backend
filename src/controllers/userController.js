const User = require('../models/User');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات پروفایل'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  console.log('Update Profile Request Body:', req.body);
  console.log('Update Profile User ID:', req.user._id);

  try {
    const { name, username, bio, links } = req.body;
    const userId = req.user._id;

    // Check if username is taken by another user
    if (username && username.trim() !== '') {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'این نام کاربری قبلاً انتخاب شده است'
        });
      }
    }

    // Build update object
    const updateFields = {};
    const unsetFields = {}; // برای حذف فیلدها

    if (name) updateFields.name = name;
    
    // مدیریت نام کاربری: اگر خالی بود، کلاً حذفش کن ($unset)
    if (username !== undefined) {
      if (username === null || username.trim() === '') {
        unsetFields.username = 1; // دستور حذف فیلد
      } else {
        updateFields.username = username;
      }
    }
    
    if (bio !== undefined) updateFields.bio = bio;
    if (links) updateFields.links = links;

    // ساخت کوئری آپدیت
    const updateQuery = { $set: updateFields };
    if (Object.keys(unsetFields).length > 0) {
      updateQuery.$unset = unsetFields;
    }

    console.log('Update Query:', JSON.stringify(updateQuery, null, 2));

    const user = await User.findByIdAndUpdate(
      userId,
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    res.status(200).json({
      success: true,
      message: 'پروفایل با موفقیت بروزرسانی شد',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle duplicate key error (if race condition occurs)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'این نام کاربری قبلاً انتخاب شده است'
      });
    }

    // نمایش خطای دقیق اعتبارسنجی
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطا در بروزرسانی پروفایل: ' + error.message
    });
  }
};

/**
 * @desc    Get all users (for tenant admin)
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
exports.getUsers = async (req, res) => {
  try {
    // If tenant admin, only show users of that tenant
    const query = {};
    if (req.user.role === 'tenant_admin') {
      query.tenant = req.user.tenant;
    }

    const users = await User.find(query).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست کاربران'
    });
  }
};

/**
 * @desc    Create new user (for tenant admin)
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, tenant } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'این ایمیل قبلاً ثبت شده است'
      });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      role: role || 'client'
    };

    // Handle tenant assignment
    if (req.user.role === 'super_admin') {
      // Super admin can assign any tenant
      if (tenant) {
        userData.tenant = tenant;
      } else if (['staff', 'tenant_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'برای نقش‌های پرسنل و مدیر فروشگاه، انتخاب فروشگاه الزامی است'
        });
      }
    } else {
      // Tenant admin can only assign to their own tenant
      userData.tenant = req.user.tenant;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: user,
      message: 'کاربر با موفقیت ایجاد شد'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در ایجاد کاربر'
    });
  }
};

/**
 * @desc    Update user (for tenant admin)
 * @route   PATCH /api/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, role, password, tenant } = req.body; // Added tenant to destructuring
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    // Check permission: Tenant admin can only update their own users
    if (req.user.role !== 'super_admin' && 
        (!user.tenant || user.tenant.toString() !== req.user.tenant.toString())) {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی ویرایش این کاربر را ندارید'
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.password = password;
    
    // Allow super_admin to update tenant
    if (req.user.role === 'super_admin' && tenant) {
      user.tenant = tenant;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'کاربر با موفقیت ویرایش شد'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ویرایش کاربر'
    });
  }
};

/**
 * @desc    Delete user (for tenant admin)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    // Check permission: Tenant admin can only delete their own users
    if (req.user.role !== 'super_admin' && 
        (!user.tenant || user.tenant.toString() !== req.user.tenant.toString())) {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی حذف این کاربر را ندارید'
      });
    }

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف کاربر'
    });
  }
};
