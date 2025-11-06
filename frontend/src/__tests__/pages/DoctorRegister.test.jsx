import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DoctorRegister from '../../pages/DoctorRegister';
import * as api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderDoctorRegister = () => {
  return render(
    <BrowserRouter>
      <DoctorRegister />
    </BrowserRouter>
  );
};

describe('DoctorRegister Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders doctor registration form', () => {
    renderDoctorRegister();
    
    expect(screen.getByText(/register as a doctor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/specialization/i)).toBeInTheDocument();
    expect(screen.getByText(/availability schedule/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderDoctorRegister();
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/specialization is required/i)).toBeInTheDocument();
    });
  });

  test('validates availability schedule', async () => {
    renderDoctorRegister();
    
    // Fill in basic fields but leave availability empty
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Dr. Smith' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'doctor@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/specialization/i), { target: { value: 'Cardiology' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least one availability slot is required/i)).toBeInTheDocument();
    });
  });

  test('can add and remove availability slots', () => {
    renderDoctorRegister();
    
    // Initially should have one availability slot
    expect(screen.getAllByText(/day/i).length).toBeGreaterThan(0);
    
    // Add another slot
    const addButton = screen.getByText(/add another availability slot/i);
    fireEvent.click(addButton);
    
    // Should now have remove buttons
    const removeButtons = screen.getAllByText(/remove this slot/i);
    expect(removeButtons.length).toBeGreaterThan(0);
    
    // Remove a slot
    fireEvent.click(removeButtons[0]);
  });

  test('successful registration redirects to login', async () => {
    const mockResponse = {
      success: true,
      data: {
        message: 'Registration successful',
        doctor: {
          id: '456',
          name: 'Dr. Smith',
          email: 'doctor@example.com'
        }
      }
    };
    
    api.post.mockResolvedValue(mockResponse);
    
    renderDoctorRegister();
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Dr. Smith' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'doctor@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/specialization/i), { target: { value: 'Cardiology' } });
    
    // Fill in availability
    const daySelects = screen.getAllByRole('combobox');
    const timeInputs = screen.getAllByRole('textbox');
    
    fireEvent.change(daySelects[0], { target: { value: 'Monday' } });
    fireEvent.change(timeInputs[0], { target: { value: '09:00' } });
    fireEvent.change(timeInputs[1], { target: { value: '17:00' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/doctors/register', expect.objectContaining({
        name: 'Dr. Smith',
        email: 'doctor@example.com',
        password: 'password123',
        specialization: 'Cardiology',
        availability: expect.arrayContaining([
          expect.objectContaining({
            day: 'Monday',
            startTime: '09:00',
            endTime: '17:00'
          })
        ])
      }));
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    // Fast-forward time to trigger redirect
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('displays error message on failed registration', async () => {
    const mockResponse = {
      success: false,
      error: 'Email already exists'
    };
    
    api.post.mockResolvedValue(mockResponse);
    
    renderDoctorRegister();
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Dr. Smith' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/specialization/i), { target: { value: 'Cardiology' } });
    
    // Fill in availability
    const daySelects = screen.getAllByRole('combobox');
    const timeInputs = screen.getAllByRole('textbox');
    
    fireEvent.change(daySelects[0], { target: { value: 'Monday' } });
    fireEvent.change(timeInputs[0], { target: { value: '09:00' } });
    fireEvent.change(timeInputs[1], { target: { value: '17:00' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
