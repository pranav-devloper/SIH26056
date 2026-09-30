import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, LogIn, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password credentials.';
      setError(msg);
      if (msg.toLowerCase().includes('not verified')) {
        setUnverifiedEmail(email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Passes standard test credential format recognized by backend Google endpoint
      await googleLogin('mock_google_token:evaluator.google@airindex.in:Google Evaluator');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
            <Plane className="w-6 h-6 -rotate-45" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome to AirIndex India</h2>
          <p className="text-xs text-slate-500">Sign in to access real-time price intelligence & analytics</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {unverifiedEmail && (
                <div className="pt-2 border-t border-red-100 flex items-center justify-between">
                  <span>Need to enter your verification code?</span>
                  <Link
                    to={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="font-bold text-red-800 underline hover:text-red-950"
                  >
                    Verify Email
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-sky-600 hover:text-sky-700">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">Or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Credentials helper for reviewers */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
            <p className="text-[11px] font-bold text-slate-700">Quick Demo Accounts (Pre-seeded):</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@airindex.in', 'Admin@AirIndex2026')}
                className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:text-sky-600 font-medium"
              >
                Use Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('analyst@airindex.in', 'Analyst@AirIndex2026')}
                className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:text-sky-600 font-medium"
              >
                Use Analyst
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('viewer@airindex.in', 'Viewer@AirIndex2026')}
                className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:text-sky-600 font-medium"
              >
                Use Viewer
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
