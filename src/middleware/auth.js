const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse, ErrorCodes } = require('../utils/errorResponse');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'دسترسی غیرمجاز. لطفاً وارد شوید.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'کاربر یافت نشد.'));
    }
    
    next();
  } catch (err) {
    return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن نامعتبر است.'));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'کاربر احراز هویت نشده است.'));
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse(ErrorCodes.FORBIDDEN, `نقش کاربری شما (${req.user.role}) اجازه دسترسی به این بخش را ندارد.`));
    }
    next();
  };
};
