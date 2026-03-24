import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import BatchesPage from './pages/BatchesPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MyAttendancePage from './pages/MyAttendancePage';

function ProtectedRoute({ children, roles }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRouter() {
  const { user } = useApp();
  return user?.role === 'student' ? <StudentDashboard /> : <Dashboard />;
}

function AppRoutes() {
  const { user } = useApp();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute roles={['admin']}><StudentsPage /></ProtectedRoute>} />
      <Route path="/batches" element={<ProtectedRoute roles={['admin']}><BatchesPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute roles={['admin']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/my-attendance" element={<ProtectedRoute roles={['student']}><MyAttendancePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(26,23,48,0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(124,58,237,0.3)',
              backdropFilter: 'blur(12px)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
