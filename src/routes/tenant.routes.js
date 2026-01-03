const express = require('express');
const {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  getMyTenant,
  updateMyTenant
} = require('../controllers/tenant.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// /me routes must come BEFORE /:id routes to avoid conflict
router
  .route('/me')
  .get(getMyTenant)
  .put(updateMyTenant);

router
  .route('/')
  .get(authorize('super_admin'), getTenants)
  .post(authorize('super_admin'), createTenant);

router
  .route('/:id')
  .get(authorize('super_admin', 'tenant_admin'), getTenant)
  .put(authorize('super_admin', 'tenant_admin'), updateTenant)
  .delete(authorize('super_admin'), deleteTenant);

module.exports = router;
