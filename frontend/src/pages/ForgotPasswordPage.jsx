import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/common/Logo';
import { forgotPassword } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const target = val !== undefined ? val : email;
    const trimmed = target.trim();
    if (!trimmed) {
      return 'Email address is required.';
    }
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleBlur = () => {
    setFieldError(validateEmail());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const err = validateEmail();
    if (err) {
      setFieldError(err);
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());
      setSuccess(response.message || 'If an account exists with this email, a password reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to request password reset link. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#2563EB]/10 dark:bg-[#2563EB]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20 rounded-full blur-3xl" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Value */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-9 bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl text-white min-h-[520px] shadow-2xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <Logo showTagline={false} size="large" className="text-white" />
            <div className="mt-8 space-y-4">
              <span className="px-3.5 py-1.5 rounded-full text-sm font-bold bg-[#2563EB]/30 text-cyan-300 border border-cyan-400/30">
                OptiBuy Account Recovery
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Reset Your Password Securely
              </h2>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                We'll email you a single-use, cryptographically secure password reset link to recover your account safely.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-200 font-medium my-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>SHA-256 encrypted single-use token validation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Preserves your user role and account permissions</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>30-minute automatic link expiration safety</span>
            </div>
          </div>
        </div>

        {/* Right Side: Forgot Password Form */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 dark:bg-cyan-500/10 flex items-center justify-center text-[#2563EB] dark:text-cyan-400 mb-4 mx-auto sm:mx-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Forgot Password?
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                Enter your registered email address and we'll send you a password reset link.
              </p>
            </div>

            {/* Error Feedback Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Feedback Banner */}
            {success && (
              <div className="mb-6 p-4.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3 font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError('');
                    }}
                    onBlur={handleBlur}
                    placeholder="Enter your registered email"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border ${
                      fieldError 
                        ? 'border-rose-500 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium`}
                  />
                </div>
                {fieldError && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] dark:text-cyan-400 hover:underline">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
