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
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  keepAlive: true,
  keepAliveInitialDelay: 300000
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
    console.error('\n=== MONGODB CONNECTION ERROR ===');
    console.error('Raw error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error ? error.constructor.name : 'N/A');
    console.error('Error message:', error ? error.message : 'NO MESSAGE');
    console.error('Error code:', error ? error.code : 'NO CODE');
    console.error('Error name:', error ? error.name : 'NO NAME');
    console.error('MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@') : 'NOT SET');
    console.error('================================\n');
    // Don't exit - let Railway restart
    // process.exit(1);
  }
};

module.exports = connectDB;
