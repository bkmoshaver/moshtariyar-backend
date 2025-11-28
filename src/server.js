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

// ایجاد logger
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// ایجاد اپلیکیشن Express
const app = express();

// اتصال به دیتابیس
connectDB();

// Middleware های امنیتی
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3001', 'https://3001-igom1gnu03doppsyhtimu-646b2ab1.manusvm.computer', 'https://3000-igom1gnu03doppsyhtimu-646b2ab1.manusvm.computer'],
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
app.listen(PORT, () => {
  logger.info(`🚀 سرور مشتریار در حال اجرا بر روی پورت ${PORT}`);
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
