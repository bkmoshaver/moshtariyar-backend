const { Queue } = require('bullmq');
const redisConnection = require('./redis');

let smsQueue = null;

// فقط اگر Redis موجود باشد، Queue ایجاد کن
if (redisConnection) {
  try {
    smsQueue = new Queue('sms', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          count: 100,
          age: 24 * 3600, // 24 hours
        },
        removeOnFail: {
          count: 1000,
        },
      },
    });

    smsQueue.on('error', (err) => {
      console.error('❌ SMS Queue error:', err.message);
    });

    console.log('✅ SMS Queue initialized');
  } catch (error) {
    console.warn('⚠️  SMS Queue initialization failed:', error.message);
    smsQueue = null;
  }
} else {
  console.log('ℹ️  SMS Queue disabled - messages will be sent directly');
}

module.exports = {
  smsQueue,
};
