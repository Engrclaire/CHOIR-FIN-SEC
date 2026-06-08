import { ArrowUpRight } from 'lucide-react';
import { Header, SearchPanel, StatCard, TransactionTable } from './pageHelpers';
import { transactions, totalIncome } from './pageData';

export function IncomePage() {
  return (
    <div className="p-8">
      <Header
        title="Income"
        subtitle="All income transactions"
        action="Record Income"
        actionLink="/dashboard/transactions?action=record"
      />
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Income</p>
            <p className="text-3xl font-semibold text-green-600">{totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100">
            <ArrowUpRight className="h-7 w-7 text-green-600" />
          </div>
        </div>
      </div>
      <SearchPanel placeholder="Search income transactions..." />
      <TransactionTable rows={transactions.filter((transaction) => transaction.type === 'income')} />
    </div>
  );
}
