/**
 * Client Model
 * مدل مشتری - هر مشتری متعلق به یک تنانت است
 */

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // ارتباط با تنانت (اختیاری برای User model، الزامی برای Staff model)
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false,
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

  // یادداشت‌ها
  notes: {
    type: String,
    maxlength: [500, 'یادداشت حداکثر 500 کاراکتر است']
  },

  // اطلاعات مالی
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    totalGifts: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },

  // آمار
  stats: {
    totalVisits: {
      type: Number,
      default: 0
    },
    lastVisit: Date,
    totalServices: {
      type: Number,
      default: 0
    },
    averageSpending: {
      type: Number,
      default: 0
    }
  },

  // وضعیت
  isActive: {
    type: Boolean,
    default: true
  },

  // تگ‌ها برای دسته‌بندی
  tags: [{
    type: String,
    trim: true
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index ترکیبی برای جلوگیری از تکرار شماره موبایل در یک تنانت
clientSchema.index({ tenant: 1, phone: 1 }, { unique: true });
clientSchema.index({ tenant: 1, name: 1 });
clientSchema.index({ tenant: 1, 'wallet.balance': -1 });

/**
 * افزودن موجودی هدیه
 */
clientSchema.methods.addGift = function(amount) {
  this.wallet.balance += amount;
  this.wallet.totalGifts += amount;
};

/**
 * کسر از موجودی
 */
clientSchema.methods.deductBalance = function(amount) {
  if (this.wallet.balance < amount) {
    throw new Error('موجودی کافی نیست');
  }
  this.wallet.balance -= amount;
};

/**
 * به‌روزرسانی آمار بعد از سرویس
 */
clientSchema.methods.updateAfterService = function(serviceAmount) {
  this.stats.totalVisits += 1;
  this.stats.lastVisit = new Date();
  this.stats.totalServices += 1;
  this.wallet.totalSpent += serviceAmount;
  
  // محاسبه میانگین خرید
  this.stats.averageSpending = Math.floor(this.wallet.totalSpent / this.stats.totalServices);
};

/**
 * بررسی مشتری VIP
 */
clientSchema.methods.isVIP = function() {
  return this.stats.totalVisits >= 10 || this.wallet.totalSpent >= 1000000;
};

module.exports = mongoose.model('Client', clientSchema);
