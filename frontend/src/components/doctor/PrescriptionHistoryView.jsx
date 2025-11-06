import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get } from '../../utils/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Alert from '../common/Alert';
import Modal from '../common/Modal';

const PrescriptionHistoryView = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVersions, setSelectedVersions] = useState({ old: null, new: null });

  useEffect(() => {
    fetchHistory();
  }, [prescriptionId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate prescription ID
      if (!prescriptionId) {
        setError('Invalid prescription ID');
        setLoading(false);
        return;
      }

      // Fetch prescription history
      const historyResult = await get(`/prescriptions/${prescriptionId}/history`);
      if (historyResult.success) {
        setHistory(historyResult.data.history);
      } else {
        setError(historyResult.error || 'Failed to load prescription history');
      }

      // Fetch prescription details
      const prescriptionResult = await get(`/prescriptions/doctor`);
      if (prescriptionResult.success) {
        const foundPrescription = prescriptionResult.data.prescriptions.find(
          p => {
            const pId = p._id || p.id;
            return pId === prescriptionId || pId?.toString() === prescriptionId;
          }
        );
        if (foundPrescription) {
          setPrescription(foundPrescription);
        } else {
          setError('Prescription not found');
        }
      }
    } catch (err) {
      setError('Failed to load prescription history');
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
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

  const handleCompareVersions = (oldVersion, newVersion) => {
    setSelectedVersions({ old: oldVersion, new: newVersion });
  };

  const closeComparison = () => {
    setSelectedVersions({ old: null, new: null });
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
    return <LoadingSpinner fullScreen text="Loading prescription history..." />;
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Prescription History</h1>
                <p className="text-gray-600">View all changes made to this prescription</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/doctor/prescriptions')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Prescriptions
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

        {/* Prescription Info */}
        {prescription && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Prescription Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <p className="text-gray-900">{prescription.patient?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Version</label>
                <p className="text-gray-900">{prescription.version || 1}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Badge variant={getBadgeVariant(prescription.status)}>
                  {prescription.status}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900">{formatDate(prescription.updatedAt)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* History Timeline */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Version History</h2>

          {history.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="No version history available"
              description="This prescription has not been edited yet"
            />
          ) : (
            <div className="space-y-6">
              {history.map((entry, index) => (
                <div key={entry._id} className="relative">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                  )}

                  <div className="flex">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                      {entry.versionNumber}
                    </div>

                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Version {entry.versionNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Edited by: Dr. {entry.editedBy?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(entry.editedAt)}
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCompareVersions(entry.oldVersion, entry.newVersion)}
                          >
                            View Changes
                          </Button>
                        </div>

                        {entry.changeDescription && (
                          <div className="mt-3 bg-white border border-gray-200 rounded p-3">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Description:</span> {entry.changeDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Version Comparison Modal */}
      {selectedVersions.old && selectedVersions.new && (
        <Modal
          isOpen={!!selectedVersions.old}
          onClose={closeComparison}
          title="Version Comparison"
          size="xlarge"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Old Version */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 bg-red-50 px-3 py-2 rounded">
                Previous Version
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {selectedVersions.old}
                </pre>
              </div>
            </div>

            {/* New Version */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 bg-green-50 px-3 py-2 rounded">
                New Version
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {selectedVersions.new}
                </pre>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PrescriptionHistoryView;
