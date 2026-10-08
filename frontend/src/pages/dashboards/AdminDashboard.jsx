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
import { formatCurrencyINR } from '../../utils/currencyFormatter';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(getStoredUser());

  const parseTabFromLocation = () => {
    const rawHash = location.hash || (location.pathname.includes('#') ? '#' + location.pathname.split('#')[1] : '');
    const clean = rawHash.replace('#', '');
    const validTabs = [
      'overview', 'requests', 'assistancerequests', 'users', 'customers', 'salespersons',
      'products', 'categories', 'inventory', 'lowstock',
      'orders', 'salesoverview', 'transactions',
      'reviews', 'analytics', 'reports',
      'health', 'audit', 'settings'
    ];
    return validTabs.includes(clean) ? clean : 'overview';
  };

  // Tab & Layout Navigation State
  const [activeTab, setActiveTab] = useState(parseTabFromLocation);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [salesTimePeriod, setSalesTimePeriod] = useState('This Month');

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
    const tab = parseTabFromLocation();
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.hash, location.pathname]);

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
    totalAssistanceRequests: 0,
    pendingAssistanceRequests: 0,
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

  // Customer Assistance Requests State
  const [assistanceRequestsList, setAssistanceRequestsList] = useState([]);
  const [assistanceCounts, setAssistanceCounts] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0, cancelled: 0 });
  const [assistanceStatusFilter, setAssistanceStatusFilter] = useState('ALL');
  const [assistanceSearchQuery, setAssistanceSearchQuery] = useState('');

  // Sales Trends State (Historical orders aggregation)
  const [salesTrends, setSalesTrends] = useState([]);
  const [productFormError, setProductFormError] = useState('');

  // Database-Driven Data States
  const [categoriesList, setCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [revenueData, setRevenueData] = useState({ grossRevenue: 0, totalOrders: 0, avgOrderValue: 0 });

  // Modals State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSalesModal, setShowAddSalesModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);

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

  const [newBrand, setNewBrand] = useState({
    name: '',
    description: '',
    logoUrl: ''
  });

  const [newSalesperson, setNewSalesperson] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  // Catalog Inventory State
  const [inventoryList, setInventoryList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Edit Product Modal State
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    modelNumber: '',
    description: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    discountPercentage: '',
    status: 'ACTIVE',
    categoryId: '',
    brandId: '',
    image: ''
  });

  const [editingBrand, setEditingBrand] = useState(null);
  const [editBrandForm, setEditBrandForm] = useState({
    name: '',
    description: '',
    logoUrl: '',
    status: 'ACTIVE'
  });

  // Stock Update Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockForm, setStockForm] = useState({
    stockQuantity: '',
    stockStatus: 'IN_STOCK'
  });

  // System Audit Logs
  const [auditLogs] = useState([
    { id: 101, action: 'User Registration', user: 'Neha Kapoor', resource: 'public.users', timestamp: '10 mins ago', status: 'Success' },
    { id: 102, action: 'Inventory Stock Update', user: 'OptiBuy Admin', resource: 'Catalog Stock', timestamp: '35 mins ago', status: 'Success' },
    { id: 103, action: 'Sales Access Requested', user: 'Aarav Sharma', resource: 'Access Request', timestamp: '1 hour ago', status: 'Pending' },
    { id: 104, action: 'System Database Sync', user: 'PostgreSQL Engine', resource: 'public schema', timestamp: '2 hours ago', status: 'Success' }
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
        setKpis(prev => ({
          ...prev,
          totalUsers: data.data.totalUsers || 0,
          totalCustomers: data.data.totalCustomers || 0,
          totalApprovedSalesPersons: data.data.totalApprovedSalesPersons || 0,
          pendingSalesRequests: data.data.pendingSalesRequests || 0,
          totalProducts: data.data.totalProducts || 0,
          activeProducts: data.data.activeProducts || 0,
          lowStockProducts: data.data.lowStockProducts || 0,
          outOfStockProducts: data.data.outOfStockProducts || 0,
          totalAssistanceRequests: data.data.totalAssistanceRequests || 0,
          pendingAssistanceRequests: data.data.pendingAssistanceRequests || 0,
          totalOrders: data.data.totalOrders || 0,
          totalRevenue: data.data.totalRevenue || 0
        }));
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

      // 4. Fetch Customer Assistance Requests from PostgreSQL
      const astRes = await fetch('/api/admin/dashboard/assistance-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const astData = await astRes.json();
      if (astData.success && astData.requests) {
        setAssistanceRequestsList(astData.requests);
        if (astData.counts) {
          setAssistanceCounts(astData.counts);
          setKpis(prev => ({
            ...prev,
            totalAssistanceRequests: astData.total || astData.counts.total || 0,
            pendingAssistanceRequests: astData.counts.new || 0
          }));
        }
      }

      // 5. Fetch Product Categories from PostgreSQL
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.success && catData.categories) {
        setCategoriesList(catData.categories);
      }

      // 5b. Fetch Brands from PostgreSQL
      const brandRes = await fetch('/api/products/brands');
      const brandData = await brandRes.json();
      if (brandData.success && brandData.brands) {
        setBrandsList(brandData.brands);
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

      // 9. Fetch Verified Sales Trend (No Fake Data)
      const trendRes = await fetch('/api/admin/dashboard/sales-trend', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trendData = await trendRes.json();
      if (trendData.success && trendData.trends) {
        setSalesTrends(trendData.trends);
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
    const targetId = targetUser.userId || targetUser.user_id;
    const currentId = user?.userId || user?.user_id;
    if (targetId === currentId || targetUser.email === 'optibuyadmin@gmail.com') {
      alert("Security Restriction: You cannot deactivate your own active administrator account or the primary system administrator.");
      return;
    }

    const newStatus = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const token = localStorage.getItem('optibuy_token');

    try {
      const res = await fetch(`/api/dashboard/admin/users/${targetId}`, {
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

  // Update Order Fulfillment Status
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
      alert("Server connection error updating order status.");
    }
  };

  // Add Product to Catalog
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setProductFormError('');
    if (!newProduct.name || !newProduct.price) {
      setProductFormError("Please fill in product name and price.");
      return;
    }

    const priceNum = parseFloat(newProduct.price);
    const stockNum = parseInt(newProduct.stock || 0, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      setProductFormError("Product price cannot be negative.");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setProductFormError("Stock quantity cannot be negative.");
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
          price: priceNum,
          stockQuantity: stockNum,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Product "${newProduct.name}" added to PostgreSQL catalog successfully!`);
        setShowAddProductModal(false);
        setNewProduct({ name: '', brand: 'Apple', category: 'Smartphones', price: '', stock: '' });
        fetchAdminDashboardData();
      } else {
        setProductFormError(data.message || "Failed to add product.");
      }
    } catch (err) {
      setProductFormError("Server error adding product.");
    }
  };

  // Add Category
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      alert("Please fill in category name.");
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
        setFeedbackMsg(`Category "${newCategory.name}" added to PostgreSQL successfully!`);
        setShowAddCategoryModal(false);
        setNewCategory({ name: '', description: '' });
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to add category.");
      }
    } catch (err) {
      alert("Server error adding category.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Deactivate product "${name}" from PostgreSQL catalog?`)) return;
    const token = localStorage.getItem('optibuy_token');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Product "${name}" deleted.`);
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to delete product.");
      }
    } catch (err) {
      alert("Server error deleting product.");
    }
  };

  // Open Edit Product Modal
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditProductForm({
      name: product.name || product.product_name,
      modelNumber: product.modelNumber || '',
      description: product.description || '',
      price: product.price || product.price_inr,
      originalPrice: product.originalPrice || product.original_price_inr || '',
      stockQuantity: product.stockQuantity || product.stock_quantity || 0,
      discountPercentage: product.discount || 0,
      status: product.status || 'ACTIVE',
      categoryId: product.categoryId || '',
      brandId: product.brandId || '',
      image: product.image || product.main_image_url || ''
    });
    setShowEditProductModal(true);
  };

  // Edit Product Submit
  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editProductForm.price);
    const origPriceNum = editProductForm.originalPrice ? parseFloat(editProductForm.originalPrice) : null;
    const stockNum = parseInt(editProductForm.stockQuantity, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Product price cannot be negative.");
      return;
    }
    if (origPriceNum !== null && (isNaN(origPriceNum) || origPriceNum < 0)) {
      alert("Original price cannot be negative.");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert("Stock quantity cannot be negative.");
      return;
    }
    
    const token = localStorage.getItem('optibuy_token');
    const productId = editingProduct.id || editingProduct.product_id;
    
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editProductForm.name,
          modelNumber: editProductForm.modelNumber,
          description: editProductForm.description,
          price: priceNum,
          originalPrice: origPriceNum,
          stockQuantity: stockNum,
          discountPercentage: parseInt(editProductForm.discountPercentage || 0, 10),
          status: editProductForm.status,
          categoryId: editProductForm.categoryId || null,
          brandId: editProductForm.brandId || null,
          image: editProductForm.image
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Product "${editProductForm.name}" updated successfully!`);
        setShowEditProductModal(false);
        setEditingProduct(null);
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to update product.");
      }
    } catch (err) {
      alert("Server error updating product.");
    }
  };

  // Open Stock Update Modal
  const handleOpenStockModal = (product) => {
    setStockProduct(product);
    setStockForm({
      stockQuantity: product.stockQuantity || product.stock_quantity || 0,
      stockStatus: product.stockStatus || 'IN_STOCK'
    });
    setShowStockModal(true);
  };

  // Stock Update Submit
  const handleStockUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!stockProduct) return;

    const stockNum = parseInt(stockForm.stockQuantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      alert("Stock quantity cannot be negative.");
      return;
    }
    
    const token = localStorage.getItem('optibuy_token');
    const productId = stockProduct.id || stockProduct.product_id;
    
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stockQuantity: stockNum,
          stockStatus: stockForm.stockStatus
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Stock updated for "${stockProduct.name || stockProduct.product_name}"!`);
        setShowStockModal(false);
        setStockProduct(null);
        fetchAdminDashboardData();
      } else {
        alert(data.message || "Failed to update stock.");
      }
    } catch (err) {
      alert("Server error updating stock.");
    }
  };

  // Filtered List Collections
  const customerList = usersList.filter(u => u.role === 'CUSTOMER');
  const salesPersonsList = usersList.filter(u => u.role === 'SALES_PERSON');
  const pendingRequestsCombined = Array.from(
    new Map(
      [
        ...salesRequestsList,
        ...usersList.filter(u => u.role === 'SALES_PERSON' && u.status === 'PENDING')
      ].map(r => [r.userId || r.user_id, r])
    ).values()
  );

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = userSearchQuery === '' ||
      (u.fullName && u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredInventory = inventoryList.filter(p => {
    const categoryMatch = categoryFilter === 'All' || p.category === categoryFilter;
    const searchMatch = inventorySearchQuery === '' ||
      p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(inventorySearchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const filteredBrands = brandsList.filter(b => {
    const searchMatch = brandSearchQuery === '' ||
      (b.name || b.brand_name || '').toLowerCase().includes(brandSearchQuery.toLowerCase()) ||
      (b.description || '').toLowerCase().includes(brandSearchQuery.toLowerCase());
    return searchMatch;
  });

  const filteredAssistance = assistanceRequestsList.filter(req => {
    const matchesStatus = assistanceStatusFilter === 'ALL' || req.status === assistanceStatusFilter;
    const q = assistanceSearchQuery.toLowerCase();
    const matchesSearch = !q ||
      (req.customerName && req.customerName.toLowerCase().includes(q)) ||
      (req.customerEmail && req.customerEmail.toLowerCase().includes(q)) ||
      (req.customerRequirements && req.customerRequirements.toLowerCase().includes(q)) ||
      (req.preferredCategory && req.preferredCategory.toLowerCase().includes(q)) ||
      (req.salespersonName && req.salespersonName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
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
        { id: 'assistancerequests', label: 'Customer Assistance', icon: HelpCircle, badge: assistanceCounts.new || kpis.pendingAssistanceRequests || null },
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
        { id: 'brands', label: 'Brand Management', icon: Shield, badge: null },
        { id: 'inventory', label: 'Inventory Levels', icon: SlidersHorizontal, badge: null },
        { id: 'lowstock', label: 'Low Stock Alerts', icon: AlertTriangle, badge: inventoryList.filter(p => (p.stock || p.stock_quantity) <= 3).length || null }
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">

      {/* 1. ENTERPRISE TOP HEADER BAR */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs transition-colors duration-300">

        {/* Left: Logo & Breadcrumbs */}
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
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                Admin Portal
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize text-slate-900 dark:text-white font-extrabold">{activeTab}</span>
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
            className="w-full pl-10 pr-12 py-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-none placeholder-slate-400 transition-colors"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            Ctrl K
          </kbd>
        </div>

        {/* Right: Status Pill, Notifications, Theme Switcher, Admin Profile Dropdown */}
        <div className="flex items-center gap-3">

          {/* Active Session / DB Sync Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PostgreSQL Active</span>
          </div>

          {/* Notifications Icon with Counter */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700/80 relative transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse">
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
                    <div className="text-slate-400 p-2 text-center">No unread notifications</div>
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
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/80 transition-all flex items-center justify-center cursor-pointer"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
          </button>

          {/* Admin Profile Section & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
                {(user?.fullName || user?.full_name || 'A')[0]}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {user?.fullName || user?.full_name || 'OptiBuy Admin'}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-extrabold uppercase tracking-wider leading-none pt-0.5">
                  SYSTEM ADMINISTRATOR
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
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 uppercase">
                      Administrator
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase">
                      Active Session
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

        {/* Left Dark Navy Sidebar (`#0B1120`) */}
        <aside className={`fixed md:sticky top-[64px] left-0 z-30 h-[calc(100vh-64px)] ${isSidebarCollapsed ? 'w-20' : 'w-64'
          } bg-[#0B1120] text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}>

          <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

            {/* Desktop Sidebar Collapse Toggle */}
            <div className="hidden md:flex justify-end pb-1">
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
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        {isSelected && (
                          <span className="w-1 h-5 rounded-r bg-cyan-400 absolute left-0" />
                        )}

                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {item.badge !== null && item.badge > 0 && !isSidebarCollapsed && (
                          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${item.id === 'requests'
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

          {/* Sidebar Footer Admin Profile Info & Quick Logout */}
          {!isSidebarCollapsed ? (
            <div className="p-3.5 border-t border-slate-800 bg-[#080C16] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  {(user?.fullName || user?.full_name || 'A')[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user?.fullName || 'OptiBuy Admin'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@optibuy.ai'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 border-t border-slate-800 bg-[#080C16] text-center">
              <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Logout">
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20 md:hidden"
          />
        )}

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="optibuy-container space-y-6">

            {/* FEEDBACK SUCCESS BANNER */}
            {feedbackMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
                <button onClick={() => setFeedbackMsg('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ERROR BANNER */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-between shadow-xs"
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
                    <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800/70 rounded-2xl" />
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
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium pt-1">
                      Monitor users, sales operations, products, inventory and platform activity from one place.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={salesTimePeriod}
                      onChange={(e) => setSalesTimePeriod(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="This Month">This Month</option>
                      <option value="This Week">This Week</option>
                      <option value="Last 3 Months">Last 3 Months</option>
                    </select>

                    <button
                      onClick={fetchAdminDashboardData}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </div>

                {/* KPI Cards (Enterprise Polished Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">

                  {/* 1. Total Users */}
                  <div
                    onClick={() => setActiveTab('users')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-blue-500 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Users</span>
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpis.totalUsers || usersList.length || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Registered accounts</div>
                  </div>

                  {/* 2. Pending Salesperson Requests */}
                  <div
                    onClick={() => setActiveTab('requests')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-amber-500 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Sales Approvals</span>
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">{pendingRequestsCombined.length}</div>
                    <div className="text-xs text-amber-600/90 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Pending review</span>
                    </div>
                  </div>

                  {/* 3. Customer Assistance Requests */}
                  <div
                    onClick={() => setActiveTab('assistancerequests')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-purple-500 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Assistance Requests</span>
                      <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                      {kpis.totalAssistanceRequests || assistanceCounts.total || assistanceRequestsList.length || 0}
                    </div>
                    <div className="text-xs text-purple-600/90 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      <span>{kpis.pendingAssistanceRequests || assistanceCounts.new || 0} new</span>
                    </div>
                  </div>

                  {/* 4. Active Sales Staff */}
                  <div
                    onClick={() => setActiveTab('salespersons')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-teal-500 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Active Sales Staff</span>
                      <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
                      {kpis.totalApprovedSalesPersons || salesPersonsList.filter(s => s.status === 'ACTIVE').length || 0}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Approved on floor</div>
                  </div>

                  {/* 5. Total Products */}
                  <div
                    onClick={() => setActiveTab('products')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-indigo-500 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Products</span>
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <Package className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpis.totalProducts || inventoryList.length || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Catalog items</div>
                  </div>

                  {/* 6. Low Stock */}
                  <div
                    onClick={() => setActiveTab('lowstock')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-rose-500 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Low Stock Items</span>
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-rose-500 tracking-tight">{inventoryList.filter(p => (p.stock || p.stock_quantity) <= 3).length}</div>
                    <div className="text-xs text-rose-600 dark:text-rose-400 font-extrabold">Requires restock</div>
                  </div>

                  {/* 7. Total Orders */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-emerald-500 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Orders</span>
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{kpis.totalOrders || ordersList.length || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Orders recorded</div>
                  </div>

                </div>

                {/* Overview Visual Charts & Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Sales Overview Line Chart & Metrics */}
                  <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Sales & Revenue Trend</h3>
                        <p className="text-xs text-slate-500">Live store transaction volume and verified order metrics from PostgreSQL</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                        {salesTimePeriod}
                      </span>
                    </div>

                    {/* Quick Revenue Metrics Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Revenue</span>
                        <div className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(revenueData.grossRevenue || kpis.totalRevenue || 0)}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                        <div className="text-lg font-extrabold text-blue-600 dark:text-cyan-400">{kpis.totalOrders || ordersList.length || 0}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Order Value</span>
                        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrencyINR(revenueData.avgOrderValue || 0)}</div>
                      </div>
                    </div>

                    {/* Sales Analytics Chart or Empty State */}
                    {(salesTrends.length === 0 || (revenueData.grossRevenue || 0) === 0) ? (
                      <div className="h-52 w-full flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800">
                        <BarChart3 className="w-10 h-10 text-slate-400 mb-2" />
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Sales Records Available</div>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          Completed showroom purchases and verified transactions will automatically plot revenue metrics and sales volume trends here.
                        </p>
                      </div>
                    ) : (
                      <div className="h-52 w-full pt-4 relative flex items-end justify-between gap-3 px-4 pb-4">
                        {salesTrends.map((trend, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[10px] font-mono font-bold text-slate-500">{formatCurrencyINR(trend.revenue || 0)}</span>
                            <div 
                              className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all duration-500 hover:opacity-90"
                              style={{ height: `${Math.max(15, Math.min(100, ((trend.revenue || 1) / (revenueData.grossRevenue || 1)) * 100))}%` }}
                            />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{trend.month || `M${idx+1}`}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Panel */}
                  <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                        <span>Quick Admin Actions</span>
                      </h3>

                      <div className="space-y-3 pt-4">
                        <button
                          onClick={() => setShowAddSalesModal(true)}
                          className="w-full p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <UserPlus className="w-4.5 h-4.5" />
                            <span>Create Salesperson Account</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setShowAddProductModal(true)}
                          className="w-full p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Plus className="w-4.5 h-4.5" />
                            <span>Add Catalog Product</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setShowAddCategoryModal(true)}
                          className="w-full p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Layers className="w-4.5 h-4.5" />
                            <span>Add Product Category</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setActiveTab('requests')}
                          className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-4.5 h-4.5 text-amber-500" />
                            <span>Review Pending Requests ({pendingRequestsCombined.length})</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Live Audit Log Stream Widget */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Live Database Event Log</span>
                        <span className="text-emerald-500 font-extrabold">PostgreSQL</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {auditLogs[0].action}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>{auditLogs[0].user}</span>
                        <span>{auditLogs[0].timestamp}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 2: SALES PERSON REQUESTS */}
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
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleRejectSalesRequest(req.userId || req.user_id, req.email)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
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

            {/* VIEW 2b: CUSTOMER ASSISTANCE REQUESTS */}
            {!loading && activeTab === 'assistancerequests' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Assistance Requests</h2>
                      <p className="text-xs text-slate-500">Monitor showroom customer inquiries, floor sales executive assignments, and resolution statuses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                      {assistanceRequestsList.length} Total Requests
                    </span>
                    <button
                      onClick={fetchAdminDashboardData}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Refresh Requests"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { key: 'ALL', label: 'All', count: assistanceCounts.total || assistanceRequestsList.length },
                      { key: 'NEW', label: 'New / Pending', count: assistanceCounts.new },
                      { key: 'IN_PROGRESS', label: 'In Progress', count: assistanceCounts.inProgress },
                      { key: 'RESOLVED', label: 'Resolved', count: assistanceCounts.resolved },
                      { key: 'CANCELLED', label: 'Cancelled', count: assistanceCounts.cancelled }
                    ].map(pill => (
                      <button
                        key={pill.key}
                        onClick={() => setAssistanceStatusFilter(pill.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          assistanceStatusFilter === pill.key
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{pill.label}</span>
                        {pill.count > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            assistanceStatusFilter === pill.key ? 'bg-purple-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {pill.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={assistanceSearchQuery}
                      onChange={(e) => setAssistanceSearchQuery(e.target.value)}
                      placeholder="Search customer, category, notes..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Requests Table or Empty State */}
                {filteredAssistance.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Assistance Requests Found</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {assistanceStatusFilter !== 'ALL'
                        ? `There are no assistance requests currently matching status "${assistanceStatusFilter}".`
                        : 'When showroom customers submit assistance requests from product pages, they will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                        <tr>
                          <th className="p-4">ID</th>
                          <th className="p-4">Customer Details</th>
                          <th className="p-4">Category / Budget</th>
                          <th className="p-4">Customer Requirements</th>
                          <th className="p-4">Assigned Sales Executive</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Requested At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {filteredAssistance.map((req) => (
                          <tr key={req.id || req.request_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                              #{req.id || req.request_id}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900 dark:text-white">{req.customerName || 'Customer'}</div>
                              <div className="text-xs text-slate-500">{req.customerEmail || req.customerPhone || 'N/A'}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {req.preferredCategory || 'General Inquiry'}
                              </span>
                              {req.budgetMax ? (
                                <span className="text-xs text-slate-500 font-mono">
                                  Budget: {formatCurrencyINR(req.budgetMin || 0)} - {formatCurrencyINR(req.budgetMax)}
                                </span>
                              ) : null}
                            </td>
                            <td className="p-4 max-w-xs">
                              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                                {req.customerRequirements || 'No specific notes provided.'}
                              </p>
                            </td>
                            <td className="p-4">
                              {req.salespersonName ? (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{req.salespersonName}</span>
                                </div>
                              ) : (
                                <span className="text-xs font-semibold text-amber-500 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                                req.status === 'NEW'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 animate-pulse'
                                  : req.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300'
                                  : req.status === 'RESOLVED'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-4 text-right text-xs text-slate-500 font-mono">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: USER MANAGEMENT (ALL USERS, CUSTOMERS, SALESPERSONS) */}
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
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

                {/* Users Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">User ID</th>
                        <th className="p-4">Full Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {filteredUsers.map((u) => {
                        const isProtected = u.email === 'optibuyadmin@gmail.com' || (u.userId || u.user_id) === (user?.userId || user?.user_id);
                        return (
                          <tr key={u.userId || u.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-4 font-mono font-bold text-blue-600 dark:text-cyan-400">#{u.userId || u.user_id}</td>
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{u.fullName || u.full_name}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${u.role === 'ADMIN'
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                                  : u.role === 'SALES_PERSON'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${u.status === 'ACTIVE'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {isProtected ? (
                                <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 italic">
                                  Protected
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${u.status === 'ACTIVE'
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

            {/* VIEW 4: PRODUCTS CATALOG & INVENTORY */}
            {!loading && (activeTab === 'products' || activeTab === 'inventory' || activeTab === 'lowstock') && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                      {activeTab === 'lowstock' ? 'Low Stock Inventory Alerts' : 'Products Catalog Management'}
                    </h2>
                    <p className="text-xs text-slate-500">Manage real-time PostgreSQL product catalog items, prices, and stock inventory</p>
                  </div>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Catalog Product</span>
                  </button>
                </div>

                {/* Filter & Search Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={inventorySearchQuery}
                      onChange={(e) => setInventorySearchQuery(e.target.value)}
                      placeholder="Search product name or brand..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span className="text-xs font-bold text-slate-500 uppercase">Category:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Categories</option>
                      <option value="Smartphones">Smartphones</option>
                      <option value="Laptops & PCs">Laptops & PCs</option>
                      <option value="Smart TVs">Smart TVs</option>
                      <option value="Audio">Audio</option>
                      <option value="Smartwatches">Smartwatches</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Gaming">Gaming</option>
                    </select>
                  </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Brand</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price (INR)</th>
                        <th className="p-4">Stock Level</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {filteredInventory.map((p) => (
                        <tr key={p.id || p.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-blue-600 dark:text-cyan-400">#{p.id || p.product_id}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <img src={p.image || p.main_image_url} alt={p.name} className="w-9 h-9 object-cover rounded-xl shrink-0" />
                            <span>{p.name || p.product_name}</span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{p.brand}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{formatCurrencyINR(p.price || p.price_inr)}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${ (p.stock || p.stock_quantity) <= 3
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 animate-pulse'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                              }`}>
                              {p.stock || p.stock_quantity} units
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenStockModal(p)}
                              className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                              title="Update Stock"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id || p.product_id, p.name || p.product_name)}
                              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 5: PRODUCT CATEGORIES */}
            {!loading && activeTab === 'categories' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Product Categories</h2>
                    <p className="text-xs text-slate-500">Manage OptiBuy catalog categories stored in PostgreSQL</p>
                  </div>

                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesList.map((cat) => (
                    <div key={cat.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{cat.name || cat.category_name}</span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description || 'Consumer electronics product category'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5b: BRAND MANAGEMENT */}
            {!loading && activeTab === 'brands' && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Brand Management</h2>
                    <p className="text-xs text-slate-500">Manage product brands in PostgreSQL catalog</p>
                  </div>

                  <button
                    onClick={() => setShowAddBrandModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Brand</span>
                  </button>
                </div>

                {/* Filter & Search Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      placeholder="Search brand name..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Brands Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Brand Name</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {filteredBrands.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            No brands found
                          </td>
                        </tr>
                      ) : (
                        filteredBrands.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">#{b.id}</td>
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{b.name || b.brand_name}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{b.description || 'No description'}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${b.status === 'ACTIVE' 
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                                }`}>
                                {b.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleEditBrand(b)}
                                className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                                title="Edit Brand"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBrand(b.id, b.name || b.brand_name)}
                                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                                title="Delete Brand"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 6: ORDERS & TRANSACTIONS */}
            {!loading && (activeTab === 'orders' || activeTab === 'salesoverview' || activeTab === 'transactions') && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {activeTab === 'transactions' ? 'Transactions History' : activeTab === 'salesoverview' ? 'Revenue Analytics' : 'Orders Fulfillment'}
                    </h2>
                    <p className="text-xs text-slate-500">Live order processing and store transaction ledger from PostgreSQL</p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300">
                    {ordersList.length} Total Orders
                  </span>
                </div>

                {ordersList.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Orders in Database</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Customer orders and showroom transactions will appear here when placed.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono tracking-wider text-xs">
                        <tr>
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Total Price (INR)</th>
                          <th className="p-4">Payment Status</th>
                          <th className="p-4">Fulfillment Status</th>
                          <th className="p-4">Update Status</th>
                          <th className="p-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {ordersList.map((ord) => {
                          const currentStatus = ord.order_status || ord.status || 'PENDING';
                          const paymentStatus = ord.payment_status || 'PENDING';
                          return (
                            <tr key={ord.id || ord.order_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-4 font-mono font-bold text-blue-600 dark:text-cyan-400">#{ord.id || ord.order_id}</td>
                              <td className="p-4 font-bold text-slate-900 dark:text-white">{ord.customer || ord.full_name || 'OptiBuy Customer'}</td>
                              <td className="p-4 font-bold text-slate-900 dark:text-white">{formatCurrencyINR(ord.total_amount || ord.price || 0)}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                                  paymentStatus === 'PAID' || paymentStatus === 'COMPLETED'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                    : paymentStatus === 'FAILED'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300'
                                }`}>
                                  {paymentStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                                  currentStatus === 'DELIVERED' || currentStatus === 'COMPLETED'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : currentStatus === 'SHIPPED'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : currentStatus === 'PROCESSING'
                                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    : currentStatus === 'CANCELLED'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                }`}>
                                  {currentStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id || ord.order_id, e.target.value)}
                                  className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>
                              <td className="p-4 text-right text-xs text-slate-500">
                                {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Today'}
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

            {/* OTHER SYSTEM TABS (REVIEWS, ANALYTICS, HEALTH, AUDIT, SETTINGS) */}
            {!loading && ['reviews', 'analytics', 'health', 'audit', 'settings'].includes(activeTab) && (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">{activeTab} Control Module</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white">Active Operational</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</span>
                        <span className="text-[10px] font-mono text-emerald-500">{log.status}</span>
                      </div>
                      <p className="text-xs text-slate-500">{log.user} • {log.resource}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Add Catalog Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{productFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Apple iPad Air 11 M2"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Price (INR ₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Save to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Add Product Category</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Wearables"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SALESPERSON MODAL */}
      {showAddSalesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Create Salesperson Account</h3>
              <button onClick={() => setShowAddSalesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSalespersonSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newSalesperson.fullName}
                  onChange={(e) => setNewSalesperson({ ...newSalesperson, fullName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newSalesperson.email}
                  onChange={(e) => setNewSalesperson({ ...newSalesperson, email: e.target.value })}
                  placeholder="aarav@optibuy.ai"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={newSalesperson.password}
                  onChange={(e) => setNewSalesperson({ ...newSalesperson, password: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSalesModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Admin Profile Management</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileModalTab === 'view' && (
              <div className="space-y-4 text-xs font-bold">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center">
                    {(user?.fullName || user?.full_name || 'A')[0]}
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">{user?.fullName || user?.full_name || 'OptiBuy Admin'}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                    <span className="mt-1 inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-600 text-white uppercase">
                      SYSTEM ADMINISTRATOR
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">User ID</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono">#{user?.userId || user?.user_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Role Authorization</span>
                    <span className="text-blue-600 dark:text-cyan-400">ADMIN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Account Status</span>
                    <span className="text-emerald-500">ACTIVE</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    onClick={() => setProfileModalTab('edit')}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}

            {profileModalTab === 'edit' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editProfileForm.fullName}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileModalTab('view')}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}

            {profileModalTab === 'password' && (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={changePasswordForm.currentPassword}
                    onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={changePasswordForm.newPassword}
                    onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={changePasswordForm.confirmPassword}
                    onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileModalTab('view')}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Edit Product</h3>
              <button onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Model Number</label>
                  <input
                    type="text"
                    value={editProductForm.modelNumber}
                    onChange={(e) => setEditProductForm({ ...editProductForm, modelNumber: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={editProductForm.discountPercentage}
                    onChange={(e) => setEditProductForm({ ...editProductForm, discountPercentage: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={editProductForm.description}
                  onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Price (INR ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProductForm.price}
                    onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Original Price (INR ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProductForm.originalPrice}
                    onChange={(e) => setEditProductForm({ ...editProductForm, originalPrice: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editProductForm.stockQuantity}
                    onChange={(e) => setEditProductForm({ ...editProductForm, stockQuantity: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editProductForm.status}
                    onChange={(e) => setEditProductForm({ ...editProductForm, status: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={editProductForm.categoryId}
                    onChange={(e) => setEditProductForm({ ...editProductForm, categoryId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map(c => (
                      <option key={c.id || c.category_id} value={c.id || c.category_id}>
                        {c.name || c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                  <select
                    value={editProductForm.brandId}
                    onChange={(e) => setEditProductForm({ ...editProductForm, brandId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Brand</option>
                    {brandsList.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name || b.brand_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editProductForm.image}
                  onChange={(e) => setEditProductForm({ ...editProductForm, image: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK UPDATE MODAL */}
      {showStockModal && stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Update Stock</h3>
              <button onClick={() => { setShowStockModal(false); setStockProduct(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockUpdateSubmit} className="space-y-4 text-xs font-bold">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">{stockProduct.name || stockProduct.product_name}</p>
                <p className="text-sm text-slate-500">{stockProduct.brand} • {formatCurrencyINR(stockProduct.price || stockProduct.price_inr)}</p>
                <p className="text-xs text-slate-400">Current: {stockProduct.stockQuantity || stockProduct.stock_quantity || 0} units ({stockProduct.stockStatus || 'IN_STOCK'})</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={stockForm.stockQuantity}
                  onChange={(e) => setStockForm({ ...stockForm, stockQuantity: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Stock Status</label>
                <select
                  value={stockForm.stockStatus}
                  onChange={(e) => setStockForm({ ...stockForm, stockStatus: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowStockModal(false); setStockProduct(null); }}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
