import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, put } from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await get('/appointments/doctor');
      if (result.success) {
        setAppointments(result.data.appointments);
      } else {
        setError(result.error || 'Failed to load appointments');
      }
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Fetch appointments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === statusFilter));
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingStatus(appointmentId);
    setError('');
    setSuccess('');

    try {
      const result = await put(`/appointments/${appointmentId}/status`, { status: newStatus });
      if (result.success) {
        setSuccess('Appointment status updated successfully');
        // Update local state
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        ));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
      console.error('Update status error:', err);
    } finally {
      setUpdatingStatus(null);
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

  const groupAppointmentsByDate = () => {
    const grouped = {};
    filteredAppointments.forEach(apt => {
      const dateKey = formatDate(apt.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });

    // Sort appointments within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'no-show':
        return 'default';
      default:
        return 'default';
    }
  };

  const groupedAppointments = groupAppointmentsByDate();
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(a) - new Date(b)
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading appointments..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600">Manage your scheduled consultations</p>
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

        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} className="mb-6">
            {success}
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </span>
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
              title="No appointments found"
              description={statusFilter === 'all' ? 'You have no appointments scheduled' : `No ${statusFilter} appointments`}
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <Card key={date} padding="none" className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-4">
                  <h2 className="text-xl font-semibold">{date}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {groupedAppointments[date].map((appointment) => (
                    <div key={appointment._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {appointment.patient?.name || 'Unknown Patient'}
                              </h3>
                              <Badge variant={getBadgeVariant(appointment.status)} size="sm">
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-2 ml-15">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Time:</span> {appointment.time}
                            </div>
                            <p>
                              <span className="font-medium">Age:</span> {appointment.patient?.age || 'N/A'} | 
                              <span className="font-medium"> Gender:</span> {appointment.patient?.gender || 'N/A'}
                            </p>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="font-medium text-gray-700 mb-1">Symptoms:</p>
                              <p className="text-gray-600">{appointment.symptoms}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-3 lg:items-end">
                          {/* Status Update Dropdown */}
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Update Status:</label>
                            <select
                              value={appointment.status}
                              onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                              disabled={updatingStatus === appointment._id}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="no-show">No Show</option>
                            </select>
                            {updatingStatus === appointment._id && (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            )}
                          </div>

                          {/* Generate Prescription Button */}
                          {appointment.status === 'completed' && (
                            <Link to={`/doctor/prescriptions/generate/${appointment._id}`}>
                              <Button variant="success" size="sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generate AI Prescription
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
