import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AIPrescriptionGenerator from '../../components/doctor/AIPrescriptionGenerator';
import * as api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockAppointment = {
  _id: '123',
  patient: {
    name: 'John Doe',
    age: 45,
    gender: 'male',
    medicalHistory: 'Diabetes, Hypertension'
  },
  date: '2024-12-01T00:00:00.000Z',
  time: '10:00',
  symptoms: 'Chest pain and shortness of breath',
  status: 'scheduled'
};

const mockPrescription = {
  _id: 'p123',
  aiDraft: JSON.stringify({
    diagnosis: 'Angina',
    medications: [
      {
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        duration: '30 days'
      }
    ],
    advice: 'Avoid strenuous activities',
    followUp: 'Follow up in 1 week'
  }),
  status: 'draft'
};

const renderAIPrescriptionGenerator = (appointmentId = '123') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/doctor/appointments/:appointmentId/prescription" element={<AIPrescriptionGenerator />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('AIPrescriptionGenerator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the route with appointmentId
    window.history.pushState({}, '', '/doctor/appointments/123/prescription');
  });

  test('renders appointment details', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointment: mockAppointment }
    });

    renderAIPrescriptionGenerator();

    await waitFor(() => {
      expect(screen.getByText(/generate ai prescription/i)).toBeInTheDocument();
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/45/i)).toBeInTheDocument();
      expect(screen.getByText(/male/i)).toBeInTheDocument();
      expect(screen.getByText(/chest pain and shortness of breath/i)).toBeInTheDocument();
      expect(screen.getByText(/diabetes, hypertension/i)).toBeInTheDocument();
    });
  });

  test('loads appointment on mount', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointment: mockAppointment }
    });

    renderAIPrescriptionGenerator();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/appointments/123');
    });
  });

  test('displays loading state while fetching appointment', () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderAIPrescriptionGenerator();

    expect(screen.getByText(/loading appointment details/i)).toBeInTheDocument();
  });

  test('generates AI prescription on button click', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointment: mockAppointment }
    });

    api.post.mockResolvedValue({
      success: true,
      data: { prescription: mockPrescription }
    });

    renderAIPrescriptionGenerator();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate ai prescription/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/prescriptions/ai-draft', {
        appointmentId: '123',
        symptoms: mockAppointment.symptoms,
        medicalHistory: mockAppointment.patient.medicalHistory
      });
    });
  });

  test('displays loading state while generating prescription', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointment: mockAppointment }
    });

    api.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderAIPrescriptionGenerator();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate ai prescription/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/generating prescription/i)).toBeInTheDocument();
      expect(screen.getByText(/please wait while our ai analyzes/i)).toBeInTheDocument();
    });
  });

  test('displays error message on generation failure', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointment: mockAppointment }
    });

    api.post.mockResolvedValue({
      success: false,
      error: 'AI service unavailable'
    });

    renderAIPrescriptionGenerator();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate ai prescription/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/ai service unavailable/i)).toBeInTheDocument();
    });
  });

  test('displays error when appointment not found', async () => {
    api.get.mockResolvedValue({
      success: false,
      error: 'Appointment not found'
    });

    renderAIPrescriptionGenerator();

    await waitFor(() => {
      expect(screen.getByText(/appointment not found/i)).toBeInTheDocument();
    });
  });

  test('navigates back to appointments', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointment: mockAppointment }
    });

    renderAIPrescriptionGenerator();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to appointments/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/appointments');
  });
});
