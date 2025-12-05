/**
 * Staff Model
 * مدل کارمند - هر کارمند متعلق به یک تنانت است
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  // ارتباط با تنانت
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'تنانت الزامی است'],
    index: true
  },

  // اطلاعات شخصی
  name: {
    type: String,
    required: [true, 'نام الزامی است'],
    trim: true,
    maxlength: [100, 'نام حداکثر 100 کاراکتر است']
  },

  phone: {
    type: String,
    required: [true, 'شماره موبایل الزامی است'],
    trim: true,
    match: [/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد']
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'ایمیل نامعتبر است']
  },

  // احراز هویت
  password: {
    type: String,
    required: [true, 'رمز عبور الزامی است'],
    minlength: [6, 'رمز عبور حداقل 6 کاراکتر باشد'],
    select: false // به صورت پیش‌فرض در query ها نمایش داده نشود
  },

  // نقش‌ها
  role: {
    type: String,
    enum: ['owner', 'manager', 'staff'],
    default: 'staff'
  },

  // دسترسی‌ها
  permissions: {
    canManageStaff: {
      type: Boolean,
      default: false
    },
    canManageClients: {
      type: Boolean,
      default: true
    },
    canRegisterServices: {
      type: Boolean,
      default: true
    },
    canViewReports: {
      type: Boolean,
      default: false
    }
  },

  // آمار عملکرد
  stats: {
    totalServices: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    }
  },

  // وضعیت
  isActive: {
    type: Boolean,
    default: true
  },

  // آخرین ورود
  lastLogin: Date

}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Index ترکیبی برای جلوگیری از تکرار شماره موبایل در یک تنانت
staffSchema.index({ tenant: 1, phone: 1 }, { unique: true });

/**
 * Hash کردن رمز عبور قبل از ذخیره
 */
staffSchema.pre('save', async function(next) {
  // فقط اگر رمز عبور تغییر کرده باشد
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * مقایسه رمز عبور
 */
staffSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('خطا در مقایسه رمز عبور');
  }
};

/**
 * بررسی دسترسی
 */
staffSchema.methods.hasPermission = function(permission) {
  if (this.role === 'owner') return true;
  if (this.role === 'manager') return true;
  return this.permissions[permission] || false;
};

/**
 * تنظیم دسترسی‌های پیش‌فرض بر اساس نقش
 */
staffSchema.methods.setDefaultPermissions = function() {
  if (this.role === 'owner' || this.role === 'manager') {
    this.permissions = {
      canManageStaff: true,
      canManageClients: true,
      canRegisterServices: true,
      canViewReports: true
    };
  } else {
    this.permissions = {
      canManageStaff: false,
      canManageClients: true,
      canRegisterServices: true,
      canViewReports: false
    };
  }
};

module.exports = mongoose.model('Staff', staffSchema);
