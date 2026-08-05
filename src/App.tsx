import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from './auth/Login';
import Onboarding from './auth/onboarding/PremiumOnboarding';
import Landing from './pages/Landing';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import DashboardLayout from './pages/dashboard/dashboard';
import DashboardHome from './pages/dashboard/pages/DashboardHome';
import AdminDashboard from './pages/dashboard/pages/AdminDashboard';
import FinancialSecretaryDashboard from './pages/dashboard/pages/FinancialSecretaryDashboard';
import CommitteeLeadDashboard from './pages/dashboard/pages/CommitteeLeadDashboard';
import {
  ContributionsPage,
  EventDetailsPage,
  EventsPage,
  ExpensesPage,
  IncomePage,
  LeviesPage,
  MemberDetailsPage,
  MembersPage,
  ReportsPage,
  SettingsPage,
  TransactionsPage,
  UserManagementPage,
} from './pages/dashboard/pages/DashboardPages';

function RootRoute() {
  // If user hasn't completed onboarding before, send them to onboarding
  const completed = typeof window !== 'undefined' && localStorage.getItem('completedOnboarding') === 'true';
  return completed ? <Login /> : <Navigate to="/onboarding" replace />;
}

function DashboardIndex() {
  const { profile, loading } = useAuth();
  if (loading) return <div className="p-8 text-sm text-gray-500">Loading workspace...</div>;
  const role = profile?.role;
  if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'fin_sec') return <Navigate to="/dashboard/financial-secretary" replace />;
  if (role === 'committee_lead') return <Navigate to="/dashboard/committee-lead" replace />;
  return <DashboardHome />;
}

function homeForRole(role?: string) {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'fin_sec') return '/dashboard/financial-secretary';
  if (role === 'committee_lead') return '/dashboard/committee-lead';
  return '/dashboard';
}

function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="p-8 text-sm text-gray-500">Loading workspace...</div>;
  const role = profile?.role;
  if (!role || !roles.includes(role)) return <Navigate to={homeForRole(role)} replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <ToastProvider>
      <AuthProvider>
      <Routes>
        {/* Public Routes */}
        
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Onboarding />} />
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<RootRoute />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route path="admin" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
          <Route path="financial-secretary" element={<RoleRoute roles={['fin_sec']}><FinancialSecretaryDashboard /></RoleRoute>} />
          <Route path="committee-lead" element={<RoleRoute roles={['committee_lead']}><CommitteeLeadDashboard /></RoleRoute>} />
          <Route path="transactions" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><TransactionsPage /></RoleRoute>} />
          <Route path="income" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><IncomePage /></RoleRoute>} />
          <Route path="expenses" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><ExpensesPage /></RoleRoute>} />
          <Route path="levies" element={<RoleRoute roles={['admin', 'fin_sec']}><LeviesPage /></RoleRoute>} />
          <Route path="contributions" element={<RoleRoute roles={['admin', 'fin_sec']}><ContributionsPage /></RoleRoute>} />
          <Route path="members" element={<RoleRoute roles={['admin', 'fin_sec']}><MembersPage /></RoleRoute>} />
          <Route path="members/:id" element={<RoleRoute roles={['admin', 'fin_sec']}><MemberDetailsPage /></RoleRoute>} />
          <Route path="events" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><EventsPage /></RoleRoute>} />
          <Route path="events/:id" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><EventDetailsPage /></RoleRoute>} />
          <Route path="reports" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><ReportsPage /></RoleRoute>} />
          <Route path="reports/financial-summary" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><ReportsPage type="financial" /></RoleRoute>} />
          <Route path="reports/member-activity" element={<RoleRoute roles={['admin', 'fin_sec', 'committee_lead']}><ReportsPage type="members" /></RoleRoute>} />
          <Route path="settings" element={<RoleRoute roles={['admin']}><SettingsPage /></RoleRoute>} />
          <Route path="user-management" element={<RoleRoute roles={['admin']}><UserManagementPage /></RoleRoute>} />
        </Route>
        <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />

        {/* Fallback route */}
        <Route path="*" element={
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">404</h1>
              <p className="text-zinc-400">Page not found</p>
              <Link 
                to="/dashboard" 
                className="mt-6 inline-block text-blue-500 hover:text-blue-400"
              >
                Go back to Dashboard
              </Link>
            </div>
          </div>
        } />
      </Routes>
      </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
