const express = require('express');
const {
  getSettings,
  updateSettings
} = require('../controllers/settings.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSettings)
  .put(authorize('tenant_admin', 'super_admin'), updateSettings);

module.exports = router;
