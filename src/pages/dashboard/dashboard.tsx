// pages/dashboard/dashboard.tsx
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import OutstandingPledges from './components/OutstandingPledges';
import TopDebtors from './components/TopDebtors';
import EventPerformance from './components/EventPerformance';
import RecentActivity from './components/RecentActivity';
import { DollarSign, TrendingDown, TrendingUp, Wallet, Menu } from 'lucide-react';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="px-4 py-4 md:px-8 md:py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm">St Cecilia Choir Financial Overview</p>
            </div>
          </div>

          <button className="bg-black text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 font-medium text-sm hover:bg-gray-800 transition w-full md:w-auto">
            <span className="text-xl">+</span>
            Record Transaction
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Bank Balance"
                amount="₦0"
                icon={DollarSign}
                color="bg-blue-500"
              />
              <StatCard
                title="Cash Balance"
                amount="₦0"
                icon={Wallet}
                color="bg-emerald-500"
              />
              <StatCard
                title="Total Income"
                amount="₦0"
                icon={TrendingUp}
                color="bg-green-500"
              />
              <StatCard
                title="Total Expenses"
                amount="₦0"
                icon={TrendingDown}
                color="bg-red-500"
              />
          </div>

          {/* Outstanding Pledges */}
          <OutstandingPledges />

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <TopDebtors />
            <EventPerformance />
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}