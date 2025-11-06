const { body, validationResult } = require('express-validator');

/**
 * Input Validation Middleware using express-validator
 * Defines validation rules for various endpoints
 * Returns 400 error with validation messages for invalid input
 * 
 * Requirements: 15.1, 15.2
 */

/**
 * Middleware to check validation results and return errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for patient registration
 */
const validatePatientRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 0, max: 150 }).withMessage('Age must be a valid number between 0 and 150'),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Phone number must contain only valid characters'),
  
  body('medicalHistory')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Medical history must not exceed 2000 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for doctor registration
 */
const validateDoctorRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required')
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be between 2 and 100 characters'),
  
  body('availability')
    .optional()
    .isArray().withMessage('Availability must be an array'),
  
  body('availability.*.day')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Day must be a valid day of the week'),
  
  body('availability.*.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  
  body('availability.*.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  
  handleValidationErrors
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for appointment booking
 */
const validateAppointmentBooking = [
  body('doctorId')
    .notEmpty().withMessage('Doctor ID is required')
    .isMongoId().withMessage('Doctor ID must be a valid ID'),
  
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),
  
  body('time')
    .notEmpty().withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  
  body('symptoms')
    .trim()
    .notEmpty().withMessage('Symptoms are required')
    .isLength({ min: 10, max: 1000 }).withMessage('Symptoms must be between 10 and 1000 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for appointment status update
 */
const validateAppointmentStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Status must be scheduled, completed, cancelled, or no-show'),
  
  handleValidationErrors
];

/**
 * Validation rules for AI prescription draft generation
 */
const validateAIPrescriptionDraft = [
  body('appointmentId')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Appointment ID must be a valid ID'),
  
  body('symptoms')
    .trim()
    .notEmpty().withMessage('Symptoms are required')
    .isLength({ min: 10, max: 1000 }).withMessage('Symptoms must be between 10 and 1000 characters'),
  
  body('medicalHistory')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Medical history must not exceed 2000 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for prescription approval
 */
const validatePrescriptionApproval = [
  body('finalPrescription')
    .trim()
    .notEmpty().withMessage('Final prescription is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Final prescription must be between 10 and 5000 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for doctor status update (admin)
 */
const validateDoctorStatus = [
  body('isActive')
    .notEmpty().withMessage('Status is required')
    .isBoolean().withMessage('Status must be a boolean value'),
  
  handleValidationErrors
];

module.exports = {
  validatePatientRegistration,
  validateDoctorRegistration,
  validateLogin,
  validateAppointmentBooking,
  validateAppointmentStatus,
  validateAIPrescriptionDraft,
  validatePrescriptionApproval,
  validateDoctorStatus,
  handleValidationErrors
};
