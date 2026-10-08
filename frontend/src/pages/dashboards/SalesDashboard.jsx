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
  Ban,
  Target,
  Zap,
  LifeBuoy,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  assignAssistanceRequest,
  createProductRecommendation,
  getProductRecommendations,
  getTailoredMatches,
  getSalesInventory
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

  // New states for Sprint 5
  const [activitiesList, setActivitiesList] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activityType: 'CUSTOMER_INTERACTION',
    customerId: '',
    productId: '',
    details: ''
  });
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Product Search & Filter
  const [catalogSearch, setCatalogSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Spec Comparison Selection (Max 3 products)
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);

  // Assistance Filter & Action States
  const [assistanceStatusFilter, setAssistanceStatusFilter] = useState('ALL');
  const [assistanceActionLoading, setAssistanceActionLoading] = useState(false);

  // Inventory Filter & Search States
  const [inventoryStockFilter, setInventoryStockFilter] = useState('ALL');
  const [inventorySearch, setInventorySearch] = useState('');

  // Tailored Recommendation State
  const [tailoredCustomer, setTailoredCustomer] = useState(null);
  const [tailoredMatchesList, setTailoredMatchesList] = useState([]);
  const [tailoredMatchesLoading, setTailoredMatchesLoading] = useState(false);
  const [showTailoredModal, setShowTailoredModal] = useState(false);

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

      // 2. Fetch Products (Sales-specific inventory with stock info)
      const prodRes = await fetch('/api/products/sales/inventory');
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

  // Assign Assistance Request to Self
  const handleAssignRequest = async (requestId) => {
    try {
      setAssistanceActionLoading(true);
      await assignAssistanceRequest(requestId, 'IN_PROGRESS');
      setFeedbackMsg(`Assistance request #${requestId} assigned to you.`);
      fetchSalesData();
    } catch (err) {
      alert(err.message || 'Failed to assign request.');
    } finally {
      setAssistanceActionLoading(false);
    }
  };

  // Update Assistance Request Status
  const handleUpdateRequestStatus = async (id, status) => {
    try {
      setAssistanceActionLoading(true);
      await updateAssistanceRequestStatus(id, status);
      setFeedbackMsg(`Assistance request #${id} status updated to ${status}.`);
      fetchSalesData();
    } catch (err) {
      alert(err.message || 'Failed to update request.');
    } finally {
      setAssistanceActionLoading(false);
    }
  };

  // Open Tailored Recommendations with OptiBuy Match Scores for Customer
  const handleOpenTailoredRecommendations = async (customerOrReq) => {
    const customerId = customerOrReq.customerId || customerOrReq.id;
    const customerName = customerOrReq.customerName || customerOrReq.fullName || 'Showroom Customer';
    
    setTailoredCustomer({
      id: customerId,
      name: customerName,
      email: customerOrReq.customerEmail || customerOrReq.email || '',
      phone: customerOrReq.customerPhone || customerOrReq.phone || '',
      preferredCategory: customerOrReq.preferredCategory || 'Smartphones',
      preferredBrand: customerOrReq.preferredBrand || 'All Brands',
      budgetMin: customerOrReq.budgetMin,
      budgetMax: customerOrReq.budgetMax,
      preferredFeatures: customerOrReq.preferredFeatures || []
    });

    setRecForm({
      customerId: customerId,
      productId: customerOrReq.productId || '',
      recommendationNote: customerOrReq.notes ? `Tailored recommendation for inquiry: "${customerOrReq.notes}". ` : ''
    });

    setShowTailoredModal(true);
    setTailoredMatchesLoading(true);

    try {
      const data = await getTailoredMatches(customerId);
      if (data.success && data.products) {
        setTailoredMatchesList(data.products);
      }
    } catch (err) {
      console.error('[Tailored Matches Error]', err);
    } finally {
      setTailoredMatchesLoading(false);
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
      setFeedbackMsg('Product recommendation created successfully and delivered to customer!');
      setShowRecModal(false);
      setShowTailoredModal(false);
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

  // Filtered Assistance Requests by Status Tab
  const filteredAssistanceRequests = assistanceRequests.filter(r => {
    if (assistanceStatusFilter === 'ALL') return true;
    return r.status === assistanceStatusFilter;
  });

  // Filtered Showroom Inventory by Stock Status & Search
  const filteredInventoryList = productsList.filter(p => {
    const stock = Number(p.stock != null ? p.stock : (p.stock_quantity != null ? p.stock_quantity : 0));
    if (inventoryStockFilter === 'LOW_STOCK' && (stock > 5 || stock === 0)) return false;
    if (inventoryStockFilter === 'OUT_OF_STOCK' && stock > 0) return false;
    if (inventorySearch.trim()) {
      const term = inventorySearch.toLowerCase();
      const name = (p.name || p.product_name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const model = (p.modelNumber || p.model_number || '').toLowerCase();
      if (!name.includes(term) && !brand.includes(term) && !cat.includes(term) && !model.includes(term)) {
        return false;
      }
    }
    return true;
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
          <div className="optibuy-container space-y-6">

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
                      Good morning, {user?.fullName || user?.full_name || 'Showroom Executive'} 👋
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium pt-1">
                      Showroom Floor Sales Operations: Manage customer assistance requests, tailored recommendations, and monitor real stock availability.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowRecModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Create Recommendation</span>
                    </button>
                    <button
                      onClick={fetchSalesData}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </div>

                {/* 6 Real Database KPI Cards (Zero Fabricated Data) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  
                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-emerald-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">MY SALES</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrencyINR(stats.mySalesINR || 0)}</div>
                    <div className="text-xs text-slate-500">Attributed showroom sales</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-blue-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">MY ORDERS</span>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.myOrdersCount || 0}</div>
                    <div className="text-xs text-slate-500">Completed store orders</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-teal-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">ACTIVE CUSTOMERS</span>
                    <div className="text-3xl font-black text-teal-600 dark:text-teal-400">{stats.activeCustomersCount || customersList.length || 0}</div>
                    <div className="text-xs text-slate-500">Registered showroom visitors</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-indigo-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">CATALOG PRODUCTS</span>
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.productsAssistedCount || productsList.length || 0}</div>
                    <div className="text-xs text-slate-500">Active showroom models</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-amber-500">
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">PENDING INQUIRIES</span>
                    <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.pendingRequestsCount ?? assistanceRequests.filter(r => r.status === 'NEW').length}</div>
                    <div className="text-xs text-amber-600 font-extrabold">Awaiting response</div>
                  </div>

                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs border-t-4 border-t-rose-500">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">LOW STOCK ALERTS</span>
                    <div className="text-3xl font-black text-rose-500">{stats.lowStockCount ?? productsList.filter(p => (p.stock || p.stock_quantity) <= 5 && (p.stock || p.stock_quantity) > 0).length}</div>
                    <div className="text-xs text-rose-600 font-extrabold">≤ 5 units left</div>
                  </div>

                </div>

                {/* Sales Target & Operational Status Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Monthly Sales Target Card */}
                  <div className="lg:col-span-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Monthly Sales Target</h3>
                          <p className="text-xs text-slate-500">Official monthly revenue goal from showroom profile</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {stats.targetProgressPct || 0}% Achieved
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-400">Achieved Sales:</span>
                          <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {formatCurrencyINR(stats.mySalesINR || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-400">Monthly Target:</span>
                          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrencyINR(stats.monthlyTargetINR || 750000)}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, stats.targetProgressPct || 0)}%` }}
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 leading-relaxed">
                        {(stats.mySalesINR || 0) === 0 ? (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>No Completed Sales Yet:</strong> No finalized showroom orders have been attributed to your account for this monthly period yet. Customer assistance inquiries and product recommendations do not count as completed sales until an order is placed and finalized.
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              You have achieved <strong>{stats.targetProgressPct}%</strong> of your monthly showroom target with {stats.myOrdersCount || 0} completed orders handled.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assistance Status & Inventory Health Summary */}
                  <div className="lg:col-span-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <LifeBuoy className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Assistance & Stock Health</h3>
                          <p className="text-xs text-slate-500">Live operational queues across showroom floor</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('assistance')}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Tickets</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                        <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Pending</span>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                          {stats.pendingRequestsCount ?? assistanceRequests.filter(r => r.status === 'NEW').length}
                        </div>
                        <span className="text-[10px] text-slate-500">Unanswered</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">In Progress</span>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                          {stats.inProgressRequestsCount ?? assistanceRequests.filter(r => r.status === 'IN_PROGRESS').length}
                        </div>
                        <span className="text-[10px] text-slate-500">Assisting</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Completed</span>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {stats.resolvedRequestsCount ?? assistanceRequests.filter(r => r.status === 'RESOLVED').length}
                        </div>
                        <span className="text-[10px] text-slate-500">Resolved</span>
                      </div>
                    </div>

                    {/* Inventory Status Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Inventory Availability Status</span>
                        <span className="text-[11px] text-slate-500">
                          {stats.inStockCount || productsList.filter(p => (p.stock || p.stock_quantity) > 5).length} In Stock • {stats.lowStockCount || productsList.filter(p => (p.stock || p.stock_quantity) <= 5 && (p.stock || p.stock_quantity) > 0).length} Low • {stats.outOfStockCount || productsList.filter(p => (p.stock || p.stock_quantity) === 0).length} Out
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setActiveTab('inventory'); setInventoryStockFilter('ALL'); }}
                          className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-center cursor-pointer transition-colors"
                        >
                          Catalog ({productsList.length})
                        </button>
                        <button
                          onClick={() => { setActiveTab('inventory'); setInventoryStockFilter('LOW_STOCK'); }}
                          className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-center cursor-pointer transition-colors"
                        >
                          Low Stock ({stats.lowStockCount || productsList.filter(p => (p.stock || p.stock_quantity) <= 5 && (p.stock || p.stock_quantity) > 0).length})
                        </button>
                        <button
                          onClick={() => { setActiveTab('inventory'); setInventoryStockFilter('OUT_OF_STOCK'); }}
                          className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 text-center cursor-pointer transition-colors"
                        >
                          Out of Stock ({stats.outOfStockCount || productsList.filter(p => (p.stock || p.stock_quantity) === 0).length})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Showroom Customer Assistance Quick Section */}
                <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Active Showroom Customer Inquiries</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('assistance')}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage All Tickets</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {assistanceRequests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No customer assistance requests submitted yet.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Customer inquiries submitted from the showroom floor will appear here in real-time.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assistanceRequests.slice(0, 3).map((req) => (
                        <div key={req.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{req.customerName}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${
                                req.status === 'NEW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                                req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {req.notes || 'Inquired about product specifications'}
                            </p>
                            {req.productName && (
                              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                Product: {req.productName}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            {req.status === 'NEW' && (
                              <button
                                onClick={() => handleAssignRequest(req.id)}
                                disabled={assistanceActionLoading}
                                className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-colors"
                              >
                                Accept
                              </button>
                            )}
                            {req.status === 'IN_PROGRESS' && (
                              <>
                                <button
                                  onClick={() => handleOpenTailoredRecommendations(req)}
                                  className="px-2.5 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Tailored</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, 'RESOLVED')}
                                  disabled={assistanceActionLoading}
                                  className="px-2.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-colors"
                                >
                                  Resolve
                                </button>
                              </>
                            )}
                            {req.status === 'RESOLVED' && (
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOMER ASSISTANCE (Full Management with Preferences, OptiBuy Match Scores & Transitions) */}
            {(activeTab === 'assistance' || activeTab === 'requests') && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                
                {/* Header & Status Filter Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Assistance Requests</h2>
                    <p className="text-xs text-slate-500">Live showroom inquiries with customer requirements, budget preferences, and status workflow</p>
                  </div>

                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'ALL', label: 'All Requests', count: assistanceRequests.length },
                      { id: 'NEW', label: 'Pending', count: assistanceRequests.filter(r => r.status === 'NEW').length },
                      { id: 'IN_PROGRESS', label: 'In Progress', count: assistanceRequests.filter(r => r.status === 'IN_PROGRESS').length },
                      { id: 'RESOLVED', label: 'Completed', count: assistanceRequests.filter(r => r.status === 'RESOLVED').length },
                      { id: 'CANCELLED', label: 'Cancelled', count: assistanceRequests.filter(r => r.status === 'CANCELLED').length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setAssistanceStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          assistanceStatusFilter === tab.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          assistanceStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                {filteredAssistanceRequests.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No Assistance Requests Found</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {assistanceStatusFilter === 'ALL'
                        ? 'There are currently no customer assistance tickets recorded in the PostgreSQL database.'
                        : `No assistance requests match the status filter '${assistanceStatusFilter}'.`}
                    </p>
                    {assistanceStatusFilter !== 'ALL' && (
                      <button
                        onClick={() => setAssistanceStatusFilter('ALL')}
                        className="px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 cursor-pointer"
                      >
                        Reset Status Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAssistanceRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        {/* Ticket Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              #{req.id}
                            </span>
                            <span className="font-extrabold text-base text-slate-900 dark:text-white">
                              {req.customerName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {req.customerEmail} • {req.customerPhone || 'No Phone'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Assigned Executive Badge */}
                            {req.salesPersonId === user?.userId ? (
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Assigned to You
                              </span>
                            ) : req.assignedSalesPerson ? (
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Assigned: {req.assignedSalesPerson}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Unassigned Floor Request
                              </span>
                            )}

                            {/* Status Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                              req.status === 'NEW'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse dark:bg-amber-950 dark:text-amber-300'
                                : req.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                                  : req.status === 'RESOLVED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {/* Ticket Details & Requirements */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8 space-y-3">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Customer Stated Requirements / Inquiry:
                              </span>
                              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium mt-1 leading-relaxed bg-white dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                "{req.notes || 'Customer requested assistance with consumer electronics selection and showroom pricing.'}"
                              </p>
                            </div>

                            {/* Customer Stored Preferences Breakdown */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                              {req.preferredCategory && (
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold">
                                  Category: {req.preferredCategory}
                                </span>
                              )}
                              {req.preferredBrand && (
                                <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 font-bold">
                                  Brand: {req.preferredBrand}
                                </span>
                              )}
                              {(req.budgetMin != null || req.budgetMax != null) && (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                                  Budget: {req.budgetMin ? formatCurrencyINR(req.budgetMin) : '₹0'} - {req.budgetMax ? formatCurrencyINR(req.budgetMax) : 'Open'}
                                </span>
                              )}
                              {Array.isArray(req.preferredFeatures) && req.preferredFeatures.map((feat, fIdx) => (
                                <span key={fIdx} className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Target Product (if inquiry references a specific catalog product) */}
                          <div className="md:col-span-4 bg-white dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                            {req.productImage ? (
                              <img src={req.productImage} alt={req.productName} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0 space-y-1">
                              <span className="text-[10px] font-black uppercase text-slate-400">Target Product</span>
                              <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                {req.productName || 'General Product Inquiry'}
                              </div>
                              {req.productPrice && (
                                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  {formatCurrencyINR(req.productPrice)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ticket Footer & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Recently'}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            {/* NEW: Accept or Cancel */}
                            {req.status === 'NEW' && (
                              <>
                                <button
                                  onClick={() => handleAssignRequest(req.id)}
                                  disabled={assistanceActionLoading}
                                  className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs transition-colors"
                                >
                                  Accept & Assist
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, 'CANCELLED')}
                                  disabled={assistanceActionLoading}
                                  className="px-3 py-2 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 cursor-pointer transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {/* IN_PROGRESS: Generate Tailored Recommendations or Mark Resolved */}
                            {req.status === 'IN_PROGRESS' && (
                              <>
                                <button
                                  onClick={() => handleOpenTailoredRecommendations(req)}
                                  className="px-4 py-2 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                                >
                                  <Sparkles className="w-4 h-4" />
                                  <span>Tailored Recommendation</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, 'RESOLVED')}
                                  disabled={assistanceActionLoading}
                                  className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Mark Completed</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, 'CANCELLED')}
                                  disabled={assistanceActionLoading}
                                  className="px-3 py-2 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 cursor-pointer transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {/* RESOLVED: Re-open or recommend */}
                            {req.status === 'RESOLVED' && (
                              <>
                                <button
                                  onClick={() => handleOpenTailoredRecommendations(req)}
                                  className="px-3.5 py-1.5 rounded-xl font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer"
                                >
                                  View / Add Recommendation
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, 'IN_PROGRESS')}
                                  disabled={assistanceActionLoading}
                                  className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                                >
                                  Reopen Ticket
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

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
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Product Recommendations</h2>
                    <p className="text-xs text-slate-500">Tailored recommendation cards saved in PostgreSQL database</p>
                  </div>
                  <button
                    onClick={() => setShowRecModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create Recommendation</span>
                  </button>
                </div>

                {recommendations.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No Product Recommendations Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      You have not created any tailored recommendations yet. Open an in-progress customer inquiry from the Customer Assistance tab to generate personalized recommendations with OptiBuy Match Scores.
                    </p>
                    <button
                      onClick={() => setShowRecModal(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 cursor-pointer shadow-xs"
                    >
                      Create First Recommendation
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((r) => (
                      <div key={r.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">For: {r.customerName}</span>
                            <span className="text-[10px] text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today'}</span>
                          </div>
                          <div className="flex items-center gap-3 pt-1">
                            {r.productImage && (
                              <img src={r.productImage} alt={r.productName} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                            )}
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{r.productName}</h4>
                              {r.productPrice != null && (
                                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrencyINR(r.productPrice)}</div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                            "{r.recommendationNote}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6 & 7: MY ORDERS & ORDER HISTORY */}
            {(activeTab === 'orders' || activeTab === 'orderhistory') && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
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

                {ordersList.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No Orders Registered Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      No customer orders have been finalized under your salesperson profile for this period. Completed customer purchases will automatically update your sales figures here.
                    </p>
                  </div>
                ) : (
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
                            <td className="p-4 font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(ord.total_amount || ord.price || 0)}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {ord.payment_status || 'PAID'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                                {ord.order_status || 'FULFILLED'}
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
                )}
              </div>
            )}

            {/* TAB 8 & 9: INVENTORY & LOW STOCK (Live stock with filters & Read-only enforcement) */}
            {(activeTab === 'inventory' || activeTab === 'lowstock') && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {activeTab === 'lowstock' ? 'Low Stock Inventory Alerts' : 'Showroom Product Availability'}
                    </h2>
                    <p className="text-xs text-slate-500">Real-time stock quantities from PostgreSQL product inventory</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {productsList.filter(p => Number(p.stock != null ? p.stock : p.stock_quantity) <= 5 && Number(p.stock != null ? p.stock : p.stock_quantity) > 0).length} Low Stock
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {productsList.filter(p => Number(p.stock != null ? p.stock : p.stock_quantity) === 0).length} Out of Stock
                    </span>
                  </div>
                </div>

                {/* Read-Only Notice Banner for Sales Executives */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="font-extrabold text-blue-700 dark:text-blue-300">
                      Showroom Floor Inventory View (Read-Only)
                    </div>
                    <p>
                      Sales Executives have real-time visibility into product inventory to guide showroom customers on availability and delivery times. Modifying stock levels, adjusting unit counts, or updating supplier pricing is strictly restricted to Showroom Administrators.
                    </p>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'ALL', label: 'All Products', count: productsList.length },
                      { id: 'LOW_STOCK', label: 'Low Stock (≤ 5)', count: productsList.filter(p => Number(p.stock != null ? p.stock : p.stock_quantity) <= 5 && Number(p.stock != null ? p.stock : p.stock_quantity) > 0).length },
                      { id: 'OUT_OF_STOCK', label: 'Out of Stock (0)', count: productsList.filter(p => Number(p.stock != null ? p.stock : p.stock_quantity) === 0).length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setInventoryStockFilter(tab.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          inventoryStockFilter === tab.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          inventoryStockFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search showroom inventory..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Inventory Table */}
                {filteredInventoryList.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No Matching Inventory Items</h4>
                    <p className="text-xs text-slate-500">No products match your selected stock filter or search keyword.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                        <tr>
                          <th className="p-4">ID</th>
                          <th className="p-4">Product Name & Model</th>
                          <th className="p-4">Brand</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price (INR)</th>
                          <th className="p-4">Available Stock</th>
                          <th className="p-4 text-right">Stock Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {filteredInventoryList.map((p) => {
                          const stock = Number(p.stock != null ? p.stock : (p.stock_quantity != null ? p.stock_quantity : 0));
                          return (
                            <tr key={p.id || p.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-4 font-mono font-bold text-emerald-600">#{p.id || p.product_id}</td>
                              <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                {p.image || p.main_image_url ? (
                                  <img src={p.image || p.main_image_url} alt={p.name} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-extrabold">{p.name || p.product_name}</div>
                                  {(p.modelNumber || p.model_number) && (
                                    <div className="text-[11px] text-slate-400 font-mono font-medium">{p.modelNumber || p.model_number}</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-slate-600 dark:text-slate-300">{p.brand}</td>
                              <td className="p-4 text-slate-600 dark:text-slate-300">{p.category}</td>
                              <td className="p-4 font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(p.price || p.price_inr)}</td>
                              <td className="p-4 font-black">
                                <span className={stock === 0 ? 'text-rose-600 dark:text-rose-400' : stock <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                  {stock} units
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                                  stock === 0
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                    : stock <= 5
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {stock === 0 ? 'OUT OF STOCK' : stock <= 5 ? 'LOW STOCK' : 'IN STOCK'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

      {/* CREATE GENERAL RECOMMENDATION MODAL */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Create Recommendation</h3>
              <button onClick={() => setShowRecModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateRecSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Select Customer (Optional)</label>
                <select
                  value={recForm.customerId}
                  onChange={(e) => setRecForm({ ...recForm, customerId: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">-- General Showroom Visitor --</option>
                  {customersList.map(c => (
                    <option key={c.id || c.userId} value={c.id || c.userId}>
                      {c.name || c.fullName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

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
                  placeholder="e.g. Recommended because this model provides superior display quality and battery life within INR budget."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRecModal(false)} className="px-4 py-2 rounded-xl text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer transition-colors">Save Recommendation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAILORED RECOMMENDATIONS MODAL (OptiBuy Match Score Engine) */}
      {showTailoredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Tailored Recommendations Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reusing OptiBuy Product Match Score Algorithm for {tailoredCustomer?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTailoredModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Stated Requirements & Preferences Banner */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                <span>Customer Preferences & Budget Constraints</span>
                <span className="text-[11px] text-purple-700 dark:text-purple-400">{tailoredCustomer?.email}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 font-bold text-purple-700 dark:text-purple-300">
                  Category: {tailoredCustomer?.preferredCategory || 'Any'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 font-bold text-purple-700 dark:text-purple-300">
                  Brand: {tailoredCustomer?.preferredBrand || 'Any'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 font-bold text-purple-700 dark:text-purple-300">
                  Budget: {tailoredCustomer?.budgetMin ? formatCurrencyINR(tailoredCustomer.budgetMin) : '₹0'} - {tailoredCustomer?.budgetMax ? formatCurrencyINR(tailoredCustomer.budgetMax) : 'Open'}
                </span>
                {Array.isArray(tailoredCustomer?.preferredFeatures) && tailoredCustomer.preferredFeatures.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-[11px] font-semibold">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Match Scores List */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Top Catalog Matches (Calculated Match Scores)
              </span>

              {tailoredMatchesLoading ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Evaluating showroom inventory with OptiBuy Match Scoring...</p>
                </div>
              ) : tailoredMatchesList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold">No active products found matching customer criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {tailoredMatchesList.slice(0, 4).map((item) => (
                    <div
                      key={item.id || item.productId}
                      className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        recForm.productId === (item.id || item.productId)
                          ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-blue-600 uppercase">{item.brand}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                            item.matchScore >= 75
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.matchScore >= 50
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {item.matchScore}% Match
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{item.name}</h4>
                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrencyINR(item.price)}</div>
                          </div>
                        </div>

                        {/* Breakdown pills */}
                        <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-slate-500 pt-1">
                          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            Budget: {item.matchDetails?.budgetScore}/40
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            Specs: {item.matchDetails?.featureScore}/20
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setRecForm({
                            ...recForm,
                            productId: item.id || item.productId,
                            recommendationNote: `Recommended ${item.name} (OptiBuy Match Score: ${item.matchScore}%) because it offers the highest compatibility with your stated preferences and budget.`
                          });
                        }}
                        className={`mt-2 w-full py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          recForm.productId === (item.id || item.productId)
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {recForm.productId === (item.id || item.productId) ? 'Selected for Recommendation' : 'Select This Match'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendation Form & Submission */}
            <form onSubmit={handleCreateRecSubmit} className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Chosen Product</label>
                <select
                  value={recForm.productId}
                  onChange={(e) => setRecForm({ ...recForm, productId: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose or select from matches above --</option>
                  {productsList.map(p => (
                    <option key={p.id || p.product_id} value={p.id || p.product_id}>
                      {p.name || p.product_name} ({formatCurrencyINR(p.price || p.price_inr)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Tailored Note for Customer</label>
                <textarea
                  value={recForm.recommendationNote}
                  onChange={(e) => setRecForm({ ...recForm, recommendationNote: e.target.value })}
                  rows={3}
                  required
                  placeholder="Explain why this product is suitable for customer's needs and showroom budget..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTailoredModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Deliver Tailored Recommendation</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default SalesDashboard;
