/**
 * Database Configuration
 * مدیریت اتصال به MongoDB
 */

const mongoose = require('mongoose');
const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

/**
 * اتصال به MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // تنظیمات پیشنهادی برای production
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB متصل شد: ${conn.connection.host}`);
    
    // مدیریت خطاهای اتصال
    mongoose.connection.on('error', (err) => {
      logger.error('❌ خطای MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB قطع شد');
    });

  } catch (error) {
    logger.error('❌ خطا در اتصال به MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
