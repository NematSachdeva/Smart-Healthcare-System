import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import PatientRegister from './pages/PatientRegister';
import DoctorRegister from './pages/DoctorRegister';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import PatientAppointments from './pages/PatientAppointments';
import PatientPrescriptions from './pages/PatientPrescriptions';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import AIPrescriptionGenerator from './components/doctor/AIPrescriptionGenerator';
import PrescriptionHistoryView from './components/doctor/PrescriptionHistoryView';
import ReviewPrescription from './pages/ReviewPrescription';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import DoctorManagement from './pages/DoctorManagement';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  // Debug info
  console.log('App loading...');
  console.log('API URL:', process.env.REACT_APP_API_URL);
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/patient" element={<PatientRegister />} />
            <Route path="/register/doctor" element={<DoctorRegister />} />
            
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <RoleBasedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/patient/appointments/book" element={
              <RoleBasedRoute allowedRoles={['patient']}>
                <BookAppointment />
              </RoleBasedRoute>
            } />
            <Route path="/patient/appointments" element={
              <RoleBasedRoute allowedRoles={['patient']}>
                <PatientAppointments />
              </RoleBasedRoute>
            } />
            <Route path="/patient/prescriptions" element={
              <RoleBasedRoute allowedRoles={['patient']}>
                <PatientPrescriptions />
              </RoleBasedRoute>
            } />
            
            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/doctor/appointments" element={
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DoctorAppointments />
              </RoleBasedRoute>
            } />
            <Route path="/doctor/prescriptions" element={
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DoctorPrescriptions />
              </RoleBasedRoute>
            } />
            <Route path="/doctor/prescriptions/generate/:appointmentId" element={
              <RoleBasedRoute allowedRoles={['doctor']}>
                <AIPrescriptionGenerator />
              </RoleBasedRoute>
            } />
            <Route path="/doctor/prescriptions/review/:id" element={
              <RoleBasedRoute allowedRoles={['doctor']}>
                <ReviewPrescription />
              </RoleBasedRoute>
            } />
            <Route path="/doctor/prescriptions/history/:prescriptionId" element={
              <RoleBasedRoute allowedRoles={['doctor']}>
                <PrescriptionHistoryView />
              </RoleBasedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/admin/users" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <UserManagement />
              </RoleBasedRoute>
            } />
            <Route path="/admin/doctors" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <DoctorManagement />
              </RoleBasedRoute>
            } />
            
            {/* Unauthorized and 404 Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            
            {/* Catch all route - redirect to 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
