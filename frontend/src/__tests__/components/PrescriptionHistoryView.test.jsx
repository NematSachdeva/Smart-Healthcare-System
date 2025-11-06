import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrescriptionHistoryView from '../../components/doctor/PrescriptionHistoryView';
import * as api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockHistory = [
  {
    _id: 'h1',
    versionNumber: 2,
    editedBy: {
      name: 'Smith'
    },
    editedAt: '2024-11-02T10:00:00.000Z',
    oldVersion: 'Original prescription content',
    newVersion: 'Updated prescription content',
    changeDescription: 'Updated dosage'
  },
  {
    _id: 'h2',
    versionNumber: 1,
    editedBy: {
      name: 'Johnson'
    },
    editedAt: '2024-11-01T10:00:00.000Z',
    oldVersion: 'Initial draft',
    newVersion: 'Original prescription content',
    changeDescription: 'Initial approval'
  }
];

const mockPrescription = {
  _id: 'p123',
  patient: {
    name: 'John Doe'
  },
  version: 2,
  status: 'approved',
  updatedAt: '2024-11-02T10:00:00.000Z'
};

const renderPrescriptionHistoryView = (prescriptionId = 'p123') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/doctor/prescriptions/:prescriptionId/history" element={<PrescriptionHistoryView />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('PrescriptionHistoryView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the route with prescriptionId
    window.history.pushState({}, '', '/doctor/prescriptions/p123/history');
  });

  test('renders prescription history page', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/prescription history/i)).toBeInTheDocument();
      expect(screen.getByText(/view all changes made to this prescription/i)).toBeInTheDocument();
    });
  });

  test('loads prescription history on mount', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/prescriptions/p123/history');
    });
  });

  test('displays prescription information', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/approved/i)).toBeInTheDocument();
    });
  });

  test('displays version history timeline', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/version 2/i)).toBeInTheDocument();
      expect(screen.getByText(/version 1/i)).toBeInTheDocument();
      expect(screen.getByText(/dr\. smith/i)).toBeInTheDocument();
      expect(screen.getByText(/dr\. johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/updated dosage/i)).toBeInTheDocument();
      expect(screen.getByText(/initial approval/i)).toBeInTheDocument();
    });
  });

  test('displays empty state when no history', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: [] }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/no version history available/i)).toBeInTheDocument();
    });
  });

  test('opens version comparison modal', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/version 2/i)).toBeInTheDocument();
    });

    const viewChangesButtons = screen.getAllByRole('button', { name: /view changes/i });
    fireEvent.click(viewChangesButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/version comparison/i)).toBeInTheDocument();
      expect(screen.getByText(/previous version/i)).toBeInTheDocument();
      expect(screen.getByText(/new version/i)).toBeInTheDocument();
      expect(screen.getByText(/original prescription content/i)).toBeInTheDocument();
      expect(screen.getByText(/updated prescription content/i)).toBeInTheDocument();
    });
  });

  test('closes version comparison modal', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/version 2/i)).toBeInTheDocument();
    });

    // Open modal
    const viewChangesButtons = screen.getAllByRole('button', { name: /view changes/i });
    fireEvent.click(viewChangesButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/version comparison/i)).toBeInTheDocument();
    });

    // Close modal by clicking X button
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn => btn.querySelector('svg'));
    if (xButton) {
      fireEvent.click(xButton);
    }

    await waitFor(() => {
      expect(screen.queryByText(/version comparison/i)).not.toBeInTheDocument();
    });
  });

  test('displays error message on load failure', async () => {
    api.get.mockResolvedValue({
      success: false,
      error: 'Failed to load prescription history'
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/failed to load prescription history/i)).toBeInTheDocument();
    });
  });

  test('navigates back to prescriptions', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory }
        });
      }
      return Promise.resolve({
        success: true,
        data: { prescriptions: [mockPrescription] }
      });
    });

    renderPrescriptionHistoryView();

    await waitFor(() => {
      expect(screen.getByText(/prescription history/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to prescriptions/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/prescriptions');
  });
});
