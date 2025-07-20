import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OTPLoginPage from './pages/OTPLoginPage';
import RegisterPage from './pages/RegisterPage';
import TurfListPage from './pages/TurfListPage';
import TurfDetailPage from './pages/TurfDetailPage';
import EventsPage from './pages/EventsPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserBookings from './pages/user/UserBookings';
import UserProfile from './pages/user/UserProfile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerTurfs from './pages/owner/OwnerTurfs';
import OwnerBookings from './pages/owner/OwnerBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTurfs from './pages/admin/AdminTurfs';
import AdminEvents from './pages/admin/AdminEvents';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp-login" element={<OTPLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/turfs" element={<TurfListPage />} />
          <Route path="/turfs/:id" element={<TurfDetailPage />} />
          <Route path="/events" element={<EventsPage />} />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute roles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/bookings"
            element={
              <PrivateRoute roles={['user']}>
                <UserBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <PrivateRoute roles={['user']}>
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <PrivateRoute roles={['owner']}>
                <OwnerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/turfs"
            element={
              <PrivateRoute roles={['owner']}>
                <OwnerTurfs />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <PrivateRoute roles={['owner']}>
                <OwnerBookings />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/turfs"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminTurfs />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminEvents />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App; 