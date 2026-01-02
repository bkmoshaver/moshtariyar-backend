/**
 * Staff Controller
 * مدیریت پرسنل مجموعه
 */

const User = require('../models/User');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * دریافت لیست پرسنل
 * GET /api/staff
 */
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({
      tenant: req.tenantId,
      role: 'staff'
    }).select('-password');

    res.json(successResponse({ staff }));
  } catch (error) {
    next(error);
  }
};

/**
 * افزودن پرسنل جدید
 * POST /api/staff
 */
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // بررسی تکراری نبودن ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این ایمیل قبلاً ثبت شده است')
      );
    }

    const staff = new User({
      name,
      email,
      password,
      role: 'staff',
      tenant: req.tenantId
    });

    await staff.save();

    // حذف پسورد از خروجی
    staff.password = undefined;

    res.status(201).json(
      successResponse({ staff }, 'پرسنل با موفقیت اضافه شد')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * حذف پرسنل
 * DELETE /api/staff/:id
 */
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenantId,
      role: 'staff'
    });

    if (!staff) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'پرسنل یافت نشد')
      );
    }

    res.json(successResponse(null, 'پرسنل با موفقیت حذف شد'));
  } catch (error) {
    next(error);
  }
};
