import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/common/Logo';
import { resetPassword } from '../services/authService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new reset link.');
    }
  }, [token]);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '', text: '', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500', width: 'w-1/3' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500', width: 'w-2/3' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', width: 'w-full' };
  };

  const validateField = (field, customValue) => {
    let err = null;

    if (field === 'password') {
      const val = customValue !== undefined ? customValue : password;
      if (!val) {
        err = 'Password is required.';
      } else if (val.length < 6) {
        err = 'Password must be at least 6 characters.';
      }
    }

    if (field === 'confirmPassword') {
      const val = customValue !== undefined ? customValue : confirmPassword;
      const passToCompare = field === 'confirmPassword' ? password : customValue;
      if (!val) {
        err = 'Please confirm your new password.';
      } else if (val !== passToCompare) {
        err = 'Passwords do not match.';
      }
    }

    return err;
  };

  const handleBlur = (field) => {
    const err = validateField(field);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateForm = () => {
    const passErr = validateField('password', password);
    const confirmErr = validateField('confirmPassword', confirmPassword);

    const errors = {};
    if (passErr) errors.password = passErr;
    if (confirmErr) errors.confirmPassword = confirmErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing password reset link. Please request a new link.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await resetPassword(token, password);
      setSuccess(response.message || 'Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid or expired password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#2563EB]/10 dark:bg-[#2563EB]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20 rounded-full blur-3xl" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Highlights */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-9 bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl text-white min-h-[520px] shadow-2xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <Logo showTagline={false} size="large" className="text-white" />
            <div className="mt-8 space-y-4">
              <span className="px-3.5 py-1.5 rounded-full text-sm font-bold bg-[#2563EB]/30 text-cyan-300 border border-cyan-400/30">
                Set New Password
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Secure Account Update
              </h2>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                Choose a strong new password for your OptiBuy account. Your account role and access permissions will remain unchanged.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-200 font-medium my-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Bcrypt 10-round salted password hashing</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Automatic token invalidation after use</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Protects account role and status</span>
            </div>
          </div>
        </div>

        {/* Right Side: Reset Password Form */}
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
                Reset Password
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 mt-1.5 font-medium">
                Create a new secure password for your account.
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

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              
              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                      if (confirmPassword && val !== confirmPassword) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
                      } else if (confirmPassword && val === confirmPassword) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: null }));
                      }
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
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                      <span className={getPasswordStrength(password).text}>{getPasswordStrength(password).label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${getPasswordStrength(password).color} ${getPasswordStrength(password).width}`} />
                    </div>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfirmPassword(val);
                      if (val && val !== password) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
                      } else {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: null }));
                      }
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border ${
                      fieldErrors.confirmPassword 
                        ? 'border-rose-500 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

            </form>

            {/* Back to Login Link */}
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

export default ResetPasswordPage;
