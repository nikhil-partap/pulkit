import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ToastRegion from './components/ToastRegion';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import JobDetailsPage from './pages/JobDetailsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import EditPortfolioPage from './pages/EditPortfolioPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="Student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/jobs/:jobId" element={<ProtectedRoute allowedRole="Student"><JobDetailsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRole="Student"><StudentProfilePage ownProfile /></ProtectedRoute>} />
            <Route path="/portfolio/edit" element={<ProtectedRoute allowedRole="Student"><EditPortfolioPage /></ProtectedRoute>} />
            <Route path="/students/:studentId" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />

            <Route
              path="/recruiter"
              element={
                <ProtectedRoute allowedRole="Recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastRegion />
        </HashRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
