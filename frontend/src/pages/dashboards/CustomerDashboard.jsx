import React, { useState, useEffect } from 'react';
import { 
  User, 
  Sparkles, 
  ShoppingBag, 
  SlidersHorizontal, 
  ShieldCheck, 
  Heart, 
  History, 
  Calculator, 
  Edit3, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Zap, 
  Clock, 
  X,
  UserCheck,
  TrendingUp,
  Trash2,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../../services/authService';
import { formatCurrencyINR } from '../../utils/currencyFormatter';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Real Database States
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState({
    preferredCategory: 'Smartphones',
    preferredBrand: 'All Brands',
    minimumBudgetINR: 10000,
    maximumBudgetINR: 200000,
    preferredFeatures: ['OLED Display', 'High Battery Endurance', 'Fast Charging']
  });
  const [wishlist, setWishlist] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Preference modal state
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [prefForm, setPrefForm] = useState({
    preferredCategory: 'Smartphones',
    preferredBrand: 'All Brands',
    minimumBudgetINR: 10000,
    maximumBudgetINR: 200000,
    preferredFeaturesText: 'OLED Display, High Battery Endurance, Fast Charging'
  });

  // Profile Edit modal state
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });

  // EMI Calculator state
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [emiAmount, setEmiAmount] = useState(120000);
  const [emiMonths, setEmiMonths] = useState(12);
  const [emiInterest, setEmiInterest] = useState(10);

  const calculateMonthlyEmi = () => {
    const r = emiInterest / 12 / 100;
    const n = emiMonths;
    const emi = (emiAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return isNaN(emi) ? 0 : Math.round(emi);
  };

  // Fetch PostgreSQL Customer Data on Mount
  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    const token = localStorage.getItem('optibuy_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Profile
      const profRes = await fetch('/api/customer/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profData = await profRes.json();
      if (profData.success) {
        setProfile(profData.profile);
        setProfileForm({
          fullName: profData.profile.fullName || '',
          phone: profData.profile.phone || '',
          address: profData.profile.address || '',
          dateOfBirth: profData.profile.dateOfBirth ? profData.profile.dateOfBirth.split('T')[0] : ''
        });
      }

      // 2. Preferences
      const prefRes = await fetch('/api/customer/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prefData = await prefRes.json();
      if (prefData.success && prefData.preferences) {
        setPreferences(prefData.preferences);
        setPrefForm({
          preferredCategory: prefData.preferences.preferredCategory || 'Smartphones',
          preferredBrand: prefData.preferences.preferredBrand || 'All Brands',
          minimumBudgetINR: prefData.preferences.minimumBudgetINR || 10000,
          maximumBudgetINR: prefData.preferences.maximumBudgetINR || 200000,
          preferredFeaturesText: Array.isArray(prefData.preferences.preferredFeatures)
            ? prefData.preferences.preferredFeatures.join(', ')
            : 'OLED Display, High Battery'
        });
      }

      // 3. Wishlist
      const wishRes = await fetch('/api/customer/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wishData = await wishRes.json();
      if (wishData.success) {
        setWishlist(wishData.wishlist || []);
      }

      // 4. Comparisons
      const compRes = await fetch('/api/customer/comparison', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const compData = await compRes.json();
      if (compData.success) {
        setComparisons(compData.comparisons || []);
      }

      // 5. Products Catalog for Recommendations
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success && prodData.products) {
        const topMatches = prodData.products.slice(0, 4);
        setRecommendations(topMatches);
      }

    } catch (err) {
      console.error('[Customer Dashboard Fetch Error]', err);
      setErrorMsg('Failed to load live PostgreSQL customer data.');
    } finally {
      setLoading(false);
    }
  };

  // Remove from Wishlist
  const handleRemoveWishlist = async (productId) => {
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/customer/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
        setFeedbackMsg('Product removed from wishlist.');
      }
    } catch (err) {
      alert('Failed to remove from wishlist.');
    }
  };

  // Remove from Comparison Matrix
  const handleRemoveComparison = async (productId) => {
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/customer/comparison/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComparisons(prev => prev.filter(item => item.productId !== productId));
        setFeedbackMsg('Product removed from comparison matrix.');
      }
    } catch (err) {
      alert('Failed to remove from comparison.');
    }
  };

  // Save Preferences to PostgreSQL
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('optibuy_token');
    const featuresArr = prefForm.preferredFeaturesText.split(',').map(f => f.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/customer/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          preferredCategory: prefForm.preferredCategory,
          preferredBrand: prefForm.preferredBrand,
          minimumBudgetINR: prefForm.minimumBudgetINR,
          maximumBudgetINR: prefForm.maximumBudgetINR,
          preferredFeatures: featuresArr
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreferences({
          preferredCategory: prefForm.preferredCategory,
          preferredBrand: prefForm.preferredBrand,
          minimumBudgetINR: parseFloat(prefForm.minimumBudgetINR),
          maximumBudgetINR: parseFloat(prefForm.maximumBudgetINR),
          preferredFeatures: featuresArr
        });
        setShowPrefModal(false);
        setFeedbackMsg('Preferences updated in PostgreSQL database.');
      }
    } catch (err) {
      alert('Failed to save preferences.');
    }
  };

  // Save Profile Details to PostgreSQL
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('optibuy_token');

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => ({
          ...prev,
          fullName: profileForm.fullName,
          phone: profileForm.phone,
          address: profileForm.address,
          dateOfBirth: profileForm.dateOfBirth
        }));
        setShowProfileEditModal(false);
        setFeedbackMsg('Customer profile updated in PostgreSQL.');
      }
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
            <button onClick={() => setFeedbackMsg('')} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-sm font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section A: Customer Welcome Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2563EB]/30 text-cyan-300 border border-cyan-400/30">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Customer Decision Support Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Welcome back, <span className="gradient-text">{profile?.fullName || user?.fullName || 'Customer'}</span>!
              </h1>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
                Connected to PostgreSQL database. Your wishlist, side-by-side spec comparison matrix, and decision support preferences are live and persistent.
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <span>Account Status</span>
                <span className="text-emerald-400 uppercase tracking-wider font-extrabold">Active</span>
              </div>
              <div className="text-xs text-slate-200 space-y-1">
                <div>Email: <span className="font-bold text-white">{profile?.email || user?.email}</span></div>
                <div>Phone: <span className="font-bold text-white">{profile?.phone || 'Not added'}</span></div>
                <div>Role: <span className="font-bold text-cyan-300 uppercase">Customer</span></div>
              </div>
              <button
                onClick={() => setShowProfileEditModal(true)}
                className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-400/30 transition-all"
              >
                Edit Profile Information
              </button>
            </div>
          </div>
        </div>

        {/* Section B: Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            to="/products"
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Browse Catalog</span>
          </Link>

          <Link
            to="/products"
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Compare Models</span>
          </Link>

          <button
            onClick={() => setShowPrefModal(true)}
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Set Preferences</span>
          </button>

          <a
            href="#saved-wishlist"
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Saved Wishlist ({wishlist.length})</span>
          </a>

          <a
            href="#comparison-matrix"
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Compare Matrix ({comparisons.length})</span>
          </a>

          <button
            onClick={() => setShowEmiModal(true)}
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">EMI Calculator</span>
          </button>
        </div>

        {/* Section C: Saved Customer Wishlist */}
        <div id="saved-wishlist" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                PostgreSQL Saved Items
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Your Saved Wishlist ({wishlist.length})
              </h2>
            </div>
            <Link to="/products" className="text-sm font-bold text-[#2563EB] dark:text-cyan-400 hover:underline flex items-center gap-1">
              <span>Explore Products Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {wishlist.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore our catalog of smartphones, laptops, TVs, and appliances. Click the heart icon on any product to save it to your wishlist.
              </p>
              <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.productId} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-full h-44 object-cover rounded-2xl"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">{item.brand}</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.stockStatus}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(item.price)}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">{formatCurrencyINR(item.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveWishlist(item.productId)}
                    className="w-full py-2 rounded-xl font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove from Wishlist</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section D: Active Side-by-Side Spec Comparison Matrix */}
        <div id="comparison-matrix" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-500">
                Decision Support Tool
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Side-by-Side Spec Comparison ({comparisons.length})
              </h2>
            </div>
          </div>

          {comparisons.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Compared Products Selected</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select up to 3 products from our catalog to compare specifications, ratings, and INR pricing side-by-side.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.map((item) => (
                <div key={item.productId} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-2xl"
                    />
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.category}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(item.price)}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveComparison(item.productId)}
                    className="w-full py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove from Compare</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section E: Shopping Preferences & Decision Engine Settings */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400">
                PostgreSQL Decision Preferences
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Your Shopping Preferences
              </h2>
            </div>
            <button
              onClick={() => setShowPrefModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Preferences</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferred Category</span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">{preferences.preferredCategory}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Range (INR)</span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatCurrencyINR(preferences.minimumBudgetINR)} - {formatCurrencyINR(preferences.maximumBudgetINR)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferred Brand</span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">{preferences.preferredBrand}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Features</span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {Array.isArray(preferences.preferredFeatures) ? preferences.preferredFeatures.join(', ') : 'OLED, Battery'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* UPDATE PREFERENCES MODAL */}
      {showPrefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Update Shopping Preferences</h3>
              <button onClick={() => setShowPrefModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Preferred Category</label>
                <select
                  value={prefForm.preferredCategory}
                  onChange={(e) => setPrefForm({ ...prefForm, preferredCategory: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Smartphones">Smartphones</option>
                  <option value="Laptops & PCs">Laptops & PCs</option>
                  <option value="Smart TVs">Smart TVs</option>
                  <option value="Audio">Audio</option>
                  <option value="Smartwatches">Smartwatches</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Preferred Brand</label>
                <input
                  type="text"
                  value={prefForm.preferredBrand}
                  onChange={(e) => setPrefForm({ ...prefForm, preferredBrand: e.target.value })}
                  placeholder="e.g. Apple, Samsung, Sony, Asus"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Min Budget (INR ₹)</label>
                  <input
                    type="number"
                    value={prefForm.minimumBudgetINR}
                    onChange={(e) => setPrefForm({ ...prefForm, minimumBudgetINR: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Max Budget (INR ₹)</label>
                  <input
                    type="number"
                    value={prefForm.maximumBudgetINR}
                    onChange={(e) => setPrefForm({ ...prefForm, maximumBudgetINR: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Preferred Features (comma separated)</label>
                <input
                  type="text"
                  value={prefForm.preferredFeaturesText}
                  onChange={(e) => setPrefForm({ ...prefForm, preferredFeaturesText: e.target.value })}
                  placeholder="e.g. OLED Display, Fast Charging, Long Battery"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPrefModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Preferences to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PROFILE MODAL */}
      {showProfileEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Edit Customer Profile</h3>
              <button onClick={() => setShowProfileEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Delivery / Residence Address</label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  rows={3}
                  placeholder="Street, City, Pincode"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileEditModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Profile to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMI CALCULATOR MODAL */}
      {showEmiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Smart Electronics EMI Calculator</h3>
              <button onClick={() => setShowEmiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Product Price ({formatCurrencyINR(emiAmount)})</label>
                <input
                  type="range"
                  min={10000}
                  max={400000}
                  step={5000}
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Tenure ({emiMonths} Months)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 12, 18, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEmiMonths(m)}
                      className={`py-2 rounded-xl font-extrabold text-xs ${
                        emiMonths === m ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estimated Monthly Installment</span>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyINR(calculateMonthlyEmi())} / mo
                </div>
                <span className="text-[10px] text-slate-400 block">No-Cost EMI Options available at showroom partner banks</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDashboard;
