import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useToast } from '../contexts/useToast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo logic as per your requirement
    if (email === 'admin@church.com' && password.length > 0) {
      setTimeout(() => {
        showToast('Login successful! Welcome back.', 'success');
        console.log('Logged in with:', { email, password, rememberMe });
        setTimeout(() => {
          setIsLoading(false);
          navigate('/onboarding'); // Redirect to onboarding for demo
        }, 500);
        // TODO: Redirect to Dashboard later
      }, 1200);
    } else {
      setTimeout(() => {
        showToast('Invalid email. Use admin@church.com for demo.', 'error');
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Initial */}
        <div className="flex justify-center mb-3">
          <div className="text-blue-900 flex items-center justify-center">
            <span className="text-3xl font-bold">Choir FinSec</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold">Welcome Back</h1>
          <p className="text-zinc-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-zinc-800">
          {/* Demo Hint */}
          <div className="bg-blue-950 border border-blue-900 rounded-xl p-4 mb-8">
            <p className="text-blue-400 text-sm font-medium">Demo Login Hint:</p>
            <p className="text-zinc-300 text-sm mt-1">
              Use <span className="font-mono text-blue-300">"admin@church.com"</span> to test the admin setup flow
            </p>
            <p className="text-zinc-400 text-xs mt-1">(Any password works in demo mode)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-gray-100 border rounded-xl px-3 py-2 text-black placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-gray-100 border rounded-xl px-4 py-2 text-black placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-600"
                />
                Remember me
              </label>
              <Link to="#" className="text-blue-500 hover:text-blue-400 text-sm transition-colors cursor-pointer">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-800 active:bg-zinc-200 disabled:bg-zinc-700 text-white cursor-pointer font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-8 text-zinc-400 text-sm">
            Don't have an account?{' '}
            <Link to="#" className="text-blue-500 hover:text-blue-400 font-medium transition-colors cursor-pointer">
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-8">
          Financial Secretary © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
