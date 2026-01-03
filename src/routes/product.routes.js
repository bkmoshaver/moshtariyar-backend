const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPublicProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for fetching products by store slug
router.get('/public/:slug', getPublicProducts);

// Protect all other routes
router.use(protect);
router.use(authorize('tenant_admin', 'super_admin', 'staff'));

router
  .route('/')
  .get(getProducts)
  .post(createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
