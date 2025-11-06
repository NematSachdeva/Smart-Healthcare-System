import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PatientAppointments from '../../pages/PatientAppointments';
import * as api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

const mockAppointments = [
  {
    _id: '1',
    doctor: {
      name: 'Smith',
      specialization: 'Cardiology'
    },
    date: '2024-12-01T00:00:00.000Z',
    time: '10:00',
    symptoms: 'Chest pain',
    status: 'scheduled'
  },
  {
    _id: '2',
    doctor: {
      name: 'Johnson',
      specialization: 'Pediatrics'
    },
    date: '2024-11-15T00:00:00.000Z',
    time: '14:00',
    symptoms: 'Fever',
    status: 'completed'
  },
  {
    _id: '3',
    doctor: {
      name: 'Williams',
      specialization: 'General Medicine'
    },
    date: '2024-11-20T00:00:00.000Z',
    time: '09:00',
    symptoms: 'Headache',
    status: 'cancelled'
  }
];

const renderPatientAppointments = () => {
  return render(
    <BrowserRouter>
      <PatientAppointments />
    </BrowserRouter>
  );
};

describe('PatientAppointments Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders appointments list page', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointments: mockAppointments }
    });

    renderPatientAppointments();

    await waitFor(() => {
      expect(screen.getByText(/my appointments/i)).toBeInTheDocument();
      expect(screen.getByText(/view and manage your appointments/i)).toBeInTheDocument();
    });
  });

  test('loads and displays appointments', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointments: mockAppointments }
    });

    renderPatientAppointments();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/appointments/patient');
      expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/chest pain/i)).toBeInTheDocument();
    });
  });

  test('displays empty state when no appointments', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointments: [] }
    });

    renderPatientAppointments();

    await waitFor(() => {
      expect(screen.getByText(/no appointments yet/i)).toBeInTheDocument();
      expect(screen.getByText(/book your first appointment/i)).toBeInTheDocument();
    });
  });

  test('filters appointments by status', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointments: mockAppointments }
    });

    renderPatientAppointments();

    await waitFor(() => {
      expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument();
    });

    // Click on "Scheduled" filter
    const scheduledButton = screen.getByRole('button', { name: /scheduled \(1\)/i });
    fireEvent.click(scheduledButton);

    await waitFor(() => {
      expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument();
      expect(screen.queryByText(/dr\. johnson/i)).not.toBeInTheDocument();
    });

    // Click on "Completed" filter
    const completedButton = screen.getByRole('button', { name: /completed \(1\)/i });
    fireEvent.click(completedButton);

    await waitFor(() => {
      expect(screen.getByText(/dr\. johnson/i)).toBeInTheDocument();
      expect(screen.queryByText(/dr\. smith/i)).not.toBeInTheDocument();
    });
  });

  test('displays appointment status badges', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointments: mockAppointments }
    });

    renderPatientAppointments();

    await waitFor(() => {
      expect(screen.getAllByText(/scheduled/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/cancelled/i).length).toBeGreaterThan(0);
    });
  });

  test('displays error message on load failure', async () => {
    api.get.mockResolvedValue({
      success: false,
      error: 'Failed to load appointments'
    });

    renderPatientAppointments();

    await waitFor(() => {
      expect(screen.getByText(/failed to load appointments/i)).toBeInTheDocument();
    });
  });

  test('navigates back to dashboard', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { appointments: mockAppointments }
    });

    renderPatientAppointments();

    await waitFor(() => {
      expect(screen.getByText(/my appointments/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
  });
});
