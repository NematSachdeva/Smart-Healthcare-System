import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post } from '../../utils/api';
import PrescriptionReviewForm from './PrescriptionReviewForm';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';

const AIPrescriptionGenerator = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    fetchAppointment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const fetchAppointment = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await get(`/appointments/${appointmentId}`);
      if (result.success) {
        setAppointment(result.data.appointment);
      } else {
        setError(result.error || 'Failed to load appointment details');
      }
    } catch (err) {
      setError('Failed to load appointment details');
      console.error('Fetch appointment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrescription = async () => {
    setGenerating(true);
    setError('');

    try {
      const result = await post('/prescriptions/ai-draft', {
        appointmentId: appointmentId,
        symptoms: appointment.symptoms,
        medicalHistory: appointment.patient?.medicalHistory || ''
      });

      if (result.success) {
        setPrescription(result.data.prescription);
      } else {
        setError(result.error || 'Failed to generate prescription');
      }
    } catch (err) {
      setError('Failed to generate prescription');
      console.error('Generate prescription error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading appointment details..." />;
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">Appointment not found</p>
          <Button
            variant="primary"
            onClick={() => navigate('/doctor/appointments')}
          >
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  // If prescription is generated, show the review form
  if (prescription) {
    return <PrescriptionReviewForm prescription={prescription} appointment={appointment} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Generate AI Prescription</h1>
                <p className="text-gray-600">Review patient details and generate prescription draft</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/doctor/appointments')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Appointments
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

        {/* Appointment Details Card */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
              <p className="text-gray-900">{appointment.patient?.name || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <p className="text-gray-900">{formatDate(appointment.date)} at {appointment.time}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <p className="text-gray-900">{appointment.patient?.age || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <p className="text-gray-900">{appointment.patient?.gender || 'N/A'}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900">{appointment.symptoms}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900">
                {appointment.patient?.medicalHistory || 'No medical history available'}
              </p>
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Prescription Draft</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to generate an AI-powered prescription draft based on the patient's symptoms and medical history. 
            You will be able to review and edit the draft before approving it.
          </p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGeneratePrescription}
            loading={generating}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate AI Prescription
          </Button>

          {generating && (
            <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <p className="text-sm">
                Please wait while our AI analyzes the patient information and generates a prescription draft. 
                This may take a few moments...
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AIPrescriptionGenerator;