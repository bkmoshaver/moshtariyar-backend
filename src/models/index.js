/**
 * Models Index
 * Export تمام مدل‌ها از یک فایل
 */

const Tenant = require('./Tenant');
const Staff = require('./Staff');
const Client = require('./Client');
const Service = require('./Service');
const Settings = require('./Settings');
const Transaction = require('./transaction.model'); // فایلی که من دادم این نام را داشت

module.exports = {
  Tenant,
  Staff,
  Client,
  Service,
  Settings,
  Transaction
};
