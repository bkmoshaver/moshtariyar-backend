const express = require('express');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/client.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('tenant_admin', 'super_admin', 'staff'));

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
