import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Home,
  Landmark,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UploadCloud,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import { useToast } from '../../contexts/useToast';
import { useAuth } from '../../contexts/AuthContext';

type Role = 'admin' | 'fin_sec' | 'committee_lead';
type WizardStep = 1 | 2 | 3;

interface AccountDetails {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

interface FinancialBaseline {
  currentBankBalance: string;
  currentCashAtHand: string;
}

interface MemberRecord {
  fullName: string;
  phoneNumber: string;
  email: string;
  choirRole: string;
}

interface StepDefinition {
  id: WizardStep;
  title: string;
  shortTitle: string;
}

interface AccountDetailsFormProps {
  value: AccountDetails;
  onChange: <Key extends keyof AccountDetails>(key: Key, value: AccountDetails[Key]) => void;
}

interface LedgerBaselineFormProps {
  value: FinancialBaseline;
  onChange: <Key extends keyof FinancialBaseline>(key: Key, value: FinancialBaseline[Key]) => void;
}

interface MemberDirectoryFormProps {
  members: MemberRecord[];
  draft: MemberRecord;
  onDraftChange: <Key extends keyof MemberRecord>(key: Key, value: MemberRecord[Key]) => void;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
}

interface StepperProps {
  currentStep: WizardStep;
  steps: StepDefinition[];
}

const steps: StepDefinition[] = [
  { id: 1, title: 'Create Account', shortTitle: 'Account' },
  { id: 2, title: 'Ledger Baseline', shortTitle: 'Baseline' },
  { id: 3, title: 'Upload Roster', shortTitle: 'Roster' },
];

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  fin_sec: 'Financial Secretary',
  committee_lead: 'Committee Lead',
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10';

const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700';

const sanitizeMoneyValue = (value: string) => value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const AccountDetailsForm = ({ value, onChange }: AccountDetailsFormProps) => (
  <div className="space-y-5 animate-fadeIn">
    <div>
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
        <ShieldCheck size={14} />
        Secure administrator profile
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Set up the first authorized profile for the choir finance ledger.
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="fullName">
          Full Name
        </label>
        <div className="relative">
          <UserPlus className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="fullName"
            value={value.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="Jane Doe"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            value={value.email}
            onChange={(event) => onChange('email', event.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type="password"
            value={value.password}
            onChange={(event) => onChange('password', event.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="Create a strong password"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="role">
          Role
        </label>
        <select
          id="role"
          value={value.role}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange('role', event.target.value as Role)}
          className={`${inputClass} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
        >
          {(Object.keys(roleLabels) as Role[]).map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

const LedgerBaselineForm = ({ value, onChange }: LedgerBaselineFormProps) => (
  <div className="space-y-5 animate-fadeIn">
    <div>
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-100">
        <WalletCards size={14} />
        Opening treasury position
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ledger baseline</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter the choir balances currently held in bank and cash channels.
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="bankBalance">
          Current Bank Balance
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₦</span>
          <input
            id="bankBalance"
            inputMode="decimal"
            value={value.currentBankBalance}
            onChange={(event) => onChange('currentBankBalance', sanitizeMoneyValue(event.target.value))}
            className={`${inputClass} pl-9`}
            placeholder="0.00"
          />
          <Landmark className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="cashAtHand">
          Current Cash at Hand
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₦</span>
          <input
            id="cashAtHand"
            inputMode="decimal"
            value={value.currentCashAtHand}
            onChange={(event) => onChange('currentCashAtHand', sanitizeMoneyValue(event.target.value))}
            className={`${inputClass} pl-9`}
            placeholder="0.00"
          />
          <Banknote className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3.5 text-xs font-medium leading-relaxed text-indigo-900">
      💡 Baseline entries become your immutable system launchpad, establishing the opening reference ledger for audit-ready reporting.
    </div>
  </div>
);

const MemberDirectoryForm = ({
  members,
  draft,
  onDraftChange,
  onAddMember,
  onRemoveMember,
}: MemberDirectoryFormProps) => (
  <div className="space-y-5 animate-fadeIn">
    <div>
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
        <UsersRound size={14} />
        Member directory seed
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload roster</h1>
      <p className="mt-1 text-sm text-slate-500">
        Add members manually now, or prepare a bulk roster upload for later.
      </p>
    </div>

    <div className="grid gap-3.5 md:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor="memberName">
          Member Name
        </label>
        <input
          id="memberName"
          value={draft.fullName}
          onChange={(event) => onDraftChange('fullName', event.target.value)}
          className={inputClass}
          placeholder="Member full name"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="memberPhone">
          Phone Number
        </label>
        <input
          id="memberPhone"
          value={draft.phoneNumber}
          onChange={(event) => onDraftChange('phoneNumber', event.target.value)}
          className={inputClass}
          placeholder="080..."
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="memberEmail">
          Email
        </label>
        <input
          id="memberEmail"
          type="email"
          value={draft.email}
          onChange={(event) => onDraftChange('email', event.target.value)}
          className={inputClass}
          placeholder="member@example.com"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="choirRole">
          Choir Role
        </label>
        <input
          id="choirRole"
          value={draft.choirRole}
          onChange={(event) => onDraftChange('choirRole', event.target.value)}
          className={inputClass}
          placeholder="Soprano, Tenor, etc."
        />
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={onAddMember}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
      >
        <UserPlus size={16} />
        Add Member
      </button>
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
      >
        <UploadCloud size={16} />
        Bulk Upload Action
      </button>
    </div>

    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="size-5 text-indigo-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Roster staging</p>
          <p className="text-xs text-slate-500">
            {members.length ? `${members.length} member${members.length === 1 ? '' : 's'} staged for configuration.` : 'No members staged yet.'}
          </p>
        </div>
      </div>
    </div>

    {members.length > 0 && (
      <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {members.map((member, index) => (
          <div key={`${member.fullName}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">{member.fullName}</p>
              <p className="text-xs text-slate-500">
                {member.phoneNumber} {member.choirRole ? `· ${member.choirRole}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveMember(index)}
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Stepper = ({ currentStep, steps: stepItems }: StepperProps) => (
  <div>
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Step {currentStep} of 3</p>
        <h2 className="text-sm font-bold text-slate-400 mt-0.5">{stepItems[currentStep - 1].title}</h2>
      </div>
      <div className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
        {Math.round((currentStep / stepItems.length) * 100)}%
      </div>
    </div>

    <div className="flex items-center gap-2">
      {stepItems.map((step, index) => {
        const isComplete = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/10'
                    : isComplete
                    ? 'bg-indigo-900 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isComplete ? <Check size={14} /> : step.id}
              </div>
              <span className={`hidden text-xs font-bold tracking-tight md:inline ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.shortTitle}
              </span>
            </div>
            {index < stepItems.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${currentStep > step.id ? 'bg-indigo-900' : 'bg-slate-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const PremiumOnboarding = () => {
  const [view, setView] = useState<'signup' | 'login'>('signup');
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetails>({
    fullName: '',
    email: '',
    password: '',
    role: 'fin_sec',
  });
  const [financialBaseline, setFinancialBaseline] = useState<FinancialBaseline>({
    currentBankBalance: '',
    currentCashAtHand: '',
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [memberDraft, setMemberDraft] = useState<MemberRecord>({
    fullName: '',
    phoneNumber: '',
    email: '',
    choirRole: '',
  });
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshProfile } = useAuth();

  const canContinue = useMemo(() => {
    if (currentStep === 1) {
      return (
        accountDetails.fullName.trim().length > 1 &&
        isValidEmail(accountDetails.email) &&
        accountDetails.password.trim().length >= 6 &&
        Boolean(accountDetails.role)
      );
    }

    if (currentStep === 2) {
      return Boolean(financialBaseline.currentBankBalance.trim() && financialBaseline.currentCashAtHand.trim());
    }

    return true;
  }, [accountDetails, currentStep, financialBaseline]);

  const updateAccountDetails = <Key extends keyof AccountDetails>(key: Key, value: AccountDetails[Key]) => {
    setAccountDetails((previous) => ({ ...previous, [key]: value }));
    setErrorMessage(null);
  };

  const updateFinancialBaseline = <Key extends keyof FinancialBaseline>(key: Key, value: FinancialBaseline[Key]) => {
    setFinancialBaseline((previous) => ({ ...previous, [key]: value }));
    setErrorMessage(null);
  };

  const updateMemberDraft = <Key extends keyof MemberRecord>(key: Key, value: MemberRecord[Key]) => {
    setMemberDraft((previous) => ({ ...previous, [key]: value }));
  };

  const handleAddMember = () => {
    if (!memberDraft.fullName.trim() || !memberDraft.phoneNumber.trim()) {
      setErrorMessage('Add at least a member name and phone number before staging.');
      return;
    }

    setMembers((previous) => [...previous, memberDraft]);
    setMemberDraft({ fullName: '', phoneNumber: '', email: '', choirRole: '' });
    setErrorMessage(null);
  };

  const handleRemoveMember = (index: number) => {
    setMembers((previous) => previous.filter((_, memberIndex) => memberIndex !== index));
  };

  const handleBack = () => {
    setCurrentStep((previous) => (previous > 1 ? ((previous - 1) as WizardStep) : previous));
    setErrorMessage(null);
  };

  const handleContinue = () => {
    if (!canContinue) {
      const message =
        currentStep === 1
          ? 'Complete the account details before continuing.'
          : 'Enter both bank and cash opening balances before continuing.';

      setErrorMessage(message);
      showToast(message, 'error');
      return;
    }

    setCurrentStep((previous) => (previous < 3 ? ((previous + 1) as WizardStep) : previous));
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoginSubmitting) return;

    const trimmedEmail = loginEmail.trim();
    const trimmedPassword = loginPassword.trim();
    if (!trimmedEmail || !trimmedPassword) {
      const message = 'Email and password are required.';
      setErrorMessage(message);
      showToast(message, 'error');
      return;
    }

    setIsLoginSubmitting(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) throw error;

      const user = data?.user;
      if (!user) {
        showToast('No user returned. Check email confirmation flow.', 'info');
        return;
      }

      try {
        await refreshProfile(user.id);
      } catch {
        // ignore; profile refresh already surfaces toasts elsewhere
      }

      showToast('Login successful! Redirecting...', 'success');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: accountDetails.email,
        password: accountDetails.password,
      });

      if (error) throw error;
      const userId = data.user?.id;

      if (!userId) {
        showToast('Check your email to confirm your account.', 'info');
        return;
      }

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          full_name: accountDetails.fullName,
          role: accountDetails.role,
        },
        { onConflict: 'id' },
      );

      if (profileError) throw profileError;

      const currentYearString = new Date().getFullYear().toString();
      const { data: yearData, error: yearLookupError } = await supabase
        .from('financial_years')
        .select('id')
        .eq('year_label', currentYearString)
        .maybeSingle();

      if (yearLookupError) throw yearLookupError;

      let activeYearId = yearData?.id;

      if (!activeYearId) {
        const { data: insertedYear, error: yearInsertError } = await supabase
          .from('financial_years')
          .insert({
            year_label: currentYearString,
            is_closed: false,
            start_date: new Date().toISOString().split('T')[0],
          })
          .select('id')
          .single();

        if (yearInsertError) throw yearInsertError;
        activeYearId = insertedYear.id;
      }

      const baselineRows = [
        {
          financial_year_id: activeYearId,
          type: 'income',
          category: 'Baseline Setup',
          description: 'Initial Bank Balance configured at setup.',
          mode_of_payment: 'transfer',
          amount: Number(financialBaseline.currentBankBalance) || 0,
          recorded_by: userId,
        },
        {
          financial_year_id: activeYearId,
          type: 'income',
          category: 'Baseline Setup',
          description: 'Initial Cash at Hand configured at setup.',
          mode_of_payment: 'cash',
          amount: Number(financialBaseline.currentCashAtHand) || 0,
          recorded_by: userId,
        },
      ];

      const { data: existingBaselines, error: baselineLookupError } = await supabase
        .from('transactions')
        .select('id')
        .eq('financial_year_id', activeYearId)
        .eq('category', 'Baseline Setup');

      if (baselineLookupError) throw baselineLookupError;

      if (!existingBaselines?.length) {
        const { error: baselineError } = await supabase.from('transactions').insert(baselineRows);
        if (baselineError) throw baselineError;
      }

      if (members.length) {
        const memberRows = members.map((member) => {
          const parts = (member.fullName || '').trim().split(/\s+/);
          const first_name = parts[0] || '';
          const last_name = parts.slice(1).join(' ') || '';
          return { first_name, last_name, full_name: member.fullName, status: 'active' };
        });

        const { error: memberError } = await supabase.from('members').insert(memberRows);
        if (memberError) throw memberError;
      }

      localStorage.setItem('completedOnboarding', 'true');
      showToast('Setup completed. Welcome to your dashboard.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to finish onboarding.';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-700 via-white to-blue-700 p-4 md:p-6">
      <div className="flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-indigo-950/20">
        
        <aside className="relative hidden w-6/12 flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex border-r border-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-black text-white shadow-md shadow-indigo-500/20">
              CF
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">Choir FinSec</p>
              <p className="text-base font-bold text-slate-100">Ledger v1.0</p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
              <ShieldCheck size={14} className="text-indigo-400" />
              Audit-ready configuration
            </div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-100">
              Automating financial tracking, digitizing debt, and securing core vaults with transparency.
            </h2>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-slate-500">
            <LockKeyhole size={14} className="text-indigo-500" />
            Powered by Supabase Secure Vault Engine.
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col justify-start overflow-hidden bg-white p-4 sm:p-6 md:p-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              {view === 'signup' ? 'Setup' : 'Access'}
            </p>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setView('signup')}
                className={`rounded-full px-3.5 py-1.5 transition-colors ${view === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setView('login')}
                className={`rounded-full px-3.5 py-1.5 transition-colors ${view === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Log in
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-xs font-semibold text-rose-700 animate-shake">
              {errorMessage}
            </div>
          )}

          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div
              key={view}
              className={`flex min-h-0 h-full w-full flex-col overflow-hidden transition-all duration-300 ${view === 'signup' ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-100'}`}
            >
              {view === 'signup' ? (
                <div className="flex min-h-0 flex-1 flex-col justify-start p-4 sm:p-5 md:p-6">
                  <div className="border-b border-slate-100 pb-3">
                    <Stepper currentStep={currentStep} steps={steps} />
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto py-5 pr-1 custom-scrollbar">
                    {currentStep === 1 ? (
                      <AccountDetailsForm value={accountDetails} onChange={updateAccountDetails} />
                    ) : currentStep === 2 ? (
                      <LedgerBaselineForm value={financialBaseline} onChange={updateFinancialBaseline} />
                    ) : (
                      <MemberDirectoryForm
                        members={members}
                        draft={memberDraft}
                        onDraftChange={updateMemberDraft}
                        onAddMember={handleAddMember}
                        onRemoveMember={handleRemoveMember}
                      />
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    {currentStep === 1 ? (
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
                      >
                        <Home size={16} />
                        Landing Page
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
                      >
                        <ChevronLeft size={16} />
                        Back
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={currentStep === 3 ? handleFinish : handleContinue}
                      disabled={!canContinue || isSubmitting}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Finishing
                        </>
                      ) : currentStep === 3 ? (
                        <>
                          Finish Setup
                          <Check size={16} />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col justify-start p-4 sm:p-6 md:p-8">
                  <div className="mx-auto w-full max-w-md pt-2">
                    <div className="mb-8">
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                        <ShieldCheck size={14} />
                        Existing workspace access
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                      <p className="mt-2 text-sm text-slate-600">Sign in to continue into your choir dashboard.</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      <div>
                        <label className={labelClass} htmlFor="loginEmail">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="loginEmail"
                            type="email"
                            value={loginEmail}
                            onChange={(event) => setLoginEmail(event.target.value)}
                            className={`${inputClass} pl-10`}
                            placeholder="you@example.com"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="loginPassword">
                          Password
                        </label>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="loginPassword"
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(event) => setLoginPassword(event.target.value)}
                            className={`${inputClass} pr-11 pl-10`}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((previous) => !previous)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                            className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          Remember me
                        </label>
                        <button type="button" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoginSubmitting}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
                      >
                        {isLoginSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PremiumOnboarding;
