// Mock the models and services BEFORE requiring them
jest.mock('../../models/Prescription');
jest.mock('../../models/PrescriptionHistory');
jest.mock('../../models/Appointment');
jest.mock('../../models/Patient');
jest.mock('../../services/aiService', () => ({
  generatePrescription: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const prescriptionController = require('../../controllers/prescriptionController');
const Prescription = require('../../models/Prescription');
const PrescriptionHistory = require('../../models/PrescriptionHistory');
const Appointment = require('../../models/Appointment');
const Patient = require('../../models/Patient');
const aiService = require('../../services/aiService');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { userId: 'doctor123', role: 'doctor' };
  next();
});

// Setup routes
app.post('/api/prescriptions/ai-draft', prescriptionController.generateAIDraft);
app.put('/api/prescriptions/approve/:id', prescriptionController.approvePrescription);
app.get('/api/prescriptions/patient', prescriptionController.getPatientPrescriptions);
app.get('/api/prescriptions/doctor', prescriptionController.getDoctorPrescriptions);
app.get('/api/prescriptions/:id/history', prescriptionController.getPrescriptionHistory);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

describe('Prescription Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/prescriptions/ai-draft - Generate AI Draft', () => {
    const validDraftData = {
      appointmentId: 'apt123',
      symptoms: 'Fever and cough',
      medicalHistory: 'No allergies'
    };

    test('should generate AI prescription draft', async () => {
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
        medicalHistory: 'No known allergies'
      };

      const mockAIDraft = {
        diagnosis: 'Common cold',
        medications: [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' }
        ],
        advice: 'Rest and drink plenty of fluids',
        followUp: 'If symptoms persist after 5 days'
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
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      
      Prescription.mockImplementation(() => mockPrescription);

      const response = await request(app)
        .post('/api/prescriptions/ai-draft')
        .send(validDraftData);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('generated successfully');
      expect(response.body.prescription.aiDraft).toHaveProperty('diagnosis');
      expect(aiService.generatePrescription).toHaveBeenCalled();
    });

    test('should return error if appointment not found', async () => {
      Appointment.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/prescriptions/ai-draft')
        .send(validDraftData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Appointment not found');
    });

    test('should return error if doctor not authorized', async () => {
      const mockAppointment = {
        _id: 'apt123',
        doctorId: 'otherDoctor',
        patientId: 'patient123'
      };
      
      Appointment.findById.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .post('/api/prescriptions/ai-draft')
        .send(validDraftData);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('not authorized');
    });

    test('should return error if prescription already exists', async () => {
      const mockAppointment = {
        _id: 'apt123',
        doctorId: 'doctor123',
        patientId: 'patient123'
      };
      
      Appointment.findById.mockResolvedValue(mockAppointment);
      Prescription.findOne.mockResolvedValue({ _id: 'existing123' });

      const response = await request(app)
        .post('/api/prescriptions/ai-draft')
        .send(validDraftData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('PUT /api/prescriptions/approve/:id - Approve Prescription', () => {
    test('should approve prescription', async () => {
      const mockPrescription = {
        _id: 'presc123',
        doctorId: 'doctor123',
        patientId: 'patient123',
        appointmentId: 'apt123',
        aiDraft: '{"diagnosis": "Cold"}',
        finalPrescription: '',
        status: 'draft',
        version: 1,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockHistory = {
        save: jest.fn().mockResolvedValue(true)
      };

      Prescription.findById.mockResolvedValue(mockPrescription);
      PrescriptionHistory.mockImplementation(() => mockHistory);

      const response = await request(app)
        .put('/api/prescriptions/approve/presc123')
        .send({
          finalPrescription: 'Updated prescription',
          notes: 'Approved with minor edits'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('approved successfully');
      expect(mockPrescription.save).toHaveBeenCalled();
      expect(mockHistory.save).toHaveBeenCalled();
    });

    test('should return error if prescription not found', async () => {
      Prescription.findById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/prescriptions/approve/presc123')
        .send({ finalPrescription: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Prescription not found');
    });

    test('should return error if already approved', async () => {
      const mockPrescription = {
        _id: 'presc123',
        doctorId: 'doctor123',
        status: 'approved'
      };

      Prescription.findById.mockResolvedValue(mockPrescription);

      const response = await request(app)
        .put('/api/prescriptions/approve/presc123')
        .send({ finalPrescription: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already approved');
    });
  });

  describe('GET /api/prescriptions/patient - Get Patient Prescriptions', () => {
    test('should fetch approved patient prescriptions', async () => {
      const mockPrescriptions = [
        {
          _id: 'presc1',
          doctorId: { _id: 'doc1', name: 'Dr. Smith', specialization: 'Cardiology' },
          finalPrescription: 'Take medication as prescribed',
          notes: 'Follow up in 2 weeks',
          lastEditedAt: new Date(),
          createdAt: new Date()
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockPrescriptions)
      };
      
      Prescription.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/api/prescriptions/patient');

      expect(response.status).toBe(200);
      expect(response.body.prescriptions).toHaveLength(1);
      expect(response.body.prescriptions[0]).toHaveProperty('doctor');
    });
  });

  describe('GET /api/prescriptions/doctor - Get Doctor Prescriptions', () => {
    test('should fetch doctor prescriptions', async () => {
      const mockPrescriptions = [
        {
          _id: 'presc1',
          patientId: { _id: 'pat1', name: 'John Doe', age: 30 },
          appointmentId: 'apt1',
          aiDraft: '{"diagnosis": "Cold"}',
          finalPrescription: 'Approved prescription',
          status: 'approved',
          version: 1,
          notes: 'Test notes',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockPrescriptions)
      };
      
      Prescription.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/api/prescriptions/doctor');

      expect(response.status).toBe(200);
      expect(response.body.prescriptions).toHaveLength(1);
      expect(response.body.prescriptions[0]).toHaveProperty('patient');
    });
  });

  describe('GET /api/prescriptions/:id/history - Get Prescription History', () => {
    test('should fetch prescription history', async () => {
      const mockPrescription = {
        _id: 'presc123',
        doctorId: 'doctor123'
      };

      const mockHistory = [
        {
          _id: 'hist1',
          versionNumber: 1,
          editedBy: { name: 'Dr. Smith' },
          editedAt: new Date(),
          oldVersion: 'Old prescription',
          newVersion: 'New prescription',
          changeDescription: 'Updated dosage'
        }
      ];

      Prescription.findById.mockResolvedValue(mockPrescription);

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockHistory)
      };
      
      PrescriptionHistory.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/api/prescriptions/presc123/history');

      expect(response.status).toBe(200);
      expect(response.body.history).toHaveLength(1);
      expect(response.body.history[0]).toHaveProperty('versionNumber');
    });

    test('should return error if prescription not found', async () => {
      Prescription.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/prescriptions/presc123/history');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Prescription not found');
    });
  });
});
