const request = require('supertest');
const express = require('express');
const appointmentController = require('../../controllers/appointmentController');
const Appointment = require('../../models/Appointment');
const Doctor = require('../../models/Doctor');
const Patient = require('../../models/Patient');

// Mock the models
jest.mock('../../models/Appointment');
jest.mock('../../models/Doctor');
jest.mock('../../models/Patient');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { userId: 'user123', role: 'patient' };
  next();
});

// Setup routes
app.post('/api/appointments/book', appointmentController.bookAppointment);
app.get('/api/appointments/patient', appointmentController.getPatientAppointments);
app.get('/api/appointments/doctor', appointmentController.getDoctorAppointments);
app.get('/api/appointments/:id', appointmentController.getAppointmentById);
app.put('/api/appointments/:id/status', appointmentController.updateAppointmentStatus);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

describe('Appointment Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appointments/book - Book Appointment', () => {
    const validAppointmentData = {
      doctorId: 'doctor123',
      date: '2024-12-01',
      time: '10:00',
      symptoms: 'Fever and headache'
    };

    test('should book appointment with valid data', async () => {
      const mockDoctor = {
        _id: 'doctor123',
        name: 'Dr. Smith',
        specialization: 'General Medicine',
        isActive: true
      };
      
      Doctor.findById.mockResolvedValue(mockDoctor);
      Appointment.findOne.mockResolvedValue(null); // No existing appointment
      
      const mockAppointment = {
        _id: 'apt123',
        patientId: 'user123',
        doctorId: { _id: 'doctor123', name: 'Dr. Smith', specialization: 'General Medicine' },
        date: new Date(validAppointmentData.date),
        time: validAppointmentData.time,
        symptoms: validAppointmentData.symptoms,
        status: 'scheduled',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'apt123',
          doctorId: { _id: 'doctor123', name: 'Dr. Smith', specialization: 'General Medicine' },
          date: new Date(validAppointmentData.date),
          time: validAppointmentData.time,
          symptoms: validAppointmentData.symptoms,
          status: 'scheduled',
          createdAt: new Date()
        })
      };
      
      Appointment.mockImplementation(() => mockAppointment);

      const response = await request(app)
        .post('/api/appointments/book')
        .send(validAppointmentData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Appointment booked successfully');
      expect(response.body.appointment).toHaveProperty('id');
    });

    test('should return error if doctor not found', async () => {
      Doctor.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/appointments/book')
        .send(validAppointmentData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });

    test('should return error if doctor is inactive', async () => {
      const mockDoctor = {
        _id: 'doctor123',
        isActive: false
      };
      
      Doctor.findById.mockResolvedValue(mockDoctor);

      const response = await request(app)
        .post('/api/appointments/book')
        .send(validAppointmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not currently accepting appointments');
    });

    test('should return error if time slot is unavailable', async () => {
      const mockDoctor = {
        _id: 'doctor123',
        isActive: true
      };
      
      Doctor.findById.mockResolvedValue(mockDoctor);
      Appointment.findOne.mockResolvedValue({ _id: 'existing123' }); // Existing appointment

      const response = await request(app)
        .post('/api/appointments/book')
        .send(validAppointmentData);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('Time slot is unavailable');
    });
  });

  describe('GET /api/appointments/patient - Get Patient Appointments', () => {
    test('should fetch patient appointments', async () => {
      const mockAppointments = [
        {
          _id: 'apt1',
          doctorId: { _id: 'doc1', name: 'Dr. Smith', specialization: 'Cardiology' },
          date: new Date(),
          time: '10:00',
          symptoms: 'Chest pain',
          status: 'scheduled',
          createdAt: new Date()
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAppointments)
      };
      
      Appointment.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/api/appointments/patient');

      expect(response.status).toBe(200);
      expect(response.body.appointments).toHaveLength(1);
      expect(response.body.appointments[0]).toHaveProperty('doctor');
    });
  });

  describe('GET /api/appointments/doctor - Get Doctor Appointments', () => {
    test('should fetch doctor appointments', async () => {
      const mockAppointments = [
        {
          _id: 'apt1',
          patientId: { _id: 'pat1', name: 'John Doe', age: 30, gender: 'male' },
          date: new Date(),
          time: '10:00',
          symptoms: 'Fever',
          status: 'scheduled',
          createdAt: new Date()
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAppointments)
      };
      
      Appointment.find.mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/api/appointments/doctor');

      expect(response.status).toBe(200);
      expect(response.body.appointments).toHaveLength(1);
      expect(response.body).toHaveProperty('groupedByDate');
    });
  });

  describe('PUT /api/appointments/:id/status - Update Appointment Status', () => {
    test('should update appointment status', async () => {
      const mockAppointment = {
        _id: 'apt123',
        doctorId: 'user123',
        status: 'scheduled',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
        patientId: { _id: 'pat1', name: 'John Doe' },
        date: new Date(),
        time: '10:00',
        symptoms: 'Fever',
        updatedAt: new Date()
      };
      
      Appointment.findById.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .put('/api/appointments/apt123/status')
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('updated successfully');
      expect(mockAppointment.save).toHaveBeenCalled();
    });

    test('should return error if appointment not found', async () => {
      Appointment.findById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/appointments/apt123/status')
        .send({ status: 'completed' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Appointment not found');
    });
  });
});
