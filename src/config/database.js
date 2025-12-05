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
    logger.info('🔍 Connecting to MongoDB...');
    logger.info(`🔍 MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
    logger.info(`🔍 MONGODB_URI length: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0}`);
    logger.info(`🔍 MONGODB_URI value: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'EMPTY'}`);
    
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
    logger.error('❌ خطا در اتصال به MongoDB:');
    logger.error('🔍 Full error object:', JSON.stringify(error, null, 2));
    logger.error('🔍 Error message:', error ? error.message : 'NO ERROR OBJECT');
    logger.error('📍 MongoDB URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@') : 'NOT SET');
    logger.error('🔍 Error code:', error ? error.code : 'N/A');
    logger.error('🔍 Error name:', error ? error.name : 'N/A');
    if (error && error.stack) {
      logger.error('🔍 Stack:', error.stack);
    }
    // Don't exit - let Railway restart
    // process.exit(1);
  }
};

module.exports = connectDB;
