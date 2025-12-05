const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const smsService = require('../services/sms');

// SMS Worker
const smsWorker = new Worker(
  'sms',
  async (job) => {
    const { type, data } = job.data;

    console.log(`🔄 Processing SMS job: ${type} for ${data.phone}`);

    try {
      let message;

      switch (type) {
        case 'IMMEDIATE_SMS':
          // Service notification SMS
          message = smsService.formatServiceSMS({
            name: data.name,
            amount: data.amount,
            gift: data.gift,
            balance: data.balance,
            businessName: data.businessName,
          });
          break;

        case 'DELAYED_SURVEY_SMS':
          // Survey SMS (sent 60 minutes after service)
          message = smsService.formatSurveySMS({
            name: data.name,
            surveyLink: data.surveyLink,
            businessName: data.businessName,
          });
          break;

        default:
          throw new Error(`Unknown SMS job type: ${type}`);
      }

      // Send SMS
      const result = await smsService.send(data.phone, message);

      if (result.success) {
        console.log(`✅ SMS sent successfully: ${type} to ${data.phone}`);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`❌ SMS job failed: ${type} for ${data.phone}`, error);
      throw error; // Will trigger retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 SMS jobs simultaneously
  }
);

smsWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

smsWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

smsWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('🚀 SMS Worker started and listening for jobs...');

module.exports = smsWorker;
