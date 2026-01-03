const express = require('express');
const {
  getPublicStore,
  getPublicProfile
} = require('../controllers/public.controller');

const router = express.Router();

router.get('/store/:slug', getPublicStore);
router.get('/profile/:username', getPublicProfile);

module.exports = router;
