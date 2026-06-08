import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Banknote } from 'lucide-react';
import { Header, RecordTransactionPanel, SearchPanel, StatCard, TransactionTable } from './pageHelpers';
import { transactions, totalIncome, totalExpenses } from './pageData';

export function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const showRecordForm = searchParams.get('action') === 'record';

  const visibleTransactions = transactions.filter((transaction) => {
    if (filter === 'income') return transaction.type === 'income';
    if (filter === 'expenses') return transaction.type === 'expense';
    return true;
  });

  return (
    <div className="p-8">
      <Header
        title="Transactions"
        subtitle="All financial activity in one place"
        action="Record Transaction"
        actionLink="/dashboard/transactions?action=record"
      />
      {showRecordForm && (
        <RecordTransactionPanel
          onClose={() => {
            searchParams.delete('action');
            setSearchParams(searchParams, { replace: true });
          }}
        />
      )}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-green-600" />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" />
        <StatCard title="Net Balance" amount={totalIncome - totalExpenses} icon={Banknote} color="bg-blue-600" />
      </div>
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-grid grid-cols-3 rounded-md bg-gray-100 p-1 text-sm">
            {['all', 'income', 'expenses'].map((item) => (
              <button
                key={item}
                className={`rounded px-3 py-1.5 capitalize ${filter === item ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                onClick={() => setFilter(item)}
              >
                {item === 'all' ? 'All Transactions' : item}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs">
            <SearchPanel placeholder="Search transactions..." />
          </div>
        </div>
      </div>
      <TransactionTable rows={visibleTransactions} />
    </div>
  );
}
