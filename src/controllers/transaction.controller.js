/**
 * Transaction Controller
 * کنترلر مدیریت تراکنش‌ها
 */

const Transaction = require('../models/transaction.model'); // مدل تراکنش (باید ساخته شود)
const Client = require('../models/Client');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    دریافت تراکنش‌های یک مشتری
 * @route   GET /api/transactions/client/:clientId
 * @access  Private (Admin, Staff)
 */
exports.getClientTransactions = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    // بررسی وجود مشتری
    const client = await Client.findById(clientId);
    if (!client) {
      return next(new ErrorResponse('مشتری یافت نشد', 404));
    }

    // اگر مدل تراکنش هنوز وجود ندارد، فعلاً آرایه خالی برگردانیم
    // تا زمانی که مدل تراکنش ساخته شود
    // const transactions = await Transaction.find({ client: clientId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    ثبت تراکنش جدید
 * @route   POST /api/transactions
 * @access  Private (Admin, Staff)
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const { clientId, amount, type, description } = req.body;

    // فعلاً فقط پیام موفقیت برمی‌گردانیم تا سرور کرش نکند
    // لاجیک اصلی بعداً اضافه می‌شود
    
    res.status(201).json({
      success: true,
      message: 'تراکنش با موفقیت ثبت شد (نسخه آزمایشی)',
      data: {
        clientId,
        amount,
        type,
        description,
        createdAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};
