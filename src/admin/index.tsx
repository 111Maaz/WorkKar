import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Users = React.lazy(() => import('./pages/Users'));
const Workers = React.lazy(() => import('./pages/Workers'));
const VerificationRequests = React.lazy(() => import('./pages/VerificationRequests'));
const Reviews = React.lazy(() => import('./pages/Reviews'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Categories = React.lazy(() => import('./pages/Categories'));
const AuditLog = React.lazy(() => import('./pages/AuditLog'));
const ChangeRequests = React.lazy(() => import('./pages/ChangeRequests'));

export default function AdminRoutes() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="workers" element={<Workers />} />
          <Route path="verification-requests" element={<VerificationRequests />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="reports" element={<Reports />} />
          <Route path="change-requests" element={<ChangeRequests />} />
          <Route path="categories" element={<Categories />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
} 