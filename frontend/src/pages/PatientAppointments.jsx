import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get } from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, filterAppointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    const result = await get('/appointments/patient');

    if (result.success) {
      // Sort appointments by date (most recent first)
      const sorted = result.data.appointments.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setAppointments(sorted);
    } else {
      setError(result.error || 'Failed to load appointments');
    }

    setLoading(false);
  };

  const filterAppointments = () => {
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter(apt => apt.status === statusFilter)
      );
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

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled':
        return 'success';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'danger';
      case 'no-show':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading appointments..." />;
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600">View and manage your appointments</p>
              </div>
            </div>
            <Link to="/patient/appointments/book">
              <Button variant="primary" size="md">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book New Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="error" onClose={() => setError('')} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Filter Tabs */}
        <Card padding="none" className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('scheduled')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  statusFilter === 'scheduled'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduled ({appointments.filter(a => a.status === 'scheduled').length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  statusFilter === 'completed'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed ({appointments.filter(a => a.status === 'completed').length})
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  statusFilter === 'cancelled'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
              </button>
            </nav>
          </div>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card>
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title={statusFilter === 'all' ? 'No appointments yet' : `No ${statusFilter} appointments`}
              description={
                statusFilter === 'all' 
                  ? 'Book your first appointment to get started'
                  : `You don't have any ${statusFilter} appointments`
              }
              actionLabel={statusFilter === 'all' ? 'Book Appointment' : undefined}
              onAction={statusFilter === 'all' ? () => navigate('/patient/appointments/book') : undefined}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment._id} hover className="transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Dr. {appointment.doctor?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor?.specialization || 'General Practice'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                    </div>

                    {appointment.symptoms && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Symptoms / Reason:</p>
                        <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                      </div>
                    )}
                  </div>
                  
                  <Badge variant={getBadgeVariant(appointment.status)} size="md">
                    {appointment.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
