import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { put } from '../../utils/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Alert from '../common/Alert';

const PrescriptionReviewForm = ({ prescription, appointment }) => {
  const navigate = useNavigate();
  
  // Handle aiDraft whether it's a string or object
  const getAiDraftString = () => {
    if (!prescription || !prescription.aiDraft) return '';
    if (typeof prescription.aiDraft === 'string') {
      return prescription.aiDraft;
    } else if (typeof prescription.aiDraft === 'object') {
      return JSON.stringify(prescription.aiDraft, null, 2);
    }
    return '';
  };
  
  // Initialize hooks before any conditional returns
  const [finalPrescription, setFinalPrescription] = useState(getAiDraftString());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Validate prescription object has required ID (after hooks)
  if (!prescription || (!prescription._id && !prescription.id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Invalid prescription data. Missing prescription ID.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/doctor/prescriptions')}
            className="mt-4"
          >
            Back to Prescriptions
          </Button>
        </div>
      </div>
    );
  }

  // Get prescription ID (prefer _id over id)
  const prescriptionId = prescription._id || prescription.id;

  const parsePrescription = (prescriptionData) => {
    try {
      // If it's already an object, return it
      if (typeof prescriptionData === 'object' && prescriptionData !== null) {
        return prescriptionData;
      }
      // If it's a string, parse it
      if (typeof prescriptionData === 'string') {
        return JSON.parse(prescriptionData);
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleApprove = async () => {
    if (!finalPrescription.trim()) {
      setError('Prescription content cannot be empty');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await put(`/prescriptions/approve/${prescriptionId}`, {
        finalPrescription: finalPrescription,
        notes: notes
      });

      if (result.success) {
        setSuccess('Prescription approved successfully!');
        setTimeout(() => {
          navigate('/doctor/prescriptions');
        }, 2000);
      } else {
        setError(result.error || 'Failed to approve prescription');
      }
    } catch (err) {
      setError('Failed to approve prescription');
      console.error('Approve prescription error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/doctor/prescriptions');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const parsedPrescription = parsePrescription(prescription.aiDraft);

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
                <h1 className="text-3xl font-bold text-gray-900">Review & Approve Prescription</h1>
                <p className="text-gray-600">Review the AI-generated draft and make any necessary edits</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" onClose={() => setError('')} className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {/* Patient Info */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{appointment?.patient?.name || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <p className="text-gray-900">{formatDate(appointment?.date)} at {appointment?.time}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <p className="text-gray-900">{appointment?.patient?.age || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="text-gray-900">{appointment?.patient?.gender || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment?.symptoms}</p>
          </div>
        </Card>

        {/* AI Generated Draft (Read-only view) */}
        {parsedPrescription && (
          <Card className="mb-6 bg-blue-50 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4">AI-Generated Draft</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Diagnosis</label>
                <p className="text-blue-800">{parsedPrescription.diagnosis}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Medications</label>
                <div className="space-y-2">
                  {parsedPrescription.medications?.map((med, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg">
                      <p className="font-semibold text-blue-900">{med.name}</p>
                      <p className="text-sm text-blue-800">
                        Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Advice</label>
                <p className="text-blue-800">{parsedPrescription.advice}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Follow-up</label>
                <p className="text-blue-800">{parsedPrescription.followUp}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Editable Prescription */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Final Prescription</h2>
          <p className="text-sm text-gray-600 mb-4">
            Edit the prescription below as needed. You can modify any part of the AI-generated draft.
          </p>
          <textarea
            value={finalPrescription}
            onChange={(e) => setFinalPrescription(e.target.value)}
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter prescription details..."
          />
        </Card>

        {/* Additional Notes */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional notes or instructions..."
          />
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={handleApprove}
              loading={submitting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve Prescription
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrescriptionReviewForm;
