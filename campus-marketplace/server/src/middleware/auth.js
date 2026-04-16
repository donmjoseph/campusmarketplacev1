const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { jwtSecret } = require('../config/env');

async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.userId);

    if (!user) {
      return next(new AppError('Invalid authentication token', 401));
    }

    if (user.status === 'suspended') {
      return next(new AppError('Your account is suspended. Contact support.', 403));
    }

    req.user = user;
    return next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
}

async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.userId);
    if (user && user.status !== 'suspended') {
      req.user = user;
    }
    return next();
  } catch {
    return next();
  }
}

function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission for this action', 403));
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
};
