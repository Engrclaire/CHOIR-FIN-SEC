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
              The Premium FinSec Suite
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-black leading-[1.1] tracking-tight ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              Empowering Choir Leadership with{' '}
              <span className={isDarkMode ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent' : 'text-blue-600'}>
                Financial Clarity
              </span>
            </h1>
            
            <p className={`mt-6 text-base leading-relaxed max-w-xl mx-auto lg:mx-0 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Engineered for absolute efficiency, transparency, and internal accountability. Track baseline channels, isolate dynamic committee budgets, and manage member configurations with confidence.
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
                Launch App Ledger
                <ArrowRight size={16} />
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
              }`}>Immutable Baselines</h3>
              <p className={`text-sm mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Configure closing and opening balances across cash and bank channels. Establish unified launch points for audit-ready transaction logging.
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
              }`}>Member Rosters</h3>
              <p className={`text-sm mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Stage your active profiles manually or configuration seeds via bulk data payloads. Track roles from Soprano to administrative chairs.
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
              }`}>Isolated Event Vaults</h3>
              <p className={`text-sm mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Empower dynamic Committee Leads to independently organize structural event funding vectors without disrupting main register balances.
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
                “This architecture completely transformed our ministry tracking framework, delivering institutional transparency in single audit cycles.”
              </p>
              <div className={`text-[11px] font-bold tracking-wider uppercase pt-1 ${
                isDarkMode ? 'bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent' : 'text-cyan-300'
              }`}>
                — Financial Council & Directorate Board
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
              <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Built Specifically for Ministry Structuring</h3>
              <p className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                An all-in-one framework built exclusively around the unique structural accounting requirements of community and parish choir boards.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>
                  <CheckCircle2 size={16} className="text-indigo-400" />
                  Rapid Onboarding Setup
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Get foundational tracking active within minutes using streamlined account configurations and automated setup wizards.
                </p>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>
                  <ShieldAlert size={16} className={isDarkMode ? 'text-violet-400' : 'text-blue-500'} />
                  Role Protection Rules
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Granular administrative role assignments safeguard database entries. Clear audit environments log internal user operations.
                </p>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>
                  <Users size={16} className="text-indigo-400" />
                  Highly Collaborative
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Seamlessly sync system states between executive directors, financial secretaries, audit partners, and choir committees.
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