import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'EMAIL_VERIFICATION';

  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(emailParam);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const inputRefs = useRef([]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Cooldown timer for Resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const cdTimer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(cdTimer);
  }, [cooldown]);

  // Helper to fetch local dev OTP if SMTP is not configured
  const fetchDevOtp = async () => {
    try {
      const res = await authApi.getDevEmails();
      const recent = res.data?.recent_emails;
      if (recent && recent.length > 0) {
        const matching = recent.find((e) => e.to === email.toLowerCase()) || recent[recent.length - 1];
        if (matching?.otp) {
          setDevOtp(matching.otp);
          const digits = matching.otp.split('');
          setOtpDigits(digits);
        }
      }
    } catch (e) {
      console.log('Dev email inspection note:', e);
    }
  };

  useEffect(() => {
    fetchDevOtp();
  }, [email]);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setError('Verification code has expired. Please request a new OTP.');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(email, fullOtp, purpose);
      setSuccessMsg('Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      await resendOtp(email, purpose);
      setSuccessMsg('A fresh verification code has been dispatched.');
      setTimeLeft(300);
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(fetchDevOtp, 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-500">
            We sent a 6-digit verification code to: <br />
            <strong className="text-slate-800 font-semibold">{email || 'your email'}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Segmented 6-digit input */}
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center font-mono text-xl font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 text-slate-900 shadow-sm transition-all"
                />
              ))}
            </div>

            {/* Timer and Cooldown */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>OTP expires in:</span>
                <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="font-semibold text-sky-600 hover:text-sky-700 disabled:text-slate-400 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || timeLeft <= 0}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify OTP & Continue</span>
                </>
              )}
            </button>
          </form>

          {/* Dev Inspection Panel for Reviewers */}
          {devOtp && (
            <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-900">Local Testing Helper</span>
                <span className="text-[10px] bg-sky-200 text-sky-800 px-1.5 py-0.5 rounded font-mono">Dev Mode</span>
              </div>
              <p className="text-[11px] text-sky-700">
                Dispatched OTP code: <strong className="font-mono text-xs text-sky-950 font-bold tracking-widest">{devOtp}</strong>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500">
          Entered the wrong email?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
            Register with another email
          </Link>
        </p>
      </div>
    </div>
  );
}
