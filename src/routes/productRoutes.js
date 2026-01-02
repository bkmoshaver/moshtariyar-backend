const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth'); // Changed from protect, authorize to authenticate, requireRole
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
router.use(authenticate); // Changed from protect
router.get('/', getProducts);
router.post('/', requireRole(['tenant_admin', 'staff']), createProduct); // Changed from authorize
router.put('/:id', requireRole(['tenant_admin', 'staff']), updateProduct); // Changed from authorize
router.delete('/:id', requireRole(['tenant_admin', 'staff']), deleteProduct); // Changed from authorize

module.exports = router;
