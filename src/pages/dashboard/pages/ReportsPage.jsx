import { ArrowDownRight, ArrowUpRight, Banknote, Wallet } from 'lucide-react';
import { Header, ReportBar, StatCard } from './pageHelpers';
import { totalIncome, totalExpenses, cashBalance, bankBalance } from './pageData';

export function ReportsPage({ type = 'overview' }) {
  const heading = type === 'financial' ? 'Financial Reports' : type === 'members' ? 'Member Activity' : 'Financial Reports';

  return (
    <div className="p-8">
      <Header
        title={heading}
        subtitle="View insights and reports"
        action="Go to Transactions"
        actionLink="/dashboard/transactions"
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-green-600" />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" />
        <StatCard title="Cash Balance" amount={cashBalance} icon={Wallet} color="bg-blue-600" />
        <StatCard title="Bank Balance" amount={bankBalance} icon={Banknote} color="bg-blue-600" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Income Breakdown</h3>
          {['Levies', 'Contributions', 'Other Income'].map((name, index) => (
            <ReportBar key={name} label={name} value={[120000, 45000, 22500][index]} total={187500} />
          ))}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Expense Breakdown</h3>
          {['Transport', 'Welfare', 'Entertainment'].map((name, index) => (
            <ReportBar key={name} label={name} value={[15000, 9700, 30000][index]} total={54700} danger />
          ))}
        </div>
      </div>
      <p className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        All reports are automatically generated from your recorded transactions. To update these reports, add or modify transactions in the Transactions section.
      </p>
    </div>
  );
}
