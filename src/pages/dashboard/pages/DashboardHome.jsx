import { Users, Banknote, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Header, StatCard } from './pageHelpers';
import { bankBalance, cashBalance, totalIncome, totalExpenses } from './pageData';

export function DashboardHome() {
  return (
    <div className="p-8">
      <Header
        title="Dashboard"
        subtitle="St Cecilia Choir Financial Overview"
        action="Record Transaction"
        actionLink="/dashboard/transactions?action=record"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Head Count" amount={0} icon={Users} color="bg-slate-600" />
        <StatCard title="Bank Balance" amount={bankBalance} icon={Banknote} color="bg-blue-600" />
        <StatCard title="Cash Balance" amount={cashBalance} icon={Wallet} color="bg-green-600" />
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-emerald-600" />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" />
      </div>

      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-800">Outstanding Pledges</p>
            <p className="text-xl font-semibold text-amber-900">₦0</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-200">
            <Wallet className="h-5 w-5 text-amber-700" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Outstanding Members</h2>
              <p className="text-sm text-gray-500">High-priority debt cases</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-4 px-6 py-4">
            <div className="rounded-3xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Members with critical debt</p>
              <p className="mt-2 text-lg font-semibold text-red-700">3</p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total owing</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">₦35,500</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Event Performance</h2>
              <p className="text-sm text-gray-500">Latest active events</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <ArrowUpRight className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-4 px-6 py-4">
            <div className="rounded-3xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Net gain this period</p>
              <p className="mt-2 text-lg font-semibold text-green-700">₦120,000</p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Upcoming events</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
