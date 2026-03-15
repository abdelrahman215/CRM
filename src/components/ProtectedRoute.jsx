import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export function ProtectedRoute({ children, roles, allowedEmails }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (allowedEmails && !allowedEmails.includes(user.email)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

