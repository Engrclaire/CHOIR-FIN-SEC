import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Landmark,
  LoaderCircle,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../config/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/useToast';

type AssignedEvent = {
  event_id: string;
  role: string;
  events: {
    id: string;
    name: string | null;
    is_settled: boolean | null;
    committee_balance: number | null;
    deadline: string | null;
    created_at: string | null;
  } | null;
};

type AssignmentRow = {
  event_id: string;
  role: string;
  events: Array<{
    id: string;
    name: string | null;
    is_settled: boolean | null;
    committee_balance: number | null;
    deadline: string | null;
    created_at: string | null;
  }> | null;
};

type TransactionRow = {
  id: string;
  amount: number | string | null;
  type: string | null;
  event_id: string | null;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0) || 0;
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'No deadline';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function StatCard({
  title,
  amount,
  icon: Icon,
  color,
  loading,
  isCurrency = true,
}: {
  title: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  loading: boolean;
  isCurrency?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {loading ? '...' : isCurrency ? formatCurrency(amount) : amount.toLocaleString('en-NG')}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-white" /> : <Icon className="h-5 w-5 text-white" />}
        </div>
      </div>
    </div>
  );
}

export default function CommitteeLeadDashboard() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<AssignedEvent[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showLogModal, setShowLogModal] = useState<'income' | 'expense' | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [logEventId, setLogEventId] = useState('');
  const [logAmount, setLogAmount] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [logMode, setLogMode] = useState<'cash' | 'transfer'>('cash');
  const [transferEventId, setTransferEventId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to view this dashboard.');

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('event_assignments')
        .select('event_id, role, events(id, name, is_settled, committee_balance, deadline, created_at)')
        .eq('user_id', user.id)
        .eq('role', 'committee_lead')
        .order('created_at', { ascending: false });
      if (assignmentError) throw assignmentError;

      const rows = (assignmentData ?? []).map((a: AssignmentRow) => ({
        event_id: a.event_id,
        role: a.role,
        events: Array.isArray(a.events) ? a.events[0] ?? null : a.events,
      })) as AssignedEvent[];
      const eventIds = rows.map((a) => a.event_id);

      const { data: txnData } = eventIds.length
        ? await supabase.from('transactions').select('id, amount, type, event_id').in('event_id', eventIds)
        : { data: [] };

      setAssignments(rows);
      setTransactions((txnData ?? []) as TransactionRow[]);

      if (logEventId && !eventIds.includes(logEventId)) setLogEventId('');
      if (transferEventId && !eventIds.includes(transferEventId)) setTransferEventId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your committee workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();

    const channel = supabase
      .channel('committee-lead-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_assignments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => void load())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const eventIds = new Set(assignments.map((a) => a.event_id));
    const scoped = transactions.filter((t) => t.event_id && eventIds.has(t.event_id));
    const income = scoped.filter((t) => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0);
    const expenses = scoped.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0);
    const balance = assignments.reduce((sum, a) => sum + toNumber(a.events?.committee_balance), 0);
    return { income, expenses, balance };
  }, [assignments, transactions]);

  const eventById = useMemo(() => {
    const map: Record<string, AssignedEvent['events']> = {};
    for (const a of assignments) {
      if (a.events) map[a.event_id] = a.events;
    }
    return map;
  }, [assignments]);

  const eventBalance = (eventId: string) => toNumber(eventById[eventId]?.committee_balance);

  const handleLogTransaction = async (type: 'income' | 'expense') => {
    if (!logEventId) {
      showToast('Please select an event first.', 'error');
      return;
    }
    if (!logAmount || Number(logAmount) <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: yearData } = await supabase.from('financial_years').select('id').eq('is_closed', false).maybeSingle();

      const { error: txnError } = await supabase.from('transactions').insert([{
        type,
        category: type === 'income' ? 'Committee Income' : 'Committee Expense',
        description: logDescription || `${type === 'income' ? 'Income' : 'Expense'} for ${eventById[logEventId]?.name ?? 'event'}`,
        amount: Number(logAmount),
        mode_of_payment: logMode,
        event_id: logEventId,
        financial_year_id: yearData?.id ?? null,
        recorded_by: user?.id ?? null,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
      }]);
      if (txnError) throw txnError;

      showToast(type === 'income' ? 'Income recorded for the event.' : 'Expense recorded for the event.', 'success');
      setShowLogModal(null);
      setLogAmount('');
      setLogDescription('');
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to record transaction.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTransferToMain = async () => {
    if (!transferEventId) {
      showToast('Please select an event first.', 'error');
      return;
    }
    const balance = eventBalance(transferEventId);
    const amount = transferAmount ? Number(transferAmount) : balance;
    if (amount <= 0) {
      showToast('There is no positive balance to transfer.', 'error');
      return;
    }
    if (amount > balance) {
      showToast('Transfer amount cannot exceed the committee balance.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: yearData } = await supabase.from('financial_years').select('id').eq('is_closed', false).maybeSingle();
      const event = eventById[transferEventId];

      const { error: txnError } = await supabase.from('transactions').insert([{
        type: 'expense',
        category: 'Transfer to Main Account',
        description: `Transfer of committee balance to main choir account (${event?.name ?? 'event'})`,
        amount,
        mode_of_payment: 'transfer',
        event_id: transferEventId,
        financial_year_id: yearData?.id ?? null,
        recorded_by: user?.id ?? null,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
      }]);
      if (txnError) throw txnError;

      const { error: updateError } = await supabase
        .from('events')
        .update({ committee_balance: 0 })
        .eq('id', transferEventId);
      if (updateError) throw updateError;

      showToast('Committee balance transferred to the main choir account.', 'success');
      setShowTransferModal(false);
      setTransferAmount('');
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Transfer failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openLogModal = (type: 'income' | 'expense') => {
    const firstEvent = assignments[0]?.event_id ?? '';
    setLogEventId(firstEvent);
    setLogAmount('');
    setLogDescription('');
    setLogMode('cash');
    setShowLogModal(type);
  };

  const openTransferModal = () => {
    const firstEvent = assignments[0]?.event_id ?? '';
    setTransferEventId(firstEvent);
    setTransferAmount('');
    setShowTransferModal(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Committee Lead Workspace
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Committee Lead Dashboard</h1>
          <p className="mt-1 text-gray-600">
            {profile?.full_name ? `${profile.full_name} · ` : ''}Manage the sub-account of events assigned to you
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openTransferModal}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-orange-400 cursor-pointer"
          >
            <Send className="mr-2 h-4 w-4" /> Transfer Balance to Main Choir Account
          </button>
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Assigned Events" amount={assignments.length} icon={CalendarDays} color="bg-violet-600" loading={isLoading} isCurrency={false} />
        <StatCard title="Committee Balance" amount={stats.balance} icon={Landmark} color="bg-amber-500" loading={isLoading} />
        <StatCard title="Total Income" amount={stats.income} icon={ArrowUpRight} color="bg-emerald-600" loading={isLoading} />
        <StatCard title="Total Expenses" amount={stats.expenses} icon={ArrowDownRight} color="bg-red-600" loading={isLoading} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => openLogModal('income')}
          className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Log Income</p>
            <p className="text-xs text-gray-500">Record income for an assigned event</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => openLogModal('expense')}
          className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-red-200 hover:shadow-md cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
            <ArrowDownRight className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Log Expense</p>
            <p className="text-xs text-gray-500">Record an expense from the committee sub-account</p>
          </div>
        </button>
        <button
          type="button"
          onClick={openTransferModal}
          className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-amber-200 hover:shadow-md cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <Send className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Transfer to Main Account</p>
            <p className="text-xs text-gray-500">Move the committee balance to the main choir account</p>
          </div>
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Assigned Events</h2>
            <p className="mt-0.5 text-sm text-gray-500">Committee work scoped strictly to these events</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="px-6 py-6 text-sm text-gray-500">Loading assigned events...</div>
          ) : assignments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">You have not been assigned to any events yet.</p>
              <p className="mt-1 text-xs text-gray-400">An Admin will assign you to an event, and it will appear here immediately.</p>
            </div>
          ) : (
            assignments.map((assignment) => {
              const event = assignment.events;
              const eventTxns = transactions.filter((t) => t.event_id === assignment.event_id);
              const income = eventTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0);
              const expenses = eventTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0);
              const balance = toNumber(event?.committee_balance);

              return (
                <div key={assignment.event_id} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <CalendarDays className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event?.name ?? 'Untitled Event'}</p>
                      <p className="text-xs text-gray-500">
                        Deadline: {formatDate(event?.deadline ?? null)} · {event?.is_settled ? 'Settled' : 'Active'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Income</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(income)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expenses</p>
                      <p className="font-semibold text-red-600">{formatCurrency(expenses)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Balance</p>
                      <p className="font-semibold text-amber-600">{formatCurrency(balance)}</p>
                    </div>
                    <Link
                      to={`/dashboard/events/${assignment.event_id}`}
                      className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Open Event
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {showLogModal === 'income' ? 'Log Income' : 'Log Expense'}
                </h2>
                <p className="text-sm text-gray-500">
                  Recorded strictly against the selected event sub-account
                </p>
              </div>
              <button type="button" onClick={() => setShowLogModal(null)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event</label>
                <select
                  value={logEventId}
                  onChange={(e) => setLogEventId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  {assignments.map((a) => (
                    <option key={a.event_id} value={a.event_id}>{a.events?.name ?? 'Untitled Event'}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mode of Payment</label>
                  <select
                    value={logMode}
                    onChange={(e) => setLogMode(e.target.value as 'cash' | 'transfer')}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder={showLogModal === 'income' ? 'e.g. Ticket sales' : 'e.g. Hall hire'}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowLogModal(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleLogTransaction(showLogModal)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer ${
                  showLogModal === 'income'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/20 hover:from-red-500 hover:to-rose-500'
                }`}
              >
                <Banknote className="h-4 w-4" /> {saving ? 'Saving...' : showLogModal === 'income' ? 'Record Income' : 'Record Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Transfer Balance to Main Choir Account</h2>
                <p className="text-sm text-gray-500">Logs the transfer and resets the committee balance to zero</p>
              </div>
              <button type="button" onClick={() => setShowTransferModal(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event</label>
                <select
                  value={transferEventId}
                  onChange={(e) => setTransferEventId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  {assignments.map((a) => (
                    <option key={a.event_id} value={a.event_id}>
                      {a.events?.name ?? 'Untitled Event'} — {formatCurrency(toNumber(a.events?.committee_balance))}
                    </option>
                  ))}
                </select>
              </div>
              {transferEventId && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Current committee balance: <strong>{formatCurrency(eventBalance(transferEventId))}</strong>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder={`Full balance: ${formatCurrency(transferEventId ? eventBalance(transferEventId) : 0)}`}
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank to transfer the full balance.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowTransferModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleTransferToMain()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" /> {saving ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
