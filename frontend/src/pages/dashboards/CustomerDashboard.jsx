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
  Cpu,
  Package,
  MessageSquare,
  LifeBuoy,
  Box,
  Send,
  Eye,
  RotateCcw,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../../services/authService';
import { formatCurrencyINR } from '../../utils/currencyFormatter';
import DashboardSidebar from '../../components/common/DashboardSidebar';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
  
  // New states for Sprint 1 features
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [salesRecommendations, setSalesRecommendations] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  
  // Loading states
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [assistanceLoading, setAssistanceLoading] = useState(false);
  const [salesRecLoading, setSalesRecLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  // Match Score states
  const [matchScores, setMatchScores] = useState([]);
  const [matchScoreLoading, setMatchScoreLoading] = useState(false);
  const [showMatchScoreModal, setShowMatchScoreModal] = useState(false);
  const [selectedMatchProduct, setSelectedMatchProduct] = useState(null);

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

  // Assistance Request Modal state
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [assistanceForm, setAssistanceForm] = useState({
    productId: '',
    requestType: 'PRODUCT_INQUIRY',
    notes: ''
  });
  const [selectedProductForAssistance, setSelectedProductForAssistance] = useState(null);

  // Order Detail Modal state
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  const calculateMonthlyEmi = () => {
    const r = emiInterest / 12 / 100;
    const n = emiMonths;
    const emi = (emiAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return isNaN(emi) ? 0 : Math.round(emi);
  };

  // Fetch PostgreSQL Customer Data on Mount & Set Polling for Real-Time Showroom Updates
  useEffect(() => {
    fetchCustomerData();

    // Poll assistance requests and sales recommendations every 20 seconds
    const pollInterval = setInterval(() => {
      refreshAssistanceAndRecommendations();
    }, 20000);

    return () => clearInterval(pollInterval);
  }, []);

  const refreshAssistanceAndRecommendations = async () => {
    const token = localStorage.getItem('optibuy_token');
    if (!token) return;
    try {
      const [assistRes, salesRecRes] = await Promise.all([
        fetch('/api/customer/assistance', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/customer/recommendations', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const assistData = await assistRes.json();
      if (assistData.success) {
        setAssistanceRequests(assistData.requests || []);
      }
      const salesRecData = await salesRecRes.json();
      if (salesRecData.success) {
        setSalesRecommendations(salesRecData.recommendations || []);
      }
    } catch (err) {
      // Silent error during background poll
    }
  };

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

      // 6. Order History
      setOrdersLoading(true);
      const ordersRes = await fetch('/api/customer/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
      setOrdersLoading(false);

      // 7. Assistance Requests
      setAssistanceLoading(true);
      const assistRes = await fetch('/api/customer/assistance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assistData = await assistRes.json();
      if (assistData.success) {
        setAssistanceRequests(assistData.requests || []);
      }
      setAssistanceLoading(false);

      // 8. Sales Executive Recommendations
      setSalesRecLoading(true);
      const salesRecRes = await fetch('/api/customer/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const salesRecData = await salesRecRes.json();
      if (salesRecData.success) {
        setSalesRecommendations(salesRecData.recommendations || []);
      }
      setSalesRecLoading(false);

      // 9. Customer's Own Reviews
      setReviewsLoading(true);
      const reviewsRes = await fetch('/api/customer/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) {
        setMyReviews(reviewsData.reviews || []);
      }
      setReviewsLoading(false);

      // 10. Product Match Scores
      setMatchScoreLoading(true);
      const matchRes = await fetch('/api/customer/match-score', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const matchData = await matchRes.json();
      if (matchData.success) {
        setMatchScores(matchData.products || []);
      }
      setMatchScoreLoading(false);

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

  // Fetch Order Details
  const handleViewOrderDetails = async (orderId) => {
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/customer/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setShowOrderDetailModal(true);
      } else {
        alert('Failed to load order details.');
      }
    } catch (err) {
      alert('Failed to load order details.');
    }
  };

  // Create Assistance Request
  const handleCreateAssistance = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('optibuy_token');
    
    if (!assistanceForm.requestType || !assistanceForm.notes.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/customer/assistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: assistanceForm.productId ? parseInt(assistanceForm.productId, 10) : null,
          requestType: assistanceForm.requestType,
          notes: assistanceForm.notes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAssistanceRequests(prev => [data.request, ...prev]);
        setShowAssistanceModal(false);
        setAssistanceForm({ productId: '', requestType: 'PRODUCT_INQUIRY', notes: '' });
        setSelectedProductForAssistance(null);
        setFeedbackMsg('Assistance request submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit assistance request.');
      }
    } catch (err) {
      alert('Failed to submit assistance request.');
    }
  };

  // Open Assistance Modal with optional product
  const openAssistanceModal = (product = null) => {
    setSelectedProductForAssistance(product);
    if (product) {
      setAssistanceForm(prev => ({
        ...prev,
        productId: product.productId || product.id,
        requestType: 'PRODUCT_INQUIRY',
        notes: `I have a question about ${product.name} (${product.modelNumber || product.model_number || ''}). `
      }));
    } else {
      setAssistanceForm({ productId: '', requestType: 'PRODUCT_INQUIRY', notes: '' });
    }
    setShowAssistanceModal(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white">
      <DashboardSidebar
        role="customer"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open dashboard navigation"
            className="p-2 -ml-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-900 dark:text-white">Customer Dashboard</span>
        </header>
        <div className="py-8 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="optibuy-container space-y-8">

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
        <div id="profile" className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2563EB]/30 text-cyan-300 border border-cyan-400/30">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Customer Decision Support Portal</span>
              </div>
              <h1 id="dashboard-header" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-4">
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

          <a
            href="#order-history"
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Order History ({orders.length})</span>
          </a>

          <button
            onClick={() => openAssistanceModal()}
            className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all text-center flex flex-col items-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Request Assistance</span>
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

        {/* Section F: Order History */}
        <div id="order-history" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                PostgreSQL Order Records
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Your Order History ({orders.length})
              </h2>
            </div>
          </div>

          {ordersLoading ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Loading Orders...</h3>
              <p className="text-xs text-slate-500">Fetching your order history from PostgreSQL.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Orders Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                      <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-slate-900 dark:text-white">Order #{order.orderId}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {order.formattedDate}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          order.orderStatus === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                          order.orderStatus === 'SHIPPED' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                          order.orderStatus === 'PROCESSING' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                          'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          {order.orderStatus}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          order.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                          'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(order.totalAmount)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewOrderDetails(order.orderId)}
                    className="w-full sm:w-auto py-2 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section G: Customer Assistance Requests */}
        <div id="assistance-requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                PostgreSQL Support Tickets
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Assistance Requests ({assistanceRequests.length})
              </h2>
            </div>
            <button
              onClick={() => openAssistanceModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>

          {assistanceLoading ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Loading Requests...</h3>
              <p className="text-xs text-slate-500">Fetching your assistance requests from PostgreSQL.</p>
            </div>
          ) : assistanceRequests.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <LifeBuoy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Assistance Requests</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't submitted any assistance requests yet. Click "New Request" to contact our sales executives.
              </p>
              <button
                onClick={() => openAssistanceModal()}
                className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-orange-600 hover:bg-orange-700"
              >
                Create New Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {assistanceRequests.map((req) => (
                <div key={req.id} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-bold text-slate-900 dark:text-white">Request #{req.id}</span>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            req.status === 'NEW' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                            req.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                            req.status === 'RESOLVED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                            'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {req.status}
                          </span>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            {req.requestType}
                          </span>
                        </div>
                        {req.productName && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-medium">Product:</span>
                            <span>{req.productName}</span>
                            {req.productPrice && (
                              <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrencyINR(req.productPrice)}</span>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-slate-700 dark:text-slate-300">{req.notes}</p>
                        {req.assignedSalesPerson ? (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span>Assigned Sales Executive: <strong className="font-semibold">{req.assignedSalesPerson}</strong></span>
                            {req.salesPersonPhone && (
                              <span className="text-emerald-600 dark:text-emerald-400">({req.salesPersonPhone})</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                            Waiting for showroom executive assignment...
                          </div>
                        )}
                        {req.updatedAt && req.updatedAt !== req.createdAt && (
                          <p className="text-[11px] text-slate-400">Last updated: {new Date(req.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section H: Sales Executive Recommendations */}
        <div id="sales-recommendations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                Expert Recommendations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Recommendations from Sales Executives ({salesRecommendations.length})
              </h2>
            </div>
          </div>

          {salesRecLoading ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Loading Recommendations...</h3>
              <p className="text-xs text-slate-500">Fetching personalized recommendations from PostgreSQL.</p>
            </div>
          ) : salesRecommendations.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Recommendations Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Our sales executives will send you personalized product recommendations based on your preferences and inquiries.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesRecommendations.map((rec) => (
                <div key={rec.id} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {rec.product && rec.product.image && (
                      <img
                        src={rec.product.image}
                        alt={rec.product.name}
                        className="w-full h-44 object-cover rounded-2xl"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">From Sales Team</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{rec.product?.stockStatus || 'Available'}</span>
                    </div>
                    {rec.product && (
                      <>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{rec.product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(rec.product.price)}</span>
                          {rec.product.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">{formatCurrencyINR(rec.product.originalPrice)}</span>
                          )}
                        </div>
                      </>
                    )}
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 space-y-2">
                      <p className="text-xs font-bold text-purple-800 dark:text-purple-200">Expert Note:</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rec.recommendationNote}</p>
                      <p className="text-[11px] text-slate-400">Recommended by: {rec.salesExecutiveName} • {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {rec.product && (
                    <Link
                      to={`/products/${rec.product.productId}`}
                      className="w-full py-2 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Product</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section I: Customer's Product Reviews */}
        <div id="my-reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                PostgreSQL Review Records
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Your Product Reviews ({myReviews.length})
              </h2>
            </div>
            <Link to="/products" className="text-sm font-bold text-[#2563EB] dark:text-cyan-400 hover:underline flex items-center gap-1">
              <span>Review More Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {reviewsLoading ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Loading Reviews...</h3>
              <p className="text-xs text-slate-500">Fetching your product reviews from PostgreSQL.</p>
            </div>
          ) : myReviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Reviews Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't written any product reviews yet. Browse products and share your experience!
              </p>
              <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div key={review.id} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center flex-shrink-0">
                      {review.product.image && (
                        <img src={review.product.image} alt={review.product.name} className="w-14 h-14 object-cover rounded-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">{review.product.name}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {review.product.brand}
                        </span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {review.status}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{review.rating.toFixed(1)}/5</span>
                      </div>
                      {review.title && (
                        <p className="font-medium text-slate-900 dark:text-white">{review.title}</p>
                      )}
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{review.text}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(review.product.price)}</p>
                      <Link
                        to={`/products/${review.product.id}`}
                        className="inline-block mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-[#2563EB] dark:text-cyan-400 hover:underline"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section J: Product Match Scores - Decision Support Engine */}
        <div id="match-scores" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                Decision Support Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Product Match Scores ({matchScores.length})
              </h2>
            </div>
            <button
              onClick={() => setShowMatchScoreModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Recalculate with Custom Preferences</span>
            </button>
          </div>

          {matchScoreLoading ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Calculating Match Scores...</h3>
              <p className="text-xs text-slate-500">Analyzing products against your preferences from PostgreSQL.</p>
            </div>
          ) : matchScores.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Match Scores Available</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Set your preferences and browse products to see personalized match scores.
              </p>
              <button
                onClick={() => setShowPrefModal(true)}
                className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700"
              >
                Set Preferences
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchScores.slice(0, 12).map((product) => (
                <div key={product.product_id || product.id} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-full h-44 object-cover rounded-2xl"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Match Score</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        product.matchScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        product.matchScore >= 60 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {product.matchScore}%
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">{formatCurrencyINR(product.originalPrice)}</span>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 space-y-1">
                      <p className="text-xs font-bold text-purple-800 dark:text-purple-200">Why this score?</p>
                      {Object.entries(product.matchDetails || {}).map(([key, detail]) => (
                        <p key={key} className="text-[11px] text-slate-700 dark:text-slate-300">
                          <span className="font-medium capitalize">{key}:</span> {detail.reason} ({detail.score}/{detail.max})
                        </p>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedMatchProduct(product); setShowMatchScoreModal(true); }}
                    className="w-full py-2 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>View Detailed Breakdown</span>
                  </button>
                </div>
              ))}
            </div>
          )}
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

      {/* ASSISTANCE REQUEST MODAL */}
      {showAssistanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Request Customer Assistance</h3>
              <button onClick={() => { setShowAssistanceModal(false); setSelectedProductForAssistance(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssistance} className="space-y-4 text-xs font-bold">
              {selectedProductForAssistance && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <img src={selectedProductForAssistance.image} alt={selectedProductForAssistance.name} className="w-8 h-8 object-cover rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedProductForAssistance.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedProductForAssistance.brand} • {formatCurrencyINR(selectedProductForAssistance.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProductForAssistance(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Request Type</label>
                <select
                  value={assistanceForm.requestType}
                  onChange={(e) => setAssistanceForm({ ...assistanceForm, requestType: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="PRODUCT_INQUIRY">Product Inquiry</option>
                  <option value="PRICE_CHECK">Price Check / Quote</option>
                  <option value="STOCK_AVAILABILITY">Stock Availability</option>
                  <option value="TECHNICAL_SPEC">Technical Specifications</option>
                  <option value="COMPARISON_HELP">Comparison Assistance</option>
                  <option value="PURCHASE_GUIDANCE">Purchase Guidance</option>
                  <option value="POST_SALE_SUPPORT">Post-Sale Support</option>
                  <option value="GENERAL_INQUIRY">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Your Message / Question</label>
                <textarea
                  value={assistanceForm.notes}
                  onChange={(e) => setAssistanceForm({ ...assistanceForm, notes: e.target.value })}
                  rows={5}
                  placeholder="Describe your question or request in detail. Our sales executives will respond within 24 hours."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAssistanceModal(false); setSelectedProductForAssistance(null); }}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            <button
              onClick={() => { setShowOrderDetailModal(false); setSelectedOrder(null); }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Order Details</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order #{selectedOrder.orderId}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Placed on {selectedOrder.formattedDate}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    selectedOrder.orderStatus === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    selectedOrder.orderStatus === 'SHIPPED' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                    selectedOrder.orderStatus === 'PROCESSING' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                    'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    {selectedOrder.orderStatus}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.itemId} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.productName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.brand} • {item.category}</p>
                        {item.modelNumber && <p className="text-xs text-slate-400 dark:text-slate-500">{item.modelNumber}</p>}
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrencyINR(item.unitPrice)} each</p>
                        <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrencyINR(item.lineTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrencyINR(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                  <span className="font-bold text-slate-900 dark:text-white">Included</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-lg">{formatCurrencyINR(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Order Placed</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{selectedOrder.formattedDate}</p>
                    </div>
                  </div>
                  {selectedOrder.orderStatus !== 'PROCESSING' && (
                    <div className="flex items-start gap-3 ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 -ml-4">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Order Processing</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Your order is being prepared</p>
                      </div>
                    </div>
                  )}
                  {['SHIPPED', 'COMPLETED'].includes(selectedOrder.orderStatus) && (
                    <div className="flex items-start gap-3 ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 -ml-4">
                        <RotateCcw className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Shipped</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Your order is on the way</p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.orderStatus === 'COMPLETED' && (
                    <div className="flex items-start gap-3 ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 -ml-4">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Delivered</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Order completed successfully</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
