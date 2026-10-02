import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SalesPersonRequestPage from './pages/SalesPersonRequestPage';

// Dashboards & Protected Routes
import ProtectedRoute from './components/common/ProtectedRoute';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import SalesDashboard from './pages/dashboards/SalesDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import { getStoredUser } from './services/authService';

// Dashboard Index Redirect based on logged-in role
const DashboardRedirect = () => {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  const role = (user.role || 'customer').toUpperCase();
  if (role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
  if (role === 'SALES_PERSON' || role === 'SALES' || role === 'SALES_EXECUTIVE' || role === 'SALESPERSON') return <Navigate to="/sales-dashboard" replace />;
  return <Navigate to="/customer-dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="join-as-sales-person" element={<SalesPersonRequestPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />

            {/* General Dashboard Redirect */}
            <Route path="dashboard" element={<DashboardRedirect />} />

            {/* Protected Role-Based Dashboards */}
            <Route
              path="customer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales-dashboard"
              element={
                <ProtectedRoute allowedRoles={['SALES_PERSON', 'SALES_EXECUTIVE', 'SALES', 'SALESPERSON']}>
                  <SalesDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
