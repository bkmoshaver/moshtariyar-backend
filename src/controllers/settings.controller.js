/**
 * Settings Controller
 * کنترلر مدیریت تنظیمات
 */

const Settings = require('../models/Settings');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * دریافت تنظیمات
 * GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const tenantId = req.user.tenant;
    
    let settings = await Settings.findOne({ tenant: tenantId });
    
    // اگر تنظیمات وجود ندارد، با مقادیر پیش‌فرض بساز
    if (!settings) {
      settings = await Settings.create({
        tenant: tenantId,
        giftPercentage: 10,
        walletExpiryDays: 365,
        smsEnabled: true,
        smsOnService: true,
        smsOnWalletLow: false,
        businessName: 'مشتریار'
      });
    }
    
    return successResponse(res, settings, 'تنظیمات با موفقیت دریافت شد');
  } catch (error) {
    console.error('❌ خطا در دریافت تنظیمات:', error);
    next(error);
  }
};

/**
 * به‌روزرسانی تنظیمات
 * PUT /api/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const tenantId = req.user.tenant;
    const {
      giftPercentage,
      walletExpiryDays,
      smsEnabled,
      smsOnService,
      smsOnWalletLow,
      businessName
    } = req.body;
    
    // اعتبارسنجی
    if (giftPercentage !== undefined && (giftPercentage < 0 || giftPercentage > 100)) {
      return errorResponse(res, 'درصد هدیه باید بین 0 تا 100 باشد', ErrorCodes.VALIDATION_ERROR);
    }
    
    if (walletExpiryDays !== undefined && walletExpiryDays < 1) {
      return errorResponse(res, 'مدت اعتبار کیف پول باید حداقل 1 روز باشد', ErrorCodes.VALIDATION_ERROR);
    }
    
    // پیدا کردن و به‌روزرسانی تنظیمات
    let settings = await Settings.findOne({ tenant: tenantId });
    
    if (!settings) {
      // ساخت تنظیمات جدید
      settings = await Settings.create({
        tenant: tenantId,
        giftPercentage: giftPercentage || 10,
        walletExpiryDays: walletExpiryDays || 365,
        smsEnabled: smsEnabled !== undefined ? smsEnabled : true,
        smsOnService: smsOnService !== undefined ? smsOnService : true,
        smsOnWalletLow: smsOnWalletLow !== undefined ? smsOnWalletLow : false,
        businessName: businessName || 'مشتریار'
      });
    } else {
      // به‌روزرسانی تنظیمات موجود
      if (giftPercentage !== undefined) settings.giftPercentage = giftPercentage;
      if (walletExpiryDays !== undefined) settings.walletExpiryDays = walletExpiryDays;
      if (smsEnabled !== undefined) settings.smsEnabled = smsEnabled;
      if (smsOnService !== undefined) settings.smsOnService = smsOnService;
      if (smsOnWalletLow !== undefined) settings.smsOnWalletLow = smsOnWalletLow;
      if (businessName !== undefined) settings.businessName = businessName;
      
      await settings.save();
    }
    
    return successResponse(res, settings, 'تنظیمات با موفقیت به‌روزرسانی شد');
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی تنظیمات:', error);
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
