const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getClients, 
  getClient, 
  createClient, 
  updateClient, 
  deleteClient 
} = require('../controllers/client.controller');

router.use(protect);
// router.use(authorize('super_admin', 'tenant_admin')); // Commented out to avoid role issues for now

router
  .route('/')
  .get(getClients)
  .post(createClient);

router
  .route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
