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
    console.log('🔍 [GET-1] getSettings started');
    console.log('🔍 [GET-2] req.user:', req.user);
    console.log('🔍 [GET-3] req.userId:', req.userId);
    
    // برای MVP: از userId به عنوان tenant استفاده می‌کنیم
    const tenantId = req.user.tenant || req.userId;
    console.log('🔍 [GET-4] tenantId:', tenantId);
    
    console.log('🔍 [GET-5] Starting Settings.findOne...');
    let settings = await Settings.findOne({ tenant: tenantId });
    console.log('🔍 [GET-6] Settings.findOne completed. Found:', !!settings);
    
    // اگر تنظیمات وجود ندارد، با مقادیر پیش‌فرض بساز
    if (!settings) {
      console.log('🔍 [GET-7] Creating default settings...');
      settings = await Settings.create({
        tenant: tenantId,
        giftPercentage: 10,
        walletExpiryDays: 365,
        smsEnabled: true,
        smsOnService: true,
        smsOnWalletLow: false,
        businessName: 'مشتریار'
      });
      console.log('✅ [GET-8] Default settings created');
    }
    
    console.log('✅ [GET-9] Sending success response');
    return res.json(successResponse(settings, 'تنظیمات با موفقیت دریافت شد'));
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
    console.log('🔍 [1] updateSettings started');
    console.log('🔍 [2] req.user:', req.user);
    console.log('🔍 [3] req.userId:', req.userId);
    
    const tenantId = req.user.tenant || req.userId;
    console.log('🔍 [4] tenantId:', tenantId);
    
    const {
      giftPercentage,
      walletExpiryDays,
      smsEnabled,
      smsOnService,
      smsOnWalletLow,
      businessName
    } = req.body;
    
    console.log('🔍 [5] Request body:', req.body);
    
    // اعتبارسنجی
    if (giftPercentage !== undefined && (giftPercentage < 0 || giftPercentage > 100)) {
      console.log('❌ [6] Validation failed: giftPercentage');
      return errorResponse(res, 'درصد هدیه باید بین 0 تا 100 باشد', ErrorCodes.VALIDATION_ERROR);
    }
    
    if (walletExpiryDays !== undefined && walletExpiryDays < 1) {
      console.log('❌ [7] Validation failed: walletExpiryDays');
      return errorResponse(res, 'مدت اعتبار کیف پول باید حداقل 1 روز باشد', ErrorCodes.VALIDATION_ERROR);
    }
    
    console.log('🔍 [8] Starting Settings.findOne...');
    
    // پیدا کردن و به‌روزرسانی تنظیمات
    let settings = await Settings.findOne({ tenant: tenantId });
    
    console.log('🔍 [9] Settings.findOne completed. Found:', !!settings);
    
    if (!settings) {
      console.log('🔍 [10] Creating new settings...');
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
      console.log('✅ [11] New settings created');
    } else {
      console.log('🔍 [12] Updating existing settings...');
      // به‌روزرسانی تنظیمات موجود
      if (giftPercentage !== undefined) settings.giftPercentage = giftPercentage;
      if (walletExpiryDays !== undefined) settings.walletExpiryDays = walletExpiryDays;
      if (smsEnabled !== undefined) settings.smsEnabled = smsEnabled;
      if (smsOnService !== undefined) smsOnService : settings.smsOnService = smsOnService;
      if (smsOnWalletLow !== undefined) settings.smsOnWalletLow = smsOnWalletLow;
      if (businessName !== undefined) settings.businessName = businessName;
      
      console.log('🔍 [13] Calling settings.save()...');
      await settings.save();
      console.log('✅ [14] settings.save() completed');
    }
    
    console.log('✅ [15] Sending success response');
    return res.json(successResponse(settings, 'تنظیمات با موفقیت به‌روزرسانی شد'));
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی تنظیمات:', error);
    console.error('❌ Error stack:', error.stack);
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
