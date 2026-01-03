const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/service.controller');

// Import middleware using destructuring to ensure compatibility
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
router.use(authorize('tenant_admin', 'super_admin'));

router
  .route('/')
  .get(getServices)
  .post(createService);

router
  .route('/:id')
  .get(getService)
  .put(updateService)
  .delete(deleteService);

module.exports = router;
