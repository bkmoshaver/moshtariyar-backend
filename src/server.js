/**
 * Server Entry Point
 * نقطه ورود اصلی برنامه
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pino = require('pino');
const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const redisConnection = require('./config/redis');
const { smsQueue } = require('./config/queue');

// ایجاد logger
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Debug: نمایش environment variables
logger.info('🔍 Environment Variables Debug:');
logger.info(`MONGODB_URI: ${process.env.MONGODB_URI ? 'SET (length: ' + process.env.MONGODB_URI.length + ')' : 'NOT SET'}`);
logger.info(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`PORT: ${process.env.PORT}`);
logger.info(`SMS_API_KEY: ${process.env.SMS_API_KEY ? 'SET' : 'NOT SET'}`);
logger.info(`SMS_SENDER: ${process.env.SMS_SENDER ? 'SET' : 'NOT SET'}`);
logger.info('---')

// ایجاد اپلیکیشن Express
const app = express();

// اتصال به دیتابیس
connectDB();

// اتصال به Redis و Queue (اختیاری)
if (redisConnection) {
  redisConnection.on('ready', () => {
    logger.info('✅ Redis connected and ready');
  });
  
  if (smsQueue) {
    logger.info('📬 BullMQ Queue initialized');
  }
} else {
  logger.warn('⚠️  Redis not configured - SMS will be sent directly');
}

// Middleware های امنیتی
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://3000-ilaald7gzmqr9doccfi5v-370c944c.manusvm.computer',
    'https://3001-igom1gnu03doppsyhtimu-646b2ab1.manusvm.computer',
    'https://3000-igom1gnu03doppsyhtimu-646b2ab1.manusvm.computer'
  ],
  credentials: true
}));

// Middleware های پردازش داده
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// لاگ درخواست‌ها
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', routes);

// Static files (برای سرو کردن فرانت‌اند)
// app.use(express.static('public'));

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ⬅ برای Railway باید به همه interface ها گوش دهد

app.listen(PORT, HOST, () => {
  logger.info(`🚀 سرور مشتریار در حال اجرا بر روی ${HOST}:${PORT}`);
  logger.info(`📝 محیط: ${process.env.NODE_ENV || 'development'}`);
});

// مدیریت خطاهای غیرمنتظره
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error(err.stack);
  process.exit(1);
});

module.exports = app;
