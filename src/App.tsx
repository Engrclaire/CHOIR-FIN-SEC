import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Onboarding from './auth/onboarding/Onboarding';
import { ToastProvider } from './contexts/ToastContext';

import DashboardLayout from './pages/dashboard/dashboard';
import { DashboardHome } from './pages/dashboard/pages/DashboardHome';
import { TransactionsPage } from './pages/dashboard/pages/TransactionsPage';
import { IncomePage } from './pages/dashboard/pages/IncomePage';
import { ExpensesPage } from './pages/dashboard/pages/ExpensesPage';
import { LeviesPage } from './pages/dashboard/pages/LeviesPage';
import { ContributionsPage } from './pages/dashboard/pages/ContributionsPage';
import { MembersPage } from './pages/dashboard/pages/MembersPage';
import { MemberDetailsPage } from './pages/dashboard/pages/MemberDetailsPage';
import { EventsPage } from './pages/dashboard/pages/EventsPage';
import { EventDetailsPage } from './pages/dashboard/pages/EventDetailsPage';
import { ReportsPage } from './pages/dashboard/pages/ReportsPage';
import { SettingsPage } from './pages/dashboard/pages/SettingsPage';
import { UserManagementPage } from './pages/dashboard/pages/UserManagementPage';

function App() {
  return (
    <Router>
      <ToastProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
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
      </ToastProvider>
    </Router>
  );
}

export default App;
