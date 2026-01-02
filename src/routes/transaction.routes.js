/**
 * Transaction Routes
 * مسیرهای مدیریت تراکنش‌ها
 */

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate, requireRole } = require('../middleware/auth');

// همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

/**
 * @route   GET /api/transactions/client/:clientId
 * @desc    دریافت تراکنش‌های یک مشتری
 * @access  Private (Admin, Staff)
 */
router.get('/client/:clientId', requireRole(['admin', 'staff']), transactionController.getClientTransactions);

/**
 * @route   POST /api/transactions
 * @desc    ثبت تراکنش جدید (افزایش/کاهش موجودی)
 * @access  Private (Admin, Staff)
 */
router.post('/', requireRole(['admin', 'staff']), transactionController.createTransaction);

module.exports = router;
