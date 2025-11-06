/**
 * Example Usage of AppError and Error Handler
 * 
 * This file demonstrates how to use the centralized error handling
 * in controllers and routes.
 */

const { AppError } = require('./errorHandler');

// Example 1: Using AppError in a controller
const exampleController = async (req, res, next) => {
  try {
    // Your business logic here
    const user = await User.findById(req.params.id);
    
    if (!user) {
      // Throw operational error with appropriate status code
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    // Pass any unexpected errors to error handler
    next(error);
  }
};

// Example 2: Validation error
const createUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }
    
    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already exists', 409));
    }
    
    // Create user...
    res.status(201).json({
      status: 'success',
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Example 3: Authorization error
const protectedRoute = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }
    
    if (req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    // Proceed with protected logic...
  } catch (error) {
    next(error);
  }
};

// Example 4: Async error wrapper (optional utility)
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Using catchAsync wrapper
const getUserController = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * Integration in server.js (will be done in task 11):
 * 
 * const express = require('express');
 * const { errorHandler } = require('./middleware/errorHandler');
 * 
 * const app = express();
 * 
 * // ... other middleware and routes ...
 * 
 * // Error handler must be registered LAST, after all routes
 * app.use(errorHandler);
 */

module.exports = {
  exampleController,
  createUserController,
  protectedRoute,
  catchAsync
};
