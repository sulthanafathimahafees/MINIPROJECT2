import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Lock, 
  Building,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/common/Logo';
import { OPTIBUY_COMPANY_INFO } from '../config/companyConfig';

const ALLOWED_DEPARTMENTS = [
  'Main Showroom Floor',
  'Flagship Electronics Hub',
  'Audio & Home Theater Zone',
  'Mobility & Laptops Section'
];

const SalesPersonRequestPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: 'Main Showroom Floor',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live password strength calculator
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-300' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score === 3 || score === 4) return { score, label: 'Fair', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = calculatePasswordStrength(formData.password);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/[^0-9]/g, '');

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (phoneDigits.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.department) {
      errors.department = 'Please select a showroom department.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (passStrength.score < 4) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/sales-person/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to submit your request right now. Please try again.');
      }

      setSubmittedData({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        department: formData.department,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      setError(err.message || 'Unable to submit request. Please verify network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 bg-slate-50 dark:bg-[#070B14] min-h-[calc(100vh-80px)] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-10 transition-colors duration-300 circuit-grid">
      
      <div className="max-w-[1360px] w-full mx-auto space-y-6 my-auto">
        
        {/* Top Header Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Logo showTagline={false} size="small" />
            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] dark:text-cyan-400 border border-[#2563EB]/20">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sales Staff Portal</span>
            </span>
          </div>

          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-cyan-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-[#2563EB]/40 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-[#2563EB] dark:text-cyan-400" />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Main Two-Section Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ====================================================
              LEFT SECTION: Corporate Info & Company Overview
             ==================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1E293B] rounded-3xl p-6 sm:p-8 text-white border border-slate-700 shadow-2xl relative overflow-hidden space-y-6">
              
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Company Header */}
              <div className="relative z-10 space-y-2">
                <Logo showTagline={false} size="large" className="text-white" />
                <p className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                  {OPTIBUY_COMPANY_INFO.tagline}
                </p>
                <div className="inline-block mt-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#2563EB]/30 text-blue-200 border border-blue-400/30">
                  {OPTIBUY_COMPANY_INFO.industry}
                </div>
              </div>

              {/* About OptiBuy */}
              <div className="relative z-10 space-y-2 pt-2 border-t border-slate-700/80">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>About OptiBuy Platform</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {OPTIBUY_COMPANY_INFO.purpose}
                </p>
              </div>

              {/* Supported Electronics Product Categories */}
              <div className="relative z-10 space-y-3 pt-2 border-t border-slate-700/80">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Supported Product Categories</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200">
                    <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Smartphones</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200">
                    <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Laptops & PCs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200">
                    <Tv className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Smart TVs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200">
                    <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Headphones</span>
                  </div>
                </div>
              </div>

              {/* Value Proposition Trust Cards */}
              <div className="relative z-10 pt-2 border-t border-slate-700/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                  Platform Decision Support
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {OPTIBUY_COMPANY_INFO.valueProps.map((badge, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Company Leadership Section */}
              <div className="relative z-10 pt-2 border-t border-slate-700/80 space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Company Leadership</span>
                </h3>
                <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <div className="text-xs font-bold text-cyan-300">
                    {OPTIBUY_COMPANY_INFO.leadership.managingDirector.designation}
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {OPTIBUY_COMPANY_INFO.leadership.managingDirector.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {OPTIBUY_COMPANY_INFO.leadership.managingDirector.description || 'Strategic vision for retail intelligence & showroom customer decision support.'}
                  </div>
                </div>
              </div>

              {/* Company Contact Details */}
              <div className="relative z-10 pt-2 border-t border-slate-700/80 space-y-2.5 text-xs text-slate-300">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Showroom Headquarters & Support
                </h3>
                <div className="space-y-2 font-medium">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <span>{OPTIBUY_COMPANY_INFO.contact.headOffice}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{OPTIBUY_COMPANY_INFO.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{OPTIBUY_COMPANY_INFO.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{OPTIBUY_COMPANY_INFO.contact.businessHours}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ====================================================
              RIGHT SECTION: Sales Person Request Form Container
             ==================================================== */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-6 sm:p-9 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
              
              {/* Form Title & Overview */}
              <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30">
                  <Building className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Showroom Staff Onboarding</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Request Sales Person Access
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Submit your staff credentials for OptiBuy Showroom Sales Specialist verification. Accounts are securely reviewed by an OptiBuy administrator before activation.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {submittedData ? (
                  /* ====================================================
                      SUCCESS PANEL STATE
                     ==================================================== */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 sm:p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 space-y-6 text-center shadow-xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/30">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Status: Pending Administrator Approval
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 pt-2">
                        Request Submitted Successfully!
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-md mx-auto">
                        Your OptiBuy Sales Staff access request has been recorded for administrator review.
                      </p>
                    </div>

                    {/* Detailed Request Summary Box */}
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-900/60 text-left space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Applicant Name:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{submittedData.fullName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Registered Email:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{submittedData.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Showroom Section:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{submittedData.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Submission Time:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{submittedData.submittedAt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      An administrator will review your staff credentials. Once approved, you will be able to sign in to the Sales Specialist Dashboard using your email and password.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs text-white gradient-btn shadow-md hover:shadow-lg transition-all"
                      >
                        Return to Login Page
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                      >
                        Return to OptiBuy Home
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ====================================================
                      SALES PERSON REQUEST FORM
                     ==================================================== */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {error && (
                      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* GROUP 1: PERSONAL INFORMATION */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Shield className="w-4 h-4 text-[#2563EB] dark:text-cyan-400" />
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                          1. Personal Information
                        </h2>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Marcus Vance"
                          className={`w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all ${
                            fieldErrors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        {fieldErrors.fullName && <p className="mt-1 text-xs text-rose-500 font-semibold">{fieldErrors.fullName}</p>}
                      </div>

                      {/* Email & Mobile Number Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Email */}
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="marcus@optibuy.ai"
                            className={`w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all ${
                              fieldErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          {fieldErrors.email && <p className="mt-1 text-xs text-rose-500 font-semibold">{fieldErrors.email}</p>}
                        </div>

                        {/* Mobile Number */}
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 9876543210"
                            className={`w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all ${
                              fieldErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          {fieldErrors.phone && <p className="mt-1 text-xs text-rose-500 font-semibold">{fieldErrors.phone}</p>}
                        </div>

                      </div>
                    </div>

                    {/* GROUP 2: EMPLOYMENT INFORMATION */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Building className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                          2. Showroom Employment Details
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Department / Showroom */}
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Department / Showroom Section *
                          </label>
                          <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className={`w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all ${
                              fieldErrors.department ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {ALLOWED_DEPARTMENTS.map((dept, idx) => (
                              <option key={idx} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.department && <p className="mt-1 text-xs text-rose-500 font-semibold">{fieldErrors.department}</p>}
                        </div>

                        {/* Employee ID */}
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            placeholder="e.g. EMP-2026-904"
                            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
                          />
                        </div>

                      </div>
                    </div>

                    {/* GROUP 3: ACCOUNT SECURITY */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Lock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                          3. Account Security Credentials
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Password */}
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="••••••••"
                              className={`w-full p-3 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all ${
                                fieldErrors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Live Password Strength Meter */}
                          {formData.password && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                <span>Strength: <strong className={passStrength.label === 'Strong' ? 'text-emerald-500' : passStrength.label === 'Fair' ? 'text-amber-500' : 'text-rose-500'}>{passStrength.label}</strong></span>
                                <span>Min 8 chars (A-Z, a-z, 0-9, #!?)</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-1">
                                <div className={`h-full transition-all duration-300 ${passStrength.color} ${passStrength.score >= 1 ? 'w-1/3' : 'w-0'}`} />
                                <div className={`h-full transition-all duration-300 ${passStrength.color} ${passStrength.score >= 3 ? 'w-1/3' : 'w-0'}`} />
                                <div className={`h-full transition-all duration-300 ${passStrength.color} ${passStrength.score >= 5 ? 'w-1/3' : 'w-0'}`} />
                              </div>
                            </div>
                          )}

                          {fieldErrors.password && <p className="mt-1 text-xs text-rose-500 font-semibold">{fieldErrors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                              className={`w-full p-3 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all ${
                                fieldErrors.confirmPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Confirm Mismatch Indicator */}
                          {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                            <p className="mt-1 text-[11px] text-amber-500 font-bold">Passwords do not match yet.</p>
                          )}

                          {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-rose-500 font-semibold">{fieldErrors.confirmPassword}</p>}
                        </div>

                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-lg shadow-[#2563EB]/25 transition-all duration-200 flex items-center justify-center gap-2 ${
                          loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting Request...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Submit Sales Person Request</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
                      By submitting, you request sales specialist permissions. All requests are subject to OptiBuy administrator approval.
                    </p>

                  </form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SalesPersonRequestPage;
