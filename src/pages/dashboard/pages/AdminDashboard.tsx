import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  HandCoins,
  LoaderCircle,
  Plus,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../config/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

type StaffAssignment = {
  id: string;
  event_id: string;
  user_id: string;
  role: 'fin_sec' | 'committee_lead';
  profiles: { id: string; full_name: string | null; email: string | null } | null;
};

type EventRow = {
  id: string;
  name: string | null;
  is_settled: boolean | null;
  created_at: string | null;
  [key: string]: unknown;
};

type TransactionRow = {
  id: string;
  amount: number | string | null;
  type: string | null;
  mode_of_payment: string | null;
  event_id: string | null;
  recorded_by: string | null;
};

type LedgerRow = {
  id: string;
  amount_due: number | string | null;
  amount_paid: number | string | null;
  total_owed: number | string | null;
  total_paid: number | string | null;
  penalty_accumulated: number | string | null;
  is_cleared: boolean | null;
  event_id: string | null;
};

type PledgeRow = {
  id: string;
  amount: number | string | null;
  status: string | null;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0) || 0;
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Recently added';
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    Settled: 'bg-gray-100 text-gray-700',
    Committee: 'bg-purple-100 text-purple-700',
    General: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [ledgers, setLedgers] = useState<LedgerRow[]>([]);
  const [pledges, setPledges] = useState<PledgeRow[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('You must be signed in to view this dashboard.');

        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        if (eventsError) throw eventsError;

        const myEvents = (eventsData ?? []) as EventRow[];
        const eventIds = myEvents.map((e) => e.id);

        const [{ data: txnData }, { data: assignmentData }, { data: ledgerData }, { data: pledgeData }] = await Promise.all([
          supabase.from('transactions').select('id, amount, type, mode_of_payment, event_id, recorded_by'),
          eventIds.length
            ? supabase.from('event_assignments').select('*').in('event_id', eventIds)
            : Promise.resolve({ data: [] }),
          supabase.from('member_ledgers').select('id, amount_due, amount_paid, total_owed, total_paid, penalty_accumulated, is_cleared, event_id'),
          supabase.from('pledges').select('id, amount, status'),
        ]);

        const rawAssignments = (assignmentData ?? []) as StaffAssignment[];
        const staffIds = rawAssignments.map((a) => a.user_id);
        const profileMap: Record<string, { id: string; full_name: string | null; email: string | null }> = {};
        if (staffIds.length) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', staffIds);
          for (const p of profileData ?? []) profileMap[p.id] = p;
        }
        const withProfiles = rawAssignments.map((a) => ({ ...a, profiles: profileMap[a.user_id] ?? null }));

        if (!mounted) return;
        setEvents(myEvents);
        setTransactions((txnData ?? []) as TransactionRow[]);
        setAssignments(withProfiles);
        setLedgers((ledgerData ?? []) as LedgerRow[]);
        setPledges((pledgeData ?? []) as PledgeRow[]);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load admin dashboard.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();

    const channel = supabase
      .channel('admin-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_assignments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_ledgers' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pledges' }, () => void load())
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const myEventIds = new Set(events.map((e) => e.id));
    const eventTxns = transactions.filter((t) => t.event_id && myEventIds.has(t.event_id));

    const cash = eventTxns.reduce((sum, t) => {
      if (t.mode_of_payment !== 'cash') return sum;
      return sum + (t.type === 'income' ? toNumber(t.amount) : -toNumber(t.amount));
    }, 0);

    const bank = eventTxns.reduce((sum, t) => {
      if (t.mode_of_payment !== 'transfer') return sum;
      return sum + (t.type === 'income' ? toNumber(t.amount) : -toNumber(t.amount));
    }, 0);

    const scopedLedgers = ledgers.filter((l) => {
      if (!l.is_cleared) return true;
      return l.event_id ? myEventIds.has(l.event_id) : false;
    });

    const totalDebts = scopedLedgers.reduce((sum, l) => {
      const owed = toNumber(l.total_owed) + toNumber(l.penalty_accumulated);
      const paid = toNumber(l.total_paid) + toNumber(l.amount_paid);
      const due = toNumber(l.amount_due);
      const expected = owed || due;
      return sum + Math.max(expected - paid, 0);
    }, 0);

    const totalPledges = pledges
      .filter((p) => p.status !== 'fulfilled' && p.status !== 'paid')
      .reduce((sum, p) => sum + toNumber(p.amount), 0);

    return {
      totalBank: bank,
      totalCash: cash,
      totalDebts,
      totalPledges,
      totalIncome: eventTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0),
      totalExpenses: eventTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0),
      assignedStaff: new Set(assignments.map((a) => a.user_id)).size,
    };
  }, [events, transactions, assignments, ledgers, pledges]);

  const staffByEvent = useMemo(() => {
    const grouped: Record<string, StaffAssignment[]> = {};
    for (const assignment of assignments) {
      if (!grouped[assignment.event_id]) grouped[assignment.event_id] = [];
      grouped[assignment.event_id].push(assignment);
    }
    return grouped;
  }, [assignments]);

  const recordedByStaff = useMemo(() => {
    const staffIds = new Set(assignments.map((a) => a.user_id));
    const counts: Record<string, number> = {};
    for (const txn of transactions) {
      if (txn.recorded_by && staffIds.has(txn.recorded_by)) {
        counts[txn.recorded_by] = (counts[txn.recorded_by] || 0) + 1;
      }
    }
    return counts;
  }, [assignments, transactions]);

  const staffName = (assignment: StaffAssignment) =>
    assignment.profiles?.full_name || assignment.profiles?.email || 'Assigned user';

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Workspace
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">
            {profile?.full_name ? `${profile.full_name} · ` : ''}Oversight of events you created and their assigned staff
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/events"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Link>
          <Link
            to="/dashboard/events"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500"
          >
            <CalendarDays className="mr-2 h-4 w-4" /> Manage Events
          </Link>
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Bank" amount={stats.totalBank} icon={Banknote} color="bg-blue-600" loading={isLoading} />
        <StatCard title="Total Cash" amount={stats.totalCash} icon={Wallet} color="bg-emerald-600" loading={isLoading} />
        <StatCard title="Total Debts" amount={stats.totalDebts} icon={AlertCircle} color="bg-amber-500" loading={isLoading} />
        <StatCard title="Total Pledges" amount={stats.totalPledges} icon={HandCoins} color="bg-violet-600" loading={isLoading} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">My Events</h2>
              <p className="mt-0.5 text-sm text-gray-500">Only events you created</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">You have not created any events yet.</p>
                <Link to="/dashboard/events" className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                  Create an Event
                </Link>
              </div>
            ) : (
              events.map((event) => {
                const eventTxns = transactions.filter((t) => t.event_id === event.id);
                const income = eventTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0);
                const expenses = eventTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0);
                const staffCount = staffByEvent[event.id]?.length ?? 0;

                return (
                  <Link key={event.id} to={`/dashboard/events/${event.id}`} className="block px-6 py-4 transition hover:bg-gray-50">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{event.name ?? 'Untitled Event'}</p>
                        <StatusBadge status={event.is_settled ? 'Settled' : 'Active'} />
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(event.created_at as string | null)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Income</p>
                        <p className="font-semibold text-emerald-600">{formatCurrency(income)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expenses</p>
                        <p className="font-semibold text-red-600">{formatCurrency(expenses)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Staff</p>
                        <p className="flex items-center gap-1 font-semibold text-violet-600">
                          <Users className="h-3.5 w-3.5" /> {staffCount}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Staff Oversight</h2>
              <p className="mt-0.5 text-sm text-gray-500">Financial Secretaries & Committee Leads on your events</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
              <UserCog className="h-5 w-5 text-violet-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No staff assigned to your events yet.</p>
                <p className="mt-1 text-xs text-gray-400">Open an event and use "Assign Event Staff" to invite a Financial Secretary or Committee Lead.</p>
              </div>
            ) : (
              assignments.map((assignment) => {
                const event = events.find((e) => e.id === assignment.event_id);
                const roleLabel = assignment.role === 'fin_sec' ? 'Financial Secretary' : 'Committee Lead';

                return (
                  <div key={assignment.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-semibold text-blue-700">{staffName(assignment).slice(0, 1).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staffName(assignment)}</p>
                        <p className="text-xs text-gray-500">
                          {roleLabel} · {event?.name ?? 'Unknown event'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> {recordedByStaff[assignment.user_id] ?? 0} txn(s) recorded
                      </span>
                      <Link
                        to={`/dashboard/events/${assignment.event_id}`}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Financial Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-emerald-50 p-5">
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <CircleDollarSign className="h-4 w-4" />
              <p className="text-sm font-medium">Total Income</p>
            </div>
            <p className="text-2xl font-semibold text-emerald-700">{formatCurrency(stats.totalIncome)}</p>
            <p className="mt-1 text-xs text-emerald-600">Across events you created</p>
          </div>
          <div className="rounded-2xl bg-red-50 p-5">
            <div className="mb-2 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">Total Expenses</p>
            </div>
            <p className="text-2xl font-semibold text-red-700">{formatCurrency(stats.totalExpenses)}</p>
            <p className="mt-1 text-xs text-red-600">Across events you created</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-5">
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              <Wallet className="h-4 w-4" />
              <p className="text-sm font-medium">Net Result</p>
            </div>
            <p className="text-2xl font-semibold text-blue-700">{formatCurrency(stats.totalIncome - stats.totalExpenses)}</p>
            <p className="mt-1 text-xs text-blue-600">Income minus expenses</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs leading-relaxed text-indigo-900">
          <Banknote className="mr-1 inline h-4 w-4" />
          All metrics are scoped strictly to events where you are the owner (created_by). Transactions recorded by your assigned
          Financial Secretaries and Committee Leads on those events are aggregated here for oversight.
        </div>
      </div>
    </div>
  );
}
