import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import MethodologyPage from './pages/MethodologyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import AirfareIndexPage from './pages/AirfareIndexPage';
import RouteAnalyticsPage from './pages/RouteAnalyticsPage';
import AirlineAnalyticsPage from './pages/AirlineAnalyticsPage';
import BookingWindowPage from './pages/BookingWindowPage';
import HeatmapPage from './pages/HeatmapPage';
import HistoricalDataPage from './pages/HistoricalDataPage';
import DataQualityPage from './pages/DataQualityPage';
import ScraperStatusPage from './pages/ScraperStatusPage';
import BacktestingPage from './pages/BacktestingPage';
import ApiDocsPage from './pages/ApiDocsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Public Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Routes guarded by ProtectedRoute with Main Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/index-explorer" element={<AirfareIndexPage />} />
            <Route path="/routes" element={<RouteAnalyticsPage />} />
            <Route path="/airlines" element={<AirlineAnalyticsPage />} />
            <Route path="/booking-windows" element={<BookingWindowPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/historical" element={<HistoricalDataPage />} />
            <Route path="/data-quality" element={<DataQualityPage />} />
            <Route path="/data-collection" element={<ScraperStatusPage />} />
            <Route path="/backtesting" element={<BacktestingPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
