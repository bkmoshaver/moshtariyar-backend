/**
 * Settings Model
 * مدل تنظیمات سیستم
 */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true
  },
  
  // تنظیمات هدیه
  giftPercentage: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  
  // تنظیمات کیف پول
  walletExpiryDays: {
    type: Number,
    default: 365,
    min: 1
  },
  
  // تنظیمات پیامک
  smsEnabled: {
    type: Boolean,
    default: true
  },
  smsOnService: {
    type: Boolean,
    default: true
  },
  smsOnWalletLow: {
    type: Boolean,
    default: false
  },
  businessName: {
    type: String,
    default: 'مشتریار'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
