import express from 'express';
import bcrypt from 'bcryptjs';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const TABLE_USERS = `${schemaName}.tbl_users`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed departments for showroom staff
const ALLOWED_DEPARTMENTS = [
  'Main Showroom Floor',
  'Mobile & Smartphones',
  'Laptops & PCs',
  'Smart TVs',
  'Audio & Headphones',
  'Accessories',
  'Inventory & Stock',
  'Customer Support',
  'Flagship Electronics Hub',
  'Audio & Home Theater Zone',
  'Mobility & Laptops Section'
];

/**
 * Validate password strength: Min 6 chars
 */
const validatePasswordStrength = (pass) => {
  if (!pass || pass.length < 6) return false;
  return true;
};

/**
 * Middleware: Verify user account status is ACTIVE before giving Sales Dashboard access
 */
const verifyActiveSalesPerson = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRes = await query(
      `SELECT user_id, role, status FROM public.users WHERE user_id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User record not found.' });
    }

    const u = userRes.rows[0];
    const status = (u.status || '').toUpperCase();
    const role = (u.role || '').toUpperCase();

    if (role !== 'SALES_PERSON' && role !== 'SALES' && role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied. Sales Executive role required.' });
    }

    if (status === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Your Sales Executive account is awaiting administrator approval.'
      });
    }

    if (status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: 'Your Sales Executive access request was not approved.'
      });
    }

    if (status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact an OptiBuy administrator.'
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/sales-person/request
 * @desc    Public endpoint for Sales Person access requests (sets role='SALES_PERSON', status='PENDING')
 * @access  Public
 */
router.post('/request', async (req, res) => {
  try {
    const fullName = req.body.fullName || req.body.full_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const employeeId = req.body.employeeId || req.body.employee_id;
    const department = req.body.department;
    const reason = req.body.reason;

    const role = 'SALES_PERSON';
    const status = 'PENDING';

    if (!fullName || !fullName.trim() || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid full name (minimum 2 characters).'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required.'
      });
    }

    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number (e.g. +91 9876543210).'
      });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmployeeId = employeeId ? employeeId.trim() : null;
    const cleanDepartment = department ? department.trim() : 'Main Showroom Floor';

    const existingRes = await query(
      `SELECT user_id, email, role, status FROM ${TABLE_USERS} WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (existingRes.rows.length > 0) {
      const existingUser = existingRes.rows[0];
      const userStatus = (existingUser.status || 'ACTIVE').toUpperCase();
      const userRole = (existingUser.role || 'CUSTOMER').toUpperCase();

      if (userStatus === 'PENDING') {
        return res.status(409).json({
          success: false,
          message: 'An access request for this email address is already awaiting administrator approval.'
        });
      }

      if (userStatus === 'ACTIVE' && (userRole === 'SALES_PERSON' || userRole === 'ADMIN')) {
        return res.status(409).json({
          success: false,
          message: 'An active staff or administrator account already exists with this email address.'
        });
      }

      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(password, saltRounds);

      const updateRes = await query(
        `UPDATE ${TABLE_USERS}
         SET full_name = $1, phone = $2, password_hash = $3, department = $4, employee_id = $5, reason = $6, role = 'SALES_PERSON', status = 'PENDING', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7
         RETURNING user_id, full_name, email, phone, department, employee_id, role, status, created_at`,
        [fullName.trim(), cleanPhone, newPasswordHash, cleanDepartment, cleanEmployeeId, reason ? reason.trim() : null, existingUser.user_id]
      );

      // Mirror to public.users
      try {
        await query(
          `UPDATE public.users
           SET full_name = $1, phone = $2, password_hash = $3, department = $4, employee_id = $5, reason = $6, role = 'SALES_PERSON', status = 'PENDING', updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $7`,
          [fullName.trim(), cleanPhone, newPasswordHash, cleanDepartment, cleanEmployeeId, reason ? reason.trim() : null, existingUser.user_id]
        );
      } catch (e) {}

      const updatedReq = updateRes.rows[0];

      return res.status(200).json({
        success: true,
        message: 'Your Sales Staff access request has been submitted for administrator review.',
        request: {
          userId: updatedReq.user_id,
          fullName: updatedReq.full_name,
          email: updatedReq.email,
          phone: updatedReq.phone,
          department: updatedReq.department,
          role: 'SALES_PERSON',
          status: 'PENDING',
          createdAt: updatedReq.created_at
        }
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertRes = await query(
      `INSERT INTO ${TABLE_USERS} (full_name, email, phone, password_hash, department, employee_id, reason, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING user_id, full_name, email, phone, department, employee_id, role, status, created_at`,
      [fullName.trim(), cleanEmail, cleanPhone, passwordHash, cleanDepartment, cleanEmployeeId, reason ? reason.trim() : null, role, status]
    );

    // Mirror to public.users
    try {
      await query(
        `INSERT INTO public.users (user_id, full_name, email, phone, password_hash, department, employee_id, reason, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (user_id) DO UPDATE SET role = 'SALES_PERSON', status = 'PENDING'`,
        [insertRes.rows[0].user_id, fullName.trim(), cleanEmail, cleanPhone, passwordHash, cleanDepartment, cleanEmployeeId, reason ? reason.trim() : null, role, status]
      );
    } catch (e) {}

    const newRequest = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Your Sales Staff access request has been submitted for administrator review.',
      request: {
        userId: newRequest.user_id,
        fullName: newRequest.full_name,
        email: newRequest.email,
        phone: newRequest.phone,
        department: newRequest.department,
        role: 'SALES_PERSON',
        status: 'PENDING',
        createdAt: newRequest.created_at
      }
    });

  } catch (error) {
    console.error('[Sales Request Backend Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit your request right now. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/sales-person/dashboard/stats
 * @desc    Protected: Get live sales dashboard statistics from PostgreSQL
 * @access  Private (Approved Sales Person & Admin)
 */
router.get('/dashboard/stats', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const spUserId = req.user.userId;

    // 1. My Sales & Orders
    const salesRes = await query(
      `SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_sales_inr
       FROM public.orders`
    );

    // 2. Active Customers
    const custRes = await query(
      `SELECT COUNT(*) as cnt FROM public.users WHERE role = 'CUSTOMER'`
    );

    // 3. Products Assisted / Total Products
    const prodRes = await query(
      `SELECT COUNT(*) as cnt FROM public.products`
    );

    // 4. Pending Customer Requests
    const reqRes = await query(
      `SELECT COUNT(*) as cnt FROM public.customer_assistance_requests WHERE status IN ('NEW', 'IN_PROGRESS')`
    );

    // 5. Low Stock Products
    const lowStockRes = await query(
      `SELECT COUNT(*) as cnt FROM public.products WHERE stock_quantity <= 3`
    );

    return res.json({
      success: true,
      stats: {
        mySalesINR: parseFloat(salesRes.rows[0].total_sales_inr || 0),
        myOrdersCount: parseInt(salesRes.rows[0].total_orders || 0, 10),
        activeCustomersCount: parseInt(custRes.rows[0].cnt || 0, 10),
        productsAssistedCount: parseInt(prodRes.rows[0].cnt || 0, 10),
        pendingRequestsCount: parseInt(reqRes.rows[0].cnt || 0, 10),
        lowStockCount: parseInt(lowStockRes.rows[0].cnt || 0, 10)
      }
    });

  } catch (error) {
    console.error('[Sales Dashboard Stats API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/profile
 * @desc    Protected: Get Sales Person Profile
 * @access  Private (Approved Sales Person)
 */
router.get('/profile', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userRes = await query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.status, u.department, u.employee_id, u.created_at,
              sp.showroom_section, sp.monthly_sales_target_inr
       FROM public.users u
       LEFT JOIN public.sales_person_profiles sp ON u.user_id = sp.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales Executive profile not found.' });
    }

    const u = userRes.rows[0];

    return res.json({
      success: true,
      profile: {
        userId: u.user_id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        status: u.status,
        employeeId: u.employee_id || `EMP-SP-${u.user_id}`,
        department: u.department || 'Consumer Electronics Showroom',
        showroomSection: u.showroom_section || 'Smartphones & Laptops',
        monthlyTargetINR: parseFloat(u.monthly_sales_target_inr || 750000),
        createdAt: u.created_at
      }
    });

  } catch (error) {
    console.error('[Sales Profile GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/sales-person/profile
 * @desc    Protected: Update Sales Person Profile (Editable: fullName, phone, showroomSection)
 * @access  Private (Approved Sales Person)
 */
router.put('/profile', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, showroomSection } = req.body;

    if (fullName && !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name cannot be empty.' });
    }

    const updateRes = await query(
      `UPDATE public.users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING user_id, full_name, email, phone, role, status`,
      [fullName ? fullName.trim() : null, phone ? phone.trim() : null, userId]
    );

    if (showroomSection) {
      await query(
        `INSERT INTO public.sales_person_profiles (user_id, showroom_section)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET showroom_section = EXCLUDED.showroom_section`,
        [userId, showroomSection.trim()]
      );
    }

    return res.json({
      success: true,
      message: 'Sales Executive profile updated successfully in PostgreSQL.',
      profile: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Sales Profile PUT Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/customers
 * @desc    Protected: Get Showroom Customers Directory for assistance
 * @access  Private (Approved Sales Person)
 */
router.get('/customers', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const custRes = await query(
      `SELECT user_id, full_name, email, phone, created_at, last_login_at
       FROM public.users
       WHERE role = 'CUSTOMER'
       ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      customers: custRes.rows.map(c => ({
        id: c.user_id,
        userId: c.user_id,
        name: c.full_name,
        email: c.email,
        phone: c.phone || 'N/A',
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('[Sales Customers GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/requests
 * @desc    Protected: Get Customer Assistance Requests from PostgreSQL
 * @access  Private (Approved Sales Person)
 */
router.get('/requests', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const reqRes = await query(
      `SELECT r.id, r.request_type, r.status, r.notes, r.created_at,
              u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
              p.product_name, p.price_inr, p.main_image_url
       FROM public.customer_assistance_requests r
       LEFT JOIN public.users u ON r.customer_id = u.user_id
       LEFT JOIN public.products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );

    return res.json({
      success: true,
      requests: reqRes.rows.map(r => ({
        id: r.id,
        customerName: r.customer_name || 'Showroom Customer',
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone || 'N/A',
        productName: r.product_name || 'General Inquiry',
        productPrice: r.price_inr ? parseFloat(r.price_inr) : null,
        requestType: r.request_type,
        status: r.status,
        notes: r.notes,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('[Sales Requests GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/sales-person/requests/:id
 * @desc    Protected: Update status of a customer assistance request
 * @access  Private (Approved Sales Person)
 */
router.put('/requests/:id', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    const updateRes = await query(
      `UPDATE public.customer_assistance_requests
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, notes, requestId]
    );

    return res.json({
      success: true,
      message: `Assistance request status updated to ${status}.`,
      request: updateRes.rows[0]
    });
  } catch (error) {
    console.error('[Sales Request PUT Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/sales-person/recommendations
 * @desc    Protected: Create a product recommendation for a customer
 * @access  Private (Approved Sales Person)
 */
router.post('/recommendations', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const spUserId = req.user.userId;
    const { customerId, productId, recommendationNote } = req.body;

    if (!productId || !recommendationNote) {
      return res.status(400).json({ success: false, message: 'productId and recommendationNote are required.' });
    }

    const insertRes = await query(
      `INSERT INTO public.product_recommendations (sales_person_id, customer_id, product_id, recommendation_note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [spUserId, customerId || null, parseInt(productId, 10), recommendationNote.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Product recommendation created and saved in PostgreSQL.',
      recommendation: insertRes.rows[0]
    });

  } catch (error) {
    console.error('[Sales Recommendation POST Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/recommendations
 * @desc    Protected: Get recommendations created by this Sales Person
 * @access  Private (Approved Sales Person)
 */
router.get('/recommendations', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const spUserId = req.user.userId;

    const recRes = await query(
      `SELECT r.id, r.recommendation_note, r.created_at,
              u.full_name as customer_name,
              p.product_name, p.price_inr, p.main_image_url
       FROM public.product_recommendations r
       LEFT JOIN public.users u ON r.customer_id = u.user_id
       LEFT JOIN public.products p ON r.product_id = p.id
       WHERE r.sales_person_id = $1
       ORDER BY r.created_at DESC`,
      [spUserId]
    );

    return res.json({
      success: true,
      recommendations: recRes.rows.map(r => ({
        id: r.id,
        customerName: r.customer_name || 'Showroom Customer',
        productName: r.product_name,
        productPrice: parseFloat(r.price_inr),
        productImage: r.main_image_url,
        recommendationNote: r.recommendation_note,
        createdAt: r.created_at
      }))
    });

  } catch (error) {
    console.error('[Sales Recommendations GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
