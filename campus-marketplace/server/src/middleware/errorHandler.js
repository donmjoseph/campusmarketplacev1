const { nodeEnv } = require('../config/env');

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (err.details) {
    response.details = err.details;
  }

  if (nodeEnv !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
