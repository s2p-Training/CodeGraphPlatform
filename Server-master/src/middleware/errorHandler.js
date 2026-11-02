const { NODE_ENV } = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message });
  }

  // Duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Invalid ObjectId cast
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({ message: 'Resource not found' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
