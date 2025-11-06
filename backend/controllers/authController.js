const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * Authentication Controller
 * Handles patient registration, doctor registration, and login
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.3
 */

/**
 * Register a new patient
 * POST /api/patients/register
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
const registerPatient = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, phone, medicalHistory } = req.body;

    // Check for duplicate email in database
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ 
        message: 'Email already registered as a patient' 
      });
    }

    // Also check in Doctor collection to ensure email is unique across system
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ 
        message: 'Email already registered as a doctor' 
      });
    }

    // Hash password using bcryptjs with salt rounds of 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new patient document in database
    const patient = new Patient({
      name,
      email,
      passwordHash,
      age,
      gender,
      phone,
      medicalHistory: medicalHistory || ''
    });

    await patient.save();

    // Return success response with patient details (excluding password)
    res.status(201).json({
      message: 'Patient registered successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        medicalHistory: patient.medicalHistory,
        role: patient.role,
        createdAt: patient.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new doctor
 * POST /api/doctors/register
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
const registerDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, availability } = req.body;

    // Check for duplicate email in database
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ 
        message: 'Email already registered as a doctor' 
      });
    }

    // Also check in Patient collection to ensure email is unique across system
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ 
        message: 'Email already registered as a patient' 
      });
    }

    // Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new doctor document in database
    const doctor = new Doctor({
      name,
      email,
      passwordHash,
      specialization,
      availability: availability || []
    });

    await doctor.save();

    // Return success response with doctor details (excluding password)
    res.status(201).json({
      message: 'Doctor registered successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        availability: doctor.availability,
        isActive: doctor.isActive,
        role: doctor.role,
        createdAt: doctor.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user (patient or doctor)
 * POST /api/auth/login
 * Requirements: 3.1, 3.2, 3.3
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user in Patient, Doctor, and User (admin) collections by email
    let user = await Patient.findOne({ email });
    let userType = 'patient';
    let passwordField = 'passwordHash';

    if (!user) {
      user = await Doctor.findOne({ email });
      userType = 'doctor';
      passwordField = 'passwordHash';
    }

    if (!user) {
      user = await User.findOne({ email });
      userType = 'admin';
      passwordField = 'password'; // Admin uses 'password' field, not 'passwordHash'
    }

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Verify password using bcryptjs compare function
    const passwordToCheck = user[passwordField];
    const isPasswordValid = await bcrypt.compare(password, passwordToCheck);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if doctor account is active
    if (userType === 'doctor' && !user.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been deactivated. Please contact administrator.' 
      });
    }

    // Generate JWT token with userId, email, and role in payload
    // Set token expiration to 24 hours
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return token and user information (id, name, email, role)
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPatient,
  registerDoctor,
  login
};
