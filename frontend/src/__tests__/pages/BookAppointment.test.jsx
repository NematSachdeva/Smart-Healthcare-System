import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookAppointment from '../../pages/BookAppointment';
import * as api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockDoctors = [
  {
    _id: '1',
    name: 'Smith',
    specialization: 'Cardiology',
    isActive: true
  },
  {
    _id: '2',
    name: 'Johnson',
    specialization: 'Pediatrics',
    isActive: true
  }
];

const renderBookAppointment = () => {
  return render(
    <BrowserRouter>
      <BookAppointment />
    </BrowserRouter>
  );
};

describe('BookAppointment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders appointment booking form', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { doctors: mockDoctors }
    });

    renderBookAppointment();

    await waitFor(() => {
      expect(screen.getByText(/book an appointment/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/select doctor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/appointment date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/appointment time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/symptoms/i)).toBeInTheDocument();
    });
  });

  test('loads and displays doctors list', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { doctors: mockDoctors }
    });

    renderBookAppointment();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/doctors/list');
      expect(screen.getByText(/dr\. smith - cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/dr\. johnson - pediatrics/i)).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { doctors: mockDoctors }
    });

    renderBookAppointment();

    await waitFor(() => {
      expect(screen.getByLabelText(/select doctor/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please select a doctor/i)).toBeInTheDocument();
      expect(screen.getByText(/please select a date/i)).toBeInTheDocument();
      expect(screen.getByText(/please select a time/i)).toBeInTheDocument();
      expect(screen.getByText(/please describe your symptoms/i)).toBeInTheDocument();
    });
  });

  test('validates symptoms minimum length', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { doctors: mockDoctors }
    });

    renderBookAppointment();

    await waitFor(() => {
      expect(screen.getByLabelText(/symptoms/i)).toBeInTheDocument();
    });

    const symptomsInput = screen.getByLabelText(/symptoms/i);
    fireEvent.change(symptomsInput, { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
    });
  });

  test('successful appointment booking redirects to appointments page', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { doctors: mockDoctors }
    });

    api.post.mockResolvedValue({
      success: true,
      data: {
        appointment: {
          id: '123',
          doctorId: '1',
          date: '2024-12-01',
          time: '10:00',
          status: 'scheduled'
        }
      }
    });

    renderBookAppointment();

    await waitFor(() => {
      expect(screen.getByLabelText(/select doctor/i)).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/select doctor/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/appointment date/i), { target: { value: '2024-12-01' } });
    fireEvent.change(screen.getByLabelText(/appointment time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/symptoms/i), { target: { value: 'I have been experiencing chest pain' } });

    const submitButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/appointments/book', {
        doctorId: '1',
        date: '2024-12-01',
        time: '10:00',
        symptoms: 'I have been experiencing chest pain'
      });
      expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument();
    });

    // Fast-forward time to trigger redirect
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/patient/appointments');
    });
  });

  test('displays error message on booking failure', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { doctors: mockDoctors }
    });

    api.post.mockResolvedValue({
      success: false,
      error: 'Time slot unavailable'
    });

    renderBookAppointment();

    await waitFor(() => {
      expect(screen.getByLabelText(/select doctor/i)).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/select doctor/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/appointment date/i), { target: { value: '2024-12-01' } });
    fireEvent.change(screen.getByLabelText(/appointment time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/symptoms/i), { target: { value: 'I have been experiencing chest pain' } });

    const submitButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/time slot unavailable/i)).toBeInTheDocument();
    });
  });
});
