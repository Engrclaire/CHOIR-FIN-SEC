import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../config/supabaseClient';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle,
  CircleDollarSign,
  Clock,
  FileText,
  HandCoins,
  Plus,
  Search,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';

/* =========================================
   INTERFACES
   ========================================= */

interface HeaderProps {
  title: string;
  subtitle: string;
  action?: string;
  actionOnClick?: () => void;
  actionLink?: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  source?: string;
  category: string;
  mode: 'Transfer' | 'Cash';
  type: 'income' | 'expense';
  amount: number;
  amountPaid?: number;
  status?: string;
}

interface Member {
  id: number | string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
  debtStatus: 'clear' | 'owing' | 'critical';
  outstandingDebt: number;
  penalties: number;
  totalPaid: number;
  totalLevies: number;
  contributions: number;
}

/* =========================================
   HELPER COMPONENTS
   ========================================= */

function formatCurrency(amount: number): string {
  return `₦${(amount || 0).toLocaleString('en-NG')}`;
}

function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:bg-gray-400"
    >
      {children}
    </button>
  );
}

function Header({ title, subtitle, action, actionOnClick, actionLink }: HeaderProps) {
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
      {action &&
        (actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {ButtonContent}
          </Link>
        ) : (
          <PrimaryButton type="button" onClick={actionOnClick}>
            {ButtonContent}
          </PrimaryButton>
        ))}
    </div>
  );
}

function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
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

function StatCard({ title, amount, icon: Icon, color, loading = false }: { title: string; amount: number; icon: any; color: string; loading?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-1 h-7 w-24 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(amount)}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function SearchPanel({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
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
    Pending: 'bg-amber-100 text-amber-700',
    Reconciled: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function TransactionTable({ rows }: { rows: Transaction[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
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
              const displayAmount = transaction.type === 'income' ? transaction.amountPaid || 0 : transaction.amount || 0;

              return (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <p className="font-medium">{transaction.description}</p>
                    {transaction.source && <p className="mt-0.5 text-xs text-gray-500">{transaction.source}</p>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{transaction.category}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{transaction.mode}</td>
                  <td className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(displayAmount)}
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

function RecordTransactionPanel({ onClose, onSaveSuccess }: { onClose: () => void; onSaveSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'income',
    category: 'Levy',
    description: '',
    amount: '',
    mode_of_payment: 'transfer',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: yearData } = await supabase
        .from('financial_years')
        .select('id')
        .eq('is_closed', false)
        .maybeSingle();

      const { error: insertError } = await supabase.from('transactions').insert([{
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type || 'expense',
        category: formData.category || 'General',
        mode_of_payment: formData.mode_of_payment,
        financial_year_id: yearData?.id ?? null,
        recorded_by: user?.id ?? null,
      }]);

      if (insertError) throw insertError;

      onSaveSuccess();
      if (typeof onClose === 'function') {
        onClose();
      }

    } catch (err: any) {
      console.error("Error saving transaction record:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-blue-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Record Transaction</h2>
          <p className="mt-1 text-sm text-gray-600">Save entries live directly to your organization's backend ledger.</p>
        </div>
        <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Transaction Type">
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </Field>
        <Field label="Category">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option>Levy</option>
            <option>Contribution</option>
            <option>Donation</option>
            <option>Transport</option>
            <option>Welfare</option>
          </select>
        </Field>
        <Field label="Description">
          <input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
            placeholder="Enter description"
            required
          />
        </Field>
        <Field label="Amount">
          <input
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
            placeholder="0.00"
            type="number"
            required
          />
        </Field>
        <Field label="Payment Mode">
          <select
            value={formData.mode_of_payment}
            onChange={(e) => setFormData({ ...formData, mode_of_payment: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="transfer">Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? 'Recording...' : 'Record Transaction'}
        </PrimaryButton>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function ReportBar({ label, value, total, danger = false }: { label: string; value: number; total: number; danger?: boolean }) {
  const width = total > 0 ? Math.round((value / total) * 100) : 0;

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

/* =========================================
   PAGE COMPONENTS — ALL LIVE FROM BACKEND
   ========================================= */

export function DashboardHome() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debtors, setDebtors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [pledgesMetrics, setPledgesMetrics] = useState({ totalOutstanding: 0 });
  const [headCount, setHeadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [transResult, debtResult, eventsResult, pledgesResult, memberResult] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('members').select('id, first_name, last_name, outstanding_debt').gt('outstanding_debt', 0).order('outstanding_debt', { ascending: false }).limit(5),
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('pledges').select('amount, status'),
        supabase.from('members').select('id', { count: 'exact', head: true }),
      ]);

      if (transResult.error) throw transResult.error;
      if (debtResult.error) throw debtResult.error;

      const transData = (transResult.data ?? []).map((t: any) => ({
        ...t,
        mode: t.mode_of_payment === 'cash' ? 'Cash' : 'Transfer',
      }));
      setTransactions(transData);

      const debtData = (debtResult.data ?? []).map((d: any) => ({
        id: d.id,
        name: `${d.first_name} ${d.last_name}`,
        amount: Number(d.outstanding_debt || 0),
      }));
      setDebtors(debtData);

      const eventsData = eventsResult.data ?? [];
      const eventIds = eventsData.map((e: any) => e.id).filter(Boolean);
      let eventFinancials: Record<string, { income: number; expenses: number }> = {};
      if (eventIds.length > 0) {
        const { data: eventTxns } = await supabase
          .from('transactions')
          .select('event_id, amount, type')
          .in('event_id', eventIds);
        for (const txn of eventTxns ?? []) {
          const eid = String((txn as any).event_id);
          if (!eventFinancials[eid]) eventFinancials[eid] = { income: 0, expenses: 0 };
          if ((txn as any).type === 'income') {
            eventFinancials[eid].income += Number((txn as any).amount || 0);
          } else {
            eventFinancials[eid].expenses += Number((txn as any).amount || 0);
          }
        }
      }
      setEvents(eventsData.map((e: any) => ({
        ...e,
        income: eventFinancials[e.id]?.income || 0,
        expenses: eventFinancials[e.id]?.expenses || 0,
      })));

      if (!pledgesResult.error) {
        const totalOutstanding = (pledgesResult.data ?? [])
          .filter((p: any) => p.status !== 'fulfilled' && p.status !== 'paid')
          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
        setPledgesMetrics({ totalOutstanding });
      }

      setHeadCount(memberResult.count ?? 0);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const cashBalance = transactions
    .filter((t) => t.mode === 'Cash')
    .reduce((sum, t) => sum + (t.type === 'income' ? (t.amountPaid || 0) : -(t.amount || 0)), 0);
  const bankBalance = transactions
    .filter((t) => t.mode === 'Transfer')
    .reduce((sum, t) => sum + (t.type === 'income' ? (t.amountPaid || 0) : -(t.amount || 0)), 0);
  const totalDebtorsSum = debtors.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  return (
    <div className="p-8">
      <Header title="Dashboard" subtitle="St Cecilia Choir Financial Overview" action="Record Transaction" actionLink="/dashboard/transactions?action=record" />

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Head Count" amount={headCount} icon={Users} color="bg-slate-600" loading={loading} />
        <StatCard title="Bank Balance" amount={bankBalance} icon={Banknote} color="bg-blue-600" loading={loading} />
        <StatCard title="Cash Balance" amount={cashBalance} icon={Wallet} color="bg-green-600" loading={loading} />
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-emerald-600" loading={loading} />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" loading={loading} />
      </div>

      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-800">Outstanding Pledges</p>
            <p className="text-xl font-semibold text-amber-900">{formatCurrency(pledgesMetrics.totalOutstanding)}</p>
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
              <p className="mt-0.5 text-sm text-gray-500">Total Outstanding: {formatCurrency(totalDebtorsSum)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Loading debtors...</div>
            ) : debtors.length ? (
              debtors.slice(0, 3).map((debtor: any, i: number) => (
                <div key={debtor.id || i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{debtor.name}</p>
                      <StatusBadge status={debtor.amount >= 15000 ? 'critical' : 'owing'} />
                    </div>
                  </div>
                  <p className="font-semibold text-red-600">{formatCurrency(debtor.amount)}</p>
                </div>
              ))
            ) : (
              <div className="px-6 py-6 text-sm text-gray-500">No outstanding debts.</div>
            )}
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
            {loading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Loading events...</div>
            ) : events.length ? (
              events.slice(0, 3).map((event: any, idx: number) => {
                const net = (event.income || 0) - (event.expenses || 0);
                return (
                  <div key={event.id || idx} className="px-6 py-4 hover:bg-gray-50">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-gray-900">{event.name}</p>
                      <StatusBadge status={net >= 0 ? 'Profit' : 'Loss'} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <Detail label="Income" value={formatCurrency(event.income)} className="text-green-600" />
                      <Detail label="Expenses" value={formatCurrency(event.expenses)} className="text-red-600" />
                      <Detail label="Net" value={`${net >= 0 ? '+' : ''}${formatCurrency(net)}`} className={net >= 0 ? 'text-green-600' : 'text-red-600'} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-6 text-sm text-gray-500">No events yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTransactions((data ?? []).map((t: any) => ({
        ...t,
        mode: t.mode_of_payment === 'cash' ? 'Cash' : 'Transfer',
      })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const showRecordForm = searchParams.get('action') === 'record';
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);

  const visibleTransactions = transactions.filter((t) => {
    if (filter === 'income' && t.type !== 'income') return false;
    if (filter === 'expenses' && t.type !== 'expense') return false;
    return t.description.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-8">
      <Header title="Transactions" subtitle="All financial activity in one place" action="Record Transaction" actionLink="/dashboard/transactions?action=record" />

      {showRecordForm && (
        <RecordTransactionPanel
          onClose={() => {
            searchParams.delete('action');
            setSearchParams(searchParams, { replace: true });
          }}
          onSaveSuccess={() => {
            searchParams.delete('action');
            setSearchParams(searchParams, { replace: true });
            fetchTransactions();
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
                className={`rounded px-3 py-1.5 capitalize ${filter === item ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setFilter(item)}
              >
                {item === 'all' ? 'All' : item}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <TransactionTable rows={visibleTransactions} />
    </div>
  );
}

export function IncomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    supabase.from('transactions').select('*').eq('type', 'income').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setTransactions((data ?? []).map((t: any) => ({ ...t, mode: t.mode_of_payment === 'cash' ? 'Cash' : 'Transfer' })));
      })
      .catch(console.error);
  }, []);

  const totalIncome = transactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);

  return (
    <div className="p-8">
      <Header title="Income" subtitle="All income transactions" action="Record Income" actionLink="/dashboard/transactions?action=record" />
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
      <TransactionTable rows={transactions} />
    </div>
  );
}

export function ExpensesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    supabase.from('transactions').select('*').eq('type', 'expense').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setTransactions((data ?? []).map((t: any) => ({ ...t, mode: t.mode_of_payment === 'cash' ? 'Cash' : 'Transfer' })));
      })
      .catch(console.error);
  }, []);

  const totalExpenses = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="p-8">
      <Header title="Expenses" subtitle="All expense transactions" action="Record Expense" actionLink="/dashboard/transactions?action=record" />
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
      <TransactionTable rows={transactions} />
    </div>
  );
}

export function LeviesPage() {
  const [levies, setLevies] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('levies').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setLevies((data ?? []).map((l: any) => ({
          ...l,
          name: l.title,
          totalCollected: Number(l.total_collected || 0),
          totalExpected: Number(l.total_expected || 0),
          amountPerMember: Number(l.amount_per_member || 0),
          membersPaid: Number(l.members_paid || 0),
          totalMembers: Number(l.total_members || 0),
          deadline: l.deadline || '',
        })));
      })
      .catch(console.error);
  }, []);

  const totalCollected = levies.reduce((total, levy) => total + (levy.totalCollected || 0), 0);
  const totalExpected = levies.reduce((total, levy) => total + (levy.totalExpected || 0), 0);

  return (
    <div className="p-8">
      <Header title="Levies" subtitle="Manage member levies and collections" action="Record Levy Payment" actionLink="/dashboard/transactions?action=record" />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Collected" amount={totalCollected} icon={FileText} color="bg-green-600" />
        <StatCard title="Total Expected" amount={totalExpected} icon={FileText} color="bg-blue-600" />
        <StatCard title="Outstanding" amount={totalExpected - totalCollected} icon={FileText} color="bg-amber-500" />
      </div>
      <SearchPanel placeholder="Search levies..." />
      <div className="space-y-4">
        {levies.map((levy: any) => {
          const progress = levy.totalExpected ? Math.round((levy.totalCollected / levy.totalExpected) * 100) : 0;

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
                <Detail label="Members Paid" value={`${levy.membersPaid || 0} / ${levy.totalMembers || 0}`} />
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
  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('contributions').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setContributions(data ?? []);
      })
      .catch(console.error);
  }, []);

  const total = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const eventTotal = contributions
    .filter((c: any) => c.type === 'Event')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="p-8">
      <Header title="Contributions" subtitle="Voluntary contributions from members" action="Record Contribution" actionLink="/dashboard/transactions?action=record" />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Contributions" amount={total} icon={HandCoins} color="bg-blue-600" />
        <StatCard title="Event Contributions" amount={eventTotal} icon={HandCoins} color="bg-purple-600" />
        <StatCard title="General Contributions" amount={total - eventTotal} icon={HandCoins} color="bg-green-600" />
      </div>
      <SearchPanel placeholder="Search contributions..." />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
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
              {contributions.map((contribution: any) => (
                <tr key={contribution.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{contribution.created_at ? new Date(contribution.created_at).toLocaleDateString('en-NG') : ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <p className="font-medium">{contribution.description}</p>
                    {contribution.event && <p className="mt-0.5 text-xs text-gray-500">{contribution.event}</p>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{contribution.source}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={contribution.type} />
                  </td>
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

/* =========================================
   DEBT STATUS BADGE (Figma style)
   ========================================= */
function DebtStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: typeof CheckCircle; cls: string }> = {
    clear: { label: 'Clear', icon: CheckCircle, cls: 'bg-green-100 text-green-700 border-green-200' },
    owing: { label: 'Owing', icon: AlertTriangle, cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    critical: { label: 'Critical', icon: AlertCircle, cls: 'bg-red-100 text-red-700 border-red-200' },
  };
  const { label, icon: Icon, cls } = config[status] || config.clear;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

/* =========================================
   MEMBERS PAGE — Card grid, live from Supabase
   ========================================= */
export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMembers(
        (data || []).map((m: any) => ({
          id: m.id,
          firstName: m.first_name,
          lastName: m.last_name,
          phone: m.phone || '',
          email: m.email || '',
          role: m.role || '',
          debtStatus: m.debt_status || 'clear',
          outstandingDebt: m.outstanding_debt || 0,
          penalties: m.penalties || 0,
          totalPaid: m.total_levies + m.total_contributions || 0,
          totalLevies: m.total_levies || 0,
          contributions: m.total_contributions || 0,
        }))
      );
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('members').insert([{
        first_name: newMember.firstName,
        last_name: newMember.lastName,
        phone: newMember.phone,
        email: newMember.email,
      }]);
      if (error) throw error;
      setShowAddModal(false);
      setNewMember({ firstName: '', lastName: '', phone: '', email: '' });
      fetchMembers();
    } catch (err) {
      console.error('Error saving member:', err);
      alert('Failed to save member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const total = members.length;
  const clearCount = members.filter((m) => m.debtStatus === 'clear').length;
  const owingCount = members.filter((m) => m.debtStatus === 'owing').length;
  const criticalCount = members.filter((m) => m.debtStatus === 'critical').length;
  const totalDebt = members.reduce((s, m) => s + m.outstandingDebt + m.penalties, 0);

  const visibleMembers = members.filter((m) => {
    if (filter === 'clear' && m.debtStatus !== 'clear') return false;
    if (filter === 'owing' && m.debtStatus === 'clear') return false;
    if (filter === 'critical' && m.debtStatus !== 'critical') return false;
    const q = search.toLowerCase();
    const full = `${m.firstName} ${m.lastName}`.toLowerCase();
    return full.includes(q) || m.phone.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
          <p className="mt-1 text-gray-600">{total} total members</p>
        </div>
        <button type="button" onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Clear Status', value: clearCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-white', sub: 'No outstanding debts' },
          { label: 'Owing', value: owingCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-white', sub: 'Have some debts' },
          { label: 'Critical', value: criticalCount, icon: AlertCircle, color: 'text-red-600', bg: 'bg-white', sub: 'High debt levels' },
          { label: 'Total Debt', value: totalDebt, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', sub: 'Outstanding + Penalties', isCurrency: true },
        ].map((card) => (
          <div key={card.label} className={`rounded-lg border border-gray-200 ${card.bg} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${card.color}`}>
                  {card.isCurrency ? formatCurrency(card.value) : card.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{card.sub}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="inline-grid grid-cols-4 rounded-md bg-gray-100 p-1 text-xs">
            {[
              { key: 'all', label: `All (${total})` },
              { key: 'clear', label: `Clear (${clearCount})` },
              { key: 'owing', label: `Owing (${owingCount})` },
              { key: 'critical', label: `Critical (${criticalCount})` },
            ].map((f) => (
              <button
                key={f.key}
                className={`rounded px-3 py-1.5 transition ${filter === f.key ? 'bg-white shadow-sm font-medium text-black' : 'text-gray-600'}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">Loading members...</div>
      ) : visibleMembers.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
          <Search className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <h3 className="font-medium text-gray-900">No members found</h3>
          <p className="mt-1">{search ? 'Try adjusting your search' : 'No members match the selected filter'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleMembers.map((m) => (
            <Link
              key={m.id}
              to={`/dashboard/members/${m.id}`}
              className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-sm font-semibold text-blue-700">{m.firstName[0]}{m.lastName[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.firstName} {m.lastName}</h3>
                    <p className="text-sm text-gray-600">{m.phone}</p>
                  </div>
                </div>
                <DebtStatusBadge status={m.debtStatus} />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Total Paid</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(m.totalPaid)}</p>
                </div>
                <div className={`rounded p-3 ${m.outstandingDebt + m.penalties > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className={`text-xs ${m.outstandingDebt + m.penalties > 0 ? 'text-red-600' : 'text-green-600'}`}>Total Debt</p>
                  <p className={`font-semibold ${m.outstandingDebt + m.penalties > 0 ? 'text-red-700' : 'text-green-700'}`}>{formatCurrency(m.outstandingDebt + m.penalties)}</p>
                </div>
              </div>
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Levies Paid:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(m.totalLevies)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Contributions:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(m.contributions)}</span>
                </div>
                {m.outstandingDebt > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Outstanding:</span>
                    <span className="font-medium text-red-600">{formatCurrency(m.outstandingDebt)}</span>
                  </div>
                )}
                {m.penalties > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Penalties:</span>
                    <span className="font-medium text-red-600">{formatCurrency(m.penalties)}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Member</h3>
            </div>
            <form onSubmit={handleAddMember} className="px-6 py-4">
              <div className="space-y-4">
                {([
                  ['First Name', 'firstName', 'Enter first name', 'text'],
                  ['Last Name', 'lastName', 'Enter last name', 'text'],
                  ['Phone Number', 'phone', '+234 000 000 0000', 'text'],
                  ['Email Address', 'email', 'email@example.com', 'email'],
                ] as const).map(([label, field, placeholder, type]) => (
                  <div key={field}>
                    <label htmlFor={field} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      id={field}
                      required
                      type={type}
                      value={(newMember as any)[field]}
                      onChange={(e) => setNewMember((prev) => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   MEMBER DETAILS PAGE — live from Supabase
   ========================================= */
export function MemberDetailsPage() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: mData, error: mErr }, { data: tData }] = await Promise.all([
          supabase.from('members').select('*').eq('id', id).maybeSingle(),
          supabase.from('transactions').select('*').eq('member_id', id).order('created_at', { ascending: false }),
        ]);
        if (mErr) throw mErr;
        if (mData) {
          setMember({
            id: mData.id,
            firstName: mData.first_name,
            lastName: mData.last_name,
            phone: mData.phone || '',
            email: mData.email || '',
            role: mData.role || '',
            debtStatus: mData.debt_status || 'clear',
            outstandingDebt: mData.outstanding_debt || 0,
            penalties: mData.penalties || 0,
            totalPaid: (mData.total_levies || 0) + (mData.total_contributions || 0),
            totalLevies: mData.total_levies || 0,
            contributions: mData.total_contributions || 0,
          });
        }
        setTransactions((tData as any[] || []).map((t) => ({
          id: t.id,
          date: t.date || t.created_at?.slice(0, 10) || '',
          description: t.description || '',
          category: t.category || '',
          mode: t.mode_of_payment || 'Transfer',
          type: t.type || 'income',
          amount: t.amount || 0,
          amountPaid: t.amount_paid || t.amount || 0,
          status: t.status,
        })));
      } catch (err) {
        console.error('Error loading member:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-8"><div className="py-12 text-center text-sm text-gray-500 animate-pulse">Loading member profile...</div></div>;
  if (!member) return <div className="p-8"><div className="py-12 text-center text-sm text-gray-500">Member not found.</div></div>;

  const totalPaid = member.totalLevies + member.contributions;
  const totalDebt = member.outstandingDebt + member.penalties;

  return (
    <div className="p-8">
      {/* Back */}
      <Link to="/dashboard/members" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>

      {/* Profile Header */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-2xl font-semibold text-blue-700">{member.firstName[0]}{member.lastName[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{member.firstName} {member.lastName}</h1>
                <DebtStatusBadge status={member.debtStatus} />
              </div>
              <p className="mt-1 text-gray-600">{member.phone}</p>
              <p className="text-gray-600">{member.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Financial Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: 2/3 */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(totalPaid)}</p>
                  <p className="text-xs text-gray-500">All-time payments</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100"><CircleDollarSign className="h-5 w-5 text-green-600" /></div>
              </div>
            </div>
            <div className={`rounded-lg border p-4 ${totalDebt > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${totalDebt > 0 ? 'text-red-600' : 'text-gray-600'}`}>Total Debt</p>
                  <p className={`mt-1 text-2xl font-semibold ${totalDebt > 0 ? 'text-red-700' : 'text-gray-900'}`}>{formatCurrency(totalDebt)}</p>
                  <p className={`text-xs ${totalDebt > 0 ? 'text-red-500' : 'text-gray-500'}`}>Outstanding + Penalties</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100"><AlertCircle className="h-5 w-5 text-red-600" /></div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Payment Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{totalPaid > 0 ? Math.round((totalPaid / (totalPaid + totalDebt)) * 100) : 0}%</p>
                  <p className="text-xs text-gray-500">On-time payments</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Financial Breakdown</h2>
            <div className="divide-y">
              {[
                { label: 'Levies Paid', value: member.totalLevies, color: 'text-blue-600', sub: 'Levy payments' },
                { label: 'Contributions & Donations', value: member.contributions, color: 'text-purple-600', memberContributions: true },
                { label: 'Outstanding Debt', value: member.outstandingDebt, color: 'text-red-600', sub: 'Unpaid balances' },
                { label: 'Penalties', value: member.penalties, color: 'text-red-600', sub: 'Penalty charges' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{row.label}</p>
                    <p className="text-sm text-gray-500">{row.sub || 'Contributions'}</p>
                  </div>
                  <span className={`font-semibold ${row.color}`}>{formatCurrency(row.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Payment History</h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No recorded transactions yet.</p>
            ) : (
              <div className="divide-y">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {t.type === 'income' ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t.description}</p>
                        <p className="text-sm text-gray-500">{t.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountPaid || t.amount)}
                      </p>
                      {t.status && <StatusBadge status={t.status} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: 1/3 */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h3 className="mb-3 font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button type="button" className="flex w-full items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black">
                <Plus className="h-4 w-4" /> Record Payment
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <FileText className="h-4 w-4" /> Add Penalty
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <CircleDollarSign className="h-4 w-4" /> Waive Debt
              </button>
            </div>
          </div>

          {/* Debt Alert */}
          {totalDebt > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Debt Alert</h3>
              </div>
              <p className="mb-3 text-sm text-gray-600">
                This member has {formatCurrency(totalDebt)} in outstanding debts. Consider following up for payment.
              </p>
              <button type="button" className="w-full rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100">
                Send Reminder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventFinancials, setEventFinancials] = useState<Record<string, { income: number; expenses: number }>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    is_committee_run: false,
    budget: '',
  });

  const fetchEvents = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEvents(data ?? []);

      const fetchedEvents = data ?? [];
      if (fetchedEvents.length > 0) {
        const eventIds = fetchedEvents.map((e: any) => e.id);
        const { data: txnData } = await supabase
          .from('transactions')
          .select('event_id, amount, type')
          .in('event_id', eventIds);

        const financials: Record<string, { income: number; expenses: number }> = {};
        for (const txn of txnData ?? []) {
          const eid = String((txn as any).event_id);
          if (!financials[eid]) financials[eid] = { income: 0, expenses: 0 };
          if ((txn as any).type === 'income') {
            financials[eid].income += Number((txn as any).amount || 0);
          } else {
            financials[eid].expenses += Number((txn as any).amount || 0);
          }
        }
        setEventFinancials(financials);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setFetchError(err instanceof Error ? err.message : 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreateEvent = async () => {
    setFormErrors(null);
    if (!newEvent.name.trim()) {
      setFormErrors('Event name is required.');
      return;
    }
    setIsSaving(true);
    try {
      const { data: yearData, error: yearError } = await supabase
        .from('financial_years')
        .select('id')
        .eq('is_closed', false)
        .maybeSingle();
      if (yearError) throw yearError;

      const { data: { user } } = await supabase.auth.getUser();

      const payload: Record<string, unknown> = {
        name: newEvent.name.trim(),
        is_committee_run: newEvent.is_committee_run,
        financial_year_id: yearData?.id ?? null,
        committee_lead_id: user?.id ?? null,
        committee_balance: newEvent.budget ? Number(newEvent.budget) : 0,
      };

      const { error: insertError } = await supabase.from('events').insert([payload]);
      if (insertError) throw insertError;

      setShowAddEventModal(false);
      setNewEvent({ name: '', is_committee_run: false, budget: '' });
      void fetchEvents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event.';
      setFormErrors(message);
      console.error('Error creating event:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettleEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Mark "${eventName}" as settled? This records the final balance.`)) return;
    setSettlingId(eventId);
    try {
      const fin = eventFinancials[eventId] || { income: 0, expenses: 0 };
      const net = fin.income - fin.expenses;
      const { error } = await supabase
        .from('events')
        .update({ is_settled: true, committee_balance: net })
        .eq('id', eventId);
      if (error) throw error;
      fetchEvents();
    } catch (err) {
      console.error('Error settling event:', err);
      alert('Failed to settle event.');
    } finally {
      setSettlingId(null);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Delete "${eventName}"? All associated data will be lost.`)) return;
    setDeletingId(eventId);
    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEvents = (events ?? []).filter((event: any) => {
    const matchesFilter = filter === 'all' ||
      (filter === 'Settled' && event.is_settled) ||
      (filter === 'Active' && !event.is_settled);
    const matchesSearch = (event.name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => !e.is_settled).length;
  const settledEvents = events.filter((e) => e.is_settled).length;
  const totalIncome = Object.values(eventFinancials).reduce((sum, f) => sum + f.income, 0);
  const totalExpenses = Object.values(eventFinancials).reduce((sum, f) => sum + f.expenses, 0);
  const netOverall = totalIncome - totalExpenses;

  return (
    <div className="p-8">
      <Header title="Events" subtitle="Manage event budgets, income, expenses and results" action="Create Event" actionOnClick={() => {
        setNewEvent({ name: '', is_committee_run: false, budget: '' });
        setFormErrors(null);
        setShowAddEventModal(true);
      }} />

      <Modal open={showAddEventModal} title="Create Event" onClose={() => setShowAddEventModal(false)}>
        <div className="grid gap-4">
          <Field label="Event Name">
            <input
              value={newEvent.name}
              onChange={(e) => setNewEvent((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. 2026 Christmas Concert"
              required
            />
          </Field>
          <Field label="Initial Budget (₦)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={newEvent.budget}
              onChange={(e) => setNewEvent((prev) => ({ ...prev, budget: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="0.00"
            />
          </Field>
          <Field label="Event Type">
            <select
              value={newEvent.is_committee_run ? 'true' : 'false'}
              onChange={(e) => setNewEvent((prev) => ({ ...prev, is_committee_run: e.target.value === 'true' }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="false">General Event</option>
              <option value="true">Committee Run</option>
            </select>
          </Field>
        </div>
        {formErrors && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {formErrors}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setShowAddEventModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleCreateEvent} disabled={isSaving} className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 cursor-pointer">
            {isSaving ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </Modal>

      {fetchError && (
        <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{fetchError}</div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Events</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
              <CalendarDays className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{loading ? '...' : totalEvents}</p>
          <p className="mt-2 text-xs text-gray-500">{activeEvents} active, {settledEvents} settled</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Income</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-green-600">{loading ? '...' : formatCurrency(totalIncome)}</p>
          <p className="mt-2 text-xs text-gray-500">Across all events</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-red-600">{loading ? '...' : formatCurrency(totalExpenses)}</p>
          <p className="mt-2 text-xs text-gray-500">Across all events</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Net Result</p>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${netOverall >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <CircleDollarSign className={`h-4 w-4 ${netOverall >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </div>
          <p className={`mt-3 text-3xl font-semibold ${netOverall >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{loading ? '...' : formatCurrency(netOverall)}</p>
          <p className="mt-2 text-xs text-gray-500">Income minus expenses</p>
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
          {['all', 'Active', 'Settled'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-4 py-3 text-sm font-medium transition cursor-pointer ${filter === value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="mt-4 h-3 w-20 rounded bg-gray-100" />
              <div className="mt-6 h-2 w-full rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <h3 className="font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">{search ? 'Try adjusting your search' : 'Create your first event to get started.'}</p>
          {!search && (
            <button onClick={() => setShowAddEventModal(true)} className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 cursor-pointer">
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event: any) => {
            const fin = eventFinancials[event.id] || { income: 0, expenses: 0 };
            const net = fin.income - fin.expenses;
            const budget = Number(event.committee_balance || 0);
            const totalActivity = fin.income + fin.expenses;
            const incomeRatio = totalActivity > 0 ? (fin.income / totalActivity) * 100 : 0;

            return (
              <div key={event.id} className={`group rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md ${event.is_settled ? 'border-gray-200' : 'border-gray-200 hover:border-blue-200'}`}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900">{event.name}</h3>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StatusBadge status={event.is_settled ? 'Settled' : 'Active'} />
                      <StatusBadge status={event.is_committee_run ? 'Committee' : 'General'} />
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs font-medium text-green-600">Income</p>
                    <p className="mt-1 text-sm font-bold text-green-700">{formatCurrency(fin.income)}</p>
                  </div>
                  <div className="rounded-xl bg-red-50 p-3">
                    <p className="text-xs font-medium text-red-600">Expenses</p>
                    <p className="mt-1 text-sm font-bold text-red-700">{formatCurrency(fin.expenses)}</p>
                  </div>
                </div>

                {totalActivity > 0 && (
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                      <span>Income vs Expense Split</span>
                      <span>{Math.round(incomeRatio)}% / {Math.round(100 - incomeRatio)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className="flex h-full">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${incomeRatio}%` }} />
                        <div className="h-full bg-red-400 transition-all" style={{ width: `${100 - incomeRatio}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="text-xs font-medium text-gray-500">Net Result</span>
                  <span className={`text-sm font-bold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {net >= 0 ? '+' : ''}{formatCurrency(net)}
                  </span>
                </div>

                {budget > 0 && (
                  <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Committee Balance</span>
                    <span className="font-medium text-gray-700">{formatCurrency(budget)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                  <Link
                    to={`/dashboard/events/${event.id}`}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  {!event.is_settled && (
                    <button
                      type="button"
                      onClick={() => handleSettleEvent(event.id, event.name)}
                      disabled={settlingId === event.id}
                      className="flex-1 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50 cursor-pointer"
                    >
                      {settlingId === event.id ? 'Settling...' : 'Settle'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id, event.name)}
                    disabled={deletingId === event.id}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === event.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [eventTransactions, setEventTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (eventError) throw eventError;
        setEvent(eventData);

        const { data: transData, error: transError } = await supabase
          .from('transactions')
          .select('*')
          .eq('event_id', id)
          .order('created_at', { ascending: false });
        if (transError) throw transError;
        setEventTransactions(transData ?? []);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEventData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Link to="/dashboard/events" className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to Events</Link>
        <div className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8">
        <div className="py-12 text-center text-sm text-gray-500">Event not found.</div>
      </div>
    );
  }

  const totalIncome = eventTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  const totalExpenses = eventTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  const net = totalIncome - totalExpenses;

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
          <div className="flex items-center gap-2">
            <StatusBadge status={event.is_settled ? 'Settled' : 'Active'} />
            {event.is_committee_run && <StatusBadge status="Committee" />}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-green-600" />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" />
        <StatCard title="Committee Balance" amount={Number(event.committee_balance || 0)} icon={Banknote} color="bg-blue-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Event Summary</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Event Name" value={event.name} />
            <InfoRow label="Total Income" value={formatCurrency(totalIncome)} />
            <InfoRow label="Total Expenses" value={formatCurrency(totalExpenses)} />
            <InfoRow label="Net Result" value={`${net > 0 ? '+' : ''}${formatCurrency(net)}`} />
            <InfoRow label="Committee Balance" value={formatCurrency(Number(event.committee_balance || 0))} />
            <InfoRow label="Settled" value={event.is_settled ? 'Yes' : 'No'} />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Related Transactions</h2>
          {eventTransactions.length === 0 ? (
            <p className="text-sm text-gray-600">No transactions recorded for this event yet.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {eventTransactions.slice(0, 10).map((transaction: any) => {
                const amount = Number(transaction.amount || 0);

                return (
                  <div key={transaction.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description || transaction.category}</p>
                      <p className="text-sm text-gray-500">{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'Recently added'}</p>
                    </div>
                    <p className={transaction.type === 'income' ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportsPage({ type = 'overview' }: { type?: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTransactions(data ?? []);
      } catch (err) {
        console.error('Error fetching transactions for reports:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const cashIncome = transactions
    .filter((t) => t.type === 'income' && t.mode_of_payment === 'cash')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const cashExpenses = transactions
    .filter((t) => t.type === 'expense' && t.mode_of_payment === 'cash')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const bankIncome = transactions
    .filter((t) => t.type === 'income' && t.mode_of_payment === 'transfer')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const bankExpenses = transactions
    .filter((t) => t.type === 'expense' && t.mode_of_payment === 'transfer')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const cashBalance = cashIncome - cashExpenses;
  const bankBalance = bankIncome - bankExpenses;

  const incomeByCategory = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const incomeCategories = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]);
  const expenseCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  const heading = type === 'financial' ? 'Financial Reports' : type === 'members' ? 'Member Activity' : 'Financial Reports';

  return (
    <div className="p-8">
      <Header title={heading} subtitle="View insights and reports" action="Go to Transactions" actionLink="/dashboard/transactions" />

      {error && (
        <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Total Income" amount={totalIncome} icon={ArrowUpRight} color="bg-green-600" loading={loading} />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={ArrowDownRight} color="bg-red-600" loading={loading} />
        <StatCard title="Cash Balance" amount={cashBalance} icon={Wallet} color="bg-blue-600" loading={loading} />
        <StatCard title="Bank Balance" amount={bankBalance} icon={Banknote} color="bg-blue-600" loading={loading} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Income by Category</h3>
          {loading ? (
            <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
          ) : incomeCategories.length === 0 ? (
            <p className="text-sm text-gray-500">No income recorded yet.</p>
          ) : (
            incomeCategories.map(([name, value]) => (
              <ReportBar key={name} label={name} value={value} total={totalIncome} />
            ))
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Expenses by Category</h3>
          {loading ? (
            <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
          ) : expenseCategories.length === 0 ? (
            <p className="text-sm text-gray-500">No expenses recorded yet.</p>
          ) : (
            expenseCategories.map(([name, value]) => (
              <ReportBar key={name} label={name} value={value} total={totalExpenses} danger />
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Mode Summary</h3>
          {loading ? (
            <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cash Income</span>
                <span className="font-semibold text-green-600">{formatCurrency(cashIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cash Expenses</span>
                <span className="font-semibold text-red-600">{formatCurrency(cashExpenses)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="font-medium text-gray-900">Cash Balance</span>
                <span className={`font-semibold ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(cashBalance)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-600">Transfer Income</span>
                <span className="font-semibold text-green-600">{formatCurrency(bankIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Transfer Expenses</span>
                <span className="font-semibold text-red-600">{formatCurrency(bankExpenses)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="font-medium text-gray-900">Bank Balance</span>
                <span className={`font-semibold ${bankBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(bankBalance)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Stats</h3>
          {loading ? (
            <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-semibold text-gray-900">{transactions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Income Transactions</span>
                <span className="font-semibold text-green-600">{transactions.filter((t) => t.type === 'income').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Expense Transactions</span>
                <span className="font-semibold text-red-600">{transactions.filter((t) => t.type === 'expense').length}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="font-medium text-gray-900">Net Balance</span>
                <span className={`font-semibold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-600">Cash Transactions</span>
                <span className="font-semibold text-gray-900">{transactions.filter((t) => t.mode_of_payment === 'cash').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Transfer Transactions</span>
                <span className="font-semibold text-gray-900">{transactions.filter((t) => t.mode_of_payment === 'transfer').length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        All reports are automatically generated from your recorded transactions. To update these reports, add or modify transactions in the Transactions section.
      </p>
    </div>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    org_name: 'St Cecilia Choir',
    financial_year_start: 'January',
    currency: 'NGN',
    allow_backdated: false,
    require_approval: false,
    show_directory: true,
    admin_access: true,
    finance_access: true,
    read_only_access: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettingsId(data.id);
          setSettings({
            org_name: data.org_name ?? 'St Cecilia Choir',
            financial_year_start: data.financial_year_start ?? 'January',
            currency: data.currency ?? 'NGN',
            allow_backdated: data.allow_backdated ?? false,
            require_approval: data.require_approval ?? false,
            show_directory: data.show_directory ?? true,
            admin_access: data.admin_access ?? true,
            finance_access: data.finance_access ?? true,
            read_only_access: data.read_only_access ?? false,
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setFetchError('Could not load settings. Using defaults.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleSetting = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
    setSaveMsg(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    setFetchError(null);
    try {
      if (settingsId) {
        const { error } = await supabase
          .from('settings')
          .update({
            org_name: settings.org_name,
            financial_year_start: settings.financial_year_start,
            currency: settings.currency,
            allow_backdated: settings.allow_backdated,
            require_approval: settings.require_approval,
            show_directory: settings.show_directory,
            admin_access: settings.admin_access,
            finance_access: settings.finance_access,
            read_only_access: settings.read_only_access,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settingsId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('settings')
          .insert([{
            org_name: settings.org_name,
            financial_year_start: settings.financial_year_start,
            currency: settings.currency,
            allow_backdated: settings.allow_backdated,
            require_approval: settings.require_approval,
            show_directory: settings.show_directory,
            admin_access: settings.admin_access,
            finance_access: settings.finance_access,
            read_only_access: settings.read_only_access,
          }])
          .select('id')
          .single();
        if (error) throw error;
        if (data) setSettingsId(data.id);
      }
      setSaveMsg('Settings saved successfully.');
    } catch (err) {
      console.error('Error saving settings:', err);
      setFetchError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <Header title="Settings" subtitle="Configure organization, permissions and financial controls" action={saving ? 'Saving...' : 'Save Settings'} actionOnClick={handleSave} />

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">Loading settings...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_1fr]">
          <div className="space-y-6">
            {fetchError && (
              <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{fetchError}</div>
            )}
            {saveMsg && (
              <div className="rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800">{saveMsg}</div>
            )}
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
                    value={settings.org_name}
                    onChange={(e) => { setSettings((prev: any) => ({ ...prev, org_name: e.target.value })); setSaveMsg(null); }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Financial year start</label>
                  <select
                    value={settings.financial_year_start}
                    onChange={(e) => { setSettings((prev: any) => ({ ...prev, financial_year_start: e.target.value })); setSaveMsg(null); }}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>January</option>
                    <option>April</option>
                    <option>July</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => { setSettings((prev: any) => ({ ...prev, currency: e.target.value })); setSaveMsg(null); }}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Workflow settings</h2>
              <p className="mt-2 text-sm text-gray-500">Adjust how your choir manages finances and member access.</p>
              <div className="mt-6 space-y-4">
                {[
                  { key: 'allow_backdated', label: 'Allow Backdated Transactions', description: 'Permit entry of older financial activity' },
                  { key: 'require_approval', label: 'Require Approval for Expenses', description: 'Send expense requests for review before payment' },
                  { key: 'show_directory', label: 'Members Directory', description: 'Show the directory to all choir members' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSetting(item.key)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${settings[item.key] ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${settings[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
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
                {[
                  { key: 'admin_access', label: 'Admin access', description: 'Full permissions for system administration' },
                  { key: 'finance_access', label: 'Finance team access', description: 'Access to financial reports and transactions' },
                  { key: 'read_only_access', label: 'Read-only access', description: 'View-only access for auditors and guests' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSetting(item.key)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${settings[item.key] ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${settings[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                  <p className="mt-2 text-sm text-gray-500">Protect your choir's financial information with secure access rules.</p>
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
      )}
    </div>
  );
}

export function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'member' });
  const [saving, setSaving] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data ?? []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setInviteError('Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      // Call the Edge Function which uses the service_role key to send a real invite email
      const { data, error: fnError } = await supabase.functions.invoke('invite-user', {
        body: {
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          role: inviteForm.role,
        },
      });

      if (fnError) {
        // Try to parse the error message from the function response
        const msg = fnError?.message || (data as any)?.error || 'Failed to send invite.';
        throw new Error(msg);
      }

      const result = data as any;
      if (result?.error) {
        throw new Error(result.error);
      }

      setInviteSuccess(result?.message || `Invitation sent to ${inviteForm.email}`);
      setInviteForm({ name: '', email: '', role: 'member' });
      setShowInviteModal(false);
      fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to invite user.';
      // Provide helpful guidance if the Edge Function is not deployed yet
      if (msg.includes('Failed to fetch') || msg.includes('FunctionsError') || msg.includes('not found')) {
        setInviteError('Edge Function not deployed yet. Run: supabase functions deploy invite-user');
      } else {
        setInviteError(msg);
      }
      console.error('Error inviting user:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Remove "${userName}" from the system? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      const { error } = await supabase.from('app_users').delete().eq('id', userId);
      if (error) throw error;
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to remove user.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="p-8">
      <Header title="User Management" subtitle="Manage user accounts and roles" action="Invite User" actionOnClick={() => {
        setInviteForm({ name: '', email: '', role: 'member' });
        setInviteError(null);
        setInviteSuccess(null);
        setShowInviteModal(true);
      }} />

      <Modal open={showInviteModal} title="Invite New User" onClose={() => setShowInviteModal(false)}>
        <form onSubmit={handleInviteUser} className="space-y-4">
          <Field label="Full Name">
            <input
              value={inviteForm.name}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Joshua Okonkwo"
              required
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. joshua@example.com"
              required
            />
          </Field>
          <Field label="Role">
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="member">Member</option>
              <option value="finance_sec">Finance Secretary</option>
              <option value="admin">Admin</option>
              <option value="committee_lead">Committee Lead</option>
              <option value="read_only">Read Only</option>
            </select>
          </Field>
          {inviteError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">{inviteError}</div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowInviteModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50">
              {saving ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>

      {inviteSuccess && (
        <div className="mb-6 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800">{inviteSuccess}</div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{loading ? '...' : totalUsers}</p>
          <p className="mt-2 text-sm text-gray-500">All registered accounts</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="mt-3 text-3xl font-semibold text-green-600">{loading ? '...' : activeUsers}</p>
          <p className="mt-2 text-sm text-gray-500">Currently active accounts</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="mt-3 text-3xl font-semibold text-blue-600">{loading ? '...' : adminCount}</p>
          <p className="mt-2 text-sm text-gray-500">Full access accounts</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white py-12 text-center shadow-sm">
          <Users className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <h3 className="font-medium text-gray-900">No users yet</h3>
          <p className="mt-1 text-sm text-gray-500">Invite your first user to get started.</p>
          <button onClick={() => setShowInviteModal(true)} className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 cursor-pointer">
            Invite User
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-semibold text-blue-700">{(user.name || '?')[0]?.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.added ? new Date(user.added).toLocaleDateString() : user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={deletingId === user.id}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                      >
                        {deletingId === user.id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
