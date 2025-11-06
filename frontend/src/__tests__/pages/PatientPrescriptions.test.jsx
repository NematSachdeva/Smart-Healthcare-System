import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PatientPrescriptions from '../../pages/PatientPrescriptions';
import * as api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPrescriptions = [
  {
    _id: '1',
    doctor: {
      name: 'Smith',
      specialization: 'Cardiology'
    },
    finalPrescription: JSON.stringify({
      diagnosis: 'Hypertension',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days'
        }
      ],
      advice: 'Monitor blood pressure regularly',
      followUp: 'Follow up in 2 weeks'
    }),
    notes: 'Take medication with food',
    version: 1,
    status: 'approved',
    updatedAt: '2024-11-01T10:00:00.000Z'
  },
  {
    _id: '2',
    doctor: {
      name: 'Johnson',
      specialization: 'General Medicine'
    },
    finalPrescription: 'Rest and drink plenty of fluids',
    notes: '',
    version: 1,
    status: 'approved',
    updatedAt: '2024-10-15T14:00:00.000Z'
  }
];

const renderPatientPrescriptions = () => {
  return render(
    <BrowserRouter>
      <PatientPrescriptions />
    </BrowserRouter>
  );
};

describe('PatientPrescriptions Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders prescriptions list page', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { prescriptions: mockPrescriptions }
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(screen.getByText(/my prescriptions/i)).toBeInTheDocument();
      expect(screen.getByText(/view your approved prescriptions/i)).toBeInTheDocument();
    });
  });

  test('loads and displays prescriptions', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { prescriptions: mockPrescriptions }
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/prescriptions/patient');
      expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/dr\. johnson/i)).toBeInTheDocument();
    });
  });

  test('displays empty state when no prescriptions', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { prescriptions: [] }
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(screen.getByText(/no prescriptions yet/i)).toBeInTheDocument();
      expect(screen.getByText(/your approved prescriptions will appear here/i)).toBeInTheDocument();
    });
  });

  test('opens prescription detail modal', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { prescriptions: mockPrescriptions }
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument();
    });

    // Click on "View Details" button for first prescription
    const viewButtons = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/prescription details/i)).toBeInTheDocument();
      expect(screen.getByText(/hypertension/i)).toBeInTheDocument();
      expect(screen.getByText(/lisinopril/i)).toBeInTheDocument();
    });
  });

  test('closes prescription detail modal', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { prescriptions: mockPrescriptions }
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument();
    });

    // Open modal
    const viewButtons = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/prescription details/i)).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/prescription details/i)).not.toBeInTheDocument();
    });
  });

  test('displays doctor notes in prescription card', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { prescriptions: mockPrescriptions }
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(screen.getByText(/take medication with food/i)).toBeInTheDocument();
    });
  });

  test('displays error message on load failure', async () => {
    api.get.mockResolvedValue({
      success: false,
      error: 'Failed to load prescriptions'
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(screen.getByText(/failed to load prescriptions/i)).toBeInTheDocument();
    });
  });

  test('navigates back to dashboard', async () => {
    api.get.mockResolvedValue({
      success: true,
      data: { prescriptions: mockPrescriptions }
    });

    renderPatientPrescriptions();

    await waitFor(() => {
      expect(screen.getByText(/my prescriptions/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
  });
});
