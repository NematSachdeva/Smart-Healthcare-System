import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const DoctorPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, statusFilter]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await get('/prescriptions/doctor');
      if (result.success) {
        setPrescriptions(result.data.prescriptions);
      } else {
        setError(result.error || 'Failed to load prescriptions');
      }
    } catch (err) {
      setError('Failed to load prescriptions');
      console.error('Fetch prescriptions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    if (statusFilter === 'all') {
      setFilteredPrescriptions(prescriptions);
    } else {
      setFilteredPrescriptions(prescriptions.filter(p => p.status === statusFilter));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parsePrescription = (prescriptionText) => {
    try {
      return JSON.parse(prescriptionText);
    } catch (e) {
      return null;
    }
  };

  const handleViewHistory = (prescriptionId) => {
    navigate(`/doctor/prescriptions/history/${prescriptionId}`);
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleApprovePrescription = (prescription) => {
    navigate(`/doctor/prescriptions/review/${prescription._id}`, {
      state: { prescription }
    });
  };

  const closeModal = () => {
    setSelectedPrescription(null);
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading prescriptions..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
                <p className="text-gray-600">Manage and review all prescriptions</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/doctor/dashboard')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" onClose={() => setError('')} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Filter */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <span className="text-sm text-gray-600">
              {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <Card>
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="No prescriptions found"
              description={statusFilter === 'all' ? 'No prescriptions have been created yet' : `No ${statusFilter} prescriptions`}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPrescriptions.map((prescription) => {
              const parsed = parsePrescription(prescription.finalPrescription || prescription.aiDraft);
              return (
                <Card key={prescription._id} hover>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {prescription.patient?.name || 'Unknown Patient'}
                          </h3>
                          <Badge variant={getBadgeVariant(prescription.status)} size="sm">
                            {prescription.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 ml-15">
                        <p>
                          <span className="font-medium">Patient Age:</span> {prescription.patient?.age || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Created:</span> {formatDate(prescription.createdAt)}
                        </p>
                        {prescription.status === 'approved' && (
                          <p>
                            <span className="font-medium">Approved:</span> {formatDate(prescription.updatedAt)}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Version:</span> {prescription.version || 1}
                        </p>
                      </div>

                      {/* Prescription Preview */}
                      {parsed && (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Prescription Summary</h4>
                          <div className="text-sm text-gray-700 space-y-2">
                            <p><span className="font-medium">Diagnosis:</span> {parsed.diagnosis}</p>
                            <div>
                              <span className="font-medium">Medications:</span>
                              <ul className="list-disc list-inside ml-4 mt-1">
                                {parsed.medications?.slice(0, 3).map((med, index) => (
                                  <li key={index}>{med.name} - {med.dosage}</li>
                                ))}
                                {parsed.medications?.length > 3 && (
                                  <li className="text-gray-500">...and {parsed.medications.length - 3} more</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {prescription.notes && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-1">Notes</h4>
                          <p className="text-sm text-blue-800">{prescription.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3 lg:items-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewDetails(prescription)}
                      >
                        View Details
                      </Button>
                      {prescription.status === 'draft' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprovePrescription(prescription)}
                        >
                          Approve Prescription
                        </Button>
                      )}
                      {prescription.status === 'approved' && prescription.version > 1 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewHistory(prescription._id)}
                        >
                          View History
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <Modal
          isOpen={!!selectedPrescription}
          onClose={closeModal}
          title="Prescription Details"
          size="large"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient: {selectedPrescription.patient?.name}</h3>
              <p className="text-sm text-gray-600">Status: {selectedPrescription.status}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {selectedPrescription.finalPrescription || selectedPrescription.aiDraft}
              </pre>
            </div>
            {selectedPrescription.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-1">Notes</h4>
                <p className="text-sm text-blue-800">{selectedPrescription.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
