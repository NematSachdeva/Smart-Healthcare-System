const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

/**
 * Appointment Controller
 * Handles appointment booking and management
 * Requirements: 4.1-4.5, 5.1-5.5, 6.1-6.5
 */

/**
 * Book a new appointment
 * POST /api/appointments/book
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, symptoms } = req.body;
    const patientId = req.user.userId; // From auth middleware

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        message: 'Doctor not found' 
      });
    }

    if (!doctor.isActive) {
      return res.status(400).json({ 
        message: 'Doctor is not currently accepting appointments' 
      });
    }

    // Check if selected time slot is available for the doctor
    const appointmentDate = new Date(date);
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      time,
      status: { $in: ['scheduled', 'completed'] } // Don't block cancelled/no-show slots
    });

    // Return 409 error if time slot is unavailable
    if (existingAppointment) {
      return res.status(409).json({ 
        message: 'Time slot is unavailable. Please select a different time.' 
      });
    }

    // Create new appointment document with patientId from token
    const appointment = new Appointment({
      patientId,
      doctorId,
      date: appointmentDate,
      time,
      symptoms,
      status: 'scheduled'
    });

    await appointment.save();

    // Populate doctor information for response
    await appointment.populate('doctorId', 'name specialization');

    // Return success response with appointment details
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        doctorId: appointment.doctorId._id,
        doctorName: appointment.doctorId.name,
        specialization: appointment.doctorId.specialization,
        date: appointment.date,
        time: appointment.time,
        symptoms: appointment.symptoms,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient appointments
 * GET /api/appointments/patient
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const getPatientAppointments = async (req, res, next) => {
  try {
    const patientId = req.user.userId; // From auth middleware

    // Query appointments by patientId from token
    // Populate doctor information (name, specialization)
    // Sort appointments by date in ascending order
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ date: 1, time: 1 });

    // Return appointments array with doctor details
    res.status(200).json({
      appointments: appointments.map(apt => ({
        _id: apt._id,  // Changed from 'id' to '_id' for frontend compatibility
        id: apt._id,   // Keep 'id' for backward compatibility
        doctor: {
          _id: apt.doctorId._id,
          id: apt.doctorId._id,
          name: apt.doctorId.name,
          specialization: apt.doctorId.specialization
        },
        date: apt.date,
        time: apt.time,
        symptoms: apt.symptoms,
        status: apt.status,
        createdAt: apt.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor appointments
 * GET /api/appointments/doctor
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user.userId; // From auth middleware

    // Query appointments by doctorId from token
    // Populate patient information (name, age, gender)
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name age gender')
      .sort({ date: 1, time: 1 });

    // Group appointments by date
    const groupedAppointments = {};
    appointments.forEach(apt => {
      const dateKey = apt.date.toISOString().split('T')[0];
      if (!groupedAppointments[dateKey]) {
        groupedAppointments[dateKey] = [];
      }
      groupedAppointments[dateKey].push({
        _id: apt._id,  // Changed from 'id' to '_id' for frontend compatibility
        id: apt._id,   // Keep 'id' for backward compatibility
        patient: {
          _id: apt.patientId._id,
          id: apt.patientId._id,
          name: apt.patientId.name,
          age: apt.patientId.age,
          gender: apt.patientId.gender
        },
        date: apt.date,
        time: apt.time,
        symptoms: apt.symptoms,
        status: apt.status,
        createdAt: apt.createdAt
      });
    });

    // Return appointments array with patient details
    res.status(200).json({
      appointments: appointments.map(apt => ({
        _id: apt._id,  // Changed from 'id' to '_id' for frontend compatibility
        id: apt._id,   // Keep 'id' for backward compatibility
        patient: {
          _id: apt.patientId._id,
          id: apt.patientId._id,
          name: apt.patientId.name,
          age: apt.patientId.age,
          gender: apt.patientId.gender
        },
        date: apt.date,
        time: apt.time,
        symptoms: apt.symptoms,
        status: apt.status,
        createdAt: apt.createdAt
      })),
      groupedByDate: groupedAppointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single appointment by ID
 * GET /api/appointments/:id
 * Requirements: 5.5, 6.4
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Query appointment by id
    // Populate both patient and doctor information
    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name age gender phone medicalHistory')
      .populate('doctorId', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ 
        message: 'Appointment not found' 
      });
    }

    // Verify user has access to appointment (is patient or doctor)
    const isPatient = appointment.patientId._id.toString() === userId;
    const isDoctor = appointment.doctorId._id.toString() === userId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to view this appointment.' 
      });
    }

    // Return appointment details
    res.status(200).json({
      appointment: {
        id: appointment._id,
        patient: {
          id: appointment.patientId._id,
          name: appointment.patientId.name,
          age: appointment.patientId.age,
          gender: appointment.patientId.gender,
          phone: appointment.patientId.phone,
          medicalHistory: appointment.patientId.medicalHistory
        },
        doctor: {
          id: appointment.doctorId._id,
          name: appointment.doctorId.name,
          specialization: appointment.doctorId.specialization
        },
        date: appointment.date,
        time: appointment.time,
        symptoms: appointment.symptoms,
        status: appointment.status,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status
 * PUT /api/appointments/:id/status
 * Requirements: 6.5
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.user.userId;

    // Query appointment by id
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ 
        message: 'Appointment not found' 
      });
    }

    // Verify the doctor owns this appointment
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own appointments.' 
      });
    }

    // Update appointment status in database
    appointment.status = status;
    await appointment.save();

    // Populate doctor and patient info for response
    await appointment.populate('doctorId', 'name specialization');
    await appointment.populate('patientId', 'name');

    // Return updated appointment
    res.status(200).json({
      message: 'Appointment status updated successfully',
      appointment: {
        id: appointment._id,
        patient: {
          id: appointment.patientId._id,
          name: appointment.patientId.name
        },
        doctor: {
          id: appointment.doctorId._id,
          name: appointment.doctorId.name,
          specialization: appointment.doctorId.specialization
        },
        date: appointment.date,
        time: appointment.time,
        symptoms: appointment.symptoms,
        status: appointment.status,
        updatedAt: appointment.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus
};
