import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardRedirect() {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="status-line page-offset">Loading dashboard...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/dashboard/${user.role}`} replace />;
}
