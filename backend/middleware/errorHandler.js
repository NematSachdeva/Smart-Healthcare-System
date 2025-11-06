/**
 * Custom Error Class for Operational Errors
 * Extends the built-in Error class with additional properties
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized Error Handler Middleware
 * Catches all errors and formats them into consistent responses
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Set default values if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging purposes
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥:', {
      message: err.message,
      statusCode: err.statusCode,
      status: err.status,
      isOperational: err.isOperational,
      stack: err.stack,
      error: err
    });
  } else {
    // In production, log less verbose information
    console.error('ERROR:', {
      message: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Distinguish between operational and programming errors
  if (err.isOperational) {
    // Operational, trusted error: send message to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('PROGRAMMING ERROR 💥:', err);
    
    res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Something went wrong on the server'
    });
  }
};

/**
 * Handle specific error types and convert them to AppError
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = '${value}'. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again', 401);
};

/**
 * Enhanced error handler that processes specific error types
 */
const errorHandlerWithTypes = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;
  error.isOperational = err.isOperational;

  // Handle specific MongoDB errors
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Use the base error handler
  errorHandler(error, req, res, next);
};

module.exports = {
  AppError,
  errorHandler: errorHandlerWithTypes
};
