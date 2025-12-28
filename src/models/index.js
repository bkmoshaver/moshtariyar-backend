/**
 * Models Index
 * Export تمام مدل‌ها از یک فایل
 */

const Client = require('./client.model');
const Service = require('./service.model');
const Tenant = require('./tenant.model');
const User = require('./user.model');
const Settings = require('./settings.model');
const Transaction = require('./transaction.model');

module.exports = {
  Client,
  Service,
  Tenant,
  User,
  Settings,
  Transaction
};
