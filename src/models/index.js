/**
 * Models Index
 * Export تمام مدل‌ها از یک فایل
 */

const Tenant = require('./Tenant');
const Staff = require('./Staff');
const Client = require('./Client');
const Service = require('./Service');

module.exports = {
  Tenant,
  Staff,
  Client,
  Service
};
