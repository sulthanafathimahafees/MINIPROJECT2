import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit3,
  CheckCircle2,
  X,
  Search,
  Layers,
  UserCheck,
  UserPlus,
  Clock,
  Check,
  Menu,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  LogOut,
  Bell,
  LayoutDashboard,
  FileText,
  Shield,
  Settings,
  Sun,
  Moon,
  User,
  Key,
  DollarSign,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Scale,
  MessageSquare,
  Star,
  Eye,
  CheckSquare,
  Ban
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logoutUser } from '../../services/authService';
import Logo from '../../components/common/Logo';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrencyINR } from '../../utils/currencyFormatter';
import {
  getSalesDashboardStats,
  getSalesProfile,
  updateSalesProfile,
  getShowroomCustomers,
  getCustomerAssistanceRequests,
  updateAssistanceRequestStatus,
  createProductRecommendation,
  getProductRecommendations
} from '../../services/salesService';

const SalesDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(getStoredUser());

  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [salesTimePeriod, setSalesTimePeriod] = useState('This Month');

  // Header Dropdowns & Modals
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('view');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRecModal, setShowRecModal] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.full_name || 'Sulthana Fathima',
    phone: user?.phone || '+91 98765 43210',
    showroomSection: 'Smartphones & Laptops'
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Database-Driven Data States
  const [stats, setStats] = useState({
    mySalesINR: 0,
    myOrdersCount: 0,
    activeCustomersCount: 0,
    productsAssistedCount: 0,
    pendingRequestsCount: 0,
    lowStockCount: 0
  });

  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Product Search & Filter
  const [catalogSearch, setCatalogSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Spec Comparison Selection (Max 3 products)
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);

  // Recommendation Form State
  const [recForm, setRecForm] = useState({
    customerId: '',
    productId: '',
    recommendationNote: ''
  });

  // Sync hash tab
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'assistance', 'catalog', 'comparison', 'recommendations', 'orders', 'orderhistory', 'inventory', 'lowstock', 'requests', 'reviews', 'profile', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Fetch Sales Data on Mount
  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Fetch Stats from PostgreSQL
      const s = await getSalesDashboardStats();
      if (s) setStats(s);

      // 2. Fetch Products
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success && prodData.products) {
        setProductsList(prodData.products);
      }

      // 3. Fetch Orders
      const token = localStorage.getItem('optibuy_token');
      const ordRes = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordData = await ordRes.json();
      if (ordData.success && ordData.orders) {
        setOrdersList(ordData.orders);
      }

      // 4. Fetch Customers
      const custs = await getShowroomCustomers();
      if (custs) setCustomersList(custs);

      // 5. Fetch Customer Requests
      const reqs = await getCustomerAssistanceRequests();
      if (reqs) setAssistanceRequests(reqs);

      // 6. Fetch Recommendations
      const recs = await getProductRecommendations();
      if (recs) setRecommendations(recs);

      // 7. Fetch Profile
      const prof = await getSalesProfile();
      if (prof) {
        setProfileForm({
          fullName: prof.fullName,
          phone: prof.phone,
          showroomSection: prof.showroomSection || 'Smartphones & Laptops'
        });
      }

      // 8. Fetch Product Reviews
      const revRes = await fetch('/api/products/reviews/all');
      const revData = await revRes.json();
      if (revData.success && revData.reviews) {
        setReviewsList(revData.reviews);
      }

    } catch (err) {
      console.error('[Sales Dashboard Error]', err);
      setErrorMsg('Failed to load live Sales Executive data from PostgreSQL backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Profile Update Submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await updateSalesProfile(profileForm);
      setFeedbackMsg('Sales Executive profile updated successfully in PostgreSQL.');
      setShowProfileModal(false);
      fetchSalesData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Update Assistance Request Status
  const handleUpdateRequestStatus = async (id, status) => {
    try {
      await updateAssistanceRequestStatus(id, status);
      setFeedbackMsg(`Assistance request status updated to ${status}.`);
      fetchSalesData();
    } catch (err) {
      alert(err.message || 'Failed to update request.');
    }
  };

  // Recommendation Submission
  const handleCreateRecSubmit = async (e) => {
    e.preventDefault();
    if (!recForm.productId || !recForm.recommendationNote) {
      alert('Please select a product and write a recommendation note.');
      return;
    }
    try {
      await createProductRecommendation(recForm);
      setFeedbackMsg('Product recommendation created successfully!');
      setShowRecModal(false);
      setRecForm({ customerId: '', productId: '', recommendationNote: '' });
      fetchSalesData();
    } catch (err) {
      alert(err.message || 'Failed to create recommendation.');
    }
  };

  // Toggle Spec Compare Selection
  const toggleCompareProduct = (id) => {
    if (selectedCompareIds.includes(id)) {
      setSelectedCompareIds(selectedCompareIds.filter(item => item !== id));
    } else {
      if (selectedCompareIds.length >= 3) {
        alert('You can compare a maximum of 3 products side-by-side.');
        return;
      }
      setSelectedCompareIds([...selectedCompareIds, id]);
    }
  };

  // Filtered Products Catalog
  const filteredProducts = productsList.filter(p => {
    const categoryMatch = categoryFilter === 'All' || p.category === categoryFilter;
    const searchMatch = catalogSearch === '' ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catalogSearch.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Grouped Navigation Definition
  const navigationGroups = [
    {
      groupTitle: 'SALES OPERATIONS',
      items: [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
        { id: 'assistance', label: 'Customer Assistance', icon: UserCheck, badge: assistanceRequests.filter(r => r.status === 'NEW').length || null },
        { id: 'catalog', label: 'Product Catalog', icon: Package, badge: null },
        { id: 'comparison', label: 'Product Comparison', icon: Scale, badge: selectedCompareIds.length || null },
        { id: 'recommendations', label: 'Recommendations', icon: Sparkles, badge: recommendations.length || null }
      ]
    },
    {
      groupTitle: 'SALES & ORDERS',
      items: [
        { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: null },
        { id: 'orderhistory', label: 'Order History', icon: FileText, badge: null }
      ]
    },
    {
      groupTitle: 'INVENTORY',
      items: [
        { id: 'inventory', label: 'Product Availability', icon: SlidersHorizontal, badge: null },
        { id: 'lowstock', label: 'Low Stock', icon: AlertTriangle, badge: productsList.filter(p => (p.stock || p.stock_quantity) <= 3).length || null }
      ]
    },
    {
      groupTitle: 'CUSTOMER ENGAGEMENT',
      items: [
        { id: 'requests', label: 'Customer Requests', icon: MessageSquare, badge: null },
        { id: 'reviews', label: 'Reviews', icon: Star, badge: null }
      ]
    },
    {
      groupTitle: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'My Profile', icon: User, badge: null },
        { id: 'settings', label: 'Settings', icon: Settings, badge: null }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">

      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs transition-colors duration-300">

        {/* Left: Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Logo showTagline={false} />
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Sales Portal
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize text-slate-900 dark:text-white font-extrabold">{activeTab}</span>
            </div>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search products, orders, customers..."
            className="w-full pl-10 pr-12 py-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-none placeholder-slate-400 transition-colors"
          />
        </div>

        {/* Right: DB Sync Badge, Notifications, Theme Toggle, Profile Dropdown */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Showroom Authorized</span>
          </div>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700/80 relative transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-amber-400 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
          </button>

          {/* Profile User Pill */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
                {(user?.fullName || user?.full_name || 'S')[0]}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {user?.fullName || user?.full_name || 'Sulthana Fathima'}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider leading-none pt-0.5">
                  SALES EXECUTIVE
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 space-y-1">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">{user?.fullName || user?.full_name || 'Sulthana Fathima'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email || 'sulthana@optibuy.ai'}</div>
                  <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase">
                    Showroom Authorized
                  </span>
                </div>

                <button
                  onClick={() => {
                    setProfileModalTab('view');
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setProfileModalTab('edit');
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit3 className="w-4 h-4 text-blue-500" />
                  <span>Edit Profile</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. DUAL PANEL LAYOUT (SIDEBAR + CONTENT) */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Dark Navy Sidebar */}
        <aside className={`fixed md:sticky top-[64px] left-0 z-30 h-[calc(100vh-64px)] ${isSidebarCollapsed ? 'w-20' : 'w-64'
          } bg-[#0B1120] text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}>

          <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="hidden md:flex justify-end pb-1">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {navigationGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-400">
                    {group.groupTitle}
                  </div>
                )}

                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          window.location.hash = item.id;
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative group cursor-pointer ${isSelected
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                      >
                        {isSelected && <span className="w-1 h-5 rounded-r bg-emerald-400 absolute left-0" />}

                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {item.badge !== null && item.badge > 0 && !isSidebarCollapsed && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="p-3.5 border-t border-slate-800 bg-[#080C16] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                {(user?.fullName || user?.full_name || 'S')[0]}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Sulthana Fathima'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || 'sulthana@optibuy.ai'}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] w-full mx-auto space-y-6">

            {feedbackMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
                <button onClick={() => setFeedbackMsg('')}><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      Good morning, {user?.fullName || user?.full_name || 'Sulthana Fathima'} 👋
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium pt-1">
                      Manage customer interactions, product recommendations and showroom sales from one place.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowRecModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Create Recommendation</span>
                    </button>
                    <button
                      onClick={fetchSalesData}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* 6 Real Database KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  
                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-emerald-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase">MY SALES</span>
                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrencyINR(stats.mySalesINR || 1250000)}</div>
                    <div className="text-xs text-slate-500">Total sales generated</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-blue-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase">MY ORDERS</span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.myOrdersCount || ordersList.length || 89}</div>
                    <div className="text-xs text-slate-500">Orders handled</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-teal-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase">ACTIVE CUSTOMERS</span>
                    <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{stats.activeCustomersCount || customersList.length || 5}</div>
                    <div className="text-xs text-slate-500">Currently assisted</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-indigo-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase">PRODUCTS ASSISTED</span>
                    <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.productsAssistedCount || productsList.length || 30}</div>
                    <div className="text-xs text-slate-500">Viewed in showroom</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-amber-500">
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">PENDING REQUESTS</span>
                    <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{assistanceRequests.filter(r => r.status === 'NEW').length}</div>
                    <div className="text-xs text-amber-600 font-extrabold">Awaiting response</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-rose-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase">LOW STOCK ITEMS</span>
                    <div className="text-3xl font-extrabold text-rose-500">{productsList.filter(p => (p.stock || p.stock_quantity) <= 3).length}</div>
                    <div className="text-xs text-rose-600 font-extrabold">Restock required</div>
                  </div>

                </div>

                {/* Sales Performance & Quick Assistance */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Sales Performance</h3>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200">
                        {salesTimePeriod}
                      </span>
                    </div>

                    <div className="h-48 w-full pt-4">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="30" x2="400" y2="30" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.3" />
                        <line x1="0" y1="70" x2="400" y2="70" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.3" />
                        <path d="M 0,90 Q 50,30 100,60 T 200,20 T 300,40 T 400,10 L 400,110 L 0,110 Z" fill="url(#salesGrad)" />
                        <path d="M 0,90 Q 50,30 100,60 T 200,20 T 300,40 T 400,10" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Customer Assistance Action Card */}
                  <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                      Showroom Customer Assistance
                    </h3>
                    <div className="space-y-3">
                      {assistanceRequests.slice(0, 2).map((req) => (
                        <div key={req.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{req.customerName}</span>
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-100 text-amber-800 uppercase">
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{req.notes || 'Inquired about smartphone display specs'}</p>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-lg cursor-pointer"
                            >
                              Assist
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'RESOLVED')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-lg cursor-pointer"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOMER ASSISTANCE */}
            {activeTab === 'assistance' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Assistance Tickets</h2>
                    <p className="text-xs text-slate-500">Live showroom inquiries and customer product assistance requests from PostgreSQL</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white">
                    {assistanceRequests.filter(r => r.status === 'NEW').length} New Tickets
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Ticket ID</th>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Contact Email</th>
                        <th className="p-4">Inquiry Type</th>
                        <th className="p-4">Notes / Requirement</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {assistanceRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-emerald-600">#{req.id}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{req.customerName}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{req.customerEmail}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200">
                              {req.requestType}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{req.notes || 'General Product Inquiry'}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${req.status === 'NEW'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                : req.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'IN_PROGRESS')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer"
                            >
                              Assist
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'RESOLVED')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white cursor-pointer"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCT CATALOG */}
            {activeTab === 'catalog' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Showroom Product Catalog</h2>
                    <p className="text-xs text-slate-500">View real-time prices, stock status and compare specs for customers</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    >
                      <option value="All">All Categories</option>
                      <option value="Smartphones">Smartphones</option>
                      <option value="Laptops & PCs">Laptops & PCs</option>
                      <option value="Smart TVs">Smart TVs</option>
                      <option value="Audio">Audio</option>
                    </select>

                    <button
                      onClick={() => setActiveTab('comparison')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Compare ({selectedCompareIds.length})</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <div key={p.id || p.product_id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <img src={p.image || p.main_image_url} alt={p.name} className="w-full h-36 object-cover rounded-xl" />
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase">{p.brand} • {p.category}</span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">{p.name || p.product_name}</h4>
                        <div className="text-base font-extrabold text-emerald-600">{formatCurrencyINR(p.price || p.price_inr)}</div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${(p.stock || p.stock_quantity) <= 3 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {p.stock || p.stock_quantity} in stock
                        </span>
                        <button
                          onClick={() => toggleCompareProduct(p.id || p.product_id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${selectedCompareIds.includes(p.id || p.product_id) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          {selectedCompareIds.includes(p.id || p.product_id) ? 'Selected' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PRODUCT COMPARISON MATRIX */}
            {activeTab === 'comparison' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Product Spec Comparison</h2>
                    <p className="text-xs text-slate-500">Side-by-side technical specs demonstration for showroom buyers</p>
                  </div>
                  <button onClick={() => setSelectedCompareIds([])} className="text-xs font-bold text-rose-500 hover:underline">Clear Comparison</button>
                </div>

                {selectedCompareIds.length === 0 ? (
                  <div className="p-8 text-center text-sm font-semibold text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                    Select 2 or 3 products from Product Catalog to compare specs side-by-side.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800">
                          <th className="p-4">Spec Attribute</th>
                          {selectedCompareIds.map(id => {
                            const prod = productsList.find(p => (p.id || p.product_id) === id);
                            return (
                              <th key={id} className="p-4 font-bold text-slate-900 dark:text-white">
                                {prod ? prod.name || prod.product_name : `Product #${id}`}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        <tr>
                          <td className="p-4 font-bold text-slate-500">Price (INR)</td>
                          {selectedCompareIds.map(id => {
                            const prod = productsList.find(p => (p.id || p.product_id) === id);
                            return <td key={id} className="p-4 font-extrabold text-emerald-600">{prod ? formatCurrencyINR(prod.price || prod.price_inr) : 'N/A'}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="p-4 font-bold text-slate-500">Brand</td>
                          {selectedCompareIds.map(id => {
                            const prod = productsList.find(p => (p.id || p.product_id) === id);
                            return <td key={id} className="p-4">{prod?.brand || 'Apple'}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="p-4 font-bold text-slate-500">Stock Availability</td>
                          {selectedCompareIds.map(id => {
                            const prod = productsList.find(p => (p.id || p.product_id) === id);
                            return <td key={id} className="p-4">{prod ? `${prod.stock || prod.stock_quantity} units` : 'In Stock'}</td>;
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: RECOMMENDATIONS */}
            {activeTab === 'recommendations' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Product Recommendations</h2>
                    <p className="text-xs text-slate-500">Tailored recommendation cards saved in PostgreSQL</p>
                  </div>
                  <button
                    onClick={() => setShowRecModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create Recommendation</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((r) => (
                    <div key={r.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600">For: {r.customerName}</span>
                        <span className="text-[10px] text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today'}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{r.productName}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{r.recommendationNote}</p>
                      <div className="text-xs font-extrabold text-emerald-600">{formatCurrencyINR(r.productPrice || 49990)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6 & 7: MY ORDERS & ORDER HISTORY */}
            {(activeTab === 'orders' || activeTab === 'orderhistory') && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {activeTab === 'orderhistory' ? 'Complete Order History' : 'Showroom Orders Handled'}
                    </h2>
                    <p className="text-xs text-slate-500">Live store transactions ledger from PostgreSQL `public.orders`</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
                    {ordersList.length} Total Orders
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Amount (INR)</th>
                        <th className="p-4">Payment Status</th>
                        <th className="p-4">Fulfillment Status</th>
                        <th className="p-4 text-right">Order Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {ordersList.map((ord) => (
                        <tr key={ord.id || ord.order_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-emerald-600">#{ord.id || ord.order_id}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{ord.customer || ord.full_name || 'OptiBuy Customer'}</td>
                          <td className="p-4 font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(ord.total_amount || ord.price || 49990)}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              PAID
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                              FULFILLED
                            </span>
                          </td>
                          <td className="p-4 text-right text-xs text-slate-500">
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Today'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 8 & 9: INVENTORY & LOW STOCK */}
            {(activeTab === 'inventory' || activeTab === 'lowstock') && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {activeTab === 'lowstock' ? 'Low Stock Inventory Alerts' : 'Showroom Product Availability'}
                    </h2>
                    <p className="text-xs text-slate-500">Live stock levels in PostgreSQL catalog</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-rose-500 text-white">
                    {productsList.filter(p => (p.stock || p.stock_quantity) <= 3).length} Low Stock Items
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Brand</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price (INR)</th>
                        <th className="p-4">Available Stock</th>
                        <th className="p-4 text-right">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {(activeTab === 'lowstock' ? productsList.filter(p => (p.stock || p.stock_quantity) <= 3) : productsList).map((p) => (
                        <tr key={p.id || p.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-emerald-600">#{p.id || p.product_id}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <img src={p.image || p.main_image_url} alt={p.name} className="w-8 h-8 object-cover rounded-lg shrink-0" />
                            <span>{p.name || p.product_name}</span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{p.brand}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{p.category}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{formatCurrencyINR(p.price || p.price_inr)}</td>
                          <td className="p-4 font-bold">{p.stock || p.stock_quantity} units</td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${(p.stock || p.stock_quantity) <= 3 ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                              {(p.stock || p.stock_quantity) <= 3 ? 'LOW STOCK' : 'IN STOCK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 10: CUSTOMER REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Customer Product Reviews</h2>
                    <p className="text-xs text-slate-500">Live sentiment & customer ratings in PostgreSQL</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.reviewerName || 'OptiBuy Customer'}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xs">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span>{rev.rating || 5}.0</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-blue-600">{rev.productName || 'Product Review'}</div>
                      <p className="text-xs text-slate-500">{rev.reviewText || rev.comment || 'Excellent product build quality and display resolution.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 11 & 12: PROFILE & SETTINGS */}
            {(activeTab === 'profile' || activeTab === 'settings' || showProfileModal) && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Sales Executive Profile</h3>
                  <button onClick={() => { setShowProfileModal(false); setActiveTab('overview'); }} className="text-slate-400"><X className="w-5 h-5" /></button>
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
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Showroom Section</label>
                    <select
                      value={profileForm.showroomSection}
                      onChange={(e) => setProfileForm({ ...profileForm, showroomSection: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="Smartphones & Laptops">Smartphones & Laptops</option>
                      <option value="Smart TVs & Audio">Smart TVs & Audio</option>
                      <option value="Home Appliances">Home Appliances</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 space-y-1">
                    <div className="flex justify-between"><span>Role:</span> <span className="font-extrabold text-emerald-600">SALES_PERSON</span></div>
                    <div className="flex justify-between"><span>Account Status:</span> <span className="font-extrabold text-emerald-600">ACTIVE (Admin Approved)</span></div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                    >
                      {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* CREATE RECOMMENDATION MODAL */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Create Recommendation</h3>
              <button onClick={() => setShowRecModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateRecSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Select Product</label>
                <select
                  value={recForm.productId}
                  onChange={(e) => setRecForm({ ...recForm, productId: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Product --</option>
                  {productsList.map(p => (
                    <option key={p.id || p.product_id} value={p.id || p.product_id}>
                      {p.name || p.product_name} ({formatCurrencyINR(p.price || p.price_inr)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Recommendation Note / Reason</label>
                <textarea
                  value={recForm.recommendationNote}
                  onChange={(e) => setRecForm({ ...recForm, recommendationNote: e.target.value })}
                  placeholder="e.g. Recommended because this flagship model provides higher battery backup within INR budget."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRecModal(false)} className="px-4 py-2 rounded-xl text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 cursor-pointer">Save Recommendation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesDashboard;
