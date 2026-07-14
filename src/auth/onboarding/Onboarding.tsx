import { useCallback, useState } from 'react';
import { ChevronLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import OrganizationForm from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import { supabase } from '../../config/supabaseClient';
import { useToast } from '../../contexts/useToast';
import { useAuth } from '../../contexts/AuthContext';

interface AccountDetails {
  churchName: string; 
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'fin_sec' | 'committee_lead';
}

interface FinancialData {
  currentBankBalance: string;
  currentCashAtHand: string;
}

interface Member {
  fullName: string;
  phoneNumber: string; 
  email: string;
  choirRole: string;
}

interface Step2Payload {
  financial: FinancialData;
  members: Member[];
}

interface Step3Payload {
  levies: Array<{ name: string; amount: string; frequency: string; isCompulsory: boolean }>;
  events: Array<{ name: string; committee: string; startDate: string; endDate: string }>;
  teamMembers: Array<{ fullName: string; email: string; role: string }>;
}

interface SubmissionLog {
  step: string;
  message: string;
  status: 'success' | 'error';
}

const Onboarding = () => {
  // Navigation View Toggle: 'onboarding' | 'login'
  const [view, setView] = useState<'onboarding' | 'login'>('onboarding');
  
  // Onboarding Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [orgData, setOrgData] = useState<AccountDetails | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Payload | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Payload | null>(null);
  
  // Shared Request Action Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionLogs, setSubmissionLogs] = useState<SubmissionLog[]>([]);
  
  // Isolated Login Workstation Block States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const pushLog = (step: string, message: string, status: SubmissionLog['status'] = 'success') => {
    setSubmissionLogs((prev) => [...prev, { step, message, status }]);
  };

  const isOrgDataValid = Boolean(
    orgData?.churchName?.trim() && orgData?.fullName?.trim() && orgData?.email?.trim() && orgData?.password?.trim() && orgData?.role
  );

  const isStep2DataValid = Boolean(
    step2Data?.financial?.currentBankBalance && step2Data?.financial?.currentCashAtHand
  );

  const handleNext = () => {
    if (currentStep === 1 && !isOrgDataValid) {
      const message = 'Please complete your account details before continuing.';
      setSubmissionError(message);
      toast.showToast(message, 'error');
      return;
    }

    if (currentStep === 2 && !isStep2DataValid) {
      const message = 'Please enter your current bank and cash balances before continuing.';
      setSubmissionError(message);
      toast.showToast(message, 'error');
      return;
    }

    setSubmissionError(null);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStep2Change = useCallback((data: Step2Payload) => {
    setStep2Data({ financial: data.financial, members: data.members });
  }, []);

  const handleStep3Change = useCallback((data: Step3Payload) => {
    setStep3Data(data);
  }, []);

  // Dedicated Alternative Authentication Handling Route
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = loginEmail.trim();
    const trimmedPassword = loginPassword.trim();
    if (!trimmedEmail || !trimmedPassword) {
      const message = 'Email and password are required.';
      setSubmissionError(message);
      toast.showToast(message, 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: trimmedEmail, 
        password: trimmedPassword 
      });
      if (error) throw error;

      const user = data?.user;
      if (!user) {
        toast.showToast('No user returned. Check email confirmation flow.', 'info');
        setIsSubmitting(false);
        return;
      }

      try {
        await refreshProfile(user.id);
      } catch (e) {
        // ignore — refreshProfile already handles toasts
      }

      toast.showToast('Login successful! Redirecting...', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      setSubmissionError(err.message || 'Login failed');
      toast.showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizardState = () => {
    setCurrentStep(1);
    setOrgData(null);
    setStep2Data(null);
    setStep3Data(null);
    setSubmissionError(null);
    setSubmissionLogs([]);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('completedOnboarding', 'true');
      } catch {
        // no-op
      }
    }
  };

  const handleCompleteSetup = async () => {
    if (isSubmitting) return;

    if (!orgData) {
      const message = 'Please complete your account details before finishing setup.';
      setSubmissionError(message);
      toast.showToast(message, 'error');
      return;
    }

    if (!step2Data?.financial) {
      const message = 'Please enter your opening balances before finishing setup.';
      setSubmissionError(message);
      toast.showToast(message, 'error');
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);
    setSubmissionLogs([]);

    try {
      const { email, password, fullName, role } = orgData;
      const bankBalance = Number(step2Data.financial.currentBankBalance.replace(/,/g, '')) || 0;
      const cashBalance = Number(step2Data.financial.currentCashAtHand.replace(/,/g, '')) || 0;

      pushLog('Auth Sign-Up', 'Creating your administrative credential credentials...');
      const { data: signData, error: signError } = await supabase.auth.signUp({ email, password });
      if (signError) throw new Error(signError.message || 'Account creation failed.');

      const user = signData?.user;
      if (!user?.id) throw new Error('Supabase did not return a valid user UUID.');

      pushLog('Auth Sign-Up', 'Account created successfully.', 'success');
      pushLog('Profile Initialization', 'Saving account privileges inside system ledger...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, full_name: fullName, role }]);
      if (profileError) throw new Error(profileError.message || 'Unable to save profile role definitions.');

      pushLog('Financial Year Setup', 'Opening financial year context tracking...');
      const currentYearString = new Date().getFullYear().toString();
      
      const { data: yearData, error: yearError } = await supabase
        .from('financial_years')
        .insert([{
          year_label: currentYearString,
          is_closed: false,
          start_date: new Date().toISOString().split('T')[0]
        }])
        .select('id')
        .single();

      if (yearError) throw new Error(yearError.message || 'Unable to provision baseline tracking year.');
      const activeYearId = yearData.id;

      pushLog('Financial Baselines', 'Injecting structural opening balances into transactions log...');
      const baselineRows = [
        {
          financial_year_id: activeYearId,
          type: 'income',
          category: 'Baseline Setup',
          description: 'Initial Bank Balance configured at onboarding setup.',
          mode_of_payment: 'transfer',
          amount: bankBalance,
          recorded_by: user.id,
        },
        {
          financial_year_id: activeYearId,
          type: 'income',
          category: 'Baseline Setup',
          description: 'Initial Cash at Hand configured at onboarding setup.',
          mode_of_payment: 'cash',
          amount: cashBalance,
          recorded_by: user.id,
        },
      ];

      const { error: baselineError } = await supabase.from('transactions').insert(baselineRows);
      if (baselineError) throw new Error(baselineError.message || 'Unable to save system opening entries.');

      if (step2Data.members?.length) {
        pushLog('Member Directory Seed', `Bulk-seeding ${step2Data.members.length} initial singers into registry...`);
        const memberRows = step2Data.members.map((member) => {
          const parts = (member.fullName || '').trim().split(/\s+/);
          const first_name = parts[0] || '';
          const last_name = parts.slice(1).join(' ') || '';
          return { first_name, last_name, full_name: member.fullName, status: 'active' };
        });

        const { error: memberError } = await supabase.from('members').insert(memberRows);
        if (memberError) throw new Error(memberError.message || 'Unable to compile active member roster.');
      }

      if (step3Data?.levies?.length) {
        pushLog('Optional Setup', 'Configuring custom church levy templates...');
        const levyRows = step3Data.levies.map((levy) => ({
          title: levy.name,
          amount: Number(levy.amount) || 0,
          type: levy.frequency === 'one-time' ? 'one-time' : 'recurring_yearly',
          is_compulsory: levy.isCompulsory,
          year_id: activeYearId
        }));

        const { error: levyError } = await supabase.from('levies').insert(levyRows);
        if (levyError) throw new Error(levyError.message || 'Unable to process customized templates.');
      }

      if (step3Data?.events?.length) {
        pushLog('Optional Setup', 'Logging future scheduled calendar events...');
        const eventRows = step3Data.events.map((event) => ({
          name: event.name,
          financial_year_id: activeYearId,
          is_committee_run: Boolean(event.committee),
          committee_balance: 0.00,
          is_settled: false
        }));

        const { error: eventError } = await supabase.from('events').insert(eventRows);
        if (eventError) throw new Error(eventError.message || 'Unable to register active calendar projections.');
      }

      resetWizardState();
      toast.showToast('Setup completed successfully. Welcome to your ledger workstation.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected backend pipeline error occurred.';
      setSubmissionError(message);
      pushLog('Setup Failed', message, 'error');
      toast.showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="min-h-screen flex flex-col bg-zinc-50">
        
        {/* Step Indicator Header Layout */}
        {view === 'onboarding' && (
          <div className="fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 px-6 py-6 z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-zinc-900">Step {currentStep} of {totalSteps}</h2>
                <span className="text-sm font-medium text-zinc-600">{Math.round(progressPercentage)}%</span>
              </div>

              <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-zinc-900 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Workstation Layout */}
        <div className={`${view === 'onboarding' ? 'mt-28' : 'mt-12'} ${currentStep === totalSteps && view === 'onboarding' ? 'mb-6' : 'mb-32'} overflow-y-auto scrollbar-hide flex-1 flex items-center justify-center p-4 md:p-6`}>
          <div className="w-full max-w-2xl">
            {/* Status Feedback Messages */}
            {(submissionError || (view === 'onboarding' && submissionLogs.length > 0)) && (
              <div className="mb-4 space-y-3">
                {submissionError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submissionError}
                  </div>
                )}
                {view === 'onboarding' && submissionLogs.length > 0 && (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    <p className="mb-2 font-semibold text-zinc-900">Setup activity log</p>
                    <ul className="space-y-1">
                      {submissionLogs.map((log, index) => (
                        <li key={`${log.step}-${index}`} className="flex items-start gap-2">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${log.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span>
                            <span className="font-medium">{log.step}:</span> {log.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-lg p-5 md:p-12 border border-zinc-200/60">
              {view === 'onboarding' ? (
                <>
                  {currentStep === 1 && (
                    <OrganizationForm 
                      onChange={setOrgData} 
                      onSignInClick={() => setView('login')} 
                    />
                  )}
                  {currentStep === 2 && (
                    <Step2 onDataChange={handleStep2Change} onSubmit={handleStep2Change} />
                  )}
                  {currentStep === 3 && <Step3 onSubmit={handleStep3Change} />}
                  {currentStep === 4 && (
                    <Step4
                      onboarData={{ members: step2Data?.members?.length ?? 0, levies: step3Data?.levies?.length ?? 0, events: step3Data?.events?.length ?? 0 }}
                      isSubmitting={isSubmitting}
                      onComplete={handleCompleteSetup}
                    />
                  )}
                </>
              ) : (
                /* Login Block view */
                <div className="w-full max-w-md mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome Back</h2>
                    <p className="text-sm text-zinc-600 mt-2">Sign in to your authorized user dashboard</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-900 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-900 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your security keys"
                          required
                          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 pr-12 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 accent-zinc-900 bg-zinc-100 border-zinc-300 rounded focus:ring-zinc-900"
                        />
                        Remember me
                      </label>
                      <Link to="#" className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors cursor-pointer">
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-white font-bold shadow-md hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? 'Signing in...' : <>Sign In <LogIn size={16} /></>}
                    </button>
                  </form>

                  <div className="text-center mt-8 pt-4 border-t border-zinc-100 text-zinc-500 text-sm">
                    Don't have an organization setup?{' '}
                    <button 
                      type="button"
                      onClick={() => setView('onboarding')} 
                      className="text-zinc-900 font-bold hover:underline cursor-pointer"
                    >
                      Create Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Control Bar Layout */}
        {view === 'onboarding' && currentStep !== totalSteps && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-6 z-10">
            <div className="max-w-4xl mx-auto flex gap-4 justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex cursor-pointer items-center gap-2 px-6 py-3 border border-zinc-300 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === totalSteps}
                className="px-8 py-3 cursor-pointer bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Onboarding;