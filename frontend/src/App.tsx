import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import GoalCreationPage from './pages/GoalCreationPage';
import GoalDetailPage from './pages/GoalDetailPage';
import MentorPage from './pages/MentorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          
          <Routes>
            {/* Public Marketing/Auth routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Core Navigator routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals/new"
              element={
                <ProtectedRoute>
                  <GoalCreationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals/:id"
              element={
                <ProtectedRoute>
                  <GoalDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor"
              element={
                <ProtectedRoute>
                  <MentorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Console routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};
export default App;
