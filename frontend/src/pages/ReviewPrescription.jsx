import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { get } from '../utils/api';
import PrescriptionReviewForm from '../components/doctor/PrescriptionReviewForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const ReviewPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [prescription, setPrescription] = useState(location.state?.prescription || null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(!prescription);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!prescription) {
      fetchPrescription();
    } else if (prescription.appointmentId) {
      fetchAppointment(prescription.appointmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const result = await get(`/prescriptions/doctor`);
      if (result.success) {
        const found = result.data.prescriptions.find(p => {
          const prescriptionId = p._id || p.id;
          return prescriptionId === id || prescriptionId?.toString() === id;
        });
        if (found) {
          setPrescription(found);
          if (found.appointmentId) {
            fetchAppointment(found.appointmentId);
          }
        } else {
          setError('Prescription not found');
        }
      } else {
        setError('Failed to load prescription');
      }
    } catch (err) {
      setError('Failed to load prescription');
      console.error('Fetch prescription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointment = async (appointmentId) => {
    try {
      const result = await get(`/appointments/${appointmentId}`);
      if (result.success) {
        setAppointment(result.data.appointment);
      }
    } catch (err) {
      console.error('Failed to load appointment:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading prescription..." />;
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error || 'Prescription not found'}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/doctor/prescriptions')}
          >
            Back to Prescriptions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PrescriptionReviewForm 
      prescription={prescription} 
      appointment={appointment || { patient: {}, symptoms: 'N/A' }} 
    />
  );
};

export default ReviewPrescription;
