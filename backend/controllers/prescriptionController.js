const Prescription = require('../models/Prescription');
const PrescriptionHistory = require('../models/PrescriptionHistory');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Use Gemini AI Service
const aiService = require('../services/geminiDirectService');

/**
 * Prescription Controller
 * Handles prescription generation, approval, and retrieval
 */

/**
 * Generate AI prescription draft
 * @route   POST /api/prescriptions/ai-draft
 * @access  Private (Doctor)
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
const generateAIDraft = async (req, res, next) => {
  try {
    const { appointmentId, symptoms, medicalHistory } = req.body;
    const doctorId = req.user.userId;

    // Fetch appointment details from database
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ 
        message: 'Appointment not found' 
      });
    }

    // Verify the doctor is associated with this appointment
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ 
        message: 'Access denied. You are not authorized to create prescription for this appointment.' 
      });
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({ 
        message: 'Prescription already exists for this appointment' 
      });
    }

    // Fetch patient details including age, gender, medical history
    const patient = await Patient.findById(appointment.patientId);
    
    if (!patient) {
      return res.status(404).json({ 
        message: 'Patient not found' 
      });
    }

    // Prepare patient data for AI service
    const patientData = {
      age: patient.age,
      gender: patient.gender,
      medicalHistory: medicalHistory || patient.medicalHistory || 'None reported'
    };

    // Call AIService.generatePrescription with patient data and symptoms
    const aiDraft = await aiService.generatePrescription(
      patientData, 
      symptoms || appointment.symptoms
    );

    // Convert AI draft object to string for storage
    const aiDraftString = JSON.stringify(aiDraft, null, 2);

    // Create new prescription document with aiDraft and status 'draft'
    const prescription = new Prescription({
      patientId: appointment.patientId,
      doctorId: doctorId,
      appointmentId: appointmentId,
      aiDraft: aiDraftString,
      status: 'draft'
    });

    await prescription.save();

    // Return prescription with AI-generated draft
    res.status(201).json({
      message: 'AI prescription draft generated successfully',
      prescription: {
        _id: prescription._id,  // Use _id for frontend compatibility
        id: prescription._id,   // Keep id for backward compatibility
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        appointmentId: prescription.appointmentId,
        aiDraft: aiDraft, // Return parsed object for frontend
        status: prescription.status,
        createdAt: prescription.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve prescription
 * @route   PUT /api/prescriptions/approve/:id
 * @access  Private (Doctor)
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 11.1, 11.2, 11.3
 */
const approvePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { finalPrescription, notes } = req.body;
    const doctorId = req.user.userId;

    // Validate that id is provided and is a valid ObjectId
    if (!id) {
      return res.status(400).json({ 
        message: 'Prescription ID is required' 
      });
    }

    // Check if id is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid prescription ID format' 
      });
    }

    // Fetch existing prescription from database
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return res.status(404).json({ 
        message: 'Prescription not found' 
      });
    }

    // Verify the doctor is authorized to approve this prescription
    if (prescription.doctorId.toString() !== doctorId) {
      return res.status(403).json({ 
        message: 'Access denied. You are not authorized to approve this prescription.' 
      });
    }

    // Check if prescription is already approved
    if (prescription.status === 'approved') {
      return res.status(400).json({ 
        message: 'Prescription is already approved' 
      });
    }

    // Create prescription history record with old version before updating
    const historyRecord = new PrescriptionHistory({
      prescriptionId: prescription._id,
      editedBy: doctorId,
      editedAt: new Date(),
      oldVersion: prescription.finalPrescription || prescription.aiDraft,
      newVersion: finalPrescription,
      versionNumber: prescription.version,
      changeDescription: notes || 'Prescription approved'
    });

    await historyRecord.save();

    // Update prescription with finalPrescription, status 'approved', increment version
    prescription.finalPrescription = finalPrescription;
    prescription.status = 'approved';
    prescription.version += 1;
    prescription.lastEditedBy = doctorId;
    prescription.lastEditedAt = new Date();
    prescription.notes = notes || '';

    await prescription.save();

    // Return updated prescription
    res.status(200).json({
      message: 'Prescription approved successfully',
      prescription: {
        id: prescription._id,
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        appointmentId: prescription.appointmentId,
        aiDraft: prescription.aiDraft,
        finalPrescription: prescription.finalPrescription,
        status: prescription.status,
        version: prescription.version,
        lastEditedBy: prescription.lastEditedBy,
        lastEditedAt: prescription.lastEditedAt,
        notes: prescription.notes,
        createdAt: prescription.createdAt,
        updatedAt: prescription.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient prescriptions
 * @route   GET /api/prescriptions/patient
 * @access  Private (Patient)
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
const getPatientPrescriptions = async (req, res, next) => {
  try {
    const patientId = req.user.userId;

    // Query prescriptions by patientId from token with status 'approved'
    const prescriptions = await Prescription.find({ 
      patientId: patientId,
      status: 'approved'
    })
    .populate('doctorId', 'name specialization') // Populate doctor information
    .sort({ lastEditedAt: -1 }); // Sort by approval date in descending order

    // Return prescriptions array
    res.status(200).json({
      prescriptions: prescriptions.map(prescription => ({
        _id: prescription._id,  // Use _id for frontend compatibility
        id: prescription._id,   // Keep id for backward compatibility
        doctor: {
          _id: prescription.doctorId._id,
          id: prescription.doctorId._id,
          name: prescription.doctorId.name,
          specialization: prescription.doctorId.specialization
        },
        finalPrescription: prescription.finalPrescription,
        notes: prescription.notes,
        version: prescription.version,
        approvedAt: prescription.lastEditedAt,
        updatedAt: prescription.updatedAt,
        createdAt: prescription.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor prescriptions
 * @route   GET /api/prescriptions/doctor
 * @access  Private (Doctor)
 * Requirements: 8.1, 8.2
 */
const getDoctorPrescriptions = async (req, res, next) => {
  try {
    const doctorId = req.user.userId;

    // Query prescriptions by doctorId from token
    const prescriptions = await Prescription.find({ 
      doctorId: doctorId
    })
    .populate('patientId', 'name age') // Populate patient information
    .sort({ createdAt: -1 }); // Sort by creation date in descending order

    // Include both draft and approved prescriptions
    // Return prescriptions array
    res.status(200).json({
      prescriptions: prescriptions.map(prescription => ({
        _id: prescription._id,  // Use _id for frontend compatibility
        id: prescription._id,   // Keep id for backward compatibility
        patient: prescription.patientId ? {
          _id: prescription.patientId._id,
          id: prescription.patientId._id,
          name: prescription.patientId.name,
          age: prescription.patientId.age
        } : null,
        appointmentId: prescription.appointmentId,
        aiDraft: prescription.aiDraft,
        finalPrescription: prescription.finalPrescription,
        status: prescription.status,
        version: prescription.version,
        notes: prescription.notes,
        createdAt: prescription.createdAt,
        updatedAt: prescription.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prescription history
 * @route   GET /api/prescriptions/:id/history
 * @access  Private (Doctor)
 * Requirements: 11.4, 11.5
 */
const getPrescriptionHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.userId;

    // Validate that id is provided and is a valid ObjectId
    if (!id) {
      return res.status(400).json({ 
        message: 'Prescription ID is required' 
      });
    }

    // Check if id is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid prescription ID format' 
      });
    }

    // Verify prescription exists and doctor has access
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return res.status(404).json({ 
        message: 'Prescription not found' 
      });
    }

    // Verify the doctor is authorized to view this prescription history
    if (prescription.doctorId.toString() !== doctorId) {
      return res.status(403).json({ 
        message: 'Access denied. You are not authorized to view this prescription history.' 
      });
    }

    // Query prescription history by prescriptionId
    const history = await PrescriptionHistory.find({ 
      prescriptionId: id 
    })
    .populate('editedBy', 'name') // Populate editedBy with doctor name
    .sort({ editedAt: -1 }); // Sort history by editedAt in descending order

    // Return history array with version details
    res.status(200).json({
      history: history.map(record => ({
        _id: record._id,
        id: record._id,
        versionNumber: record.versionNumber,
        editedBy: {
          name: record.editedBy.name
        },
        editedAt: record.editedAt,
        oldVersion: record.oldVersion,
        newVersion: record.newVersion,
        changeDescription: record.changeDescription
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAIDraft,
  approvePrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionHistory
};
