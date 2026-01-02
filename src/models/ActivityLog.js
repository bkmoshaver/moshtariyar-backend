/**
 * Activity Log Model
 * ثبت فعالیت‌های مهم کاربران در سیستم
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false // برخی فعالیت‌ها ممکن است مربوط به کل سیستم باشند
  },

  action: {
    type: String,
    required: true,
    trim: true
  },

  details: {
    type: String,
    required: false
  },

  ipAddress: {
    type: String,
    required: false
  },

  userAgent: {
    type: String,
    required: false
  },

  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  }

}, {
  timestamps: true
});

// ایندکس برای جستجوی سریع
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ tenant: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
