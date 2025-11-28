/**
 * Routes Index
 * تجمیع تمام مسیرها
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const clientRoutes = require('./client.routes');
const serviceRoutes = require('./service.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'سرور مشتریار در حال اجراست',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/services', serviceRoutes);

module.exports = router;
