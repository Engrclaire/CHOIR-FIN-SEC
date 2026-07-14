import { useState, type ChangeEvent, type FC } from 'react';

interface AccountDetails {
  churchName: string;
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'fin_sec' | 'committee_lead';
}

interface OrganizationFormProps {
  onChange?: (data: AccountDetails | null) => void;
  onSignInClick?: () => void; // Added view-switch interaction hook
}

const OrganizationForm: FC<OrganizationFormProps> = ({ onChange, onSignInClick }) => {
  const [formData, setFormData] = useState({
    churchName: '', 
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '', 
    role: 'fin_sec' as 'admin' | 'fin_sec' | 'committee_lead',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const validateInputs = (data: typeof formData) => {
    let localErrors = { password: '', confirmPassword: '' };
    let isValid = true;

    if (data.password && data.password.length < 8) {
      localErrors.password = 'Password must be at least 8 characters.';
      isValid = false;
    }

    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      localErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    const structuralChecksPass = 
      data.churchName.trim() !== '' &&
      data.fullName.trim() !== '' && 
      data.email.trim() !== '' && 
      data.password.trim() !== '' && 
      data.confirmPassword.trim() !== '' && 
      localErrors.password === '' && 
      localErrors.confirmPassword === '';

    setErrors(localErrors);
    return isValid && structuralChecksPass;
  };

  const dispatchParentUpdate = (nextData: typeof formData) => {
    const currentValid = validateInputs(nextData);

    if (onChange) {
      if (currentValid) {
        onChange({
          churchName: nextData.churchName,
          fullName: nextData.fullName,
          email: nextData.email,
          password: nextData.password,
          role: nextData.role,
        });
      } else {
        onChange(null);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextData = { ...prev, [name]: value };
      dispatchParentUpdate(nextData);
      return nextData;
    });
  };

  const handleRoleSelect = (selectedRole: 'admin' | 'fin_sec' | 'committee_lead') => {
    setFormData(prev => {
      const nextData = { ...prev, role: selectedRole };
      dispatchParentUpdate(nextData);
      return nextData;
    });
  };

  const rolesConfig = [
    { id: 'admin' as const, title: 'Admin', desc: 'Full global visibility & keys' },
    { id: 'fin_sec' as const, title: 'Financial Sec.', desc: 'Manage ledger registers & dues' },
    { id: 'committee_lead' as const, title: 'Committee Lead', desc: 'Isolate standalone budgets' },
  ];

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900">Account Details</h2>
        <p className="text-sm md:text-md text-zinc-600 mt-2">Create your admin account for Choir FinSec</p>
      </div>

      {/* CHURCH NAME FIELD */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">Church / Organization Name</label>
        <input
          name="churchName"
          type="text"
          value={formData.churchName}
          onChange={handleInputChange}
          placeholder="e.g. Grace Sanctuary Choir"
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
        />
      </div>

      {/* FULL NAME FIELD */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">Full name</label>
        <input
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Jane Doe"
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
        />
      </div>

      {/* EMAIL FIELD */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
        />
      </div>

      {/* PASSWORD FIELD */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">Password</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Create a password"
          required
          className={`w-full bg-zinc-100 border ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900'} rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors`}
        />
        {errors.password && <p className="text-xs text-red-500 mt-2 ml-1">{errors.password}</p>}
      </div>

      {/* CONFIRM PASSWORD FIELD */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Repeat your password"
          required
          className={`w-full bg-zinc-100 border ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900'} rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors`}
        />
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-2 ml-1">{errors.confirmPassword}</p>}
      </div>

      {/* ROLE FIELD */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-3">Select System Role</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rolesConfig.map((roleItem) => {
            const isSelected = formData.role === roleItem.id;
            return (
              <button
                key={roleItem.id}
                type="button"
                onClick={() => handleRoleSelect(roleItem.id)}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm tracking-tight">{roleItem.title}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'border-white bg-white' : 'border-zinc-300 bg-white'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                  </div>
                </div>
                <p className={`text-xs mt-2 font-medium leading-normal ${
                  isSelected ? 'text-zinc-300' : 'text-zinc-500'
                }`}>
                  {roleItem.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTION BLOCK FOR REDIRECT TOGGLE */}
      {onSignInClick && (
        <div className="text-center pt-5 mt-4 border-t border-zinc-100 text-zinc-500 text-sm">
          Already have an administrative workspace account?{' '}
          <button 
            type="button"
            onClick={onSignInClick} 
            className="text-zinc-900 font-bold hover:underline cursor-pointer transition-colors"
          >
            Sign In
          </button>
        </div>
      )}
    </form>
  );
};

export default OrganizationForm;