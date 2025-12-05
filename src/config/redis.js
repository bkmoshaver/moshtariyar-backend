const Redis = require('ioredis');

let redisConnection = null;

// فقط اگر REDIS_URL موجود باشد، اتصال برقرار کن
if (process.env.REDIS_URL) {
  try {
    redisConnection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redisConnection.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisConnection.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      // Don't crash - just log the error
    });
  } catch (error) {
    console.warn('⚠️  Redis initialization failed:', error.message);
    redisConnection = null;
  }
} else {
  console.log('ℹ️  Redis disabled - SMS will be sent directly');
}

module.exports = redisConnection;
