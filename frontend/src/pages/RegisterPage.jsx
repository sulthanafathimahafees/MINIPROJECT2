import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle2, ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/common/Logo';
import { registerUser } from '../services/authService';
import { initiateGoogleSignIn } from '../services/googleAuthService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({});

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let err = null;

    if (field === 'fullName') {
      const val = (customValue !== undefined ? customValue : fullName).trim();
      if (!val) {
        err = 'Full name is required.';
      } else if (val.length < 2) {
        err = 'Full name must be at least 2 characters.';
      }
    }

    if (field === 'email') {
      const val = (customValue !== undefined ? customValue : email).trim();
      if (!val) {
        err = 'Email address is required.';
      } else if (!emailRegex.test(val)) {
        err = 'Please enter a valid email address.';
      }
    }

    if (field === 'phone') {
      const val = (customValue !== undefined ? customValue : phone).trim();
      const phoneDigits = val.replace(/[^0-9]/g, '');
      if (val && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
        err = 'Please enter a valid 10-15 digit mobile number.';
      }
    }

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
        err = 'Please confirm your password.';
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
    const fnErr = validateField('fullName', fullName);
    const emErr = validateField('email', email);
    const phErr = validateField('phone', phone);
    const passErr = validateField('password', password);
    const confirmErr = validateField('confirmPassword', confirmPassword);

    const errors = {};
    if (fnErr) errors.fullName = fnErr;
    if (emErr) errors.email = emErr;
    if (phErr) errors.phone = phErr;
    if (passErr) errors.password = passErr;
    if (confirmErr) errors.confirmPassword = confirmErr;

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
      const response = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password
      });

      setSuccess(`Account created successfully! Redirecting to Customer Dashboard...`);
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#2563EB]/10 dark:bg-[#2563EB]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20 rounded-full blur-3xl" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Value */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-9 bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl text-white min-h-[600px] shadow-2xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <Logo showTagline={false} size="large" className="text-white" />
            <div className="mt-8 space-y-4">
              <span className="px-3.5 py-1.5 rounded-full text-sm font-bold bg-[#2563EB]/30 text-cyan-300 border border-cyan-400/30">
                Join OptiBuy Today
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Create Your Free OptiBuy Account
              </h2>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                Save preference profiles, store showroom spec comparisons, and receive personalized electronics recommendations.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm text-slate-200 font-medium my-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Free instant access to decision score tools</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Smart showroom QR product scanner</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>PostgreSQL authenticated account safety</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Create Account
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 mt-1 font-medium">
                Register as an OptiBuy Customer to get started.
              </p>
            </div>

            {/* Error Feedback Banner */}
            {error && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Feedback Banner */}
            {success && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3 font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: null }));
                    }}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border ${
                      fieldErrors.fullName 
                        ? 'border-rose-500 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
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
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border ${
                      fieldErrors.email 
                        ? 'border-rose-500 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: null }));
                    }}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border ${
                      fieldErrors.phone 
                        ? 'border-rose-500 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
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
                      className={`w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border ${
                        fieldErrors.password 
                          ? 'border-rose-500 ring-2 ring-rose-500/20' 
                          : 'border-slate-200 dark:border-slate-700'
                      } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                        <span className={getPasswordStrength(password).text}>{getPasswordStrength(password).label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${getPasswordStrength(password).color} ${getPasswordStrength(password).width}`} />
                      </div>
                    </div>
                  )}
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
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
                      className={`w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border ${
                        fieldErrors.confirmPassword 
                          ? 'border-rose-500 ring-2 ring-rose-500/20' 
                          : 'border-slate-200 dark:border-slate-700'
                      } text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
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

            {/* Bottom Login Redirect */}
            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#2563EB] dark:text-cyan-400 hover:underline">
                Login
              </Link>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
