const express = require('express');
const {
  getOrders,
  createOrder,
  updateOrderStatus
} = require('../controllers/order.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('tenant_admin', 'super_admin', 'staff'));

router
  .route('/')
  .get(getOrders)
  .post(createOrder);

router
  .route('/:id/status')
  .patch(updateOrderStatus);

module.exports = router;
