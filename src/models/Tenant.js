/**
 * Tenant Model
 * مدل کسب‌وکار (تنانت) - هر کسب‌وکار یک تنانت مجزا است
 */

const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  // اطلاعات اصلی کسب‌وکار
  name: {
    type: String,
    required: [true, 'نام کسب‌وکار الزامی است'],
    trim: true,
    maxlength: [100, 'نام کسب‌وکار حداکثر 100 کاراکتر است']
  },

  // پلن اشتراک
  plan: {
    type: {
      type: String,
      enum: ['free', 'basic', 'pro', 'premium'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },

  // تنظیمات سیستم هدیه
  giftSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    percentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    },
    expireDays: {
      type: Number,
      default: 30,
      min: 1
    }
  },

  // تنظیمات ظاهری
  branding: {
    logo: String,
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#10B981'
    }
  },

  // آمار
  stats: {
    totalClients: {
      type: Number,
      default: 0
    },
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
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index برای جستجو
tenantSchema.index({ name: 1 });
tenantSchema.index({ 'plan.expiresAt': 1 });

/**
 * بررسی محدودیت‌های پلن
 */
tenantSchema.methods.getPlanLimits = function() {
  const limits = {
    free: {
      maxClients: 100,
      maxStaff: 2,
      features: ['basic_crm']
    },
    basic: {
      maxClients: 500,
      maxStaff: 5,
      features: ['basic_crm', 'gift_system', 'sms']
    },
    pro: {
      maxClients: 2000,
      maxStaff: 20,
      features: ['basic_crm', 'gift_system', 'sms', 'analytics', 'api']
    },
    premium: {
      maxClients: Infinity,
      maxStaff: Infinity,
      features: ['all']
    }
  };

  return limits[this.plan.type] || limits.free;
};

/**
 * بررسی انقضای اشتراک
 */
tenantSchema.methods.isExpired = function() {
  return new Date() > this.plan.expiresAt;
};

/**
 * محاسبه مبلغ هدیه
 */
tenantSchema.methods.calculateGift = function(serviceAmount) {
  if (!this.giftSettings.enabled) return 0;
  return Math.floor(serviceAmount * this.giftSettings.percentage / 100);
};

module.exports = mongoose.model('Tenant', tenantSchema);
