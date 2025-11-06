const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { 
  validateAppointmentBooking,
  validateAppointmentStatus
} = require('../middleware/validator');

/**
 * Appointment Routes
 * Handles appointment booking and management
 */

/**
 * @route   POST /api/appointments/book
 * @desc    Book a new appointment
 * @access  Private (Patient)
 */
router.post('/book', auth, validateAppointmentBooking, appointmentController.bookAppointment);

/**
 * @route   GET /api/appointments/patient
 * @desc    Get patient appointments
 * @access  Private (Patient)
 */
router.get('/patient', auth, appointmentController.getPatientAppointments);

/**
 * @route   GET /api/appointments/doctor
 * @desc    Get doctor appointments
 * @access  Private (Doctor)
 */
router.get('/doctor', auth, roleCheck(['doctor']), appointmentController.getDoctorAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment by ID
 * @access  Private (Patient or Doctor)
 */
router.get('/:id', auth, appointmentController.getAppointmentById);

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Doctor)
 */
router.put('/:id/status', auth, roleCheck(['doctor']), validateAppointmentStatus, appointmentController.updateAppointmentStatus);

module.exports = router;
