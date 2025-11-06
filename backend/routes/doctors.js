const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const { validateDoctorRegistration } = require('../middleware/validator');

/**
 * Doctor Routes
 * Handles doctor-specific operations
 */

/**
 * @route   POST /api/doctors/register
 * @desc    Register a new doctor
 * @access  Public
 */
router.post('/register', validateDoctorRegistration, authController.registerDoctor);

/**
 * @route   GET /api/doctors/list
 * @desc    Get list of all active doctors
 * @access  Public (needed for appointment booking)
 */
router.get('/list', doctorController.getDoctorsList);

/**
 * @route   GET /api/doctors/profile
 * @desc    Get doctor profile
 * @access  Private (Doctor only)
 */
router.get('/profile', auth, doctorController.getDoctorProfile);

module.exports = router;
