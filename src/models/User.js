/**
 * User Model
 * مدل کاربر - برای احراز هویت ساده
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام الزامی است'],
    trim: true,
    maxlength: [100, 'نام حداکثر 100 کاراکتر است']
  },

  email: {
    type: String,
    required: [true, 'ایمیل الزامی است'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'ایمیل نامعتبر است']
  },

  password: {
    type: String,
    required: [true, 'رمز عبور الزامی است'],
    minlength: [6, 'رمز عبور حداقل 6 کاراکتر باشد'],
    select: false
  },

  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و زیرخط باشد']
  },

  bio: {
    type: String,
    maxlength: [500, 'بیوگرافی حداکثر 500 کاراکتر است'],
    default: ''
  },

  links: [{
    title: String,
    url: String,
    icon: String,
    active: { type: Boolean, default: true }
  }],

  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'staff', 'client', 'user'], // user & admin kept for backward compatibility
    default: 'tenant_admin'
  },

  // ارتباط با مجموعه (برای Super Admin خالی است)
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: function() {
      // برای نقش‌های وابسته به مجموعه، این فیلد الزامی است
      return ['tenant_admin', 'staff'].includes(this.role);
    }
  }

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

/**
 * Hash کردن رمز عبور قبل از ذخیره
 */
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('خطا در مقایسه رمز عبور');
  }
};

module.exports = mongoose.model('User', userSchema);
