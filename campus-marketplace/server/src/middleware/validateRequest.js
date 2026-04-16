const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array();
  const primaryMessage = details[0]?.msg || 'Validation failed';
  return next(new AppError(primaryMessage, 400, details));
}

module.exports = validateRequest;
