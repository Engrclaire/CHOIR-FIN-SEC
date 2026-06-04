import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  FileText,
  HandCoins,
  Plus,
  Search,
  X,
  Users,
  Wallet,
} from 'lucide-react';

const transactions = [];

const debtors = [
  { name: 'Joshua Okonkwo', amount: 15000, status: 'critical' },
  { name: 'Agu Emmanuel', amount: 12500, status: 'owing' },
  { name: 'Anamba Florence', amount: 8000, status: 'owing' },
];

const events = [
  {
    id: 1,
    name: '2026 Concert',
    status: 'Active',
    period: 'Feb 1, 2026 - Jun 30, 2026',
    income: 250000,
    expenses: 130000,
    net: 120000,
  },
  {
    id: 2,
    name: 'Carol Event',
    status: 'Pending',
    period: 'Nov 8, 2025 - Dec 24, 2025',
    income: 98000,
    expenses: 76000,
    net: 22000,
  },
  {
    id: 3,
    name: 'Harvest Festival',
    status: 'Pending',
    period: 'Nov 1, 2025 - Dec 18, 2025',
    income: 70000,
    expenses: 82000,
    net: -12000,
  },
  {
    id: 4,
    name: 'Evening of Hymns',
    status: 'Reconciled',
    period: 'Mar 1, 2025 - Aug 21, 2025',
    income: 190000,
    expenses: 160000,
    net: 30000,
  },
  {
    id: 5,
    name: '2024 Concert',
    status: 'Reconciled',
    period: 'Feb 1, 2024 - Jul 20, 2024',
    income: 260000,
    expenses: 210000,
    net: 50000,
  },
];

const levies = [
  {
    id: 1,
    name: 'Harvest Levy',
    description: 'Mandatory levy for harvest event',
    amountPerMember: 2500,
    totalCollected: 145000,
    totalExpected: 200000,
    membersPaid: 58,
    totalMembers: 80,
    deadline: '30/04/2026',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Monthly Welfare',
    description: 'Recurring welfare support levy',
    amountPerMember: 1000,
    totalCollected: 82000,
    totalExpected: 80000,
    membersPaid: 80,
    totalMembers: 80,
    deadline: 'Monthly',
    status: 'Active',
  },
];

const contributions = [
  {
    id: 1,
    date: '19/02/2026',
    description: 'Harvest event contribution',
    source: 'Anamba Florence',
    event: 'Harvest Committee',
    amount: 5000,
    mode: 'Transfer',
    type: 'Event',
  },
  {
    id: 2,
    date: '15/02/2026',
    description: 'General welfare contribution',
    source: 'Joshua Okonkwo',
    amount: 10000,
    mode: 'Cash',
    type: 'General',
  },
  {
    id: 3,
    date: '12/02/2026',
    description: 'Christmas carol contribution',
    source: 'Agu Emmanuel',
    event: 'Christmas Carol',
    amount: 7500,
    mode: 'Transfer',
    type: 'Event',
  },
];

const members = [
  {
    id: 1,
    firstName: 'Joshua',
    lastName: 'Okonkwo',
    phone: '+234 801 234 5678',
    email: 'joshua@example.com',
    role: 'Tenor',
    debtStatus: 'critical',
    outstandingDebt: 15000,
    penalties: 2500,
    totalPaid: 120000,
    totalLevies: 80000,
    contributions: 25000,
  },
  {
    id: 2,
    firstName: 'Agu',
    lastName: 'Emmanuel',
    phone: '+234 802 345 6789',
    email: 'agu@example.com',
    role: 'Bass',
    debtStatus: 'owing',
    outstandingDebt: 12500,
    penalties: 1000,
    totalPaid: 74000,
    totalLevies: 36000,
    contributions: 18000,
  },
  {
    id: 3,
    firstName: 'Anamba',
    lastName: 'Florence',
    phone: '+234 803 456 7890',
    email: 'florence@example.com',
    role: 'Soprano',
    debtStatus: 'owing',
    outstandingDebt: 8000,
    penalties: 0,
    totalPaid: 69000,
    totalLevies: 29000,
    contributions: 15000,
  },
  {
    id: 4,
    firstName: 'Chioma',
    lastName: 'Nwosu',
    phone: '+234 804 567 8901',
    email: 'chioma@example.com',
    role: 'Alto',
    debtStatus: 'clear',
    outstandingDebt: 0,
    penalties: 0,
    totalPaid: 98000,
    totalLevies: 54000,
    contributions: 22000,
  },
  {
    id: 5,
    firstName: 'Peter',
    lastName: 'Adeyemi',
    phone: '+234 805 678 9012',
    email: 'peter.adeyemi@example.com',
    role: 'Baritone',
    debtStatus: 'clear',
    outstandingDebt: 0,
    penalties: 0,
    totalPaid: 104500,
    totalLevies: 50000,
    contributions: 14500,
  },
];

const users = [
  {
    id: 1,
    name: 'Rev. Fr. Peter Okoro',
    email: 'peter.okoro@stcecilia.org',
    role: 'Admin',
    status: 'Active',
    added: '1/15/2026',
  },
  {
    id: 2,
    name: 'Anamba Florence',
    email: 'florence@example.com',
    role: 'Financial Secretary',
    status: 'Active',
    added: '9/12/2025',
  },
];

const totalIncome = transactions
  .filter((transaction) => transaction.type === 'income')
  .reduce((total, transaction) => total + (transaction.amountPaid || 0), 0);
const totalExpenses = transactions
  .filter((transaction) => transaction.type === 'expense')
  .reduce((total, transaction) => total + (transaction.amount || 0), 0);
const cashBalance = transactions
  .filter((transaction) => transaction.mode === 'Cash')
  .reduce((total, transaction) => total + (transaction.amountPaid || 0) - (transaction.amount || 0), 0);
const bankBalance = transactions
  .filter((transaction) => transaction.mode === 'Transfer')
  .reduce((total, transaction) => total + (transaction.amountPaid || 0) - (transaction.amount || 0), 0);

function formatCurrency(amount) {
  return `₦${amount.toLocaleString()}`;
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
    >
      {children}
    </button>
  );
}

function Header({ title, subtitle, action, actionOnClick, actionLink }) {
  const ButtonContent = (
    <>
      <Plus className="mr-2 h-4 w-4" />
      {action}
    </>
  );

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-600">{subtitle}</p>
      </div>
      {action && (
        actionLink ? (
          <Link to={actionLink} className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
            {ButtonContent}
          </Link>
        ) : (
          <PrimaryButton type="button" onClick={actionOnClick}>
            {ButtonContent}
          </PrimaryButton>
        )
      )}
    </div>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">Complete the required fields and save to continue.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon: Icon, color }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(amount)}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function SearchPanel({ placeholder }) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    PLEDGE: 'bg-blue-100 text-blue-700',
    owing: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
    clear: 'bg-green-100 text-green-700',
    Event: 'bg-purple-100 text-purple-700',
    General: 'bg-green-100 text-green-700',
    Profit: 'bg-green-100 text-green-700',
    Loss: 'bg-red-100 text-red-700',
    Active: 'bg-green-100 text-green-700',
    Pending: 'bg-amber-100 text-amber-700',
    Reconciled: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function TransactionTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {['Date', 'Description', 'Category', 'Mode', 'Amount', 'Status'].map((heading) => (
                <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((transaction) => {
              const amount = transaction.type === 'income' ? transaction.amountPaid || 0 : transaction.amount || 0;

              return (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{transaction.source}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{transaction.category}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{transaction.mode}</td>
                  <td className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {transaction.status ? <StatusBadge status={transaction.status} /> : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordTransactionPanel({ onClose }) {
  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Record Transaction</h2>
          <p className="mt-1 text-sm text-gray-600">Frontend form ready for backend API integration</p>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Transaction Type">
          <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            <option>Income</option>
            <option>Expense</option>
          </select>
        </Field>
        <Field label="Category">
          <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            <option>Levy</option>
            <option>Contribution</option>
            <option>Donation</option>
            <option>Transport</option>
            <option>Welfare</option>
          </select>
        </Field>
        <Field label="Description">
          <input className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Enter description" />
        </Field>
        <Field label="Amount">
          <input className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="0.00" type="number" />
        </Field>
        <Field label="Payment Mode">
          <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            <option>Transfer</option>
            <option>Cash</option>
          </select>
        </Field>
        <Field label="Date">
          <input className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" type="date" />
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Save as Draft
        </button>
        <PrimaryButton>
          <Plus className="mr-2 h-4 w-4" />
          Record Transaction
        </PrimaryButton>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value, className = 'text-gray-900' }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-semibold ${className}`}>{value}</p>
    </div>
  );
}

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
            <p className="text-xl font-semibold text-amber-900">{formatCurrency(0)}</p>
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
              <h2 className="font-semibold text-gray-900">Top Debtors</h2>
              <p className="mt-0.5 text-sm text-gray-500">Total Outstanding: {formatCurrency(35500)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {debtors.map((debtor) => (
              <div key={debtor.name} className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{debtor.name}</p>
                    <StatusBadge status={debtor.status} />
                  </div>
                </div>
                <p className="font-semibold text-red-600">{formatCurrency(debtor.amount)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              View All Members
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Event Performance</h2>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="cursor-pointer px-6 py-4 transition-colors hover:bg-gray-50">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-gray-900">{event.name}</p>
                  <StatusBadge status={event.status} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <Detail label="Income" value={formatCurrency(event.income)} className="text-green-600" />
                  <Detail label="Expenses" value={formatCurrency(event.expenses)} className="text-red-600" />
                  <Detail
                    label="Net"
                    value={`${event.net >= 0 ? '+' : ''}${formatCurrency(event.net)}`}
                    className={event.net >= 0 ? 'text-green-600' : 'text-red-600'}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              View All Events
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {transactions.slice(0, 5).map((transaction) => {
              const amount = transaction.type === 'income' ? transaction.amountPaid || 0 : -(transaction.amount || 0);

              return (
                <div key={transaction.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {amount > 0 ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {amount > 0 ? '+' : ''}
                    {formatCurrency(Math.abs(amount))}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold text-gray-900">No transactions yet</p>
            <p className="mt-2 text-sm text-gray-500">Record your first transaction to start tracking income and expenses.</p>
            <div className="mt-6">
              <Link
                to="/dashboard/transactions"
                className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
              >
                Record First Transaction
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none" placeholder="Search transactions..." />
          </div>
        </div>
      </div>
      <TransactionTable rows={visibleTransactions} />
    </div>
  );
}

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
            <p className="text-3xl font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
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
            <p className="text-3xl font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
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

export function LeviesPage() {
  const totalCollected = levies.reduce((total, levy) => total + levy.totalCollected, 0);
  const totalExpected = levies.reduce((total, levy) => total + levy.totalExpected, 0);

  return (
    <div className="p-8">
      <Header
        title="Levies"
        subtitle="Manage member levies and collections"
        action="Record Levy Payment"
        actionLink="/dashboard/transactions?action=record"
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Collected" amount={totalCollected} icon={FileText} color="bg-green-600" />
        <StatCard title="Total Expected" amount={totalExpected} icon={FileText} color="bg-blue-600" />
        <StatCard title="Outstanding" amount={totalExpected - totalCollected} icon={FileText} color="bg-amber-500" />
      </div>
      <SearchPanel placeholder="Search levies..." />
      <div className="space-y-4">
        {levies.map((levy) => {
          const progress = Math.round((levy.totalCollected / levy.totalExpected) * 100);

          return (
            <div key={levy.id} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{levy.name}</h3>
                    <StatusBadge status={levy.status} />
                  </div>
                  <p className="text-sm text-gray-600">{levy.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount per member</p>
                  <p className="text-xl font-semibold text-gray-900">{formatCurrency(levy.amountPerMember)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-4">
                <Detail label="Collected" value={formatCurrency(levy.totalCollected)} className="text-green-600" />
                <Detail label="Expected" value={formatCurrency(levy.totalExpected)} className="text-blue-600" />
                <Detail label="Members Paid" value={`${levy.membersPaid} / ${levy.totalMembers}`} />
                <Detail label="Deadline" value={levy.deadline} />
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Collection Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ContributionsPage() {
  const total = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
  const eventTotal = contributions
    .filter((contribution) => contribution.type === 'Event')
    .reduce((sum, contribution) => sum + contribution.amount, 0);

  return (
    <div className="p-8">
      <Header
        title="Contributions"
        subtitle="Voluntary contributions from members"
        action="Record Contribution"
        actionLink="/dashboard/transactions?action=record"
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Contributions" amount={total} icon={HandCoins} color="bg-blue-600" />
        <StatCard title="Event Contributions" amount={eventTotal} icon={HandCoins} color="bg-purple-600" />
        <StatCard title="General Contributions" amount={total - eventTotal} icon={HandCoins} color="bg-green-600" />
      </div>
      <SearchPanel placeholder="Search contributions..." />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['Date', 'Description', 'Contributor', 'Type', 'Amount'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contributions.map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{contribution.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <p className="font-medium">{contribution.description}</p>
                    {contribution.event && <p className="mt-0.5 text-xs text-gray-500">{contribution.event}</p>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{contribution.source}</td>
                  <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={contribution.type} /></td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-blue-600">{formatCurrency(contribution.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function MembersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const filteredMembers = members.filter((member) => {
    const matchesFilter = filter === 'all' || member.debtStatus === filter;
    const query = `${member.firstName} ${member.lastName} ${member.phone} ${member.email}`.toLowerCase();
    return matchesFilter && query.includes(search.toLowerCase());
  });

  const stats = {
    total: members.length,
    clear: members.filter((member) => member.debtStatus === 'clear').length,
    owing: members.filter((member) => member.debtStatus === 'owing').length,
    critical: members.filter((member) => member.debtStatus === 'critical').length,
    totalDebt: members.reduce((sum, member) => sum + member.outstandingDebt + member.penalties, 0),
  };

  return (
    <div className="p-8">
      <Header
        title="Members"
        subtitle="Every choir member and their financial position"
        action="Add Member"
        actionOnClick={() => setShowAddMemberModal(true)}
      />

      <Modal open={showAddMemberModal} title="Add Member" onClose={() => setShowAddMemberModal(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Joshua"
            />
          </Field>
          <Field label="Last name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Okonkwo"
            />
          </Field>
          <Field label="Phone">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="+234 801 234 5678"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="joshua@example.com"
            />
          </Field>
          <Field label="Role">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Tenor"
            />
          </Field>
          <Field label="Debt status">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>clear</option>
              <option>owing</option>
              <option>critical</option>
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowAddMemberModal(false)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowAddMemberModal(false)}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Add Member
          </button>
        </div>
      </Modal>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MemberStat label="Total Members" value={stats.total.toString()} helper="Choir headcount" icon={Users} />
        <MemberStat label="Clear" value={stats.clear.toString()} helper="No outstanding debts" icon={CheckCircle2} />
        <MemberStat label="Owing" value={stats.owing.toString()} helper="Have some debts" icon={AlertCircle} color="text-amber-600" />
        <MemberStat label="Critical" value={stats.critical.toString()} helper="High debt levels" icon={AlertCircle} color="text-red-600" />
      </div>

      <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search members..."
            />
          </div>
          <div className="grid w-full grid-cols-4 gap-2 sm:w-auto sm:grid-cols-4">
            {[
              { key: 'all', label: `All (${stats.total})` },
              { key: 'clear', label: `Clear (${stats.clear})` },
              { key: 'owing', label: `Owing (${stats.owing})` },
              { key: 'critical', label: `Critical (${stats.critical})` },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${filter === item.key ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredMembers.map((member) => (
          <Link
            key={member.id}
            to={`/dashboard/members/${member.id}`}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 text-xl font-semibold">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                  <p className="mt-1 text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <StatusBadge status={member.debtStatus} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
              <Detail label="Paid" value={formatCurrency(member.totalPaid)} />
              <Detail label="Debt" value={formatCurrency(member.outstandingDebt)} className="text-red-600" />
              <Detail label="Penalty" value={formatCurrency(member.penalties)} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-3xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Levies paid</p>
                <p className="mt-2 font-semibold text-gray-900">{formatCurrency(member.totalLevies)}</p>
              </div>
              <div className="rounded-3xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Contributions</p>
                <p className="mt-2 font-semibold text-gray-900">{formatCurrency(member.contributions)}</p>
              </div>
            </div>
          </Link>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full rounded-3xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            No members match your search and filter selection.
          </div>
        )}
      </div>
    </div>
  );
}

export function MemberDetailsPage() {
  const { id } = useParams();
  const member = members.find((item) => item.id.toString() === id) || members[0];
  const memberTransactions = transactions.filter((transaction) => transaction.source === `${member.firstName} ${member.lastName}`);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link to="/dashboard/members" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to Members
        </Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{member.firstName} {member.lastName}</h1>
              <p className="mt-1 text-gray-600">{member.role} member profile</p>
            </div>
          </div>
          <StatusBadge status={member.debtStatus} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Outstanding Debt" amount={member.outstandingDebt + member.penalties} icon={AlertCircle} color="bg-red-600" />
        <StatCard title="Levies Paid" amount={80000} icon={FileText} color="bg-blue-600" />
        <StatCard title="Contributions" amount={25000} icon={HandCoins} color="bg-green-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Member Information</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Phone" value={member.phone} />
            <InfoRow label="Email" value={member.email} />
            <InfoRow label="Choir Role" value={member.role} />
            <InfoRow label="Debt Status" value={member.debtStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Recent Member Activity</h2>
          {memberTransactions.length === 0 ? (
            <p className="text-sm text-gray-600">No recorded transactions for this member yet.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {memberTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <p className="font-semibold text-green-600">{formatCurrency(transaction.amountPaid || 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberStat({ label, value, helper, icon: Icon, color = 'text-green-600', danger = false }) {
  return (
    <div className={`rounded-lg border p-4 ${danger ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-sm ${danger ? 'text-red-700' : 'text-gray-600'}`}>{label}</span>
        <Icon className={`h-5 w-5 ${danger ? 'text-red-600' : color}`} />
      </div>
      <p className={`text-2xl font-semibold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
      <p className={`mt-1 text-xs ${danger ? 'text-red-600' : 'text-gray-500'}`}>{helper}</p>
    </div>
  );
}

export function EventsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const filteredEvents = events.filter((event) => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEvents = events.length;
  const totalIncome = filteredEvents.reduce((sum, event) => sum + event.income, 0);
  const totalNet = filteredEvents.reduce((sum, event) => sum + event.net, 0);

  return (
    <div className="p-8">
      <Header
        title="Events"
        subtitle="Manage event budgets and results"
        action="Create Event"
        actionOnClick={() => setShowAddEventModal(true)}
      />

      <Modal open={showAddEventModal} title="Create Event" onClose={() => setShowAddEventModal(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="2026 Concert"
            />
          </Field>
          <Field label="Status">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>Active</option>
              <option>Pending</option>
              <option>Reconciled</option>
            </select>
          </Field>
          <Field label="Income">
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="250000"
            />
          </Field>
          <Field label="Expenses">
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="130000"
            />
          </Field>
          <Field label="Start date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowAddEventModal(false)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowAddEventModal(false)}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Create Event
          </button>
        </div>
      </Modal>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Events</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totalEvents}</p>
          <p className="mt-2 text-sm text-gray-500">All scheduled events</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{formatCurrency(totalIncome)}</p>
          <p className="mt-2 text-sm text-gray-500">Income from filtered events</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Net Result</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{formatCurrency(totalNet)}</p>
          <p className="mt-2 text-sm text-gray-500">Combined profit/loss</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search events..."
            />
          </div>
        </div>
        <div className="inline-flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {['all', 'Active', 'Pending', 'Reconciled'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value === 'all' ? 'all' : value)}
              className={`px-4 py-3 text-sm font-medium transition ${filter === (value === 'all' ? 'all' : value) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['Event', 'Status', 'Period', 'Net', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600"><StatusBadge status={event.status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.period}</td>
                  <td className={`px-6 py-4 text-sm font-semibold ${event.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {event.net >= 0 ? '+' : ''}{formatCurrency(event.net)}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/dashboard/events/${event.id}`} className="text-blue-600 hover:text-blue-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No events match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function EventDetailsPage() {
  const { id } = useParams();
  const event = events.find((item) => item.id.toString() === id) || events[0];

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
          <StatusBadge status={event.status === 'profit' ? 'Profit' : 'Loss'} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Income" amount={event.income} icon={ArrowUpRight} color="bg-green-600" />
        <StatCard title="Total Expenses" amount={event.expenses} icon={ArrowDownRight} color="bg-red-600" />
        <StatCard title="Net Balance" amount={event.profit} icon={Banknote} color={event.profit >= 0 ? 'bg-blue-600' : 'bg-red-600'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Financial Summary</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Total Income" value={formatCurrency(event.income)} />
            <InfoRow label="Total Expenses" value={formatCurrency(event.expenses)} />
            <InfoRow label="Net Result" value={`${event.profit > 0 ? '+' : ''}${formatCurrency(event.profit)}`} />
            <InfoRow label="Status" value={event.status === 'profit' ? 'Profit' : 'Loss'} />
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
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(amount)}
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

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

function ReportBar({ label, value, total, danger = false }) {
  const width = Math.round((value / total) * 100);

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${danger ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

const settingsToggles = [
  { label: 'Allow Backdated Transactions', description: 'Permit entry of older financial activity', enabled: true },
  { label: 'Require Approval for Expenses', description: 'Send expense requests for review before payment', enabled: false },
  { label: 'Members Directory', description: 'Show the directory to all choir members', enabled: true },
];

const accessControls = [
  { label: 'Admin access', description: 'Full permissions for system administration', enabled: true },
  { label: 'Finance team access', description: 'Access to financial reports and transactions', enabled: true },
  { label: 'Read-only access', description: 'View-only access for auditors and guests', enabled: false },
];

export function SettingsPage() {
  const [toggles, setToggles] = useState(settingsToggles);
  const [access, setAccess] = useState(accessControls);

  const toggleItem = (index) => {
    setToggles((current) =>
      current.map((item, idx) => (idx === index ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const toggleAccess = (index) => {
    setAccess((current) =>
      current.map((item, idx) => (idx === index ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  return (
    <div className="p-8">
      <Header
        title="Settings"
        subtitle="Configure organization, permissions and financial controls"
        action="Save Settings"
        actionOnClick={() => window.alert('Settings saved successfully')}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Organization</h2>
                <p className="mt-2 text-sm text-gray-500">Update choir details and billing settings.</p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Live</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization name</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  defaultValue="St Cecilia Choir"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Financial year start</label>
                <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option>January</option>
                  <option>April</option>
                  <option>July</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default currency</label>
                <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option>Nigerian Naira (₦)</option>
                  <option>US Dollar ($)</option>
                  <option>Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Workflow settings</h2>
            <p className="mt-2 text-sm text-gray-500">Adjust how your choir manages finances and member access.</p>
            <div className="mt-6 space-y-4">
              {toggles.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${item.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Access controls</h2>
                <p className="mt-2 text-sm text-gray-500">Manage who can view and edit financial data.</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Standard</div>
            </div>
            <div className="space-y-4">
              {access.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAccess(index)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${item.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                <p className="mt-2 text-sm text-gray-500">Protect your choir’s financial information with secure access rules.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Two-factor authentication</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">Enabled</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Auto logout</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">30 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const roleCards = [
    { title: 'Admin', description: 'Full system access and user management' },
    { title: 'Financial Secretary', description: 'Record transactions, view reports' },
    { title: 'Treasurer', description: 'View financial reports and balances' },
    { title: 'Committee Head', description: 'Manage committee events and finances' },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const query = `${user.name} ${user.email} ${user.role}`.toLowerCase();
    return matchesStatus && query.includes(search.toLowerCase());
  });

  const stats = {
    total: users.length,
    active: users.filter((user) => user.status === 'Active').length,
    invited: users.filter((user) => user.status === 'Invited').length,
  };

  return (
    <div className="p-8">
      <Header
        title="User Management"
        subtitle="Invite and manage team access"
        action="Invite User"
        actionOnClick={() => setShowInviteUserModal(true)}
      />

      <Modal open={showInviteUserModal} title="Invite User" onClose={() => setShowInviteUserModal(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Rev. Fr. Peter Okoro"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="peter.okoro@stcecilia.org"
            />
          </Field>
          <Field label="Role">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>Admin</option>
              <option>Financial Secretary</option>
              <option>Treasurer</option>
              <option>Committee Head</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>Active</option>
              <option>Invited</option>
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowInviteUserModal(false)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowInviteUserModal(false)}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Send Invite
          </button>
        </div>
      </Modal>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {roleCards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search users..."
            />
          </div>
        </div>
        <div className="inline-flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {['all', 'Active', 'Invited'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-3 text-sm font-medium transition ${statusFilter === value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {value === 'all' ? 'All' : value}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['User', 'Role', 'Status', 'Added', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        {user.name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.added}</td>
                  <td className="px-6 py-4">
                    <button type="button" className="text-blue-600 hover:text-blue-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No users match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
