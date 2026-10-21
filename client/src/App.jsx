import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import NotFoundPage from './pages/public/NotFoundPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import SubmitComplaint from './pages/user/SubmitComplaint';
import MyComplaints from './pages/user/MyComplaints';
import ComplaintDetails from './pages/user/ComplaintDetails';
import UserProfile from './pages/user/UserProfile';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentComplaints from './pages/agent/AgentComplaints';
import AgentComplaintDetails from './pages/agent/AgentComplaintDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllComplaints from './pages/admin/AllComplaints';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import FeedbackReports from './pages/admin/FeedbackReports';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-page">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Shared Profile & Complaint Details */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/submit-complaint"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <SubmitComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-complaints"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/complaints"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <AgentComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <AgentComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AllComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <FeedbackReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
