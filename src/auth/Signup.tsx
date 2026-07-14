import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { useToast } from '../contexts/useToast';

type Role = 'admin' | 'fin_sec' | 'committee_lead';

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

const Signup: React.FC = () => {
  const [form, setForm] = useState<SignupForm>({ fullName: '', email: '', password: '', role: 'fin_sec' });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (k: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      const userId = data?.user?.id;

      if (!userId) {
        showToast('Check your email to confirm your account.', 'info');
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          full_name: form.fullName,
          role: form.role,
        },
        { onConflict: 'id' },
      );

      if (insertError) {
        console.error('profiles insert error', insertError);
        showToast(insertError.message || 'Failed to create profile', 'error');
        setIsLoading(false);
        return;
      }

      showToast('Account created. Redirecting to onboarding...', 'success');
      navigate('/onboarding');
    } catch (err: any) {
      console.error('Signup error', err);
      showToast(err?.message || 'Signup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900">Create an account</h1>
          <p className="mt-2 text-slate-500">Register to manage choir finances securely</p>
        </header>

        <div className="mx-auto max-w-md bg-white rounded-3xl shadow-lg p-6 border border-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">Full name</label>
              <input
                value={form.fullName}
                onChange={handleChange('fullName')}
                required
                className="w-full bg-gray-100 border rounded-xl px-3 py-2 text-black placeholder-zinc-500 focus:outline-none focus:border-blue-600"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                required
                className="w-full bg-gray-100 border rounded-xl px-3 py-2 text-black placeholder-zinc-500 focus:outline-none focus:border-blue-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                required
                className="w-full bg-gray-100 border rounded-xl px-3 py-2 text-black placeholder-zinc-500 focus:outline-none focus:border-blue-600"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">Role</label>
              <select
                value={form.role}
                onChange={handleChange('role') as any}
                className="w-full bg-gray-100 border rounded-xl px-3 py-2 text-black focus:outline-none focus:border-blue-600"
              >
                <option value="admin">Admin</option>
                <option value="fin_sec">Financial Secretary</option>
                <option value="committee_lead">Committee Lead</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-white font-semibold shadow-sm hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="text-center mt-6 text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/" className="text-indigo-600 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
