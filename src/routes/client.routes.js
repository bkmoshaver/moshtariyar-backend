/**
 * Client Routes
 * مسیرهای مدیریت مشتریان
 */

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate'); // ← ← این اصلاح شد
const { 
  createClientSchema, 
  updateClientSchema, 
  addBalanceSchema 
} = require('../validators/client.validator');

// تمام مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

/**
 * @route   GET /api/clients
 * @desc    دریافت لیست مشتریان
 * @access  Private
 */
router.get('/', clientController.getClients);

/**
 * @route   GET /api/clients/:id
 * @desc    دریافت یک مشتری
 * @access  Private
 */
router.get('/:id', clientController.getClient);

/**
 * @route   POST /api/clients
 * @desc    ایجاد مشتری جدید
 * @access  Private (canManageClients)
 */
router.post(
  '/',
  requirePermission('canManageClients'),
  validate(createClientSchema),
  clientController.createClient
);

/**
 * @route   PUT /api/clients/:id
 * @desc    به‌روزرسانی مشتری
 * @access  Private (canManageClients)
 */
router.put(
  '/:id',
  requirePermission('canManageClients'),
  validate(updateClientSchema),
  clientController.updateClient
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    حذف مشتری
 * @access  Private (canManageClients)
 */
router.delete(
  '/:id',
  requirePermission('canManageClients'),
  clientController.deleteClient
);

/**
 * @route   POST /api/clients/:id/balance
 * @desc    افزودن موجودی دستی
 * @access  Private (owner/manager)
 */
router.post(
  '/:id/balance',
  requirePermission('canManageClients'),
  validate(addBalanceSchema),
  clientController.addBalance
);

module.exports = router;
/**
 
 * @desc    تراکنش کیف پول
router.get('/:clientId/transactions', transactionController.getClientTransactions);

