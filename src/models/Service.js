/**
 * Service Model
 * مدل سرویس - ثبت خدمات ارائه شده به مشتریان
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // ارتباط با تنانت (optional for User MVP)
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false,
    index: true
  },

  // ارتباط با مشتری
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'مشتری الزامی است'],
    index: true
  },

  // ارتباط با کارمند ثبت‌کننده (optional for User MVP)
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false,
    index: true
  },

  // اطلاعات سرویس
  title: {
    type: String,
    required: [true, 'عنوان سرویس الزامی است'],
    trim: true,
    maxlength: [200, 'عنوان حداکثر 200 کاراکتر است']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'توضیحات حداکثر 1000 کاراکتر است']
  },

  // اطلاعات مالی
  amount: {
    type: Number,
    required: [true, 'مبلغ الزامی است'],
    min: [0, 'مبلغ نمی‌تواند منفی باشد']
  },

  // هدیه
  gift: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    applied: {
      type: Boolean,
      default: false
    }
  },

  // استفاده از موجودی کیف پول
  walletUsed: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    applied: {
      type: Boolean,
      default: false
    }
  },

  // مبلغ نهایی پرداختی (auto-calculated)
  finalAmount: {
    type: Number,
    required: false,
    min: 0
  },

  // تاریخ و زمان سرویس
  serviceDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  // یادداشت‌ها
  notes: {
    type: String,
    maxlength: [500, 'یادداشت حداکثر 500 کاراکتر است']
  },

  // وضعیت
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'pending'],
    default: 'completed'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes برای جستجو و گزارش‌گیری
serviceSchema.index({ tenant: 1, serviceDate: -1 });
serviceSchema.index({ tenant: 1, client: 1, serviceDate: -1 });
serviceSchema.index({ tenant: 1, staff: 1, serviceDate: -1 });
serviceSchema.index({ tenant: 1, status: 1 });

/**
 * محاسبه خودکار مبلغ نهایی قبل از ذخیره
 */
serviceSchema.pre('save', function(next) {
  // مبلغ نهایی = مبلغ اصلی - استفاده از کیف پول
  this.finalAmount = this.amount - (this.walletUsed.amount || 0);
  
  // اطمینان از اینکه مبلغ نهایی منفی نشود
  if (this.finalAmount < 0) {
    this.finalAmount = 0;
  }
  
  next();
});

/**
 * محاسبه سود خالص
 */
serviceSchema.methods.getNetProfit = function() {
  return this.finalAmount - (this.gift.amount || 0);
};

/**
 * Virtual برای نمایش اطلاعات کامل
 */
serviceSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    title: this.title,
    amount: this.amount,
    gift: this.gift.amount,
    walletUsed: this.walletUsed.amount,
    finalAmount: this.finalAmount,
    netProfit: this.getNetProfit(),
    date: this.serviceDate
  };
});

module.exports = mongoose.model('Service', serviceSchema);
