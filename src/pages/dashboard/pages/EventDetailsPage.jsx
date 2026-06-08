import { useParams, Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Banknote } from 'lucide-react';
import { StatCard, StatusBadge, InfoRow } from './pageHelpers';
import { events, transactions, formatCurrency } from './pageData';

export function EventDetailsPage() {
  const { id } = useParams();
  const event = events.find((item) => item.id.toString() === id) || events[0];
  const profit = event.net;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link to="/dashboard/events" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to Events
        </Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{event.name}</h1>
            <p className="mt-1 text-gray-600">Event Financial Details</p>
          </div>
          <StatusBadge status={profit >= 0 ? 'Profit' : 'Loss'} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Income" amount={event.income} icon={ArrowUpRight} color="bg-green-600" />
        <StatCard title="Total Expenses" amount={event.expenses} icon={ArrowDownRight} color="bg-red-600" />
        <StatCard title="Net Balance" amount={profit} icon={Banknote} color={profit >= 0 ? 'bg-blue-600' : 'bg-red-600'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Financial Summary</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Total Income" value={formatCurrency(event.income)} />
            <InfoRow label="Total Expenses" value={formatCurrency(event.expenses)} />
            <InfoRow label="Net Result" value={`${profit > 0 ? '+' : ''}${formatCurrency(profit)}`} />
            <InfoRow label="Status" value={profit >= 0 ? 'Profit' : 'Loss'} />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Related Transactions</h2>
          <div className="divide-y divide-gray-200">
            {transactions.slice(0, 3).map((transaction) => {
              const amount = transaction.amountPaid || transaction.amount || 0;

              return (
                <div key={transaction.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <p className={transaction.type === 'income' ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
