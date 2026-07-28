import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Users, 
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import image from '../assets/image.png';

const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 selection:bg-indigo-500/30 selection:text-indigo-200 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      
      {/* BACKGROUND GRAPHIC EFFECTS */}
      {isDarkMode ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-75" />
      )}

      {/* HEADER SECTION */}
      <header className={`w-full sticky top-0 z-50 transition-colors backdrop-blur-md border-b ${
        isDarkMode 
          ? 'bg-slate-950/70 border-slate-900 text-white' 
          : 'bg-[#0B0F19] border-slate-800 text-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg ${
              isDarkMode ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20' : 'bg-blue-600 shadow-blue-500/20'
            }`}>
              CF
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-slate-200 uppercase leading-none">Choir FinSec</span>
              <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${
                isDarkMode ? 'bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent' : 'text-blue-400'
              }`}>Ledger v1.0</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            <Link to="#" className="text-slate-300 hover:text-white transition-colors">Product</Link>
            <Link to="#" className="text-slate-300 hover:text-white transition-colors">Features</Link>
            <Link to="#" className="text-slate-300 hover:text-white transition-colors">Security</Link>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              to="/onboarding"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-lg font-bold transition-all duration-200 active:scale-[0.98] ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20' 
                  : 'bg-[rgb(35,186,245)] hover:bg-[rgb(139,178,230)] text-slate-950 shadow-cyan-500/10'
              }`}
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </nav>

          {/* Mobile Actions Container */}
          <div className="flex md:hidden items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-300"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 w-full border-b px-6 py-6 space-y-4 flex flex-col shadow-xl backdrop-blur-lg animate-fadeIn ${
            isDarkMode ? 'bg-slate-950/95 border-slate-900' : 'bg-[#0B0F19]/95 border-slate-800'
          }`}>
            <Link to="#" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Product</Link>
            <Link to="#" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link to="#" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Security</Link>
            <Link
              to="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-center py-3 rounded-xl font-bold shadow-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/10' 
                  : 'bg-[rgb(35,175,245)] text-slate-950'
              }`}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left">
            <div className={`mx-auto lg:mx-0 mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
              isDarkMode 
                ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <Sparkles size={12} className={isDarkMode ? 'text-violet-400' : 'text-blue-500'} />
              Built for Choir Financial Teams
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-black leading-[1.1] tracking-tight ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              Track Every Naira in Your{' '}
              <span className={isDarkMode ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent' : 'text-blue-600'}>
                Choir's Treasury
              </span>
            </h1>
            
            <p className={`mt-6 text-base leading-relaxed max-w-xl mx-auto lg:mx-0 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              From weekly levies and event contributions to penalties and committee budgets — manage your choir's finances with clarity. See who has paid, who owes, and where every kobo goes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/onboarding"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all duration-200 active:scale-[0.98] ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20' 
                    : 'bg-[#114ada] hover:bg-blue-700 text-white shadow-blue-600/20'
                }`}
              >
                Start Managing Finances
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-200 border ${
                  isDarkMode 
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800/50' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* HERO IMAGE CONTAINER */}
          <div className="lg:col-span-7 w-full relative">
            {isDarkMode && (
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 opacity-25 blur-xl pointer-events-none" />
            )}
            <img
              src={image}
              alt="Choir FinSec Dashboard Preview"
              className={`relative w-full h-auto rounded-xl shadow-2xl object-cover transition-transform duration-500 hover:scale-[1.005] border ${
                isDarkMode ? 'border-slate-800/80 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
            />
          </div>
        </section>

        {/* FEATURE CORE MODULES HIGHLIGHTS */}
        <section className={`max-w-7xl mx-auto px-6 py-12 border-t ${isDarkMode ? 'border-slate-900' : 'border-slate-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature Card 1 */}
            <div className={`border rounded-2xl p-8 transition-all duration-300 group ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900/40' 
                : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 text-xl font-bold transition-all duration-300 shadow-sm ${
                isDarkMode 
                  ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white' 
                  : 'bg-teal-50 text-teal-500'
              }`}>
                {isDarkMode ? <TrendingUp size={20} /> : '🧮'}
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-slate-100 group-hover:text-indigo-300' : 'text-slate-950'
              }`}>Levy & Contribution Tracking</h3>
              <p className={`text-sm mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Record levies, donations, and event contributions in real time. See who has paid, who is owing, and generate reports at a glance.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className={`border rounded-2xl p-8 transition-all duration-300 group ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900/40' 
                : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 text-xl font-bold transition-all duration-300 shadow-sm ${
                isDarkMode 
                  ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white' 
                  : 'bg-cyan-50 text-cyan-500'
              }`}>
                {isDarkMode ? <Users size={20} /> : '📋'}
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-slate-100 group-hover:text-indigo-300' : 'text-slate-950'
              }`}>Member Debt Management</h3>
              <p className={`text-sm mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Track outstanding debts per member, apply penalties, send reminders, and mark debts as cleared — all from one member profile.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className={`border rounded-2xl p-8 transition-all duration-300 group ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900/40' 
                : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 text-xl font-bold transition-all duration-300 shadow-sm ${
                isDarkMode 
                  ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white' 
                  : 'bg-blue-50 text-blue-500'
              }`}>
                {isDarkMode ? <Layers size={20} /> : '📅'}
              </div>
              <h3 className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-slate-100 group-hover:text-indigo-300' : 'text-slate-950'
              }`}>Event Budget Management</h3>
              <p className={`text-sm mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create events, assign committee leads, track income vs expenses per event, and settle events with a single click when budgets are complete.
              </p>
            </div>

          </div>
        </section>

        {/* TRUST BANNER BLOCK */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className={`relative overflow-hidden rounded-2xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8 border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-900' 
              : 'bg-[#0B3A60] border-transparent text-white'
          }`}>
            {isDarkMode && (
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            )}
            
            <div className={`w-16 h-16 rounded-xl flex-shrink-0 border flex items-center justify-center shadow-inner text-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20 text-violet-400' 
                : 'bg-slate-800 border-white/20 text-white'
            }`}>
              {isDarkMode ? <Activity size={28} /> : '🎶'}
            </div>
            
            <div className="flex-1 space-y-2 text-center md:text-left relative z-10">
              {isDarkMode ? null : <span className="text-4xl text-cyan-300 font-serif leading-none block">“</span>}
              <p className={`text-base md:text-lg font-medium leading-relaxed italic ${isDarkMode ? 'text-slate-200' : 'text-slate-100'}`}>
                "Before this tool, we were writing everything in notebooks. Now every member can see their balance, every event is accounted for, and settlement takes minutes, not hours."
              </p>
              <div className={`text-[11px] font-bold tracking-wider uppercase pt-1 ${
                isDarkMode ? 'bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent' : 'text-cyan-300'
              }`}>
                — Choir Financial Secretary
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM UTILITY ATTRIBUTES */}
        <section className={`border-t py-20 ${
          isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Built for Your Choir's Financial Needs</h3>
              <p className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Everything a choir financial team needs — from tracking weekly collections to managing multi-committee event budgets and penalty records.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>
                  <CheckCircle2 size={16} className="text-indigo-400" />
                  Quick Setup
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Create your choir's account, add members, and start recording transactions in under 5 minutes. No training required.
                </p>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>
                  <ShieldAlert size={16} className={isDarkMode ? 'text-violet-400' : 'text-blue-500'} />
                  Role-Based Access
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Admins see everything. Financial secretaries manage transactions. Committee leads only see their events. Everyone stays accountable.
                </p>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>
                  <Users size={16} className="text-indigo-400" />
                  Live Dashboard
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  See real-time balances, top debtors, event performance, and recent transactions — all on one dashboard when you log in.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER SECTION */}
      <footer className={`py-10 border-t relative z-10 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-500 border-slate-900' : 'bg-[#0B0F19] text-slate-400 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-medium">
          <div>&copy; 2026 Choir FinSec. Built for transparent ministry management.</div>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;