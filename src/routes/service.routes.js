/**
 * Service Routes
 * مسیرهای مدیریت سرویس‌ها
 */

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createServiceSchema, getServicesSchema } = require('../validators/service.validator');

// تمام مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

/**
 * @route   GET /api/services
 * @desc    دریافت لیست سرویس‌ها
 * @access  Private
 */
router.get('/', validate(getServicesSchema), serviceController.getServices);

/**
 * @route   GET /api/services/:id
 * @desc    دریافت یک سرویس
 * @access  Private
 */
router.get('/:id', serviceController.getService);

/**
 * @route   POST /api/services
 * @desc    ثبت سرویس جدید
 * @access  Private (canRegisterServices)
 */
router.post(
  '/',
  requireRole(['admin', 'staff']),
  validate(createServiceSchema),
  serviceController.createService
);

/**
 * @route   DELETE /api/services/:id
 * @desc    حذف سرویس
 * @access  Private (owner/manager)
 */
router.delete('/:id', requireRole(['admin']), serviceController.deleteService);

module.exports = router;
