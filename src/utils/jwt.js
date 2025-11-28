/**
 * JWT Utility
 * مدیریت توکن‌های JWT
 */

const jwt = require('jsonwebtoken');

/**
 * ساخت Access Token
 * @param {Object} payload - اطلاعات برای قرار دادن در توکن
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * ساخت Refresh Token
 * @param {Object} payload - اطلاعات برای قرار دادن در توکن
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * تأیید Access Token
 * @param {string} token
 * @returns {Object}
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('توکن نامعتبر یا منقضی شده است');
  }
};

/**
 * تأیید Refresh Token
 * @param {string} token
 * @returns {Object}
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('توکن نامعتبر یا منقضی شده است');
  }
};

/**
 * استخراج توکن از هدر Authorization
 * @param {string} authHeader
 * @returns {string|null}
 */
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractToken
};
