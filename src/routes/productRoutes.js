const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getPublicProducts 
} = require('../controllers/productController');

// Public routes
router.get('/public/:slug', getPublicProducts);

// Protected routes
router.use(protect);
router.get('/', getProducts);
router.post('/', authorize('tenant_admin', 'staff'), createProduct);
router.put('/:id', authorize('tenant_admin', 'staff'), updateProduct);
router.delete('/:id', authorize('tenant_admin', 'staff'), deleteProduct);

module.exports = router;
