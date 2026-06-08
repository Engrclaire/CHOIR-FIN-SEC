import { ArrowDownRight } from 'lucide-react';
import { Header, SearchPanel, StatCard, TransactionTable } from './pageHelpers';
import { transactions, totalExpenses } from './pageData';

export function ExpensesPage() {
  return (
    <div className="p-8">
      <Header
        title="Expenses"
        subtitle="All expense transactions"
        action="Record Expense"
        actionLink="/dashboard/transactions?action=record"
      />
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-3xl font-semibold text-red-600">{totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-100">
            <ArrowDownRight className="h-7 w-7 text-red-600" />
          </div>
        </div>
      </div>
      <SearchPanel placeholder="Search expense transactions..." />
      <TransactionTable rows={transactions.filter((transaction) => transaction.type === 'expense')} />
    </div>
  );
}
