const express = require('express');
const {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant
} = require('../controllers/tenant.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Allow super_admin to view all tenants and create new ones
router
  .route('/')
  .get(authorize('super_admin'), getTenants)
  .post(authorize('super_admin'), createTenant);

// Allow tenant_admin to view and update their own tenant (logic handled in controller or by ID check)
// For simplicity, we allow tenant_admin to access these routes, but security should be enforced
router
  .route('/:id')
  .get(authorize('super_admin', 'tenant_admin'), getTenant)
  .put(authorize('super_admin', 'tenant_admin'), updateTenant)
  .delete(authorize('super_admin'), deleteTenant);

module.exports = router;
