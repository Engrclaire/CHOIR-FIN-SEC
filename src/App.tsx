import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './auth/Login';
import Onboarding from './auth/onboarding/Onboarding';
import { ToastProvider } from './contexts/ToastContext';

// Placeholder pages (we'll create them soon)
import Dashboard from './pages/dashboard/dashboard';
// import MemberDetails from './pages/dashboard/members/MemberDetails';
// import Members from './pages/dashboard/members/Members';
// import Transactions from './pages/Transactions';
// import Budgets from './pages/Budgets';
// import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <ToastProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected Routes (we'll add auth protection later) */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/dashboard/members" element={<Members />} /> */}
        {/* <Route path="/dashboard/members/:memberId" element={<MemberDetails />} /> */}
        {/* <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/reports" element={<Reports />} /> */}

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
