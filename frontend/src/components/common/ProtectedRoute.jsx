import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser } from '../../services/authService';

const normalizeRole = (role) => {
  if (!role) return 'customer';
  const r = role.toLowerCase().trim();
  if (r === 'sales' || r === 'salesperson' || r === 'sales_person' || r === 'sales_executive' || r === 'sales executive') return 'salesperson';
  if (r === 'admin' || r === 'administrator') return 'admin';
  return 'customer';
};

/**
 * Protected Route wrapper enforcing user authentication and role authorization
 * @param {Array<string>} allowedRoles - Allowed roles for this route ('customer', 'salesperson', 'admin')
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getStoredUser();
  const location = useLocation();

  if (!user) {
    // User is not logged in -> redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = normalizeRole(user.role);
  const normalizedAllowedRoles = allowedRoles ? allowedRoles.map(r => normalizeRole(r)) : [];

  if (allowedRoles && allowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    // User role is not authorized for this specific dashboard -> redirect to user's valid dashboard
    if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (userRole === 'salesperson') return <Navigate to="/sales-dashboard" replace />;
    return <Navigate to="/customer-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
