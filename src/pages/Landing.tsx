import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Scale,
  Wallet,
  Banknote,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Smartphone,
  Receipt,
  FolderOpen,
  BarChart3,
  LayoutDashboard,
  Calendar,
  Printer,
  Download,
  Bell,
  Plus,
  UsersRound,
  ClipboardList,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

/* ============================================================
   CHOIR FINSEC — LANDING PAGE (Refined)
   Calm, premium, human-designed. Varied section rhythm.
   Requires: framer-motion, lucide-react, react-router-dom, tailwindcss
   Tailwind v4: add `@custom-variant dark (&:where(.dark, .dark *));` to CSS
   ============================================================ */

/* ---------- THEME HOOK ---------- */
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('cf-theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('cf-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((p) => (p === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}

/* ---------- REVEAL WRAPPER ---------- */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.25, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- THEME TOGGLE ---------- */
function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

/* ============================================================
   REALISTIC APP DASHBOARD MOCKUP
   Modeled after the actual product (sidebar + topbar + widgets)
   ============================================================ */
function AppDashboard() {
  const navItems = [
    { section: 'OVERVIEW', items: [{ icon: LayoutDashboard, label: 'Dashboard', active: false }, { icon: ShieldCheck, label: 'Admin Workspace', active: true }] },
    { section: 'FINANCIAL', items: [{ icon: Receipt, label: 'Transactions', active: false }, { icon: Wallet, label: 'Levies', active: false }, { icon: Banknote, label: 'Contributions', active: false }] },
    { section: 'PEOPLE & EVENTS', items: [{ icon: Users, label: 'Members', active: false }, { icon: Calendar, label: 'Events', active: false }] },
    { section: 'INSIGHTS', items: [{ icon: BarChart3, label: 'Reports', active: false }] },
  ];

  return (
    <div className="rounded-xl border border-gray-200/70 dark:border-white/[0.08] bg-white dark:bg-[#0F1015] overflow-hidden shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-none">
      <div className="flex text-[11px]">
        {/* Sidebar */}
        <div className="hidden sm:flex w-[168px] flex-shrink-0 flex-col border-r border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.015] py-3">
          <div className="flex items-center gap-2 px-4 pb-4">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">L</div>
            <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">Ledgsy</span>
          </div>

          {navItems.map((group, gi) => (
            <div key={gi} className="px-3 mb-3">
              <p className="text-[8.5px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 mb-1">{group.section}</p>
              {group.items.map((item, ii) => (
                <div
                  key={ii}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 ${
                    item.active ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <item.icon size={11} />
                  <span className="text-[10.5px] font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="mt-auto px-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
            {[{ icon: UsersRound, label: 'Users' }, { icon: Settings, label: 'Settings' }, { icon: LogOut, label: 'Log out' }].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 text-gray-400 dark:text-gray-500">
                <item.icon size={11} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-medium mb-1.5">
                <ShieldCheck size={9} /> Admin Workspace
              </div>
              <h3 className="text-[14px] font-bold text-gray-900 dark:text-white leading-none">Admin Dashboard</h3>
              <p className="text-[10px] text-gray-400 mt-1">Oversight of events you created and their assigned staff</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                <Plus size={11} /> Create Event
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-medium">
                <ClipboardList size={11} /> Manage Events
              </div>
              <Bell size={14} className="text-gray-400 hidden sm:block" />
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4">
            {[
              { label: 'Total Bank', value: '₦0', icon: Banknote, bg: 'bg-indigo-600' },
              { label: 'Total Cash', value: '₦0', icon: Wallet, bg: 'bg-emerald-600' },
              { label: 'Total Debts', value: '₦0', icon: TrendingDown, bg: 'bg-amber-500' },
              { label: 'Total Pledges', value: '₦0', icon: FolderOpen, bg: 'bg-violet-600' },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9.5px] text-gray-400 font-medium">{s.label}</span>
                  <div className={`w-5 h-5 rounded-md ${s.bg} flex items-center justify-center`}>
                    <s.icon size={10} className="text-white" />
                  </div>
                </div>
                <p className="text-[13px] font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Middle row: My Events + Staff Oversight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-4 pb-4">
            <div className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">My Events</p>
                  <p className="text-[9px] text-gray-400">Only events you created</p>
                </div>
                <Calendar size={12} className="text-gray-400" />
              </div>
              <div className="rounded-md border border-gray-100 dark:border-white/[0.06] p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-medium text-gray-800 dark:text-gray-200">Harvest 2026</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-medium">Active</span>
                  </div>
                  <span className="text-[8.5px] text-gray-400">5 Aug 2026</span>
                </div>
                <div className="flex gap-4 text-[9.5px]">
                  <div><span className="text-gray-400">Income</span> <span className="text-emerald-600 dark:text-emerald-400 font-medium">₦0</span></div>
                  <div><span className="text-gray-400">Expenses</span> <span className="text-rose-500 font-medium">₦0</span></div>
                  <div><span className="text-gray-400">Staff</span> <span className="text-violet-500 font-medium">0</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">Staff Oversight</p>
                  <p className="text-[9px] text-gray-400">Financial Secretaries & Leads on your events</p>
                </div>
                <Users size={12} className="text-gray-400" />
              </div>
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Users size={18} className="text-gray-300 dark:text-gray-600 mb-1.5" />
                <p className="text-[9.5px] text-gray-400">No staff assigned yet</p>
              </div>
            </div>
          </div>

          {/* Financial overview */}
          <div className="px-4 pb-4">
            <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 mb-2.5">Financial Overview</p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/[0.06] p-2.5">
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Total Income</span>
                <p className="text-[12px] font-bold text-gray-900 dark:text-white mt-1">₦1,845,200</p>
              </div>
              <div className="rounded-lg bg-rose-50 dark:bg-rose-500/[0.06] p-2.5">
                <span className="text-[9px] text-rose-500 font-medium">Total Expenses</span>
                <p className="text-[12px] font-bold text-gray-900 dark:text-white mt-1">₦1,120,500</p>
              </div>
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/[0.06] p-2.5">
                <span className="text-[9px] text-indigo-500 font-medium">Net Result</span>
                <p className="text-[12px] font-bold text-gray-900 dark:text-white mt-1">₦724,700</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- COMPACT ANALYTICS DASHBOARD (for preview section) ---------- */
function AnalyticsDashboard() {
  return (
    <div className="rounded-xl border border-gray-200/70 dark:border-white/[0.08] bg-white dark:bg-[#0F1015] overflow-hidden shadow-[0_2px_24px_-6px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
        <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">Financial Overview — 2026</span>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span>This Year</span><ChevronDown size={11} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4">
        {[
          { label: 'Bank Balance', value: '₦1,245,000', delta: '+12%', icon: Banknote },
          { label: 'Cash Balance', value: '₦340,500', delta: '+5%', icon: Wallet },
          { label: 'Monthly Income', value: '₦312,000', delta: '+8%', icon: TrendingUp },
          { label: 'Outstanding Debts', value: '₦85,200', delta: '7 members', icon: TrendingDown },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <s.icon size={12} className="text-gray-400" />
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-[13px] font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 px-4 pb-4">
        {/* Chart */}
        <div className="sm:col-span-2 rounded-lg border border-gray-100 dark:border-white/[0.06] p-3.5">
          <p className="text-[10.5px] font-medium text-gray-600 dark:text-gray-400 mb-3">Income vs Expenses</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {[55, 70, 45, 80, 60, 90, 65, 72].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                <div className="w-full rounded-sm bg-indigo-500" style={{ height: `${h}%` }} />
                <div className="w-full rounded-sm bg-gray-200 dark:bg-white/10" style={{ height: `${h * 0.4}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-3.5">
          <p className="text-[10.5px] font-medium text-gray-600 dark:text-gray-400 mb-3">Upcoming Events</p>
          <div className="space-y-2.5">
            {[
              { name: 'Harvest', date: 'Aug 22' },
              { name: 'Carol Night', date: 'Dec 18' },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <Calendar size={11} className="text-indigo-400" />
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{e.name}</p>
                  <p className="text-[9px] text-gray-400">{e.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-4 pb-4">
        {/* Recent transactions */}
        <div className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-3.5">
          <p className="text-[10.5px] font-medium text-gray-600 dark:text-gray-400 mb-2.5">Recent Transactions</p>
          <div className="space-y-2">
            {[
              { name: 'Annual Levy — John D.', amt: '+₦5,000', pos: true },
              { name: 'Sound System — Carol', amt: '−₦15,000', pos: false },
              { name: 'Donation — Mrs. Okafor', amt: '+₦20,000', pos: true },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate pr-2">{tx.name}</span>
                <span className={`text-[10px] font-semibold ${tx.pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{tx.amt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Committee summary */}
        <div className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-3.5">
          <p className="text-[10.5px] font-medium text-gray-600 dark:text-gray-400 mb-2.5">Committee Summary</p>
          <div className="space-y-2">
            {[
              { name: 'Harvest Committee', balance: '₦140,000' },
              { name: 'Carol Committee', balance: '₦30,000' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{c.name}</span>
                <span className="text-[10px] font-semibold text-gray-800 dark:text-gray-300">{c.balance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- PDF-STYLE REPORT VIEWER ---------- */
function ReportViewer() {
  return (
    <div className="rounded-xl border border-gray-200/70 dark:border-white/[0.08] bg-white dark:bg-[#0F1015] overflow-hidden shadow-[0_2px_24px_-6px_rgba(0,0,0,0.1)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02]">
        <span className="text-[10.5px] font-medium text-gray-500">Annual_Report_2026.pdf</span>
        <div className="flex items-center gap-3">
          <Printer size={13} className="text-gray-400" />
          <Download size={13} className="text-gray-400" />
        </div>
      </div>

      {/* Document body */}
      <div className="p-6 bg-white dark:bg-[#0F1015]">
        <div className="text-center mb-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <p className="text-[13px] font-bold text-gray-900 dark:text-white">St. Cecilia Choir</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Annual Financial Statement — Year Ended December 2026</p>
        </div>

        <p className="text-[10.5px] font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Financial Summary</p>
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/[0.06] p-2.5">
            <p className="text-[9px] text-gray-500">Total Income</p>
            <p className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">₦1,845,200</p>
          </div>
          <div className="rounded-lg bg-rose-50 dark:bg-rose-500/[0.06] p-2.5">
            <p className="text-[9px] text-gray-500">Total Expenses</p>
            <p className="text-[12px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">₦1,120,500</p>
          </div>
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/[0.06] p-2.5">
            <p className="text-[9px] text-gray-500">Net Balance</p>
            <p className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">₦724,700</p>
          </div>
        </div>

        <p className="text-[10.5px] font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Income Breakdown</p>
        <div className="space-y-2 mb-5">
          {[
            { label: 'Levies', pct: 40, amount: '₦738,080' },
            { label: 'Donations', pct: 25, amount: '₦461,300' },
            { label: 'Events', pct: 20, amount: '₦369,040' },
            { label: 'Pledges', pct: 15, amount: '₦276,780' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] text-gray-500 w-16 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-[9.5px] text-gray-400 w-20 text-right flex-shrink-0">{item.amount}</span>
            </div>
          ))}
        </div>

        <p className="text-[10.5px] font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Expense Breakdown</p>
        <div className="space-y-2">
          {[
            { label: 'Events', pct: 55, amount: '₦616,275' },
            { label: 'Welfare', pct: 25, amount: '₦280,125' },
            { label: 'Admin', pct: 20, amount: '₦224,100' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] text-gray-500 w-16 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-rose-400" style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-[9.5px] text-gray-400 w-20 text-right flex-shrink-0">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const Landing: React.FC = () => {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ];

  const features = [
    { icon: TrendingUp, title: 'Record Income', desc: 'Log collections, donations, levies and pledges with full or part-payment tracking.' },
    { icon: TrendingDown, title: 'Manage Expenses', desc: 'Record expenses, tag them to events, and keep budgets under control in real time.' },
    { icon: Users, title: 'Member Accounts', desc: 'See who has paid, who owes, and their full penalty and payment history at a glance.' },
    { icon: FolderOpen, title: 'Committee Finance', desc: 'Give each committee its own sub-account, then settle balances to the main account.' },
    { icon: Scale, title: 'Reconciliation', desc: 'Compare system balances with actual cash and bank. Spot differences instantly.' },
    { icon: FileText, title: 'Reports', desc: 'Generate monthly and annual financial statements in minutes, ready for meetings.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0F] text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">

      {/* ====== NAV ====== */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-white/85 dark:bg-[#0B0B0F]/85 backdrop-blur-md border-b border-gray-200/70 dark:border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">CF</div>
            <span className="text-sm font-semibold tracking-tight">Choir FinSec</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Login
            </Link>
            <ThemeToggle theme={theme} toggle={toggle} />
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle theme={theme} toggle={toggle} />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 text-gray-500 dark:text-gray-400">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0B0F] px-6 py-4 space-y-3">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-500 dark:text-gray-400">
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-500 dark:text-gray-400">Login</Link>
            <Link to="/onboarding" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white">
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* ====== HERO — text left, screenshot right ====== */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-16 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[2.6rem] leading-[1.15] font-bold tracking-tight text-gray-900 dark:text-white"
            >
              Financial management built for Catholic choirs.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="mt-6 text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-sm"
            >
              Record collections, manage levies, track expenses, reconcile accounts and generate annual reports from one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
              >
                Get Started
                <ArrowRight size={15} />
              </Link>
              <Link to="#contact" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200">
                Book a Demo
              </Link>
            </motion.div>
          </div>

          {/* Realistic screenshot, no laptop frame — just a clean elevated card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
          >
            <AppDashboard />
          </motion.div>
        </div>
      </section>

      {/* ====== TRUST — full width centered ====== */}
      <section className="py-14 border-y border-gray-200/70 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400 mb-6">
              Built for Choir Financial Secretaries
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                { icon: Smartphone, label: 'Mobile Friendly' },
                { icon: Lock, label: 'Secure Records' },
                { icon: FileText, label: 'Annual Reports' },
                { icon: Scale, label: 'Easy Reconciliation' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <item.icon size={14} className="text-gray-400" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====== WHY — split layout, left-aligned ====== */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-gray-900 dark:text-white">
                Choir finances deserve better tools.
              </h2>
              <p className="mt-5 text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-sm">
                Many choirs still record collections manually in notebooks before transferring everything into Excel. It's slow, repetitive, and hard to audit when the year ends.
              </p>
              <p className="mt-4 text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-sm">
                Choir FinSec simplifies the entire workflow — from the collection plate to the annual report.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal delay={0.08}>
              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-white/[0.06] rounded-xl border border-gray-100 dark:border-white/[0.06]">
                <div className="p-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Before</span>
                  <ul className="mt-4 space-y-3">
                    {['Paper records', 'Excel duplication', 'Missing entries', 'Hard to audit'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">With FinSec</span>
                  <ul className="mt-4 space-y-3">
                    {['Record once', 'Auto-calculated', 'Live balances', 'Full audit trail'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle2 size={14} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====== FEATURES — staggered two-column ====== */}
      <section id="features" className="py-24 px-6 border-t border-gray-200/70 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-md mb-14">
            <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-gray-900 dark:text-white">
              Everything you need, nothing you don't.
            </h2>
            <p className="mt-4 text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Designed around the real, everyday workflow of choir financial management.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
            {features.map((f, i) => (
              <Reveal key={i} delay={(i % 2) * 0.06} className={i % 2 === 1 ? 'md:mt-8' : ''}>
                <div className="group flex gap-4 py-1">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10">
                    <f.icon size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== DASHBOARD PREVIEW — large screenshot, small text column ====== */}
      <section className="py-24 px-6 border-t border-gray-200/70 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-md mb-10">
            <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-gray-900 dark:text-white">
              See exactly where you stand.
            </h2>
            <p className="mt-4 text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              One dashboard for bank balance, cash on hand, income, expenses, debts and committee balances.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,220px)] gap-8 items-start">
            <Reveal>
              <AnalyticsDashboard />
            </Reveal>

            <Reveal delay={0.08} className="lg:pt-6">
              <ul className="space-y-4">
                {[
                  'Bank & cash balances',
                  'Monthly income and expenses',
                  'Outstanding member debts',
                  'Income vs expense trend',
                  'Committee balances',
                  'Upcoming events',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={15} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS — minimal timeline ====== */}
      <section id="how-it-works" className="py-24 px-6 border-t border-gray-200/70 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center max-w-md mx-auto mb-16">
            <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-gray-900 dark:text-white">
              How it works
            </h2>
            <p className="mt-3 text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7]">
              Set up in minutes. No training required.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {[
              { step: '01', title: 'Create your choir account', desc: 'Admin sets up the account and creates logins for the financial secretary and committee leads.' },
              { step: '02', title: 'Record financial activities', desc: 'Log income, expenses, levies and pledges in real time — from a phone, anywhere.' },
              { step: '03', title: 'Generate reports anytime', desc: 'View dashboards, export reports, reconcile balances, and close the year with confidence.' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div>
                  <span className="text-xs font-semibold text-indigo-400 dark:text-indigo-500">{s.step}</span>
                  <h3 className="mt-3 text-[15px] font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== REPORTS — screenshot left, text right ====== */}
      <section className="py-24 px-6 border-t border-gray-200/70 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <ReportViewer />
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-gray-900 dark:text-white">
                Reports in minutes, not weeks.
              </h2>
              <p className="mt-5 text-[15px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-sm">
                Generate clean financial statements for committee meetings, annual reviews, or parish presentations — export to PDF or Excel with one click.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'Monthly income and expense summaries',
                  'Annual statements with year-over-year comparison',
                  'Committee-level financial breakdowns',
                  'Debt and levy reports per member',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={15} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA — centered in soft panel ====== */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-500/[0.06] px-8 py-16 sm:py-20 text-center">
              <h2 className="text-[1.9rem] sm:text-[2.2rem] leading-tight font-bold tracking-tight text-gray-900 dark:text-white max-w-lg mx-auto">
                Spend less time balancing books. Focus on your choir.
              </h2>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                >
                  Get Started
                  <ArrowRight size={15} />
                </Link>
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 transition-colors duration-200">
                  Contact Us
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====== FOOTER — expanded ====== */}
      <footer className="border-t border-gray-200/70 dark:border-white/[0.06] py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">CF</div>
                <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Choir FinSec</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[220px]">
                Financial management built for Catholic choirs.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Product</p>
              <ul className="space-y-2.5">
                {['Features', 'Documentation'].map((l, i) => (
                  <li key={i}><Link to="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Company</p>
              <ul className="space-y-2.5">
                {['Support', 'Contact'].map((l, i) => (
                  <li key={i}><Link to="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Legal</p>
              <ul className="space-y-2.5">
                {['Privacy', 'Terms'].map((l, i) => (
                  <li key={i}><Link to="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-400">© 2026 Choir FinSec. Built for transparent ministry management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
