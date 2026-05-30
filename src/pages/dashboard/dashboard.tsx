import { useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  FileText,
  HandCoins,
  LoaderCircle,
  Menu,
  Plus,
  Search,
  Users,
  Wallet,
} from 'lucide-react';
import Sidebar from './components/Sidebar';

type Transaction = {
  id: number;
  date: string;
  category: string;
  description: string;
  source: string;
  amountPaid?: number;
  amount?: number;
  status?: string;
  mode: string;
  type: 'income' | 'expense';
};

const transactions: Transaction[] = [
  {
    id: 1,
    date: '22/02/2026',
    category: 'Levy',
    description: 'Harvest levy payment',
    source: 'Joshua Okonkwo',
    amountPaid: 15000,
    status: 'PAID',
    mode: 'Transfer',
    type: 'income',
  },
  {
    id: 2,
    date: '21/02/2026',
    category: 'Transport',
    description: 'Member visitation',
    source: 'Welfare Team',
    amount: 15000,
    mode: 'Cash',
    type: 'expense',
  },
  {
    id: 3,
    date: '20/02/2026',
    category: 'Contribution',
    description: 'Christmas carol contribution',
    source: 'Agu Emmanuel',
    amountPaid: 7500,
    status: 'PARTIAL',
    mode: 'Transfer',
    type: 'income',
  },
  {
    id: 4,
    date: '20/02/2026',
    category: 'Welfare',
    description: 'Refreshment for rehearsal',
    source: 'Choir Welfare',
    amount: 9700,
    mode: 'Cash',
    type: 'expense',
  },
  {
    id: 5,
    date: '19/02/2026',
    category: 'Donation',
    description: 'General choir donation',
    source: 'Anamba Florence',
    amountPaid: 22500,
    status: 'PAID',
    mode: 'Transfer',
    type: 'income',
  },
];

const debtors = [
  { name: 'Joshua Okonkwo', amount: 15000, status: 'critical' },
  { name: 'Agu Emmanuel', amount: 12500, status: 'owing' },
  { name: 'Anamba Florence', amount: 8000, status: 'owing' },
];

const events = [
  { id: 1, name: 'Harvest Committee', income: 120000, expenses: 95000, profit: 25000, status: 'profit' },
  { id: 2, name: 'Christmas Carol', income: 85000, expenses: 92000, profit: -7000, status: 'loss' },
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
    totalContributions: 25000,
    totalLevies: 80000,
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
    totalContributions: 45000,
    totalLevies: 120000,
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
    totalContributions: 60000,
    totalLevies: 150000,
  },
  {
    id: 4,
    firstName: 'Grace',
    lastName: 'Nwosu',
    phone: '+234 804 567 8901',
    email: 'grace@example.com',
    role: 'Alto',
    debtStatus: 'clear',
    outstandingDebt: 0,
    penalties: 0,
    totalContributions: 35000,
    totalLevies: 95000,
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
const outstandingPledges = 0;

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
      {children}
    </button>
  );
}

function StatCard({
  title,
  amount,
  icon: Icon,
  color,
}: {
  title: string;
  amount: number;
  icon: ElementType;
  color: string;
}) {
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

function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-600">{subtitle}</p>
      </div>
      {action && (
        <PrimaryButton>
          <Plus className="mr-2 h-4 w-4" />
          {action}
        </PrimaryButton>
      )}
    </div>
  );
}

function SearchPanel({ placeholder }: { placeholder: string }) {
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
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
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export function DashboardHome() {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="p-8">
      <Header
        title="Dashboard"
        subtitle="St Cecilia Choir Financial Overview"
        action="Record Transaction"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Bank Balance" amount={bankBalance} icon={Banknote} color="bg-blue-600" />
        <StatCard title="Cash Balance" amount={cashBalance} icon={Wallet} color="bg-green-600" />
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-emerald-600" />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" />
      </div>

      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-800">Outstanding Pledges</p>
            <p className="text-xl font-semibold text-amber-900">{formatCurrency(outstandingPledges)}</p>
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
                  <StatusBadge status={event.status === 'profit' ? 'Profit' : 'Loss'} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Income</p>
                    <p className="font-semibold text-green-600">{formatCurrency(event.income)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expenses</p>
                    <p className="font-semibold text-red-600">{formatCurrency(event.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net</p>
                    <p className={`font-semibold ${event.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {event.profit > 0 ? '+' : ''}
                      {formatCurrency(event.profit)}
                    </p>
                  </div>
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
        <div className="divide-y divide-gray-200">
          {recentTransactions.map((transaction) => {
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
      </div>
    </div>
  );
}

export function TransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expenses'>('all');
  const visibleTransactions = transactions.filter((transaction) => {
    if (filter === 'income') return transaction.type === 'income';
    if (filter === 'expenses') return transaction.type === 'expense';
    return true;
  });

  return (
    <div className="p-8">
      <Header title="Transactions" subtitle="All financial activity in one place" action="Record Transaction" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-green-600" />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" />
        <StatCard title="Net Balance" amount={totalIncome - totalExpenses} icon={Banknote} color="bg-blue-600" />
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-grid grid-cols-3 rounded-md bg-gray-100 p-1 text-sm">
            {(['all', 'income', 'expenses'] as const).map((item) => (
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

function TransactionTable({ rows }: { rows: Transaction[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[720px]">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mode</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
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
                <td className="whitespace-nowrap px-6 py-4">{transaction.status ? <StatusBadge status={transaction.status} /> : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function IncomePage() {
  const incomeRows = transactions.filter((transaction) => transaction.type === 'income');

  return (
    <div className="p-8">
      <Header title="Income" subtitle="All income transactions" action="Record Income" />
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
      <TransactionTable rows={incomeRows} />
    </div>
  );
}

export function ExpensesPage() {
  const expenseRows = transactions.filter((transaction) => transaction.type === 'expense');

  return (
    <div className="p-8">
      <Header title="Expenses" subtitle="All expense transactions" action="Record Expense" />
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
      <TransactionTable rows={expenseRows} />
    </div>
  );
}

export function LeviesPage() {
  const totalCollected = levies.reduce((total, levy) => total + levy.totalCollected, 0);
  const totalExpected = levies.reduce((total, levy) => total + levy.totalExpected, 0);

  return (
    <div className="p-8">
      <Header title="Levies" subtitle="Manage member levies and collections" action="Record Levy Payment" />
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

function Detail({ label, value, className = 'text-gray-900' }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-semibold ${className}`}>{value}</p>
    </div>
  );
}

export function ContributionsPage() {
  const total = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
  const eventTotal = contributions.filter((contribution) => contribution.type === 'Event').reduce((sum, contribution) => sum + contribution.amount, 0);
  const generalTotal = total - eventTotal;

  return (
    <div className="p-8">
      <Header title="Contributions" subtitle="Voluntary contributions from members" action="Record Contribution" />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Contributions" amount={total} icon={HandCoins} color="bg-blue-600" />
        <StatCard title="Event Contributions" amount={eventTotal} icon={HandCoins} color="bg-purple-600" />
        <StatCard title="General Contributions" amount={generalTotal} icon={HandCoins} color="bg-green-600" />
      </div>
      <SearchPanel placeholder="Search contributions..." />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[720px]">
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
  );
}

export function MembersPage() {
  const stats = {
    total: members.length,
    clear: members.filter((member) => member.debtStatus === 'clear').length,
    owing: members.filter((member) => member.debtStatus === 'owing').length,
    critical: members.filter((member) => member.debtStatus === 'critical').length,
    totalDebt: members.reduce((sum, member) => sum + member.outstandingDebt + member.penalties, 0),
  };

  return (
    <div className="p-8">
      <Header title="Members" subtitle={`${stats.total} total members`} action="Add Member" />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MemberStat label="Clear Status" value={stats.clear.toString()} helper="No outstanding debts" icon={CheckCircle2} />
        <MemberStat label="Owing" value={stats.owing.toString()} helper="Have some debts" icon={AlertCircle} color="text-amber-600" />
        <MemberStat label="Critical" value={stats.critical.toString()} helper="High debt levels" icon={AlertCircle} color="text-red-600" />
        <MemberStat label="Total Debt" value={formatCurrency(stats.totalDebt)} helper="Outstanding + Penalties" icon={AlertCircle} danger />
      </div>
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none" placeholder="Search by name, phone, or email..." />
          </div>
          <div className="grid grid-cols-4 rounded-md bg-gray-100 p-1 text-xs">
            {['All', 'Clear', 'Owing', 'Critical'].map((item, index) => (
              <button key={item} className={`rounded px-3 py-2 ${index === 0 ? 'bg-white shadow-sm' : 'text-gray-600'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <StatusBadge status={member.debtStatus} />
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">{member.phone}</p>
              <p className="text-gray-600">{member.email}</p>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding</span>
                  <span className="font-semibold text-red-600">{formatCurrency(member.outstandingDebt + member.penalties)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberStat({
  label,
  value,
  helper,
  icon: Icon,
  color = 'text-green-600',
  danger = false,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
  color?: string;
  danger?: boolean;
}) {
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
  return (
    <div className="p-8">
      <Header title="Events" subtitle="Track event income, expenses, and outcomes" action="Add Event" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
              <StatusBadge status={event.status === 'profit' ? 'Profit' : 'Loss'} />
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
              <Detail label="Income" value={formatCurrency(event.income)} className="text-green-600" />
              <Detail label="Expenses" value={formatCurrency(event.expenses)} className="text-red-600" />
              <Detail label="Net" value={`${event.profit > 0 ? '+' : ''}${formatCurrency(event.profit)}`} className={event.profit > 0 ? 'text-green-600' : 'text-red-600'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPage({ type = 'overview' }: { type?: 'overview' | 'financial' | 'members' }) {
  const heading = type === 'financial' ? 'Financial Reports' : type === 'members' ? 'Member Activity' : 'Financial Reports';

  return (
    <div className="p-8">
      <Header title={heading} subtitle="View insights and reports" action="Go to Transactions" />
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

function ReportBar({ label, value, total, danger = false }: { label: string; value: number; total: number; danger?: boolean }) {
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

export function SettingsPage() {
  return (
    <div className="p-8">
      <Header title="Settings" subtitle="Configure organization and financial controls" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Organization</h3>
          <label className="text-sm font-medium text-gray-700">Organization Name</label>
          <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" defaultValue="St Cecilia Choir" />
          <label className="mt-4 block text-sm font-medium text-gray-700">Financial Year Start Month</label>
          <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" defaultValue="January" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Financial Controls</h3>
          {['Allow Backdated Transactions', 'Require Approval for Expenses', 'Members Directory'].map((setting, index) => (
            <div key={setting} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
              <p className="font-medium text-gray-900">{setting}</p>
              <div className={`h-6 w-11 rounded-full p-1 ${index === 1 ? 'bg-gray-300' : 'bg-blue-600'}`}>
                <div className={`h-4 w-4 rounded-full bg-white transition ${index === 1 ? '' : 'translate-x-5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UserManagementPage() {
  const users = [
    { name: 'Admin User', email: 'admin@stcecilia.org', role: 'Choir Admin', status: 'Active' },
    { name: 'Finance Secretary', email: 'finance@stcecilia.org', role: 'Financial Secretary', status: 'Active' },
  ];

  return (
    <div className="p-8">
      <Header title="User Management" subtitle="Invite and manage team access" action="Invite User" />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {['Name', 'Email', 'Role', 'Status'].map((heading) => (
                <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.email} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        <LoaderCircle className="mx-auto mb-3 h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
