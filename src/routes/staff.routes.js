const express = require('express');
const {
  getStaff,
  createStaff,
  deleteStaff,
  updateStaffRole
} = require('../controllers/staff.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('tenant_admin', 'super_admin'));

router
  .route('/')
  .get(getStaff)
  .post(createStaff);

router
  .route('/:id')
  .delete(deleteStaff);

router
  .route('/:id/role')
  .patch(updateStaffRole);

module.exports = router;
