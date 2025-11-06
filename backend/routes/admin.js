const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * Admin Routes
 * Handles admin functionality for user management and system statistics
 * All routes require admin role
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (patients and doctors)
 * @access  Private (Admin)
 */
router.get('/users', auth, roleCheck(['admin']), adminController.getAllUsers);

/**
 * @route   PUT /api/admin/doctors/:id/status
 * @desc    Update doctor account status (activate/deactivate)
 * @access  Private (Admin)
 */
router.put('/doctors/:id/status', auth, roleCheck(['admin']), adminController.updateDoctorStatus);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private (Admin)
 */
router.get('/stats', auth, roleCheck(['admin']), adminController.getSystemStats);

module.exports = router;
