import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  LoaderCircle,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../config/supabaseClient';

type UserRole = 'admin' | 'fin_sec' | 'committee_lead';
type TransactionType = 'income' | 'expense';

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: UserRole;
}

interface FinancialYearRow {
  id: string;
  year_label: string;
  is_closed: boolean;
}

interface TransactionRow {
  id: string | number;
  created_at: string | null;
  date: string | null;
  category: string | null;
  description: string | null;
  amount: number | string | null;
  type: TransactionType | string | null;
  mode_of_payment: string | null;
  status: string | null;
  financial_year_id: string | null;
  event_id: string | null;
  recorded_by: string | null;
}

interface MemberLedgerRow {
  id: string | number;
  total_owed: number | string | null;
  total_paid: number | string | null;
  penalty_accumulated: number | string | null;
  is_cleared: boolean | null;
  members: {
    full_name: string | null;
    envelope_number: string | null;
  } | null;
}

interface EventRow {
  id: string | number;
  name: string | null;
  committee_lead_id: string | null;
  financial_year_id: string | null;
  committee_balance: number | null;
  is_settled: boolean | null;
  is_committee_run: boolean | null;
  [key: string]: unknown;
}

interface DashboardMetrics {
  total_bank_balance: number;
  total_cash_at_hand: number;
  total_income: number;
  total_expenses: number;
  outstanding_debts: number;
}

interface DebtorSummary {
  id: string | number;
  full_name: string;
  outstanding_amount: number;
  status: 'critical' | 'owing';
}

interface EventPerformance {
  id: string | number;
  name: string;
  income: number;
  expenses: number;
  net: number;
  status: string;
}

interface StatCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  isLoading: boolean;
}

const emptyMetrics: DashboardMetrics = {
  total_bank_balance: 0,
  total_cash_at_hand: 0,
  total_income: 0,
  total_expenses: 0,
  outstanding_debts: 0,
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0) || 0;
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Recently added';
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function StatCard({ title, amount, icon: Icon, color, isLoading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {isLoading ? 'Loading...' : formatCurrency(amount)}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          {isLoading ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Icon className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Full: 'bg-green-100 text-green-700',
    Part: 'bg-amber-100 text-amber-700',
    Pledge: 'bg-blue-100 text-blue-700',
    owing: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
    Profit: 'bg-green-100 text-green-700',
    Loss: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function DashboardHome() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [activeFinancialYearId, setActiveFinancialYearId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [topDebtors, setTopDebtors] = useState<DebtorSummary[]>([]);
  const [eventPerformance, setEventPerformance] = useState<EventPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('You must be signed in to view the dashboard.');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Profile not found for this user.');

        const userProfile = profileData as ProfileRow;
        const userRole = userProfile.role;

        const { data: financialYearData, error: financialYearError } = await supabase
          .from('financial_years')
          .select('id, year_label, is_closed')
          .eq('is_closed', false)
          .maybeSingle();

        if (financialYearError) throw financialYearError;

        const activeFinancialYear = financialYearData as FinancialYearRow | null;
        const activeYearId = activeFinancialYear?.id ?? null;

        let eventsQuery = supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (userRole === 'committee_lead') {
          eventsQuery = eventsQuery.eq('committee_lead_id', user.id);
        }

        const { data: eventsData, error: eventsError } = await eventsQuery;
        if (eventsError) throw eventsError;

        const visibleEvents = (eventsData ?? []) as EventRow[];
        const visibleEventIds = visibleEvents.map((event) => String(event.id));

        let transactionsQuery = supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (activeYearId) {
          transactionsQuery = transactionsQuery.eq('financial_year_id', activeYearId);
        }

        if (userRole === 'committee_lead') {
          transactionsQuery = visibleEventIds.length
            ? transactionsQuery.in('event_id', visibleEventIds)
            : transactionsQuery.eq('id', '-1'); // Secure fallback
        }

        const { data: transactionsData, error: transactionsError } = await transactionsQuery;
        if (transactionsError) throw transactionsError;

        let ledgerQuery = supabase
          .from('member_ledgers')
          .select('*')
          .eq('is_cleared', false);

        const { data: ledgerData, error: ledgerError } = await ledgerQuery;
        if (ledgerError) throw ledgerError;

        const scopedTransactions = (transactionsData ?? []) as TransactionRow[];
        const unclearedLedgers = (ledgerData ?? []) as unknown as MemberLedgerRow[];

        const total_income = scopedTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const total_expenses = scopedTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const cash_income = scopedTransactions
          .filter((t) => t.type === 'income' && t.mode_of_payment === 'cash')
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const cash_expenses = scopedTransactions
          .filter((t) => t.type === 'expense' && t.mode_of_payment === 'cash')
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const transfer_income = scopedTransactions
          .filter((t) => t.type === 'income' && t.mode_of_payment === 'transfer')
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const transfer_expenses = scopedTransactions
          .filter((t) => t.type === 'expense' && t.mode_of_payment === 'transfer')
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const total_cash_at_hand = cash_income - cash_expenses;
        const total_bank_balance = transfer_income - transfer_expenses;

        const debtorSummaries = unclearedLedgers
          .map((ledger) => {
            const owed = toNumber(ledger.total_owed) + toNumber(ledger.penalty_accumulated);
            const paid = toNumber(ledger.total_paid);
            const outstanding_amount = Math.max(owed - paid, 0);

            return {
              id: ledger.id,
              full_name: (ledger as any).members?.full_name ?? 'Unnamed Member',
              outstanding_amount,
              status: outstanding_amount >= 10000 ? 'critical' : 'owing',
            } satisfies DebtorSummary;
          })
          .filter((ledger) => ledger.outstanding_amount > 0)
          .sort((left, right) => right.outstanding_amount - left.outstanding_amount);

        const eventRows = visibleEvents.map((event) => {
          const relatedTransactions = scopedTransactions.filter((t) => String(t.event_id) === String(event.id));
          const inc = relatedTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0);
          const exp = relatedTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0);
          const net = inc - exp;

          return {
            id: event.id,
            name: event.name ?? 'Untitled Event',
            income: inc,
            expenses: exp,
            net,
            status: net >= 0 ? 'Profit' : 'Loss',
          };
        });

        if (!isMounted) return;

        setProfile(userProfile);
        setActiveFinancialYearId(activeFinancialYear?.year_label ?? null);
        setTransactions(scopedTransactions.slice(0, 8));
        setTopDebtors(debtorSummaries.slice(0, 5));
        setEventPerformance(eventRows);
        setMetrics({
          total_bank_balance,
          total_cash_at_hand,
          total_income,
          total_expenses,
          outstanding_debts: debtorSummaries.reduce((sum, debtor) => sum + debtor.outstanding_amount, 0),
        });
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load dashboard data.');
      } {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchDashboardData();

    const dashboardChannel = supabase
      .channel('dashboard-live-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => void fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_ledgers' }, () => void fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => void fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_years' }, () => void fetchDashboardData())
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(dashboardChannel);
    };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            {profile?.full_name ? `${profile.full_name} · ` : ''}
            <span className="capitalize">{profile?.role?.replace('_', ' ') ?? 'Loading role'}</span>
            {activeFinancialYearId ? ` · FY ${activeFinancialYearId}` : ''}
          </p>
        </div>
        <Link
          to="/dashboard/transactions?action=record"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Record Transaction
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Bank Balance" amount={metrics.total_bank_balance} icon={Banknote} color="bg-blue-600" isLoading={isLoading} />
        <StatCard title="Cash at Hand" amount={metrics.total_cash_at_hand} icon={Wallet} color="bg-green-600" isLoading={isLoading} />
        <StatCard title="Total Income" amount={metrics.total_income} icon={ArrowUpRight} color="bg-emerald-600" isLoading={isLoading} />
        <StatCard title="Total Expenses" amount={metrics.total_expenses} icon={ArrowDownRight} color="bg-red-600" isLoading={isLoading} />
        <StatCard title="Outstanding Debts" amount={metrics.outstanding_debts} icon={AlertCircle} color="bg-amber-600" isLoading={isLoading} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Debtors */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Top Debtors</h2>
              <p className="mt-0.5 text-sm text-gray-500">Total Outstanding: {formatCurrency(metrics.outstanding_debts)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Loading debtors...</div>
            ) : topDebtors.length ? (
              topDebtors.map((debtor) => (
                <div key={debtor.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{debtor.full_name}</p>
                      <StatusBadge status={debtor.status} />
                    </div>
                  </div>
                  <p className="font-semibold text-red-600">{formatCurrency(debtor.outstanding_amount)}</p>
                </div>
              ))
            ) : (
              <div className="px-6 py-6 text-sm text-gray-500">No uncleared member debts.</div>
            )}
          </div>
        </div>

        {/* Event Performance */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Event Performance</h2>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Loading events...</div>
            ) : eventPerformance.length ? (
              eventPerformance.map((event) => (
                <div key={event.id} className="px-6 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-gray-900">{event.name}</p>
                    <StatusBadge status={event.net >= 0 ? 'Profit' : 'Loss'} />
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
                      <p className={`font-semibold ${event.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {event.net >= 0 ? '+' : ''}
                        {formatCurrency(event.net)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-6 text-sm text-gray-500">No visible events for this role.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="px-6 py-6 text-sm text-gray-500">Loading transactions...</div>
          ) : transactions.length ? (
            transactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const amount = toNumber(transaction.amount);

              return (
                <div key={transaction.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isIncome ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description ?? transaction.category ?? 'Recorded transaction'}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.created_at)} · {transaction.mode_of_payment ?? 'Unknown Mode'}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}
                    {formatCurrency(amount)}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-6 text-sm text-gray-500">No transactions are visible for your account yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}