const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { 
  validateAIPrescriptionDraft,
  validatePrescriptionApproval
} = require('../middleware/validator');

/**
 * Prescription Routes
 * Handles prescription generation, approval, and retrieval
 */

/**
 * @route   POST /api/prescriptions/ai-draft
 * @desc    Generate AI prescription draft
 * @access  Private (Doctor)
 */
router.post('/ai-draft', auth, roleCheck(['doctor']), validateAIPrescriptionDraft, prescriptionController.generateAIDraft);

/**
 * @route   PUT /api/prescriptions/approve/:id
 * @desc    Approve prescription
 * @access  Private (Doctor)
 */
router.put('/approve/:id', auth, roleCheck(['doctor']), validatePrescriptionApproval, prescriptionController.approvePrescription);

/**
 * @route   GET /api/prescriptions/patient
 * @desc    Get patient prescriptions
 * @access  Private (Patient)
 */
router.get('/patient', auth, prescriptionController.getPatientPrescriptions);

/**
 * @route   GET /api/prescriptions/doctor
 * @desc    Get doctor prescriptions
 * @access  Private (Doctor)
 */
router.get('/doctor', auth, roleCheck(['doctor']), prescriptionController.getDoctorPrescriptions);

/**
 * @route   GET /api/prescriptions/:id/history
 * @desc    Get prescription history
 * @access  Private (Doctor)
 */
router.get('/:id/history', auth, roleCheck(['doctor']), prescriptionController.getPrescriptionHistory);

module.exports = router;
