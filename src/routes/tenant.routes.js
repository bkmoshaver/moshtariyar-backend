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
router.use(authorize('super_admin'));

router
  .route('/')
  .get(getTenants)
  .post(createTenant);

router
  .route('/:id')
  .get(getTenant)
  .put(updateTenant)
  .delete(deleteTenant);

module.exports = router;
