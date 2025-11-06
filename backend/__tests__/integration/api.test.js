// Mock all dependencies BEFORE requiring them
jest.mock('../../models/Patient');
jest.mock('../../models/Doctor');
jest.mock('../../models/Appointment');
jest.mock('../../models/Prescription');
jest.mock('../../models/PrescriptionHistory');
jest.mock('../../services/aiService', () => ({
  generatePrescription: jest.fn()
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../../models/Patient');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Prescription = require('../../models/Prescription');
const PrescriptionHistory = require('../../models/PrescriptionHistory');
const aiService = require('../../services/aiService');
const authController = require('../../controllers/authController');
const appointmentController = require('../../controllers/appointmentController');
const prescriptionController = require('../../controllers/prescriptionController');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

// Create Express app for integration testing
const app = express();
app.use(express.json());

// Setup routes
app.post('/api/patients/register', authController.registerPatient);
app.post('/api/doctors/register', authController.registerDoctor);
app.post('/api/auth/login', authController.login);
app.post('/api/appointments/book', auth, roleCheck(['patient']), appointmentController.bookAppointment);
app.post('/api/prescriptions/ai-draft', auth, roleCheck(['doctor']), prescriptionController.generateAIDraft);
app.put('/api/prescriptions/approve/:id', auth, roleCheck(['doctor']), prescriptionController.approvePrescription);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Complete Authentication Flow', () => {
    test('should register patient, login, and access protected route', async () => {
      // Step 1: Register patient
      Patient.findOne.mockResolvedValue(null);
      Doctor.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');

      const mockPatient = {
        _id: 'patient123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedPassword',
        age: 30,
        gender: 'male',
        phone: '1234567890',
        medicalHistory: 'None',
        role: 'patient',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      Patient.mockImplementation(() => mockPatient);

      const registerResponse = await request(app)
        .post('/api/patients/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          age: 30,
          gender: 'male',
          phone: '1234567890',
          medicalHistory: 'None'
        });

      expect(registerResponse.status).toBe(201);

      // Step 2: Login
      Patient.findOne.mockResolvedValue(mockPatient);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBe('mockToken');

      // Step 3: Access protected route
      jwt.verify.mockReturnValue({
        userId: 'patient123',
        email: 'john@example.com',
        role: 'patient'
      });

      const mockDoctor = { _id: 'doctor123', isActive: true };
      Doctor.findById.mockResolvedValue(mockDoctor);
      Appointment.findOne.mockResolvedValue(null);

      const mockAppointment = {
        _id: 'apt123',
        patientId: 'patient123',
        doctorId: { _id: 'doctor123', name: 'Dr. Smith', specialization: 'Cardiology' },
        date: new Date(),
        time: '10:00',
        symptoms: 'Chest pain',
        status: 'scheduled',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'apt123',
          doctorId: { _id: 'doctor123', name: 'Dr. Smith', specialization: 'Cardiology' },
          date: new Date(),
          time: '10:00',
          symptoms: 'Chest pain',
          status: 'scheduled',
          createdAt: new Date()
        })
      };
      Appointment.mockImplementation(() => mockAppointment);

      const appointmentResponse = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', 'Bearer mockToken')
        .send({
          doctorId: 'doctor123',
          date: '2024-12-01',
          time: '10:00',
          symptoms: 'Chest pain'
        });

      expect(appointmentResponse.status).toBe(201);
    });
  });

  describe('Complete Appointment Booking Flow', () => {
    test('should book appointment with valid authentication', async () => {
      jwt.verify.mockReturnValue({
        userId: 'patient123',
        email: 'patient@example.com',
        role: 'patient'
      });

      const mockDoctor = {
        _id: 'doctor123',
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        isActive: true
      };
      Doctor.findById.mockResolvedValue(mockDoctor);
      Appointment.findOne.mockResolvedValue(null);

      const mockAppointment = {
        _id: 'apt123',
        patientId: 'patient123',
        doctorId: { _id: 'doctor123', name: 'Dr. Smith', specialization: 'Cardiology' },
        date: new Date('2024-12-01'),
        time: '10:00',
        symptoms: 'Fever',
        status: 'scheduled',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'apt123',
          doctorId: { _id: 'doctor123', name: 'Dr. Smith', specialization: 'Cardiology' },
          date: new Date('2024-12-01'),
          time: '10:00',
          symptoms: 'Fever',
          status: 'scheduled',
          createdAt: new Date()
        })
      };
      Appointment.mockImplementation(() => mockAppointment);

      const response = await request(app)
        .post('/api/appointments/book')
        .set('Authorization', 'Bearer validToken')
        .send({
          doctorId: 'doctor123',
          date: '2024-12-01',
          time: '10:00',
          symptoms: 'Fever'
        });

      expect(response.status).toBe(201);
      expect(response.body.appointment).toHaveProperty('id');
    });

    test('should reject booking without authentication', async () => {
      const response = await request(app)
        .post('/api/appointments/book')
        .send({
          doctorId: 'doctor123',
          date: '2024-12-01',
          time: '10:00',
          symptoms: 'Fever'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Complete Prescription Generation and Approval Flow', () => {
    test('should generate AI draft and approve prescription', async () => {
      // Mock doctor authentication
      jwt.verify.mockReturnValue({
        userId: 'doctor123',
        email: 'doctor@example.com',
        role: 'doctor'
      });

      // Step 1: Generate AI draft
      const mockAppointment = {
        _id: 'apt123',
        doctorId: 'doctor123',
        patientId: 'patient123',
        symptoms: 'Fever and cough'
      };
      const mockPatient = {
        _id: 'patient123',
        age: 30,
        gender: 'male',
        medicalHistory: 'No allergies'
      };
      const mockAIDraft = {
        diagnosis: 'Common cold',
        medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' }],
        advice: 'Rest',
        followUp: 'If symptoms persist'
      };

      Appointment.findById.mockResolvedValue(mockAppointment);
      Prescription.findOne.mockResolvedValue(null);
      Patient.findById.mockResolvedValue(mockPatient);
      aiService.generatePrescription.mockResolvedValue(mockAIDraft);

      const mockPrescription = {
        _id: 'presc123',
        patientId: 'patient123',
        doctorId: 'doctor123',
        appointmentId: 'apt123',
        aiDraft: JSON.stringify(mockAIDraft, null, 2),
        status: 'draft',
        version: 1,
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      Prescription.mockImplementation(() => mockPrescription);

      const draftResponse = await request(app)
        .post('/api/prescriptions/ai-draft')
        .set('Authorization', 'Bearer validToken')
        .send({
          appointmentId: 'apt123',
          symptoms: 'Fever and cough',
          medicalHistory: 'No allergies'
        });

      expect(draftResponse.status).toBe(201);
      expect(aiService.generatePrescription).toHaveBeenCalled();

      // Step 2: Approve prescription
      mockPrescription.doctorId = 'doctor123';
      mockPrescription.status = 'draft';
      Prescription.findById.mockResolvedValue(mockPrescription);

      const mockHistory = {
        save: jest.fn().mockResolvedValue(true)
      };
      PrescriptionHistory.mockImplementation(() => mockHistory);

      const approveResponse = await request(app)
        .put('/api/prescriptions/approve/presc123')
        .set('Authorization', 'Bearer validToken')
        .send({
          finalPrescription: 'Approved prescription text',
          notes: 'Looks good'
        });

      expect(approveResponse.status).toBe(200);
      expect(mockPrescription.save).toHaveBeenCalled();
    });
  });
});
