const Doctor = require('../models/Doctor');

/**
 * Doctor Controller
 * Handles doctor-specific operations
 */

/**
 * Get list of all active doctors
 * GET /api/doctors/list
 * Public access - needed for patients to book appointments
 */
const getDoctorsList = async (req, res, next) => {
  try {
    // Fetch all active doctors
    const doctors = await Doctor.find({ isActive: true })
      .select('name email specialization availability isActive')
      .sort({ name: 1 });

    res.status(200).json({
      message: 'Doctors retrieved successfully',
      doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor profile
 * GET /api/doctors/profile
 * Protected route - requires authentication
 */
const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user.userId)
      .select('-passwordHash');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({
      message: 'Doctor profile retrieved successfully',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorsList,
  getDoctorProfile
};
