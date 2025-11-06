import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrescriptionReviewForm from '../../components/doctor/PrescriptionReviewForm';
import * as api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

const mockAppointment = {
  _id: '123',
  patient: {
    name: 'John Doe',
    age: 45,
    gender: 'male'
  },
  date: '2024-12-01T00:00:00.000Z',
  time: '10:00',
  symptoms: 'Chest pain and shortness of breath'
};

const renderPrescriptionReviewForm = () => {
  return render(
    <BrowserRouter>
      <PrescriptionReviewForm prescription={mockPrescription} appointment={mockAppointment} />
    </BrowserRouter>
  );
};

describe('PrescriptionReviewForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders prescription review form', () => {
    renderPrescriptionReviewForm();

    expect(screen.getByText(/review & approve prescription/i)).toBeInTheDocument();
    expect(screen.getByText(/patient information/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-generated draft/i)).toBeInTheDocument();
    expect(screen.getByText(/final prescription/i)).toBeInTheDocument();
  });

  test('displays patient information', () => {
    renderPrescriptionReviewForm();

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/45/i)).toBeInTheDocument();
    expect(screen.getByText(/male/i)).toBeInTheDocument();
    expect(screen.getByText(/chest pain and shortness of breath/i)).toBeInTheDocument();
  });

  test('displays AI-generated draft', () => {
    renderPrescriptionReviewForm();

    expect(screen.getByText(/angina/i)).toBeInTheDocument();
    expect(screen.getByText(/aspirin/i)).toBeInTheDocument();
    expect(screen.getByText(/81mg/i)).toBeInTheDocument();
    expect(screen.getByText(/avoid strenuous activities/i)).toBeInTheDocument();
  });

  test('allows editing final prescription', () => {
    renderPrescriptionReviewForm();

    const textarea = screen.getByPlaceholderText(/enter prescription details/i);
    expect(textarea).toHaveValue(mockPrescription.aiDraft);

    fireEvent.change(textarea, { target: { value: 'Modified prescription content' } });
    expect(textarea).toHaveValue('Modified prescription content');
  });

  test('allows adding additional notes', () => {
    renderPrescriptionReviewForm();

    const notesTextarea = screen.getByPlaceholderText(/add any additional notes/i);
    fireEvent.change(notesTextarea, { target: { value: 'Take with food' } });

    expect(notesTextarea).toHaveValue('Take with food');
  });

  test('approves prescription successfully', async () => {
    api.put.mockResolvedValue({
      success: true,
      data: {
        prescription: {
          ...mockPrescription,
          status: 'approved'
        }
      }
    });

    renderPrescriptionReviewForm();

    const approveButton = screen.getByRole('button', { name: /approve prescription/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(`/prescriptions/approve/${mockPrescription._id}`, {
        finalPrescription: mockPrescription.aiDraft,
        notes: ''
      });
      expect(screen.getByText(/prescription approved successfully/i)).toBeInTheDocument();
    });

    // Fast-forward time to trigger redirect
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/doctor/prescriptions');
    });
  });

  test('validates empty prescription content', async () => {
    renderPrescriptionReviewForm();

    const textarea = screen.getByPlaceholderText(/enter prescription details/i);
    fireEvent.change(textarea, { target: { value: '' } });

    const approveButton = screen.getByRole('button', { name: /approve prescription/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/prescription content cannot be empty/i)).toBeInTheDocument();
    });
  });

  test('displays error message on approval failure', async () => {
    api.put.mockResolvedValue({
      success: false,
      error: 'Failed to approve prescription'
    });

    renderPrescriptionReviewForm();

    const approveButton = screen.getByRole('button', { name: /approve prescription/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to approve prescription/i)).toBeInTheDocument();
    });
  });

  test('disables buttons while submitting', async () => {
    api.put.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderPrescriptionReviewForm();

    const approveButton = screen.getByRole('button', { name: /approve prescription/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(approveButton).toBeDisabled();
      expect(screen.getByText(/approving/i)).toBeInTheDocument();
    });
  });

  test('cancels and navigates back to appointments', () => {
    renderPrescriptionReviewForm();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/appointments');
  });
});
