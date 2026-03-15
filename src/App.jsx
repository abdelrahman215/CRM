import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import SalesLayout from './layouts/SalesLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminLeads from './pages/AdminLeads';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import SalesDashboard from './pages/SalesDashboard';
import SalesLeads from './pages/SalesLeads';
import SalesFollowUps from './pages/SalesFollowUps';
import SalesPerformance from './pages/SalesPerformance';
import SalesData from './pages/SalesData';
import { ProtectedRoute } from './components/ProtectedRoute';

const ADMIN_ALLOWED_EMAILS = ['Admin1@admin.com', 'Admin2@admin.com', 'Admin3@admin.com'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']} allowedEmails={ADMIN_ALLOWED_EMAILS}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<div>Settings</div>} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route
        path="/sales"
        element={
          <ProtectedRoute roles={['sales']}>
            <SalesLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SalesDashboard />} />
        <Route path="leads" element={<SalesLeads />} />
        <Route path="follow-ups" element={<SalesFollowUps />} />
        <Route path="performance" element={<SalesPerformance />} />
        <Route path="data" element={<SalesData />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

