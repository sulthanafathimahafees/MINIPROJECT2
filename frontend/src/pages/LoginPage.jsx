import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/common/Logo';
import { loginUser } from '../services/authService';
import { initiateGoogleSignIn } from '../services/googleAuthService';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectParam = queryParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (field, val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let err = null;

    if (field === 'email') {
      const trimmed = (val !== undefined ? val : email).trim();
      if (!trimmed) {
        err = 'Email address is required.';
      } else if (!emailRegex.test(trimmed)) {
        err = 'Please enter a valid email address.';
      }
    }

    if (field === 'password') {
      const targetPass = val !== undefined ? val : password;
      if (!targetPass) {
        err = 'Password is required.';
      } else if (targetPass.length < 6) {
        err = 'Password must be at least 6 characters.';
      }
    }

    return err;
  };

  const handleBlur = (field) => {
    const err = validateField(field);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateForm = () => {
    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);
    const errors = {};
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await loginUser({ email: email.trim(), password });
      const userRole = (response.user.role || 'customer').toLowerCase();
      const defaultDashboard = userRole === 'admin' ? '/admin-dashboard' : (userRole === 'salesperson' || userRole === 'sales_person' || userRole === 'sales') ? '/sales-dashboard' : '/customer-dashboard';
      const targetDashboard = redirectParam || defaultDashboard;
      setSuccess(`Welcome back, ${response.user.fullName || 'User'}! Redirecting...`);
      setTimeout(() => {
        navigate(targetDashboard);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to connect to authentication server. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    setSuccess('');
    setLoading(true);

    initiateGoogleSignIn(
      (data) => {
        setLoading(false);
        const userRole = (data.user.role || 'customer').toLowerCase();
        const targetDashboard = userRole === 'admin' ? '/admin-dashboard' : (userRole === 'salesperson' || userRole === 'sales_person' || userRole === 'sales') ? '/sales-dashboard' : '/customer-dashboard';
        setSuccess(`Signed in with Google as ${data.user.fullName || data.user.email}! Redirecting to ${userRole.toUpperCase()} Dashboard...`);
        setTimeout(() => {
          navigate(targetDashboard);
        }, 1000);
      },
      (err) => {
        setLoading(false);
        setError(err.message || 'Google Sign-In failed.');
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#2563EB]/10 dark:bg-[#2563EB]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20 rounded-full blur-3xl" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Highlights */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-9 bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl text-white min-h-[560px] shadow-2xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div>
            <Logo showTagline={false} size="large" className="text-white" />
            <div className="mt-8 space-y-4">
              <span className="px-3.5 py-1.5 rounded-full text-sm font-bold bg-[#2563EB]/30 text-cyan-300 border border-cyan-400/30">
                Welcome Back to OptiBuy
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Consumer Electronics Decision Support Platform
              </h2>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                Access your personalized wishlists, OptiBuy Decision Scores, and side-by-side spec comparison matrices.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 text-sm text-slate-200 font-medium my-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Real-time sentiment score summaries</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Zero-regret electronics purchasing decisions</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>PostgreSQL authenticated user sessions</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-center sm:text-left mb-7">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Sign in to OptiBuy
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 mt-1.5 font-medium">
                Enter your credentials to access your account.
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
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3 font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              
              {/* Email Field */}
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
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                    }}
                    onBlur={() => handleBlur('email')}
                    placeholder="Enter your email address"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border ${
                      fieldErrors.email 
                        ? 'border-rose-500 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                    }}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border ${
                      fieldErrors.password 
                        ? 'border-rose-500 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox & Forgot Password Link */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Remember Me</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#2563EB] dark:text-cyan-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-grow" />
              <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-grow" />
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-3 transition-colors shadow-xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Bottom Register Redirect & Sales Person Request Link */}
            <div className="mt-7 text-center space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <div>
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-[#2563EB] dark:text-cyan-400 hover:underline">
                  Create Account
                </Link>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold">
                Are you an OptiBuy sales professional?{' '}
                <Link to="/join-as-sales-person" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                  Request Sales Person Access
                </Link>
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
