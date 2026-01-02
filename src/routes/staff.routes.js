/**
 * Staff Routes
 * مسیرهای مدیریت پرسنل
 */

const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

// اعتبارسنجی افزودن پرسنل
const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    email: z.string().email(),
    password: z.string().min(6)
  })
});

// همه مسیرها نیاز به احراز هویت و نقش مدیر مجموعه دارند
router.use(authenticate);
router.use(requireRole(['tenant_admin']));

router.get('/', staffController.getStaff);
router.post('/', validate(createStaffSchema), staffController.createStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
