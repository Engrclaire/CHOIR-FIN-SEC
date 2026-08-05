import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="financial-secretary" element={<FinancialSecretaryDashboard />} />
          <Route path="committee-lead" element={<CommitteeLeadDashboard />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="levies" element={<LeviesPage />} />
          <Route path="contributions" element={<ContributionsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="members/:id" element={<MemberDetailsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/financial-summary" element={<ReportsPage type="financial" />} />
          <Route path="reports/member-activity" element={<ReportsPage type="members" />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="user-management" element={<UserManagementPage />} />
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
