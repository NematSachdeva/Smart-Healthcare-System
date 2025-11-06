import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const DoctorManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    doctorId: null,
    doctorName: '',
    newStatus: false
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/users');
      if (response.data.users) {
        const doctorUsers = response.data.users.filter(u => u.role === 'doctor');
        setDoctors(doctorUsers);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (doctor) => {
    setConfirmDialog({
      show: true,
      doctorId: doctor.id,
      doctorName: doctor.name,
      newStatus: !doctor.isActive
    });
  };

  const confirmStatusChange = async () => {
    try {
      setError('');
      setSuccess('');

      const response = await api.put(
        `/admin/doctors/${confirmDialog.doctorId}/status`,
        { isActive: confirmDialog.newStatus }
      );

      if (response.data.doctor) {
        setDoctors(doctors.map(d => 
          d.id === confirmDialog.doctorId 
            ? { ...d, isActive: confirmDialog.newStatus }
            : d
        ));
        setSuccess(response.data.message || 'Doctor status updated successfully');
      }

      setConfirmDialog({ show: false, doctorId: null, doctorName: '', newStatus: false });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor status');
      setConfirmDialog({ show: false, doctorId: null, doctorName: '', newStatus: false });
    }
  };

  const cancelStatusChange = () => {
    setConfirmDialog({ show: false, doctorId: null, doctorName: '', newStatus: false });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading doctors..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-xl font-bold text-gray-800">Doctor Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:inline">Welcome, {user?.name}</span>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
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

        {/* Doctors Table */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Doctors ({doctors.length})
          </h2>

          {doctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No doctors registered yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{doctor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor.specialization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={doctor.isActive ? 'success' : 'danger'}>
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(doctor.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant={doctor.isActive ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => handleStatusToggle(doctor)}
                        >
                          {doctor.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={() => navigate('/admin/users')}
          >
            View All Users
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <Modal
          isOpen={confirmDialog.show}
          onClose={cancelStatusChange}
          title="Confirm Status Change"
        >
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {confirmDialog.newStatus ? 'activate' : 'deactivate'} the account for{' '}
              <span className="font-semibold">{confirmDialog.doctorName}</span>?
            </p>
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={cancelStatusChange}
              >
                Cancel
              </Button>
              <Button
                variant={confirmDialog.newStatus ? 'success' : 'danger'}
                fullWidth
                onClick={confirmStatusChange}
              >
                {confirmDialog.newStatus ? 'Activate' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorManagement;
