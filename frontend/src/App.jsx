import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Guard
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ManagementLogin from './pages/admin/ManagementLogin';

// Student Portal Pages
import StudentDashboard from './pages/student/StudentDashboard';
import RaiseComplaint from './pages/student/RaiseComplaint';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentProfile from './pages/student/StudentProfile';
import StudentSettings from './pages/student/StudentSettings';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminStaff from './pages/admin/AdminStaff';
import AdminManagement from './pages/admin/AdminManagement';
import UserManagement from './pages/admin/UserManagement';

// Staff Page
import StaffDashboard from './pages/staff/StaffDashboard';

function App() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Crisp & Visible Campus Background Image Layer */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-slate-950">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 opacity-95 filter brightness-105 contrast-105" 
            style={{ backgroundImage: `url('/campus-bg.png')` }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-900/15 to-slate-950/50" 
          />
        </div>

        <Router>
          <Routes>
            
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<ManagementLogin />} />
            
            {/* Redirect /admin/register to /admin/login */}
            <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />

            {/* ======================================================== */}
            {/* 1. STUDENT WEBSITE ROUTES (Only accessible by Students) */}
            {/* ======================================================== */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout>
                    <StudentDashboard />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/complaints" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout>
                    <StudentDashboard />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/complaints/raise" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout>
                    <RaiseComplaint />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/notifications" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout>
                    <StudentNotifications />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/profile" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout>
                    <StudentSettings />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/settings" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout>
                    <StudentSettings />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />

            {/* ======================================================== */}
            {/* 2. ADMIN WEBSITE ROUTES (Accessible by Admins & Super Admins) */}
            {/* ======================================================== */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminStudents />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/complaints" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminComplaints />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/staff" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminStaff />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/admins" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminLayout>
                    <AdminManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/buildings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/departments" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            {/* Staff Protected Routes */}
            <Route 
              path="/staff/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StudentLayout>
                    <StaffDashboard />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
