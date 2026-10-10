import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onNavigate: (view: string, param?: string) => void;
}

export function AuthView({ initialMode = 'login', onNavigate }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
        addToast({
          title: 'Welcome Back',
          message: 'Your atelier session has been verified.',
          type: 'success',
        });
        onNavigate('account');
      } else if (mode === 'register') {
        await register({ email, password, fullName, phone });
        addToast({
          title: 'Collector Account Established',
          message: 'Welcome to the AURA Atelier circle.',
          type: 'success',
        });
        onNavigate('account');
      } else {
        // Forgot password
        addToast({
          title: 'Reset Link Dispatched',
          message: 'If that email is registered, secure instructions have been sent.',
          type: 'info',
        });
        setMode('login');
      }
    } catch (err: any) {
      addToast({
        title: 'Authentication Error',
        message: err.message || 'Unable to authenticate.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
          Atelier Gateway
        </span>
        <h1 className="font-serif-display text-3xl font-semibold text-stone-950 dark:text-stone-50">
          {mode === 'login'
            ? 'Sign In to Your Account'
            : mode === 'register'
            ? 'Establish Collector Profile'
            : 'Recover Access Credentials'}
        </h1>
        <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
          Access your personal wishlist, registered addresses, and consignment tracking.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Elena Vance"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded pl-9 pr-3 py-2 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@atelier.com"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded pl-9 pr-3 py-2 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-stone-700 dark:text-stone-300 font-medium">Password *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 text-[11px]"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded pl-9 pr-3 py-2 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                Contact Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (212) 555-0144"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded pl-9 pr-3 py-2 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting
              ? 'Verifying Credentials...'
              : mode === 'login'
              ? 'Sign In to Atelier'
              : mode === 'register'
              ? 'Register Profile'
              : 'Dispatch Reset Token'}
          </button>
        </form>

        {/* Quick Demo Credentials Bar */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2 text-[11px]">
          <span className="text-stone-400 uppercase tracking-wider font-semibold">
            One-Click Test Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('elena.vance@atelier.com', 'Customer123!')}
              className="p-2 text-left rounded border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
            >
              <div className="font-semibold">Collector Client</div>
              <div className="text-stone-400 text-[10px]">elena.vance@atelier.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@aura-atelier.com', 'Admin@Aura2026!')}
              className="p-2 text-left rounded border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100"
            >
              <div className="font-semibold text-amber-800 dark:text-amber-400">Director Admin</div>
              <div className="text-stone-400 text-[10px]">admin@aura-atelier.com</div>
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-stone-500">
          {mode === 'login' ? (
            <div>
              Prospective collector?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-stone-900 dark:text-stone-100 font-semibold underline"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div>
              Already hold an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-stone-900 dark:text-stone-100 font-semibold underline"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
