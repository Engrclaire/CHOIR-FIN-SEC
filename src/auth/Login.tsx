import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useToast } from '../contexts/useToast';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  // Cleaned up syntax: Turned the handler itself into a direct async function
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      showToast('Email and password are required.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password: trimmedPassword });
      if (error) throw error;

      const user = data?.user;
      if (!user) {
        showToast('No user returned. Check email confirmation flow.', 'info');
        setIsLoading(false);
        return;
      }

      // 2. Refresh permissions context to bind admin or committee privileges
      try {
        await refreshProfile(user.id);
      } catch (profileError) {
        // Safe fallback — refreshProfile internally handles UI toast errors
        console.warn('Profile hydration skipped:', profileError);
      }

      // 3. Clear states and redirect safely to internal layout path
      showToast('Login successful! Redirecting...', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 sm:p-10">
        
        {/* Header Alignment */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome Back</h2>
          <p className="text-sm text-zinc-600 mt-2">Sign in to your authorized user dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Remember Me + Forgot Password */}
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

          {/* Premium Unified Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-white font-bold shadow-md hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            {isLoading ? 'Signing in...' : <>Sign In <LogIn size={16} /></>}
          </button>
        </form>

        {/* Redirect Links */}
        <div className="text-center mt-8 pt-4 border-t border-zinc-100 text-zinc-500 text-sm">
          Don't have an ledger setup?{' '}
          <Link to="/signup" className="text-zinc-900 font-bold hover:underline">
            Register Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;