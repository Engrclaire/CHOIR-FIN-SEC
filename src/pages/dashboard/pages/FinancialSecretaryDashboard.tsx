import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  HandCoins,
  Landmark,
  LoaderCircle,
  Lock,
  RefreshCw,
  Scale,
  ShieldCheck,
  Users,
  X,
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
    deadline: string | null;
    created_at: string | null;
  }> | null;
};

type TransactionRow = {
  id: string;
  amount: number | string | null;
  type: string | null;
  mode_of_payment: string | null;
  event_id: string | null;
};

type LedgerRow = {
  member_id: string | null;
  event_id: string | null;
  amount_due: number | string | null;
  amount_paid: number | string | null;
  total_owed: number | string | null;
  total_paid: number | string | null;
  penalty_accumulated: number | string | null;
  is_cleared: boolean | null;
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

const quickLinks = [
  { label: 'Levies', href: '/dashboard/levies', icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { label: 'Contributions', href: '/dashboard/contributions', icon: HandCoins, color: 'bg-purple-50 text-purple-600' },
  { label: 'Transactions', href: '/dashboard/transactions', icon: Banknote, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
];

export default function FinancialSecretaryDashboard() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [assignedEvents, setAssignedEvents] = useState<AssignedEvent[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [ledgers, setLedgers] = useState<LedgerRow[]>([]);
  const [members, setMembers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [activeYear, setActiveYear] = useState<{ id: string; year_label: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actualCash, setActualCash] = useState('');
  const [actualBank, setActualBank] = useState('');
  const [reconNotes, setReconNotes] = useState('');
  const [reconSaving, setReconSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  const [penaltyTarget, setPenaltyTarget] = useState<{ memberId: string; fullName: string } | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyDesc, setPenaltyDesc] = useState('');
  const [penaltySaving, setPenaltySaving] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to view this dashboard.');

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('event_assignments')
        .select('event_id, role, events(id, name, is_settled, deadline, created_at)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (assignmentError) throw assignmentError;

      const assignments = (assignmentData ?? []).map((a: AssignmentRow) => ({
        event_id: a.event_id,
        role: a.role,
        events: Array.isArray(a.events) ? a.events[0] ?? null : a.events,
      })) as AssignedEvent[];

      const [{ data: txnData }, { data: ledgerData }, { data: memberData }, { data: yearData }] = await Promise.all([
        supabase.from('transactions').select('id, amount, type, mode_of_payment, event_id'),
        supabase.from('member_ledgers').select('member_id, event_id, amount_due, amount_paid, total_owed, total_paid, penalty_accumulated, is_cleared'),
        supabase.from('members').select('id, first_name, last_name'),
        supabase.from('financial_years').select('id, year_label').eq('is_closed', false).maybeSingle(),
      ]);

      setAssignedEvents(assignments);
      setTransactions((txnData ?? []) as TransactionRow[]);
      setLedgers((ledgerData ?? []) as LedgerRow[]);
      setMembers((memberData ?? []) as typeof members);
      setActiveYear((yearData ?? null) as { id: string; year_label: string } | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your assigned workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();

    const channel = supabase
      .channel('finsec-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_assignments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_ledgers' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_years' }, () => void load())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0);
    const cash = transactions.reduce((sum, t) => {
      if (t.mode_of_payment !== 'cash') return sum;
      return sum + (t.type === 'income' ? toNumber(t.amount) : -toNumber(t.amount));
    }, 0);
    const bank = transactions.reduce((sum, t) => {
      if (t.mode_of_payment !== 'transfer') return sum;
      return sum + (t.type === 'income' ? toNumber(t.amount) : -toNumber(t.amount));
    }, 0);
    return { income, expenses, cash, bank };
  }, [transactions]);

  const debtRows = useMemo(() => {
    const eventIds = new Set(assignedEvents.map((a) => a.event_id));
    const byMember = new Map<string, { owed: number; paid: number }>();

    for (const ledger of ledgers) {
      if (!ledger.member_id) continue;
      if (ledger.event_id && !eventIds.has(ledger.event_id)) continue;

      const owed = toNumber(ledger.total_owed) || toNumber(ledger.amount_due);
      const penalty = toNumber(ledger.penalty_accumulated);
      const paid = toNumber(ledger.total_paid) || toNumber(ledger.amount_paid);

      const current = byMember.get(ledger.member_id) ?? { owed: 0, paid: 0 };
      current.owed += owed + penalty;
      current.paid += paid;
      byMember.set(ledger.member_id, current);
    }

    return Array.from(byMember.entries())
      .map(([memberId, { owed, paid }]) => {
        const member = members.find((m) => m.id === memberId);
        const outstanding = Math.max(owed - paid, 0);
        return {
          memberId,
          fullName: member ? `${member.first_name} ${member.last_name}`.trim() : 'Unknown Member',
          owed,
          paid,
          outstanding,
          rate: owed > 0 ? Math.round((paid / owed) * 100) : 0,
        };
      })
      .filter((row) => row.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [ledgers, members, assignedEvents]);

  const totalDebt = debtRows.reduce((sum, row) => sum + row.outstanding, 0);
  const totalMembers = members.length;

  const handleSaveReconciliation = async () => {
    if (actualCash === '' && actualBank === '') {
      showToast('Enter at least one actual balance to reconcile.', 'error');
      return;
    }
    setReconSaving(true);
    try {
      const { error } = await supabase.from('reconciliations').insert([{
        financial_year_id: activeYear?.id ?? null,
        cash_system_balance: stats.cash,
        cash_actual_balance: Number(actualCash || 0),
        bank_system_balance: stats.bank,
        bank_actual_balance: Number(actualBank || 0),
        cash_difference: stats.cash - Number(actualCash || 0),
        bank_difference: stats.bank - Number(actualBank || 0),
        notes: reconNotes,
      }]);
      if (error) throw error;
      showToast('Reconciliation saved successfully.', 'success');
      setActualCash('');
      setActualBank('');
      setReconNotes('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save reconciliation.', 'error');
    } finally {
      setReconSaving(false);
    }
  };

  const handleYearEndClosure = async () => {
    if (!confirm('Close the current financial year?\n\nThis locks the year, rolls forward bank/cash balances and unpaid member debts into a new financial year. This cannot be undone.')) return;
    setClosing(true);
    try {
      const { data, error } = await supabase.rpc('close_financial_year');
      if (error) throw error;
      showToast(`FY ${data?.new_year_label} opened. Balances rolled forward (Cash ₦${formatNumber(data?.cash_balance ?? 0)}, Bank ₦${formatNumber(data?.bank_balance ?? 0)}).`, 'success');
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Year-end closure failed.', 'error');
    } finally {
      setClosing(false);
    }
  };

  function formatNumber(value: number | string | null) {
    return Number(value ?? 0).toLocaleString('en-NG');
  }

  const handleAddPenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyTarget || !Number(penaltyAmount)) {
      showToast('Enter a valid penalty amount.', 'error');
      return;
    }
    setPenaltySaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: yearData } = await supabase.from('financial_years').select('id').eq('is_closed', false).maybeSingle();
      const { error: txnError } = await supabase.from('transactions').insert([{
        type: 'expense',
        category: 'Penalty',
        description: penaltyDesc.trim() || `Penalty applied to ${penaltyTarget.fullName}`,
        amount: Number(penaltyAmount),
        mode_of_payment: 'cash',
        member_id: penaltyTarget.memberId,
        financial_year_id: yearData?.id ?? null,
        recorded_by: user?.id ?? null,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
      }]);
      if (txnError) throw txnError;

      const { data: memberData } = await supabase
        .from('members')
        .select('penalties')
        .eq('id', penaltyTarget.memberId)
        .maybeSingle();

      const { error: updateError } = await supabase
        .from('members')
        .update({ penalties: (Number(memberData?.penalties || 0)) + Number(penaltyAmount) })
        .eq('id', penaltyTarget.memberId);
      if (updateError) throw updateError;

      void supabase.from('audit_logs').insert([{
        action: 'PENALTY',
        entity: 'member',
        entity_id: penaltyTarget.memberId,
        description: `Penalty of ${formatCurrency(Number(penaltyAmount))} applied to ${penaltyTarget.fullName} (${penaltyDesc.trim() || 'Penalty'})`,
      }]);

      showToast(`Penalty of ${formatCurrency(Number(penaltyAmount))} applied to ${penaltyTarget.fullName}.`, 'success');
      setPenaltyTarget(null);
      setPenaltyAmount('');
      setPenaltyDesc('');
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to apply penalty.', 'error');
    } finally {
      setPenaltySaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Financial Secretary Workspace
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Financial Secretary Dashboard</h1>
          <p className="mt-1 text-gray-600">
            {profile?.full_name ? `${profile.full_name} · ` : ''}Manage levies, contributions and reporting for assigned events
            {activeYear ? ` · FY ${activeYear.year_label}` : ''}
          </p>
        </div>
        <Link
          to="/dashboard/transactions?action=record"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500"
        >
          <Banknote className="mr-2 h-4 w-4" /> Record Transaction
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Assigned Events" amount={assignedEvents.length} icon={CalendarDays} color="bg-blue-600" loading={isLoading} isCurrency={false} />
        <StatCard title="Total Income" amount={stats.income} icon={ArrowUpRight} color="bg-emerald-600" loading={isLoading} />
        <StatCard title="Total Expenses" amount={stats.expenses} icon={ArrowDownRight} color="bg-red-600" loading={isLoading} />
        <StatCard title="Outstanding Debts" amount={totalDebt} icon={Users} color="bg-amber-500" loading={isLoading} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${link.color}`}>
              <link.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{link.label}</p>
              <p className="text-xs text-gray-500">Manage {link.label.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Member Levy & Debt Tracking */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Member Levies & Debts</h2>
              <p className="mt-0.5 text-sm text-gray-500">{totalMembers} members · {debtRows.length} owing · {formatCurrency(totalDebt)} outstanding</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Loading debts...</div>
            ) : debtRows.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No outstanding member debts.</p>
                <p className="mt-1 text-xs text-gray-400">Record levies and payments to start tracking member balances.</p>
              </div>
            ) : (
              debtRows.slice(0, 8).map((row) => (
                <div key={row.memberId} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-semibold text-blue-700">{row.fullName.slice(0, 1).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{row.fullName}</p>
                      <p className="text-xs text-gray-500">{row.rate}% paid · {formatCurrency(row.paid)} of {formatCurrency(row.owed)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-semibold text-red-600">{formatCurrency(row.outstanding)}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPenaltyTarget({ memberId: row.memberId, fullName: row.fullName });
                        setPenaltyAmount('');
                        setPenaltyDesc('');
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 cursor-pointer"
                    >
                      <AlertTriangle className="h-3 w-3" /> Add Penalty
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <Link
              to="/dashboard/members"
              className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Users className="h-4 w-4" /> Manage Members & Debts
            </Link>
          </div>
        </div>

        {/* Cash vs Bank Reconciliation */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Cash vs Bank Reconciliation</h2>
              <p className="mt-0.5 text-sm text-gray-500">System balances vs. actual balances counted</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Scale className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-emerald-700">System Cash Balance</p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">{isLoading ? '...' : formatCurrency(stats.cash)}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-blue-700">System Bank Balance</p>
                <p className="mt-1 text-xl font-semibold text-blue-700">{isLoading ? '...' : formatCurrency(stats.bank)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Actual Cash Counted (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="0.00"
                />
                {actualCash !== '' && (
                  <p className={`mt-1 text-xs ${stats.cash - Number(actualCash) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    Difference: {formatCurrency(stats.cash - Number(actualCash))}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Actual Bank Counted (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={actualBank}
                  onChange={(e) => setActualBank(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="0.00"
                />
                {actualBank !== '' && (
                  <p className={`mt-1 text-xs ${stats.bank - Number(actualBank) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    Difference: {formatCurrency(stats.bank - Number(actualBank))}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <input
                value={reconNotes}
                onChange={(e) => setReconNotes(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. Cash counted at service on 12/05/2026"
              />
            </div>
            <button
              type="button"
              disabled={reconSaving}
              onClick={() => void handleSaveReconciliation()}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 cursor-pointer"
            >
              {reconSaving ? 'Saving...' : 'Save Reconciliation'}
            </button>
          </div>
        </div>
      </div>

      {/* Year-End Closure */}
      <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Year-End Closure</h2>
              <p className="mt-1 text-sm text-gray-600">
                {activeYear
                  ? <>Current financial year: <strong>FY {activeYear.year_label}</strong>. Closing locks all transactions for the year and rolls forward bank/cash balances plus unpaid debts into a new financial year.</>
                  : 'No open financial year found. Run the 004 migration to create one.'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl bg-white px-4 py-2 text-sm">
              <p className="text-xs text-gray-500">Cash to roll forward</p>
              <p className="font-semibold text-amber-700">{isLoading ? '...' : formatCurrency(stats.cash)}</p>
            </div>
            <div className="rounded-xl bg-white px-4 py-2 text-sm">
              <p className="text-xs text-gray-500">Bank to roll forward</p>
              <p className="font-semibold text-amber-700">{isLoading ? '...' : formatCurrency(stats.bank)}</p>
            </div>
            <button
              type="button"
              disabled={closing || !activeYear}
              onClick={() => void handleYearEndClosure()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 cursor-pointer"
            >
              {closing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {closing ? 'Closing...' : 'Close Current Year'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Assigned Events</h2>
            <p className="mt-0.5 text-sm text-gray-500">Financial work scoped strictly to these events</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <CalendarDays className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="px-6 py-6 text-sm text-gray-500">Loading assigned events...</div>
          ) : assignedEvents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">You have not been assigned to any events yet.</p>
              <p className="mt-1 text-xs text-gray-400">An Admin will assign you to an event, and it will appear here immediately.</p>
            </div>
          ) : (
            assignedEvents.map((assignment) => {
              const event = assignment.events;
              const eventTxns = transactions.filter((t) => t.event_id === assignment.event_id);
              const income = eventTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0);
              const expenses = eventTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0);

              return (
                <div key={assignment.event_id} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
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

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs leading-relaxed text-emerald-900">
        <Landmark className="mr-1 inline h-4 w-4" />
        All figures are scoped strictly to the events assigned to you. Reconciliation snapshots are stored in the reconciliations
        table, and closing a financial year permanently locks it while opening a fresh one with carried-forward balances.
      </div>

      {penaltyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPenaltyTarget(null)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Apply Penalty</h3>
                <p className="mt-0.5 text-sm text-gray-500">{penaltyTarget.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPenaltyTarget(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPenalty} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Amount (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Reason (Optional)</label>
                <input
                  value={penaltyDesc}
                  onChange={(e) => setPenaltyDesc(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  placeholder="e.g. Late levy payment"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPenaltyTarget(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={penaltySaving}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 cursor-pointer"
                >
                  {penaltySaving ? 'Applying...' : 'Apply Penalty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
