import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Search,
  Cpu,
  Database,
  Server,
  BarChart3,
  Sparkles,
  Layers,
  UserCheck,
  UserPlus,
  Lock,
  Clock,
  Check,
  Ban,
  Menu,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Activity,
  ArrowUpRight,
  Download,
  LogOut,
  Bell,
  LayoutDashboard,
  FileText,
  Shield,
  List,
  Settings,
  HelpCircle,
  Calendar,
  PieChart,
  ArrowRight,
  Sun,
  Moon,
  User,
  Key,
  DollarSign,
  ChevronDown,
  Filter,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logoutUser } from '../../services/authService';
import Logo from '../../components/common/Logo';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(getStoredUser());

  // Tab & Layout Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Profile & Dropdown Modals
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('view'); // 'view' | 'edit' | 'password'
  const [showNotifications, setShowNotifications] = useState(false);

  // Edit Profile Form State
  const [editProfileForm, setEditProfileForm] = useState({
    fullName: user?.fullName || user?.full_name || '',
    phone: user?.phone || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Change Password Form State
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notifications List State (Loaded from DB)
  const [notifications, setNotifications] = useState([]);

  // Sync hash with active tab
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && [
      'overview', 'requests', 'users', 'customers', 'salespersons',
      'products', 'categories', 'inventory', 'lowstock',
      'orders', 'salesoverview', 'transactions',
      'reviews', 'analytics', 'reports',
      'health', 'audit', 'settings'
    ].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Sync user state from auth storage
  useEffect(() => {
    const currentUser = getStoredUser();
    if (currentUser) {
      setUser(currentUser);
      setEditProfileForm({
        fullName: currentUser.fullName || currentUser.full_name || '',
        phone: currentUser.phone || ''
      });
    }
  }, []);

  // Database-Driven Data State
  const [usersList, setUsersList] = useState([]);
  const [salesRequestsList, setSalesRequestsList] = useState([]);
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalApprovedSalesPersons: 0,
    pendingSalesRequests: 0,
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Table Search & Filter States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Database-Driven Data States
  const [categoriesList, setCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [revenueData, setRevenueData] = useState({ grossRevenue: 0, totalOrders: 0, avgOrderValue: 0 });

  // Modals State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSalesModal, setShowAddSalesModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: 'Apple',
    category: 'Smartphones',
    price: '',
    stock: ''
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  const [newSalesperson, setNewSalesperson] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  // Catalog Inventory State
  const [inventoryList, setInventoryList] = useState([
    { id: 1, name: 'Apple iPhone 15 Pro Max 256GB', brand: 'Apple', category: 'Smartphones', price: 1199, stock: 12, rating: 4.9, status: 'Active' },
    { id: 2, name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', category: 'Smartphones', price: 1299, stock: 8, rating: 4.8, status: 'Active' },
    { id: 3, name: 'Asus ROG Zephyrus G16 (2024)', brand: 'Asus', category: 'Laptops', price: 1899, stock: 3, rating: 4.9, status: 'Active' },
    { id: 4, name: 'Sony BRAVIA XR A95L 65" QD-OLED', brand: 'Sony', category: 'Smart TVs', price: 2799, stock: 2, rating: 4.9, status: 'Active' },
    { id: 5, name: 'Dyson V15 Cordless Vacuum', brand: 'Dyson', category: 'Appliances', price: 749, stock: 0, rating: 4.8, status: 'Active' },
    { id: 6, name: 'MacBook Pro 16" M3 Max 36GB', brand: 'Apple', category: 'Laptops', price: 3499, stock: 5, rating: 5.0, status: 'Active' },
    { id: 7, name: 'LG C3 55" OLED 4K Smart TV', brand: 'LG', category: 'Smart TVs', price: 1499, stock: 1, rating: 4.7, status: 'Active' }
  ]);

  // System Audit Logs
  const [auditLogs] = useState([
    { id: 101, action: 'User Registration', user: 'Neha Kapoor', resource: 'tbl_users', timestamp: '1 hour ago', status: 'Success' },
    { id: 102, action: 'Inventory Stock Update', user: 'OptiBuy Admin', resource: 'Catalog Stock', timestamp: '35 mins ago', status: 'Success' },
    { id: 103, action: 'Sales Access Requested', user: 'Aarav Sharma', resource: 'Access Request', timestamp: '10 mins ago', status: 'Pending' },
    { id: 104, action: 'System Backup Created', user: 'System Task', resource: 'Backup Engine', timestamp: '4 hours ago', status: 'Success' }
  ]);

  // Fetch PostgreSQL Data on Mount & Refresh
  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    const token = localStorage.getItem('optibuy_token');
    if (!token) return;
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Fetch Live Database Stats
      const res = await fetch('/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.users) setUsersList(data.data.users);
        setKpis({
          totalUsers: data.data.totalUsers || 0,
          totalCustomers: data.data.totalCustomers || 0,
          totalApprovedSalesPersons: data.data.totalApprovedSalesPersons || 0,
          pendingSalesRequests: data.data.pendingSalesRequests || 0,
          totalProducts: data.data.totalProducts || 0,
          activeProducts: data.data.activeProducts || 0,
          lowStockProducts: data.data.lowStockProducts || 0,
          outOfStockProducts: data.data.outOfStockProducts || 0,
          totalOrders: data.data.totalOrders || 0,
          totalRevenue: data.data.totalRevenue || 0
        });
      } else {
        setErrorMsg(data.message || 'Failed to retrieve database stats.');
      }

      // 2. Fetch Products List from PostgreSQL
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success && prodData.products) {
        setInventoryList(prodData.products);
      }

      // 3. Fetch Pending Salesperson Access Requests
      const reqRes = await fetch('/api/dashboard/admin/sales-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reqData = await reqRes.json();
      if (reqData.success && reqData.requests) {
        setSalesRequestsList(reqData.requests);
      }

      // 5. Fetch Product Categories from PostgreSQL
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.success && catData.categories) {
        setCategoriesList(catData.categories);
      }

      // 6. Fetch Orders Fulfillment List from PostgreSQL
      const ordRes = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordData = await ordRes.json();
      if (ordData.success && ordData.orders) {
        setOrdersList(ordData.orders);
      }

      // 7. Fetch Transactions History from PostgreSQL
      const transRes = await fetch('/api/admin/orders/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const transData = await transRes.json();
      if (transData.success && transData.transactions) {
        setTransactionsList(transData.transactions);
      }

      // 8. Fetch Revenue Summary Metrics from PostgreSQL
      const revRes = await fetch('/api/admin/orders/revenue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const revData = await revRes.json();
      if (revData.success && revData.data) {
        setRevenueData(revData.data);
      }

    } catch (err) {
      console.error('[Admin Dashboard API Error]', err);
      setErrorMsg('Unable to connect to PostgreSQL backend API. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Profile Edit Submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editProfileForm.fullName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    const token = localStorage.getItem('optibuy_token');
    try {
      setProfileSaving(true);
      setErrorMsg('');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editProfileForm)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg('Admin profile updated successfully!');
        const updated = { ...user, fullName: data.user.full_name, full_name: data.user.full_name, phone: data.user.phone };
        setUser(updated);
        localStorage.setItem('optibuy_user', JSON.stringify(updated));
        setShowProfileModal(false);
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg('Error connecting to server.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password Submission
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    if (changePasswordForm.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    const token = localStorage.getItem('optibuy_token');
    try {
      setPasswordSaving(true);
      setErrorMsg('');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: changePasswordForm.currentPassword,
          newPassword: changePasswordForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg('Password changed successfully.');
        setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowProfileModal(false);
      } else {
        setErrorMsg(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setErrorMsg('Error connecting to server.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Salesperson Request Approval
  const handleApproveSalesRequest = async (userId, email) => {
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/dashboard/admin/sales-requests/${userId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg("Sales Person access approved successfully.");
        setSalesRequestsList(salesRequestsList.filter(r => (r.userId || r.user_id) !== userId));
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to approve request.");
      }
    } catch (err) {
      alert("Server connection error.");
    }
  };

  // Salesperson Request Rejection
  const handleRejectSalesRequest = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to reject the Sales Person application for ${email}?`)) return;
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/dashboard/admin/sales-requests/${userId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg("Sales Person request rejected.");
        setSalesRequestsList(salesRequestsList.filter(r => (r.userId || r.user_id) !== userId));
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to reject request.");
      }
    } catch (err) {
      alert("Server connection error.");
    }
  };

  // Create Salesperson Account
  const handleCreateSalespersonSubmit = async (e) => {
    e.preventDefault();
    if (!newSalesperson.fullName || !newSalesperson.email || !newSalesperson.password) {
      alert("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem('optibuy_token');

    try {
      const res = await fetch('/api/dashboard/admin/create-salesperson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSalesperson)
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Salesperson account for "${newSalesperson.email}" created successfully!`);
        setShowAddSalesModal(false);
        setNewSalesperson({ fullName: '', email: '', phone: '', password: '' });
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to create salesperson account.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  // User Status Toggle (Active/Inactive)
  const handleToggleUserStatus = async (targetUser) => {
    if (targetUser.userId === user?.userId || targetUser.user_id === user?.user_id) {
      alert("Security Restriction: You cannot deactivate your own active administrator account.");
      return;
    }

    const newStatus = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const token = localStorage.getItem('optibuy_token');

    try {
      const res = await fetch(`/api/dashboard/admin/users/${targetUser.userId || targetUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`User ${targetUser.email} status updated to ${newStatus}.`);
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to update user status.");
      }
    } catch (err) {
      alert("Server connection error.");
    }
  };

  // Change User Role
  const handleChangeUserRole = async (targetUser, newRole) => {
    if (targetUser.userId === user?.userId || targetUser.user_id === user?.user_id) {
      alert("Security Restriction: You cannot modify your own active administrator role.");
      return;
    }

    const token = localStorage.getItem('optibuy_token');

    try {
      const res = await fetch(`/api/dashboard/admin/users/${targetUser.userId || targetUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`User ${targetUser.email} role updated to ${newRole}.`);
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to update user role.");
      }
    } catch (err) {
      alert("Server connection error.");
    }
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert("Category name is required.");
      return;
    }
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCategory)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Category "${newCategory.name}" created successfully.`);
        setShowAddCategoryModal(false);
        setNewCategory({ name: '', description: '' });
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to create category.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  const handleToggleCategoryStatus = async (categoryId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Category status updated to ${newStatus}.`);
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to update category.");
      }
    } catch (err) {
      alert("Server connection error.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Order #${orderId} fulfillment status updated to ${newStatus}.`);
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to update order status.");
      }
    } catch (err) {
      alert("Server connection error.");
    }
  };

  const handleStockChange = async (id, delta) => {
    const targetItem = inventoryList.find(item => (item.id || item.product_id) === id);
    if (!targetItem) return;
    const currentStock = targetItem.stock !== undefined ? targetItem.stock : (targetItem.stockQuantity !== undefined ? targetItem.stockQuantity : targetItem.stock_quantity || 0);
    const newStock = Math.max(0, currentStock + delta);

    // Optimistic UI update
    setInventoryList(inventoryList.map(item => {
      if ((item.id || item.product_id) === id) {
        return { ...item, stock: newStock, stockQuantity: newStock, stock_quantity: newStock };
      }
      return item;
    }));

    const token = localStorage.getItem('optibuy_token');
    try {
      await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      fetchAdminDashboardData();
    } catch (err) {
      console.error('[Stock Change Error]', err);
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to remove this product from inventory?")) {
      setInventoryList(inventoryList.filter(p => (p.id || p.product_id) !== productId));
      setFeedbackMsg("Product removed from inventory successfully.");
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert("Please fill in all required product fields.");
      return;
    }

    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProduct.name,
          brand: newProduct.brand,
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock, 10)
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Product "${newProduct.name}" added to PostgreSQL database successfully.`);
        setShowAddProductModal(false);
        setNewProduct({ name: '', brand: 'Apple', category: 'Smartphones', price: '', stock: '' });
        fetchAdminDashboardData();
      } else {
        alert(data.message || 'Failed to add product.');
      }
    } catch (err) {
      alert('Error connecting to backend server.');
    }
  };

  // Filtered Lists
  const pendingRequestsCombined = [
    ...salesRequestsList,
    ...usersList.filter(u => (u.role === 'SALES_PERSON' || u.role === 'sales' || u.role === 'salesperson') && u.status === 'PENDING')
  ].filter((v, i, a) => a.findIndex(t => (t.userId || t.user_id) === (v.userId || v.user_id)) === i);

  const salesPersonsList = usersList.filter(u =>
    (u.role === 'SALES_PERSON' || u.role === 'sales' || u.role === 'salesperson')
  );

  const customerList = usersList.filter(u => !u.role || u.role === 'CUSTOMER');

  const filteredUsers = usersList.filter(u => {
    const roleMatch = roleFilter === 'All' || u.role === roleFilter;
    const searchMatch = (u.fullName || u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase());
    return roleMatch && searchMatch;
  });

  const filteredInventory = inventoryList.filter(p => {
    const categoryMatch = categoryFilter === 'All' || p.category === categoryFilter;
    const searchMatch = p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(inventorySearchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Grouped Sidebar Navigation Definition
  const navigationGroups = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      groupTitle: 'PEOPLE & GOVERNANCE',
      items: [
        { id: 'requests', label: 'Sales Requests', icon: UserCheck, badge: pendingRequestsCombined.length || kpis.pendingSalesRequests || null },
        { id: 'users', label: 'All Users Accounts', icon: Users, badge: null },
        { id: 'customers', label: 'Customers Directory', icon: User, badge: customerList.length || kpis.totalCustomers || null },
        { id: 'salespersons', label: 'Sales Team Roster', icon: UserPlus, badge: salesPersonsList.length || kpis.totalApprovedSalesPersons || null }
      ]
    },
    {
      groupTitle: 'CATALOG & INVENTORY',
      items: [
        { id: 'products', label: 'Products Catalog', icon: Package, badge: null },
        { id: 'categories', label: 'Product Categories', icon: Layers, badge: null },
        { id: 'inventory', label: 'Inventory Levels', icon: SlidersHorizontal, badge: null },
        { id: 'lowstock', label: 'Low Stock Alerts', icon: AlertTriangle, badge: inventoryList.filter(p => p.stock <= 3).length || null }
      ]
    },
    {
      groupTitle: 'SALES & TRANSACTIONS',
      items: [
        { id: 'orders', label: 'Orders Fulfillment', icon: FileText, badge: null },
        { id: 'salesoverview', label: 'Revenue & Sales', icon: TrendingUp, badge: null },
        { id: 'transactions', label: 'Transactions History', icon: DollarSign, badge: null }
      ]
    },
    {
      groupTitle: 'ANALYTICS & SYSTEM',
      items: [
        { id: 'reviews', label: 'Reviews Sentiment', icon: ShieldCheck, badge: null },
        { id: 'analytics', label: 'Platform Analytics', icon: BarChart3, badge: null },
        { id: 'health', label: 'System Health', icon: Shield, badge: null },
        { id: 'audit', label: 'Audit Logs', icon: List, badge: null },
        { id: 'settings', label: 'Settings', icon: Settings, badge: null }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">

      {/* 1. ENTERPRISE TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm transition-colors duration-300">

        {/* Left: Logo & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Logo showTagline={false} />
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-bold">Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize text-blue-600 dark:text-blue-400 font-extrabold">{activeTab}</span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Input */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search users, products, orders..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Right: Notifications, Theme Switcher, Admin Profile Dropdown */}
        <div className="flex items-center gap-3">

          {/* Notifications Icon with Counter */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 relative transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">System Notifications</span>
                  <button
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Mark read
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {notifications.length === 0 ? (
                    <div className="text-slate-400 p-2 text-center">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] font-normal text-slate-400">{n.time}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">{n.desc}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle Switch */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Admin Profile Section & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
                {(user?.fullName || user?.full_name || 'A')[0]}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {user?.fullName || user?.full_name || 'OptiBuy Admin'}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider leading-none pt-0.5">
                  System Administrator
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform duration-200 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 space-y-1">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">{user?.fullName || user?.full_name || 'OptiBuy Admin'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email || 'optibuyadmin@gmail.com'}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase">
                      Administrator
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase">
                      Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileModalTab('view');
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-500" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    setProfileModalTab('edit');
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-indigo-500" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setProfileModalTab('password');
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-cyan-500" />
                  <span>Account Settings</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. DUAL PANEL LAYOUT (LEFT SIDEBAR + MAIN CONTENT AREA) */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Dark Navy Sidebar (`#0F172A`) */}
        <aside className={`fixed md:sticky top-[65px] left-0 z-30 h-[calc(100vh-65px)] ${isSidebarCollapsed ? 'w-20' : 'w-64'
          } bg-[#0F172A] text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}>

          <div className="p-4 space-y-6 overflow-y-auto flex-1">

            {/* Desktop Sidebar Collapse Toggle */}
            <div className="hidden md:flex justify-end">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {/* Grouped Navigation */}
            {navigationGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                {!isSidebarCollapsed && (
                  <div className="px-3 text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">
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
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4.5 h-4.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {item.badge !== null && item.badge > 0 && !isSidebarCollapsed && (
                          <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${item.id === 'requests'
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
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

          {/* Sidebar Footer Admin Email Info */}
          {!isSidebarCollapsed && (
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/50 text-center">
              <div className="text-xs font-mono text-slate-400">Logged in: <span className="text-blue-400 font-bold">{user?.email}</span></div>
            </div>
          )}

        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-950/70 backdrop-blur-xs md:hidden"
          />
        )}

        {/* 3. MAIN CONTENT VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Feedback Toast */}
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
              <button onClick={() => setFeedbackMsg('')} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Error Alert Toast */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-sm font-bold flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={fetchAdminDashboardData}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors ml-2"
              >
                Retry Fetch
              </button>
            </motion.div>
          )}

          {/* LOADING SKELETON */}
          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 w-64 bg-slate-300 dark:bg-slate-800 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                ))}
              </div>
            </div>
          )}

          {/* VIEW 1: OVERVIEW */}
          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Welcome Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Welcome back, Admin 👋
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Monitor users, sales operations, products, inventory and platform activity from one place.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchAdminDashboardData}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Refresh Data</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards (6 Professional Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                {/* 1. Total Users */}
                <div
                  onClick={() => setActiveTab('users')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Total Users</span>
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{kpis.totalUsers || usersList.length || 7}</div>
                  <div className="text-xs text-slate-500 font-medium">Registered accounts</div>
                </div>

                {/* 2. Pending Requests */}
                <div
                  onClick={() => setActiveTab('requests')}
                  className="bg-white dark:bg-[#0F172A] border border-amber-200/90 dark:border-amber-900/40 rounded-2xl p-4 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase">Pending Requests</span>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingRequestsCombined.length}</div>
                  <div className="text-xs text-amber-600/90 font-extrabold">Requires admin review</div>
                </div>

                {/* 3. Active Sales Staff */}
                <div
                  onClick={() => setActiveTab('salespersons')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Active Sales Staff</span>
                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                    {kpis.totalApprovedSalesPersons || salesPersonsList.filter(s => s.status === 'ACTIVE').length || 1}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Currently approved</div>
                </div>

                {/* 4. Total Products */}
                <div
                  onClick={() => setActiveTab('products')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Total Products</span>
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{kpis.totalProducts || inventoryList.length || 7}</div>
                  <div className="text-xs text-slate-500 font-medium">Active catalog items</div>
                </div>

                {/* 5. Low Stock */}
                <div
                  onClick={() => setActiveTab('lowstock')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Low Stock Items</span>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-amber-500">{inventoryList.filter(p => p.stock <= 3).length}</div>
                  <div className="text-xs text-amber-600 font-extrabold">Requires restock</div>
                </div>

                {/* 6. Total Orders */}
                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Total Orders</span>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.totalOrders || 89}</div>
                  <div className="text-xs text-slate-500 font-medium">Orders processed</div>
                </div>

              </div>

              {/* Overview Visual Charts & Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sales Overview Line Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Sales & Revenue Trend</h3>
                      <p className="text-xs text-slate-500">Monthly store transaction volume and order metrics</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                      This Month
                    </span>
                  </div>

                  {/* SVG Chart Plot */}
                  <div className="h-48 w-full pt-4 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="salesGradOverview" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.4" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.4" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.4" />

                      <path d="M 0,90 Q 50,40 100,70 T 200,30 T 300,50 T 400,20 L 400,110 L 0,110 Z" fill="url(#salesGradOverview)" />
                      <path d="M 0,90 Q 50,40 100,70 T 200,30 T 300,50 T 400,20" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span>Quick Admin Actions</span>
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAddSalesModal(true)}
                      className="w-full p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserPlus className="w-4.5 h-4.5" />
                        <span>Create Salesperson Account</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="w-full p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Plus className="w-4.5 h-4.5" />
                        <span>Add Catalog Product</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('requests')}
                      className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4.5 h-4.5 text-amber-500" />
                        <span>Review Pending Requests ({pendingRequestsCombined.length})</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: SALES PERSON REQUESTS */}
          {!loading && activeTab === 'requests' && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sales Person Requests</h2>
                    <p className="text-xs text-slate-500">Review pending access requests from applicants requesting Salesperson role</p>
                  </div>
                </div>

                <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-xs">
                  {pendingRequestsCombined.length} Pending Approval
                </span>
              </div>

              {pendingRequestsCombined.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-sm font-semibold text-slate-500">
                  No pending Sales Person access requests found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">User ID</th>
                        <th className="p-4">Applicant Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Mobile Phone</th>
                        <th className="p-4">Requested Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {pendingRequestsCombined.map((req) => (
                        <tr key={req.userId || req.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-blue-600 dark:text-cyan-400">#{req.userId || req.user_id}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{req.fullName || req.full_name}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{req.email}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{req.phone || 'N/A'}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300">
                              SALES_PERSON
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 animate-pulse">
                              PENDING
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleApproveSalesRequest(req.userId || req.user_id, req.email)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectSalesRequest(req.userId || req.user_id, req.email)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                            >
                              <Ban className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW: USER MANAGEMENT (ALL USERS, CUSTOMERS, SALESPERSONS) */}
          {!loading && (activeTab === 'users' || activeTab === 'customers' || activeTab === 'salespersons') && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                    {activeTab === 'customers' ? 'Registered Customers' : activeTab === 'salespersons' ? 'Sales Team Roster' : 'All User Accounts'}
                  </h2>
                  <p className="text-xs text-slate-500">Manage user authorization roles and account status</p>
                </div>

                <button
                  onClick={() => setShowAddSalesModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Salesperson Account</span>
                </button>
              </div>

              {/* Table Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs font-bold text-slate-500 uppercase">Role Filter:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="All">All Roles ({usersList.length})</option>
                    <option value="CUSTOMER">Customers</option>
                    <option value="SALES_PERSON">Sales Persons</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                    <tr>
                      <th className="p-4">User ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {filteredUsers.map((u) => {
                      const isCurrentAdmin = u.userId === user?.userId || u.user_id === user?.user_id;
                      return (
                        <tr key={u.userId || u.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-blue-600 dark:text-cyan-400">#{u.userId || u.user_id}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {u.fullName || u.full_name}
                            {isCurrentAdmin && (
                              <span className="ml-2 text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                                You (Admin)
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                          <td className="p-4">
                            <select
                              value={u.role || 'CUSTOMER'}
                              disabled={isCurrentAdmin}
                              onChange={(e) => handleChangeUserRole(u, e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                            >
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="SALES_PERSON">SALES_PERSON</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${u.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                                u.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                                  'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              }`}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            {u.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleApproveSalesRequest(u.userId || u.user_id, u.email)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectSalesRequest(u.userId || u.user_id, u.email)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                disabled={isCurrentAdmin}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 ${u.status === 'ACTIVE'
                                    ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                  }`}
                              >
                                {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: PRODUCT MANAGEMENT */}
          {/* VIEW: CATALOG & INVENTORY (Products, Categories, Inventory, Low Stock Alerts) */}
          {!loading && (activeTab === 'products' || activeTab === 'categories' || activeTab === 'inventory' || activeTab === 'lowstock') && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                    {activeTab === 'lowstock' ? 'Low Stock Alerts' : activeTab === 'categories' ? 'Product Categories' : activeTab === 'inventory' ? 'Inventory Levels' : 'Products Catalog'}
                  </h2>
                  <p className="text-xs text-slate-500">Monitor inventory quantities, reorder thresholds, and category configurations</p>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'categories' ? (
                    <button
                      onClick={() => setShowAddCategoryModal(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product Category</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Catalog Product</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table Search & Category Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                    placeholder={activeTab === 'categories' ? "Search category name..." : "Search product name or brand..."}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {activeTab !== 'categories' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span className="text-xs font-bold text-slate-500 uppercase">Category:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Categories</option>
                      <option value="Smartphones">Smartphones</option>
                      <option value="Laptops">Laptops</option>
                      <option value="Smart TVs">Smart TVs</option>
                      <option value="Headphones">Headphones</option>
                      <option value="Appliances">Appliances</option>
                    </select>
                  </div>
                )}
              </div>

              {/* VIEW: CATEGORIES TAB TABLE */}
              {activeTab === 'categories' ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Category ID</th>
                        <th className="p-4">Category Name</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {categoriesList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                            No product categories found in PostgreSQL database.
                          </td>
                        </tr>
                      ) : (
                        categoriesList.filter(c => c.name.toLowerCase().includes(inventorySearchQuery.toLowerCase())).map((cat) => (
                          <tr key={cat.id || cat.category_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">CAT-00{cat.id || cat.category_id}</td>
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{cat.description || 'General electronics category'}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                cat.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                              }`}>
                                {cat.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleToggleCategoryStatus(cat.id || cat.category_id, cat.status)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                              >
                                {cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* VIEW: PRODUCTS / INVENTORY / LOW STOCK TAB TABLE */
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Brand</th>
                        <th className="p-4">Price (INR)</th>
                        <th className="p-4">Stock Level</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {(activeTab === 'lowstock' ? filteredInventory.filter(p => (p.stock !== undefined ? p.stock : (p.stock_quantity || 0)) <= (p.reorder_threshold || 5)) : filteredInventory).map((item) => {
                        const stockVal = item.stock !== undefined ? item.stock : (item.stock_quantity !== undefined ? item.stock_quantity : 0);
                        const isLowStock = stockVal <= (item.reorder_threshold || 5);
                        return (
                          <tr key={item.id || item.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              {item.name}
                              {isLowStock && <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950">Low Stock</span>}
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                            <td className="p-4 text-blue-600 dark:text-blue-400 font-semibold">{item.brand}</td>
                            <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStockChange(item.id || item.product_id, -1)}
                                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${isLowStock ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                                  {stockVal} units
                                </span>
                                <button
                                  onClick={() => handleStockChange(item.id || item.product_id, 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteProduct(item.id || item.product_id)}
                                className="p-2 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/40"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
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

          {/* VIEW: ORDERS & TRANSACTIONS */}
          {!loading && (activeTab === 'orders' || activeTab === 'salesoverview' || activeTab === 'transactions') && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                    {activeTab === 'transactions' ? 'Store Transactions' : activeTab === 'salesoverview' ? 'Sales Analytics & Revenue' : 'Customer Orders'}
                  </h2>
                  <p className="text-xs text-slate-500">Order fulfillment history across online, in-store, and phone sales</p>
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Total Revenue: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenueData.grossRevenue || kpis.totalRevenue || 0)}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                    <tr>
                      <th className="p-4">Order / Txn ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items / Details</th>
                      <th className="p-4">Amount (INR)</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Fulfillment / Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {ordersList.map((ord) => (
                      <tr key={ord.id || ord.orderId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{ord.id}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{ord.customer}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{ord.itemCount ? `${ord.itemCount} Item(s)` : (ord.items || 'Consumer Electronics')}</td>
                        <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(ord.amount)}
                        </td>
                        <td className="p-4 text-slate-500">{ord.date}</td>
                        <td className="p-4 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.orderId || ord.id.replace('ORD-2026-', ''), e.target.value)}
                            className="px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: REVIEWS & ANALYTICS */}
          {!loading && (activeTab === 'reviews' || activeTab === 'analytics' || activeTab === 'reports') && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                    {activeTab === 'reviews' ? 'Review Intelligence' : activeTab === 'reports' ? 'Export Reports' : 'Analytics Overview'}
                  </h2>
                  <p className="text-xs text-slate-500">Natural Language Processing review analysis across 28.4K customer reviews</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Positive Sentiment</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">84.2%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[84%]" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Neutral Sentiment</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">11.5%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[11.5%]" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Critical Feedback</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">4.3%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[4.3%]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SYSTEM HEALTH, AUDIT LOGS, SETTINGS */}
          {!loading && (activeTab === 'health' || activeTab === 'audit' || activeTab === 'settings') && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">

              {activeTab === 'health' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">System Operational Status</h2>
                      <p className="text-xs text-slate-500">Real-time status of backend services and database connection</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">Database</span>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Operational</span>
                      </div>
                      <div className="text-xs text-slate-400">PostgreSQL service response ok</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">API Endpoints</span>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Operational</span>
                      </div>
                      <div className="text-xs text-slate-400">Express REST APIs operational</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">Authentication</span>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Operational</span>
                      </div>
                      <div className="text-xs text-slate-400">JWT Token verification online</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">System Audit Logs</h2>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono text-xs">
                        <tr>
                          <th className="p-4">Log ID</th>
                          <th className="p-4">Event Action</th>
                          <th className="p-4">User / Admin</th>
                          <th className="p-4">Resource</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-4 font-mono text-blue-600 dark:text-blue-400">#{log.id}</td>
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{log.user}</td>
                            <td className="p-4 font-mono text-slate-500">{log.resource}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                {log.status}
                              </span>
                            </td>
                            <td className="p-4 text-right text-slate-400">{log.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Administrator Account Settings</h2>
                      <p className="text-xs text-slate-500">Manage your system notification preferences, dashboard sync rate, and interface theme</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    {/* Notification Preferences */}
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider text-[11px]">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <span>Notification Preferences</span>
                      </h3>

                      <div className="space-y-3 text-xs">
                        <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Email System Alerts</span>
                          <input
                            type="checkbox"
                            checked={user?.settings?.emailNotifications !== false}
                            onChange={(e) => {
                              const newSettings = { ...user?.settings, emailNotifications: e.target.checked };
                              setUser({ ...user, settings: newSettings });
                            }}
                            className="w-4 h-4 accent-blue-600 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Low-Stock Inventory Alerts</span>
                          <input
                            type="checkbox"
                            checked={user?.settings?.lowStockAlerts !== false}
                            onChange={(e) => {
                              const newSettings = { ...user?.settings, lowStockAlerts: e.target.checked };
                              setUser({ ...user, settings: newSettings });
                            }}
                            className="w-4 h-4 accent-blue-600 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Sales Request Notifications</span>
                          <input
                            type="checkbox"
                            checked={user?.settings?.salesRequestAlerts !== false}
                            onChange={(e) => {
                              const newSettings = { ...user?.settings, salesRequestAlerts: e.target.checked };
                              setUser({ ...user, settings: newSettings });
                            }}
                            className="w-4 h-4 accent-blue-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* System & Sync Preferences */}
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider text-[11px]">
                        <RefreshCw className="w-4 h-4 text-emerald-500" />
                        <span>System Sync & Preferences</span>
                      </h3>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <label className="block font-bold text-slate-800 dark:text-slate-200">Dashboard Refresh Rate</label>
                          <select
                            value={user?.settings?.refreshRate || 30}
                            onChange={(e) => {
                              const newSettings = { ...user?.settings, refreshRate: parseInt(e.target.value, 10) };
                              setUser({ ...user, settings: newSettings });
                            }}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                          >
                            <option value={10}>Every 10 seconds (Live Sync)</option>
                            <option value={30}>Every 30 seconds (Recommended)</option>
                            <option value={60}>Every 60 seconds</option>
                            <option value={0}>Manual Refresh Only</option>
                          </select>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <label className="block font-bold text-slate-800 dark:text-slate-200">Security Architecture</label>
                          <div className="text-slate-500 font-mono text-[11px]">PostgreSQL 16 + JWT Bearer Auth + bcrypt Hashes</div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('optibuy_token');
                            try {
                              const res = await fetch('/api/admin/profile/settings', {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ settings: user?.settings || {} })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setFeedbackMsg("Account settings saved successfully to PostgreSQL.");
                              }
                            } catch (err) {
                              alert("Failed to save settings.");
                            }
                          }}
                          className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
                        >
                          Save Account Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ADMIN PROFILE MODAL (VIEW PROFILE / EDIT PROFILE / CHANGE PASSWORD) */}
      {/* ADMIN PROFILE MODAL (VIEW PROFILE / EDIT PROFILE / CHANGE PASSWORD) */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Profile Modal Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => setProfileModalTab('view')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileModalTab === 'view'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  View Profile
                </button>

                <button
                  onClick={() => setProfileModalTab('edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileModalTab === 'edit'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  Edit Profile
                </button>

                <button
                  onClick={() => setProfileModalTab('password')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileModalTab === 'password'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  Change Password
                </button>
              </div>

              {/* TAB CONTENT: VIEW PROFILE */}
              {profileModalTab === 'view' && (
                <div className="space-y-5 text-sm">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                    <img
                      src={user?.avatarUrl || user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                      alt="Admin Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
                    />
                    <div className="space-y-1">
                      <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {user?.fullName || user?.full_name || 'OptiBuy Admin'}
                      </h4>
                      <div className="text-slate-500 text-xs font-mono">{user?.email || 'optibuyadmin@gmail.com'}</div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                          SYSTEM ADMINISTRATOR
                        </span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Designation</span>
                      <div className="font-bold text-slate-900 dark:text-white">{user?.designation || 'Senior System Administrator'}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Department</span>
                      <div className="font-bold text-slate-900 dark:text-white">{user?.department || 'Executive Technology Operations'}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mobile Number</span>
                      <div className="font-bold text-slate-900 dark:text-white">{user?.phone || '+91 98765 43210'}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                      <div className="font-bold text-slate-900 dark:text-white">{user?.dateOfBirth || user?.date_of_birth || '1990-05-15'}</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Office Address</span>
                    <div className="font-bold text-slate-900 dark:text-white">{user?.address || 'OptiBuy Tech Park, Showroom HQ, Bengaluru, Karnataka, India'}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Administrative Audit Trail</div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Account Creation Date:</span>
                      <span className="font-bold font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'Jun 1, 2026'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Last Login Session:</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN') : 'Just now'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: EDIT PROFILE */}
              {profileModalTab === 'edit' && (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editProfileForm.fullName || ''}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number</label>
                      <input
                        type="tel"
                        value={editProfileForm.phone || ''}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                      <input
                        type="text"
                        value={editProfileForm.designation || 'Senior System Administrator'}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, designation: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        value={editProfileForm.department || 'Executive Technology Operations'}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, department: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Office Address</label>
                    <input
                      type="text"
                      value={editProfileForm.address || ''}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                      placeholder="OptiBuy Tech Park, Bengaluru..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Email Address (Security Protected - Cannot Edit)</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'optibuyadmin@gmail.com'}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 text-slate-500 font-medium text-xs cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs shadow-xs"
                    >
                      {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB CONTENT: CHANGE PASSWORD */}
              {profileModalTab === 'password' && (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={changePasswordForm.currentPassword}
                      onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      value={changePasswordForm.newPassword}
                      onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={changePasswordForm.confirmPassword}
                      onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs shadow-xs"
                    >
                      {passwordSaving ? 'Hashing & Updating...' : 'Update Security Password'}
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD PRODUCT MODAL */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowAddProductModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Add Catalog Product</h3>

              <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                    >
                      <option value="Smartphones">Smartphones</option>
                      <option value="Laptops">Laptops</option>
                      <option value="Smart TVs">Smart TVs</option>
                      <option value="Appliances">Appliances</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      placeholder="Sony"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="399"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="10"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs text-xs"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE SALESPERSON MODAL */}
      <AnimatePresence>
        {showAddSalesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowAddSalesModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Sales Person Account</h3>

              <form onSubmit={handleCreateSalespersonSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newSalesperson.fullName}
                    onChange={(e) => setNewSalesperson({ ...newSalesperson, fullName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newSalesperson.email}
                    onChange={(e) => setNewSalesperson({ ...newSalesperson, email: e.target.value })}
                    placeholder="aarav@optibuy.com"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={newSalesperson.phone}
                    onChange={(e) => setNewSalesperson({ ...newSalesperson, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newSalesperson.password}
                    onChange={(e) => setNewSalesperson({ ...newSalesperson, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSalesModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs text-xs"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE PRODUCT CATEGORY MODAL */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <span>Add Product Category</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Create a new product category in PostgreSQL database</p>
              </div>

              <form onSubmit={handleAddCategorySubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g. Smart Wearables"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Description</label>
                  <textarea
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Smartwatches, fitness bands, and smart glasses..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs text-xs"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
