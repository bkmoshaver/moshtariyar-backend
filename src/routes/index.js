const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const clientRoutes = require('./client.routes');
const serviceRoutes = require('./service.routes');
const seedRoutes = require('./seed.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'سرور مشتریار در حال اجراست',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', userRoutes);           // ⬅ Login/Signup فقط User
router.use('/clients', clientRoutes);
router.use('/services', serviceRoutes);
router.use('/seed', seedRoutes);

module.exports = router;
