import { useEffect, useState, type FormEvent } from 'react';
import type { ElementType } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Menu,
  Plus,
  Users,
  Wallet,
  LoaderCircle,
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

const outstandingPledges = 0;

interface IncomeFormState {
  category: string;
  description: string;
  amount: string;
  modeOfPayment: 'cash' | 'transfer';
  memberId: string;
  eventId: string;
}

interface ExpenseFormState {
  category: string;
  description: string;
  amount: string;
  modeOfPayment: 'cash' | 'transfer';
  eventId: string;
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function StatCard({
  title,
  amount,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  amount: number;
  icon: ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {loading ? 'Loading…' : formatCurrency(amount)}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          {loading ? <LoaderCircle className="h-5 w-5 text-white animate-spin" /> : <Icon className="h-5 w-5 text-white" />}
        </div>
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
            className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 cursor-pointer"
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
  const navigate = useNavigate();
  const [cashAtHand, setCashAtHand] = useState<number>(0);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [outstandingDebts, setOutstandingDebts] = useState<number>(0);
  const [totalIncomeValue, setTotalIncomeValue] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<Transaction[]>(transactions.slice(0, 5));
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showIncomeModal, setShowIncomeModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const [incomeForm, setIncomeForm] = useState<IncomeFormState>({
    category: '',
    description: '',
    amount: '',
    modeOfPayment: 'cash',
    memberId: '',
    eventId: '',
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    category: '',
    description: '',
    amount: '',
    modeOfPayment: 'cash',
    eventId: '',
  });

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);
    setMetricsError(null);

    try {
      const [{ data: txnData, error: txnError }, { data: ledgerData, error: ledgerError }] = await Promise.all([
        supabase.from('transactions').select('amount, type, mode_of_payment'),
        supabase.from('member_ledgers').select('amount_due, amount_paid'),
      ]);

      if (txnError) throw txnError;
      if (ledgerError) throw ledgerError;

      const transactionsData = txnData ?? [];
      const cashIncome = transactionsData
        .filter((row: any) => row.type === 'income' && row.mode_of_payment === 'cash')
        .reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);

      const cashExpense = transactionsData
        .filter((row: any) => row.type === 'expense' && row.mode_of_payment === 'cash')
        .reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);

      const transferIncome = transactionsData
        .filter((row: any) => row.type === 'income' && row.mode_of_payment === 'transfer')
        .reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);

      const transferExpense = transactionsData
        .filter((row: any) => row.type === 'expense' && row.mode_of_payment === 'transfer')
        .reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);

      const incomeTotal = transactionsData
        .filter((row: any) => row.type === 'income')
        .reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);

      const debtRows = ledgerData ?? [];
      const totalDebt = debtRows.reduce((sum: number, row: any) => {
        const due = Number(row.amount_due || 0);
        const paid = Number(row.amount_paid || 0);
        return sum + Math.max(due - paid, 0);
      }, 0);

      setCashAtHand(cashIncome - cashExpense);
      setBankBalance(transferIncome - transferExpense);
      setOutstandingDebts(totalDebt);
      setTotalIncomeValue(incomeTotal);
    } catch (error: any) {
      console.error('Metric fetch error', error);
      setMetricsError(error?.message || 'Unable to load metrics.');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const fetchActivity = async () => {
    setIsLoadingActivity(true);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const mapped: Transaction[] = (data ?? []).map((row: any, index: number) => ({
        id: row.id ?? index + 1,
        date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recently added',
        category: row.category ?? 'General',
        description: row.description ?? 'Recorded transaction',
        source: row.recorded_by ?? 'System',
        amount: Number(row.amount || 0),
        amountPaid: row.type === 'income' ? Number(row.amount || 0) : undefined,
        status: row.status ?? undefined,
        mode: row.mode_of_payment === 'transfer' ? 'Transfer' : 'Cash',
        type: row.type === 'income' ? 'income' : 'expense',
      }));

      setRecentActivity(mapped);
    } catch (error: any) {
      console.error('Activity fetch error', error);
      setRecentActivity(transactions.slice(0, 5));
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchActivity();
  }, []);

  const clearToast = () => setTimeout(() => setToastMessage(null), 4000);

  const handleAddIncome = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError || new Error('Unable to identify current user.');
      }

      const payload = {
        type: 'income',
        category: incomeForm.category,
        description: incomeForm.description,
        amount: Number(incomeForm.amount),
        mode_of_payment: incomeForm.modeOfPayment,
        recorded_by: user.id,
        member_id: incomeForm.memberId || null,
        event_id: incomeForm.eventId || null,
      };

      const { error: insertError } = await supabase.from('transactions').insert([payload]);
      if (insertError) throw insertError;

      setIncomeForm({ category: '', description: '', amount: '', modeOfPayment: 'cash', memberId: '', eventId: '' });
      setShowIncomeModal(false);
      setToastMessage('Income entry recorded successfully.');
      fetchMetrics();
      clearToast();
    } catch (error: any) {
      console.error('Income insert error', error);
      setMetricsError(error?.message || 'Failed to record income.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError || new Error('Unable to identify current user.');
      }

      const payload = {
        type: 'expense',
        category: expenseForm.category,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        mode_of_payment: expenseForm.modeOfPayment,
        recorded_by: user.id,
        event_id: expenseForm.eventId || null,
      };

      const { error: insertError } = await supabase.from('transactions').insert([payload]);
      if (insertError) throw insertError;

      setExpenseForm({ category: '', description: '', amount: '', modeOfPayment: 'cash', eventId: '' });
      setShowExpenseModal(false);
      setToastMessage('Expense entry recorded successfully.');
      fetchMetrics();
      clearToast();
    } catch (error: any) {
      console.error('Expense insert error', error);
      setMetricsError(error?.message || 'Failed to record expense.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">St Cecilia Choir Financial Overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowIncomeModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Income
          </button>
          <button
            type="button"
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800">{toastMessage}</div>
      )}
      {metricsError && (
        <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{metricsError}</div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Cash at Hand" amount={cashAtHand} icon={Wallet} color="bg-green-600" loading={isLoadingMetrics} />
        <StatCard title="Bank Balance" amount={bankBalance} icon={Banknote} color="bg-blue-600" loading={isLoadingMetrics} />
        <StatCard title="Outstanding Debts" amount={outstandingDebts} icon={AlertCircle} color="bg-amber-600" loading={isLoadingMetrics} />
        <StatCard title="Total Income" amount={totalIncomeValue} icon={ArrowUpRight} color="bg-emerald-600" loading={isLoadingMetrics} />
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
            <button
              onClick={() => navigate('/dashboard/members')}
              className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
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
            <button
              onClick={() => navigate('/dashboard/events')}
              className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
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
          {isLoadingActivity ? (
            <div className="px-6 py-6 text-sm text-gray-500">Loading activity…</div>
          ) : recentActivity.length === 0 ? (
            <div className="px-6 py-6 text-sm text-gray-500">No recent activity yet.</div>
          ) : recentActivity.map((transaction) => {
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

      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Income</h2>
                <p className="text-sm text-gray-500">Record a new income transaction.</p>
              </div>
              <button type="button" onClick={() => setShowIncomeModal(false)} className="text-gray-500 hover:text-gray-900 cursor-pointer">Cancel</button>
            </div>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <input
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="e.g. Levy"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Income source or note"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <input
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm((prev) => ({ ...prev, amount: e.target.value }))}
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Mode of Payment</label>
                  <select
                    value={incomeForm.modeOfPayment}
                    onChange={(e) => setIncomeForm((prev) => ({ ...prev, modeOfPayment: e.target.value as 'cash' | 'transfer' }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Member ID</label>
                  <input
                    value={incomeForm.memberId}
                    onChange={(e) => setIncomeForm((prev) => ({ ...prev, memberId: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Optional member id"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Event ID</label>
                  <input
                    value={incomeForm.eventId}
                    onChange={(e) => setIncomeForm((prev) => ({ ...prev, eventId: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Optional event id"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowIncomeModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitLoading} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer">
                  {submitLoading ? 'Saving...' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Expense</h2>
                <p className="text-sm text-gray-500">Record a new expense transaction.</p>
              </div>
              <button type="button" onClick={() => setShowExpenseModal(false)} className="text-gray-500 hover:text-gray-900 cursor-pointer">Cancel</button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <input
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="e.g. Transport"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Expense detail"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <input
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Mode of Payment</label>
                  <select
                    value={expenseForm.modeOfPayment}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, modeOfPayment: e.target.value as 'cash' | 'transfer' }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Event ID</label>
                <input
                  value={expenseForm.eventId}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, eventId: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Optional event id"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitLoading} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer">
                  {submitLoading ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
