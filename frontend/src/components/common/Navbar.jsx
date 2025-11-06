import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // If not authenticated, show minimal navbar
  if (!isAuthenticated()) {
    return (
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-lg sm:text-xl font-bold">
              Smart Healthcare
            </Link>
            <div className="flex space-x-2 sm:space-x-4">
              <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded text-sm sm:text-base">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Role-based menu items
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'patient':
        return [
          { path: '/patient/dashboard', label: 'Dashboard' },
          { path: '/patient/book-appointment', label: 'Book Appointment' },
          { path: '/patient/appointments', label: 'My Appointments' },
          { path: '/patient/prescriptions', label: 'My Prescriptions' }
        ];
      case 'doctor':
        return [
          { path: '/doctor/dashboard', label: 'Dashboard' },
          { path: '/doctor/appointments', label: 'Appointments' },
          { path: '/doctor/prescriptions', label: 'Prescriptions' }
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/users', label: 'User Management' },
          { path: '/admin/doctors', label: 'Doctor Management' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-lg sm:text-xl font-bold flex-shrink-0">
            Smart Healthcare
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hover:bg-blue-700 px-3 py-2 rounded transition-colors text-sm whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            <span className="text-xs sm:text-sm">
              <span className="hidden lg:inline">{user?.name || user?.email}</span>
              <span className="ml-2 text-xs bg-blue-700 px-2 py-1 rounded">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-2 rounded transition-colors text-sm"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {/* User Info */}
            <div className="px-3 py-2 bg-blue-700 rounded text-sm">
              <div>{user?.name || user?.email}</div>
              <div className="text-xs text-blue-200 mt-1">Role: {user?.role}</div>
            </div>
            
            {/* Menu Items */}
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block hover:bg-blue-700 px-3 py-3 rounded transition-colors"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-3 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
