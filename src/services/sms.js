const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.sender = process.env.SMS_SENDER;
    this.baseUrl = 'https://rest.payamak-panel.com/api/SendSMS';
  }

  /**
   * Send SMS via Melipayamak
   * @param {string} phone - Recipient phone number
   * @param {string} text - Message text
   * @returns {Promise<Object>} Response from SMS provider
   */
  async send(phone, text) {
    try {
      if (!this.apiKey || !this.sender) {
        throw new Error('SMS credentials not configured. Check SMS_API_KEY and SMS_SENDER in .env');
      }

      // Melipayamak REST API
      const response = await axios.post(`${this.baseUrl}/SendSMS`, {
        username: this.apiKey.split(':')[0], // Format: username:password
        password: this.apiKey.split(':')[1],
        to: phone,
        from: this.sender,
        text: text,
        isFlash: false,
      });

      console.log(`✅ SMS sent to ${phone}:`, response.data);
      
      return {
        success: true,
        messageId: response.data.Value,
        provider: 'melipayamak',
      };
    } catch (error) {
      console.error(`❌ SMS send failed to ${phone}:`, error.message);
      
      // Don't throw error - just log it
      return {
        success: false,
        error: error.message,
        provider: 'melipayamak',
      };
    }
  }

  /**
   * Format service notification SMS
   */
  formatServiceSMS({ name, amount, gift, balance, businessName = 'مشتریار' }) {
    return `سلام ${name} عزیز 🌟
ممنون بابت مراجعه‌تون
مبلغ خدمت: ${amount.toLocaleString('fa-IR')} تومان
هدیه جدید: ${gift.toLocaleString('fa-IR')} تومان
موجودی کیف پول: ${balance.toLocaleString('fa-IR')} تومان
منتظر دیدارتون هستیم ❤️
${businessName}`;
  }

  /**
   * Format survey SMS
   */
  formatSurveySMS({ name, surveyLink, businessName = 'مشتریار' }) {
    return `${name} عزیز،
از خدمات ما راضی بودید؟
لطفاً نظر خود را ثبت کنید:
${surveyLink}
${businessName}`;
  }
}

module.exports = new SMSService();
