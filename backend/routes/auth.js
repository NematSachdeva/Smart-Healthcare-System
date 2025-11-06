const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  validatePatientRegistration, 
  validateDoctorRegistration, 
  validateLogin 
} = require('../middleware/validator');

/**
 * Authentication Routes
 * Handles patient registration, doctor registration, and login
 */

/**
 * @route   POST /api/auth/login
 * @desc    Login user (patient or doctor)
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

module.exports = router;
