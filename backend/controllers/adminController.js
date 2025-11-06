const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

/**
 * Admin Controller
 * Handles admin functionality for user management and system statistics
 * Requirements: 12.1-12.5, 13.1-13.5
 */

/**
 * Get all users (patients and doctors)
 * GET /api/admin/users
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
const getAllUsers = async (req, res, next) => {
  try {
    // Query all patients and doctors from database
    // Exclude passwordHash from results
    const patients = await Patient.find()
      .select('-passwordHash')
      .lean();
    
    const doctors = await Doctor.find()
      .select('-passwordHash')
      .lean();

    // Combine and format user data with role information
    const users = [
      ...patients.map(patient => ({
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: patient.role,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt
      })),
      ...doctors.map(doctor => ({
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization,
        isActive: doctor.isActive,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt
      }))
    ];

    // Return users array
    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage doctor status (activate/deactivate)
 * PUT /api/admin/doctors/:id/status
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */
const updateDoctorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate input data (isActive boolean)
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean value'
      });
    }

    // Update doctor isActive field in database
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Return updated doctor information
    res.status(200).json({
      message: `Doctor account ${isActive ? 'activated' : 'deactivated'} successfully`,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        isActive: doctor.isActive,
        role: doctor.role,
        updatedAt: doctor.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system statistics
 * GET /api/admin/stats
 * Requirements: 12.1, 12.2
 */
const getSystemStats = async (req, res, next) => {
  try {
    // Count total patients, doctors, appointments, and prescriptions
    const [totalPatients, totalDoctors, totalAppointments, totalPrescriptions] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Prescription.countDocuments()
    ]);

    // Return statistics object
    res.status(200).json({
      message: 'System statistics retrieved successfully',
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalPrescriptions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateDoctorStatus,
  getSystemStats
};
