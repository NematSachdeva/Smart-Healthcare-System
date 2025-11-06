const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validatePatientRegistration } = require('../middleware/validator');

/**
 * Patient Routes
 * Handles patient-specific operations
 */

/**
 * @route   POST /api/patients/register
 * @desc    Register a new patient
 * @access  Public
 */
router.post('/register', validatePatientRegistration, authController.registerPatient);

module.exports = router;
