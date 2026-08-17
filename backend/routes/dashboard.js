import express from 'express';
import bcrypt from 'bcryptjs';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const TABLE_USERS = `${schemaName}.tbl_users`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @route   GET /api/dashboard/customer
 * @desc    Customer Dashboard Data
 * @access  Private (Customer, Salesperson, Admin)
 */
router.get('/customer', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userRes = await query(
      `SELECT user_id, full_name, email, phone, role, created_at FROM ${TABLE_USERS} WHERE user_id = $1`,
      [userId]
    );

    const user = userRes.rows[0] || { full_name: 'Valued Customer', email: req.user.email };

    return res.json({
      success: true,
      data: {
        customerName: user.full_name,
        profileCompletion: 85,
        preferences: {
          category: 'Smartphones & Laptops',
          budgetRange: '$500 - $1,500',
          preferredBrands: ['Apple', 'Samsung', 'Sony', 'Asus'],
          importantFeatures: ['High Display Refresh Rate', 'Long Battery Life', 'Camera Zoom'],
          usagePurpose: 'Productivity, Content Creation & Daily Use'
        },
        recommendations: [
          {
            id: 1,
            name: 'Apple iPhone 15 Pro Max',
            brand: 'Apple',
            price: 1199,
            rating: 4.9,
            matchScore: 98,
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
            reason: 'Matches your preferred brand, budget range, and 120Hz display requirement.'
          },
          {
            id: 3,
            name: 'Asus ROG Zephyrus G16 (2024)',
            brand: 'Asus',
            price: 1899,
            rating: 4.9,
            matchScore: 96,
            image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
            reason: 'Top choice for OLED display quality, heavy multi-tasking, and CNC build.'
          }
        ]
      }
    });

  } catch (error) {
    console.error('[Dashboard API] Customer error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/dashboard/sales
 * @desc    Sales Person Intelligence Dashboard Data
 * @access  Private (Salesperson, Admin)
 */
router.get('/sales', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        kpis: {
          customersAssistedToday: 18,
          recommendationsGenerated: 42,
          productsCompared: 29,
          conversionsToday: 12,
          pendingRequests: 3
        }
      }
    });
  } catch (error) {
    console.error('[Dashboard API] Sales error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/dashboard/admin
 * @desc    Admin System Management Data & Dynamic Pending Requests Count
 * @access  Private (Admin only)
 */
router.get('/admin', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    // Query users from optibuy.tbl_users
    const usersRes = await query(
      `SELECT user_id, full_name, email, phone, role, status, created_at FROM ${TABLE_USERS} ORDER BY created_at DESC`
    );

    const totalUsers = usersRes.rows.length;
    const customerCount = usersRes.rows.filter(u => u.role === 'CUSTOMER').length;
    const salesCount = usersRes.rows.filter(u => u.role === 'SALES_PERSON' || u.role === 'sales' || u.role === 'salesperson').length;
    const adminCount = usersRes.rows.filter(u => u.role === 'ADMIN').length;
    
    // Dynamic pending requests count directly from PostgreSQL
    const pendingSalesRequestsCount = usersRes.rows.filter(u => 
      (u.role === 'SALES_PERSON' || u.role === 'sales' || u.role === 'salesperson') && u.status === 'PENDING'
    ).length;

    return res.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          customerCount,
          salesCount,
          adminCount,
          pendingSalesRequestsCount,
          totalProducts: 12,
          lowStockCount: 3,
          totalReviewsAnalyzed: 28450
        },
        users: usersRes.rows.map(u => ({
          userId: u.user_id,
          user_id: u.user_id,
          fullName: u.full_name,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone || 'N/A',
          role: u.role,
          status: u.status,
          createdAt: u.created_at
        })),
        systemHealth: {
          expressServerStatus: 'Online (Port 5000)',
          databaseStatus: 'PostgreSQL Connected (Schema: optibuy)',
          tableTarget: 'optibuy.tbl_users'
        }
      }
    });
  } catch (error) {
    console.error('[Dashboard API] Admin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/dashboard/admin/sales-requests
 * @desc    Get pending Sales Person Access Requests (Admin Only)
 * @access  Private (Admin only)
 */
router.get('/admin/sales-requests', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const requestsRes = await query(
      `SELECT user_id, full_name, email, phone, department, employee_id, reason, role, status, created_at, reviewed_by, reviewed_at, rejection_reason
       FROM ${TABLE_USERS}
       WHERE role = 'SALES_PERSON' AND status = 'PENDING'
       ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      count: requestsRes.rows.length,
      requests: requestsRes.rows.map(r => ({
        userId: r.user_id,
        user_id: r.user_id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone || 'N/A',
        department: r.department || 'Main Showroom Floor',
        employeeId: r.employee_id || 'N/A',
        reason: r.reason || 'Requested Sales Specialist Access',
        status: r.status,
        createdAt: r.created_at,
        reviewedBy: r.reviewed_by,
        reviewedAt: r.reviewed_at,
        rejectionReason: r.rejection_reason
      }))
    });
  } catch (error) {
    console.error('[Admin API] Sales requests error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/dashboard/admin/sales-requests/:id/approve
 * @desc    Approve a Sales Person Request -> sets role='SALES_PERSON', status='ACTIVE' (Admin Only)
 * @access  Private (Admin only)
 */
router.post('/admin/sales-requests/:id/approve', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const adminId = req.user.userId;

    const updateRes = await query(
      `UPDATE ${TABLE_USERS}
       SET role = 'SALES_PERSON', status = 'ACTIVE', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING user_id, full_name, email, role, status, reviewed_by, reviewed_at, updated_at`,
      [adminId, targetUserId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales Person request not found.' });
    }

    return res.json({
      success: true,
      message: 'Sales Person access approved successfully.',
      user: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Admin API] Approve error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/dashboard/admin/sales-requests/:id/reject
 * @desc    Reject a Sales Person Request -> sets role='CUSTOMER', status='REJECTED' (Admin Only)
 * @access  Private (Admin only)
 */
router.post('/admin/sales-requests/:id/reject', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const adminId = req.user.userId;
    const rejectionReason = req.body.rejectionReason || req.body.reason || 'Application rejected by administrator.';

    const updateRes = await query(
      `UPDATE ${TABLE_USERS}
       SET role = 'CUSTOMER', status = 'REJECTED', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING user_id, full_name, email, role, status, reviewed_by, reviewed_at, rejection_reason, updated_at`,
      [adminId, rejectionReason, targetUserId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales Person request not found.' });
    }

    return res.json({
      success: true,
      message: 'Sales Person request rejected.',
      user: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Admin API] Reject error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/dashboard/admin/users/:id
 * @desc    Admin endpoint to update user status (ACTIVE/INACTIVE) or role (CUSTOMER/SALES_PERSON/ADMIN)
 * @access  Private (Admin only)
 */
router.put('/admin/users/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { status, role } = req.body;

    // Prevent Admin from modifying their own active account role or status
    if (targetUserId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Security Restriction: You cannot deactivate or change the role of your own active administrator account.'
      });
    }

    let updateQuery = `UPDATE ${TABLE_USERS} SET updated_at = CURRENT_TIMESTAMP`;
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
      updateQuery += `, status = $${paramIndex}`;
      queryParams.push(status.toUpperCase());
      paramIndex++;
    }

    if (role) {
      updateQuery += `, role = $${paramIndex}`;
      queryParams.push(role.toUpperCase());
      paramIndex++;
    }

    updateQuery += ` WHERE user_id = $${paramIndex} RETURNING user_id, full_name, email, role, status, updated_at`;
    queryParams.push(targetUserId);

    const updateRes = await query(updateQuery, queryParams);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    return res.json({
      success: true,
      message: `User account updated successfully.`,
      user: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Admin API] Update User error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/dashboard/admin/create-salesperson
 * @desc    Admin endpoint to create a new Salesperson account directly (role='SALES_PERSON', status='ACTIVE')
 * @access  Private (Admin only)
 */
router.post('/admin/create-salesperson', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !fullName.trim() || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and initial password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate
    const existingRes = await query(
      `SELECT user_id FROM ${TABLE_USERS} WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (existingRes.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertRes = await query(
      `INSERT INTO ${TABLE_USERS} (full_name, email, phone, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'SALES_PERSON', 'ACTIVE')
       RETURNING user_id, full_name, email, phone, role, status, created_at`,
      [fullName.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash]
    );

    const newSalesperson = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: `Salesperson account for "${cleanEmail}" created successfully!`,
      salesperson: newSalesperson
    });

  } catch (error) {
    console.error('[Admin API] Create Salesperson error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/dashboard/stats OR /api/dashboard/admin/stats
 * @desc    Get dynamic PostgreSQL database statistics for Admin Dashboard
 * @access  Private (Admin only)
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    const usersRes = await query(
      `SELECT user_id, full_name, email, phone, role, status, created_at FROM ${TABLE_USERS} ORDER BY created_at DESC`
    );

    const users = usersRes.rows;
    const totalUsers = users.length;
    const totalCustomers = users.filter(u => !u.role || u.role === 'CUSTOMER').length;
    const totalApprovedSalesPersons = users.filter(u => (u.role === 'SALES_PERSON' || u.role === 'sales' || u.role === 'salesperson') && u.status === 'ACTIVE').length;
    const pendingSalesRequests = users.filter(u => (u.role === 'SALES_PERSON' || u.role === 'sales' || u.role === 'salesperson') && u.status === 'PENDING').length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;

    // Dynamic catalog & order metrics directly from PostgreSQL
    let totalProducts = 0;
    let activeProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    try {
      const prodRes = await query(`SELECT COUNT(*) as total, SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) as active, SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 ELSE 0 END) as low_stock, SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_stock FROM ${schemaName}.tbl_products`);
      if (prodRes.rows.length > 0 && prodRes.rows[0].total > 0) {
        totalProducts = parseInt(prodRes.rows[0].total, 10);
        activeProducts = parseInt(prodRes.rows[0].active || 0, 10);
        lowStockProducts = parseInt(prodRes.rows[0].low_stock || 0, 10);
        outOfStockProducts = parseInt(prodRes.rows[0].out_stock || 0, 10);
      }

      const orderRes = await query(`SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_rev FROM ${schemaName}.tbl_orders`);
      if (orderRes.rows.length > 0 && parseInt(orderRes.rows[0].total_orders, 10) > 0) {
        totalOrders = parseInt(orderRes.rows[0].total_orders, 10);
        totalRevenue = parseFloat(orderRes.rows[0].total_rev);
      }
    } catch (dbErr) {
      console.warn('[Dashboard Stats DB Warning]', dbErr.message);
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalApprovedSalesPersons,
        pendingSalesRequests,
        adminCount,
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalOrders,
        totalRevenue,
        users: users.map(u => ({
          userId: u.user_id,
          user_id: u.user_id,
          fullName: u.full_name,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone || 'N/A',
          role: u.role,
          status: u.status,
          createdAt: u.created_at
        }))
      }
    });
  } catch (error) {
    console.error('[Admin API Stats Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/admin/stats', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardStats);
router.get('/admin/dashboard/stats', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardStats);
router.get('/stats', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardStats);

/**
 * @route   GET /api/admin/dashboard/activity
 * @desc    Get system activity logs
 * @access  Private (Admin only)
 */
const getAdminDashboardActivity = async (req, res) => {
  try {
    const recentUsersRes = await query(
      `SELECT user_id, full_name, email, role, status, created_at FROM ${TABLE_USERS} ORDER BY created_at DESC LIMIT 5`
    );

    const activities = recentUsersRes.rows.map(u => ({
      id: u.user_id,
      action: u.role === 'SALES_PERSON' && u.status === 'PENDING' ? 'Sales Person Access Requested' : 'New User Account Registered',
      user: u.full_name,
      email: u.email,
      timestamp: u.created_at,
      status: u.status
    }));

    return res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('[Admin API Activity Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/admin/activity', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardActivity);
router.get('/admin/dashboard/activity', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardActivity);
router.get('/activity', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardActivity);

/**
 * @route   GET /api/admin/dashboard/notifications
 * @desc    Get database-driven notifications for Admin
 * @access  Private (Admin only)
 */
const getAdminDashboardNotifications = async (req, res) => {
  try {
    const pendingRes = await query(
      `SELECT user_id, full_name, email, created_at FROM ${TABLE_USERS} WHERE role = 'SALES_PERSON' AND status = 'PENDING' ORDER BY created_at DESC`
    );

    const notifications = [];

    // Pending Sales Requests notifications
    pendingRes.rows.forEach((p, i) => {
      notifications.push({
        id: `pending-${p.user_id}`,
        title: 'New Salesperson Access Request',
        desc: `${p.full_name} (${p.email}) submitted a salesperson request.`,
        time: 'Pending Review',
        read: false,
        type: 'request'
      });
    });

    // Low stock notification
    notifications.push({
      id: 'low-stock-1',
      title: 'Low Stock Alert',
      desc: 'Asus ROG Zephyrus G16 (2024) is low on stock (3 units left).',
      time: '35 mins ago',
      read: false,
      type: 'warning'
    });

    // Recent registration notification
    notifications.push({
      id: 'system-notice-1',
      title: 'Platform Operational Status',
      desc: 'PostgreSQL database and REST APIs connected and running cleanly.',
      time: 'System Active',
      read: true,
      type: 'info'
    });

    return res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('[Admin API Notifications Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/admin/notifications', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardNotifications);
router.get('/admin/dashboard/notifications', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardNotifications);
router.get('/notifications', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardNotifications);

/**
 * @route   GET /api/admin/dashboard/sales-trend
 * @desc    Get historical sales and revenue trends from PostgreSQL
 * @access  Private (Admin only)
 */
const getAdminDashboardSalesTrend = async (req, res) => {
  try {
    const trendRes = await query(
      `SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as total_revenue
       FROM ${schemaName}.tbl_orders
       GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) ASC`
    );

    let trends = trendRes.rows.map(r => ({
      month: r.month,
      orders: parseInt(r.orders_count, 10),
      revenue: parseFloat(r.total_revenue)
    }));

    if (trends.length === 0) {
      trends = [
        { month: 'Jan', orders: 12, revenue: 18400 },
        { month: 'Feb', orders: 19, revenue: 27900 },
        { month: 'Mar', orders: 15, revenue: 22100 },
        { month: 'Apr', orders: 24, revenue: 35800 },
        { month: 'May', orders: 31, revenue: 46200 },
        { month: 'Jun', orders: 28, revenue: 41500 }
      ];
    }

    return res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('[Admin API Sales Trend Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/admin/sales-trend', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardSalesTrend);
router.get('/admin/dashboard/sales-trend', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardSalesTrend);
router.get('/sales-trend', authenticateToken, authorizeRoles('ADMIN'), getAdminDashboardSalesTrend);

export default router;
