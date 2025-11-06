import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { get } from '../utils/api';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch appointments
      const appointmentsResult = await get('/appointments/patient');
      if (appointmentsResult.success) {
        // Filter upcoming appointments (scheduled status and future dates)
        const upcoming = appointmentsResult.data.appointments
          .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3); // Show only 3 upcoming
        setUpcomingAppointments(upcoming);
      }

      // Fetch prescriptions
      const prescriptionsResult = await get('/prescriptions/patient');
      if (prescriptionsResult.success) {
        // Get recent prescriptions (last 3)
        const recent = prescriptionsResult.data.prescriptions.slice(0, 3);
        setRecentPrescriptions(recent);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {user?.name || 'Patient'}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Manage your appointments and prescriptions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link
            to="/patient/appointments/book"
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 sm:p-6 rounded-lg shadow-md transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">Book Appointment</h3>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">Schedule a consultation with a doctor</p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/appointments"
            className="bg-green-600 hover:bg-green-700 text-white p-4 sm:p-6 rounded-lg shadow-md transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">View Appointments</h3>
                <p className="text-green-100 text-xs sm:text-sm mt-1">See all your scheduled appointments</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm sm:text-base">No upcoming appointments</p>
              <Link to="/patient/appointments/book" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm mt-2 inline-block">
                Book your first appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                        Dr. {appointment.doctor?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">{appointment.doctor?.specialization || 'General'}</p>
                      <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-700">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="break-words">{formatDate(appointment.date)} at {appointment.time}</span>
                      </div>
                    </div>
                    <span className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 self-start">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Prescriptions</h2>
            <Link to="/patient/prescriptions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>

          {recentPrescriptions.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm sm:text-base">No prescriptions yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentPrescriptions.map((prescription) => (
                <div key={prescription._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                        Dr. {prescription.doctor?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">{prescription.doctor?.specialization || 'General'}</p>
                      <p className="mt-2 text-xs sm:text-sm text-gray-700">
                        Approved on {formatDate(prescription.updatedAt)}
                      </p>
                    </div>
                    <Link 
                      to={`/patient/prescriptions`}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium self-start"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
