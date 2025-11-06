import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const PatientPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');

    const result = await get('/prescriptions/patient');

    if (result.success) {
      setPrescriptions(result.data.prescriptions);
    } else {
      setError(result.error || 'Failed to load prescriptions');
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDetailModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPrescription(null);
  };

  const parsePrescriptionContent = (content) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return parsed;
    } catch (e) {
      // If not JSON, return as plain text
      return { text: content };
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading prescriptions..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center text-sm font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
              <p className="text-gray-600">View your approved prescriptions</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="error" onClose={() => setError('')} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Prescriptions List */}
        {prescriptions.length === 0 ? (
          <Card>
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="No prescriptions yet"
              description="Your approved prescriptions will appear here after your doctor consultations"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((prescription) => (
              <Card 
                key={prescription._id} 
                hover
                className="transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Prescription</h3>
                      <p className="text-xs text-gray-500">Version {prescription.version || 1}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Approved
                  </Badge>
                </div>

                {/* Doctor Info */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Prescribed by</p>
                  <p className="font-semibold text-gray-900">
                    Dr. {prescription.doctor?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {prescription.doctor?.specialization || 'General Practice'}
                  </p>
                </div>

                {/* Date Info */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Approved on {formatDate(prescription.updatedAt)}</span>
                  </div>
                </div>

                {/* Notes Preview */}
                {prescription.notes && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs font-medium text-yellow-800 mb-1">Doctor's Notes:</p>
                    <p className="text-sm text-yellow-900 line-clamp-2">
                      {prescription.notes}
                    </p>
                  </div>
                )}

                {/* View Details Button */}
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => openDetailModal(prescription)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPrescription && (
        <Modal
          isOpen={showDetailModal}
          onClose={closeDetailModal}
          title="Prescription Details"
          size="large"
        >
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-2">Prescribed by</p>
              <p className="text-lg font-bold text-gray-900">
                Dr. {selectedPrescription.doctor?.name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">
                {selectedPrescription.doctor?.specialization || 'General Practice'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Approved: {formatDateTime(selectedPrescription.updatedAt)}
              </p>
            </div>

            {/* Prescription Content */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Prescription</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {(() => {
                  const content = parsePrescriptionContent(selectedPrescription.finalPrescription);
                  
                  if (content.diagnosis || content.medications) {
                    return (
                      <div className="space-y-4">
                        {content.diagnosis && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Diagnosis:</p>
                            <p className="text-gray-700">{content.diagnosis}</p>
                          </div>
                        )}
                        
                        {content.medications && content.medications.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-2">Medications:</p>
                            <div className="space-y-3">
                              {content.medications.map((med, index) => (
                                <div key={index} className="bg-white p-3 rounded border border-gray-200">
                                  <p className="font-medium text-gray-900">{med.name}</p>
                                  <div className="mt-1 text-sm text-gray-600 space-y-1">
                                    {med.dosage && <p>Dosage: {med.dosage}</p>}
                                    {med.frequency && <p>Frequency: {med.frequency}</p>}
                                    {med.duration && <p>Duration: {med.duration}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {content.advice && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Advice:</p>
                            <p className="text-gray-700">{content.advice}</p>
                          </div>
                        )}
                        
                        {content.followUp && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Follow-up:</p>
                            <p className="text-gray-700">{content.followUp}</p>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <p className="text-gray-700 whitespace-pre-wrap">{content.text || selectedPrescription.finalPrescription}</p>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Doctor's Notes */}
            {selectedPrescription.notes && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Doctor's Notes</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPrescription.notes}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={closeDetailModal}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => window.print()}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientPrescriptions;
