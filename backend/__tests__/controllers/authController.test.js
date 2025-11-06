const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../../controllers/authController');
const Patient = require('../../models/Patient');
const Doctor = require('../../models/Doctor');

// Mock the models
jest.mock('../../models/Patient');
jest.mock('../../models/Doctor');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post('/api/patients/register', authController.registerPatient);
app.post('/api/doctors/register', authController.registerDoctor);
app.post('/api/auth/login', authController.login);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

describe('Authentication Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/patients/register - Patient Registration', () => {
    const validPatientData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      age: 30,
      gender: 'male',
      phone: '1234567890',
      medicalHistory: 'No known allergies'
    };

    test('should register a new patient with valid data', async () => {
      // Mock no existing patient or doctor
      Patient.findOne.mockResolvedValue(null);
      Doctor.findOne.mockResolvedValue(null);
      
      // Mock bcrypt
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      // Mock patient save
      const mockPatient = {
        _id: 'patient123',
        ...validPatientData,
        passwordHash: 'hashedPassword',
        role: 'patient',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      Patient.mockImplementation(() => mockPatient);

      const response = await request(app)
        .post('/api/patients/register')
        .send(validPatientData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Patient registered successfully');
      expect(response.body.patient).toHaveProperty('id');
      expect(response.body.patient.email).toBe(validPatientData.email);
      expect(response.body.patient).not.toHaveProperty('passwordHash');
    });

    test('should return error if email already exists as patient', async () => {
      Patient.findOne.mockResolvedValue({ email: validPatientData.email });

      const response = await request(app)
        .post('/api/patients/register')
        .send(validPatientData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already registered as a patient');
    });

    test('should return error if email already exists as doctor', async () => {
      Patient.findOne.mockResolvedValue(null);
      Doctor.findOne.mockResolvedValue({ email: validPatientData.email });

      const response = await request(app)
        .post('/api/patients/register')
        .send(validPatientData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already registered as a doctor');
    });
  });

  describe('POST /api/doctors/register - Doctor Registration', () => {
    const validDoctorData = {
      name: 'Dr. Smith',
      email: 'smith@example.com',
      password: 'password123',
      specialization: 'Cardiology',
      availability: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' }
      ]
    };

    test('should register a new doctor with valid data', async () => {
      Doctor.findOne.mockResolvedValue(null);
      Patient.findOne.mockResolvedValue(null);
      
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      const mockDoctor = {
        _id: 'doctor123',
        ...validDoctorData,
        passwordHash: 'hashedPassword',
        role: 'doctor',
        isActive: true,
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      Doctor.mockImplementation(() => mockDoctor);

      const response = await request(app)
        .post('/api/doctors/register')
        .send(validDoctorData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Doctor registered successfully');
      expect(response.body.doctor).toHaveProperty('id');
      expect(response.body.doctor.specialization).toBe(validDoctorData.specialization);
    });

    test('should return error if email already exists as doctor', async () => {
      Doctor.findOne.mockResolvedValue({ email: validDoctorData.email });

      const response = await request(app)
        .post('/api/doctors/register')
        .send(validDoctorData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already registered as a doctor');
    });
  });

  describe('POST /api/auth/login - User Login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    test('should login patient with valid credentials', async () => {
      const mockPatient = {
        _id: 'patient123',
        name: 'John Doe',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        role: 'patient'
      };
      
      Patient.findOne.mockResolvedValue(mockPatient);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mockToken');
      expect(response.body.user.role).toBe('patient');
    });

    test('should login doctor with valid credentials', async () => {
      const mockDoctor = {
        _id: 'doctor123',
        name: 'Dr. Smith',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        role: 'doctor',
        isActive: true
      };
      
      Patient.findOne.mockResolvedValue(null);
      Doctor.findOne.mockResolvedValue(mockDoctor);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mockToken');
      expect(response.body.user.role).toBe('doctor');
    });

    test('should return error for invalid email', async () => {
      Patient.findOne.mockResolvedValue(null);
      Doctor.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should return error for invalid password', async () => {
      const mockPatient = {
        _id: 'patient123',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        role: 'patient'
      };
      
      Patient.findOne.mockResolvedValue(mockPatient);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should return error for inactive doctor account', async () => {
      const mockDoctor = {
        _id: 'doctor123',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        role: 'doctor',
        isActive: false
      };
      
      Patient.findOne.mockResolvedValue(null);
      Doctor.findOne.mockResolvedValue(mockDoctor);
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('deactivated');
    });
  });
});
