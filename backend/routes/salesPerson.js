import express from 'express';
import bcrypt from 'bcryptjs';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { calculateMatchScore } from '../utils/matchScore.js';

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

    if (role !== 'SALES_PERSON' && role !== 'SALES' && role !== 'SALES_EXECUTIVE' && role !== 'ADMIN') {
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

      if (userStatus === 'ACTIVE' && (userRole === 'SALES_PERSON' || userRole === 'SALES_EXECUTIVE' || userRole === 'ADMIN')) {
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

    // 1. My Confirmed Sales & Orders (attributed to this salesperson)
    const salesRes = await query(
      `SELECT COUNT(*) as my_orders_count, COALESCE(SUM(total_amount), 0) as my_sales_inr
       FROM public.orders
       WHERE salesperson_id = $1 AND order_status NOT IN ('CANCELLED', 'REFUNDED')`,
      [spUserId]
    );

    // 2. Monthly Sales Target from profile
    const profileRes = await query(
      `SELECT monthly_sales_target_inr, showroom_section, department
       FROM public.sales_person_profiles
       WHERE user_id = $1`,
      [spUserId]
    );
    const monthlyTargetINR = profileRes.rows.length > 0 && profileRes.rows[0].monthly_sales_target_inr != null
      ? parseFloat(profileRes.rows[0].monthly_sales_target_inr)
      : 750000.00;

    const mySalesINR = parseFloat(salesRes.rows[0].my_sales_inr || 0);
    const myOrdersCount = parseInt(salesRes.rows[0].my_orders_count || 0, 10);
    const targetProgressPct = monthlyTargetINR > 0
      ? Math.min(100, Math.round((mySalesINR / monthlyTargetINR) * 100))
      : 0;

    // 3. Assistance Request Metrics (Pending, In Progress, Resolved, Assigned to Self)
    const reqRes = await query(
      `SELECT 
         COUNT(*) as total_requests,
         COUNT(*) FILTER (WHERE status = 'NEW') as pending_count,
         COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_count,
         COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_count,
         COUNT(*) FILTER (WHERE sales_person_id = $1 AND status = 'IN_PROGRESS') as my_assigned_count
       FROM public.customer_assistance_requests`,
      [spUserId]
    );

    // 4. Showroom Inventory Status
    const invRes = await query(
      `SELECT 
         COUNT(*) as total_products,
         COUNT(*) FILTER (WHERE stock_quantity <= 5 AND stock_quantity > 0) as low_stock_count,
         COUNT(*) FILTER (WHERE stock_quantity = 0) as out_of_stock_count,
         COUNT(*) FILTER (WHERE stock_quantity > 5) as in_stock_count
       FROM public.products
       WHERE status = 'ACTIVE'`
    );

    // 5. Active Customers
    const custRes = await query(
      `SELECT COUNT(*) as cnt FROM public.users WHERE role = 'CUSTOMER' AND status = 'ACTIVE'`
    );

    // 6. Recommendations Count by this Sales Executive
    const recsRes = await query(
      `SELECT COUNT(*) as cnt FROM public.product_recommendations WHERE sales_person_id = $1`,
      [spUserId]
    );

    return res.json({
      success: true,
      stats: {
        mySalesINR,
        myOrdersCount,
        monthlyTargetINR,
        targetProgressPct,
        activeCustomersCount: parseInt(custRes.rows[0].cnt || 0, 10),
        productsAssistedCount: parseInt(invRes.rows[0].total_products || 0, 10),
        totalRequestsCount: parseInt(reqRes.rows[0].total_requests || 0, 10),
        pendingRequestsCount: parseInt(reqRes.rows[0].pending_count || 0, 10),
        inProgressRequestsCount: parseInt(reqRes.rows[0].in_progress_count || 0, 10),
        resolvedRequestsCount: parseInt(reqRes.rows[0].resolved_count || 0, 10),
        myAssignedRequestsCount: parseInt(reqRes.rows[0].my_assigned_count || 0, 10),
        lowStockCount: parseInt(invRes.rows[0].low_stock_count || 0, 10),
        outOfStockCount: parseInt(invRes.rows[0].out_of_stock_count || 0, 10),
        inStockCount: parseInt(invRes.rows[0].in_stock_count || 0, 10),
        myRecommendationsCount: parseInt(recsRes.rows[0].cnt || 0, 10)
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
 * Allowed status transitions for showroom assistance workflow
 */
const ALLOWED_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];

/**
 * @route   GET /api/sales-person/requests
 * @desc    Protected: Get Customer Assistance Requests with full requirements from PostgreSQL
 * @access  Private (Approved Sales Person & Admin)
 */
router.get('/requests', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const { status, customerId } = req.query;

    let sql = `
      SELECT r.id, r.request_type, r.status, r.notes, r.created_at, r.updated_at,
             r.customer_id, r.sales_person_id,
             u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             sp.full_name as assigned_sales_person, sp.phone as sales_person_phone,
             p.id as product_id, p.product_name, p.price_inr, p.main_image_url,
             c.category_name as product_category, b.brand_name as product_brand,
             cp.preferred_category, cp.preferred_brand, cp.minimum_budget_inr, cp.maximum_budget_inr, cp.preferred_features
      FROM public.customer_assistance_requests r
      LEFT JOIN public.users u ON r.customer_id = u.user_id
      LEFT JOIN public.users sp ON r.sales_person_id = sp.user_id
      LEFT JOIN public.products p ON r.product_id = p.id
      LEFT JOIN public.product_categories c ON p.category_id = c.id
      LEFT JOIN public.brands b ON p.brand_id = b.id
      LEFT JOIN public.customer_preferences cp ON r.customer_id = cp.user_id
      WHERE 1=1
    `;

    const params = [];
    let pIdx = 1;

    if (status && status !== 'ALL') {
      sql += ` AND r.status = $${pIdx}`;
      params.push(status.toUpperCase().trim());
      pIdx++;
    }

    if (customerId) {
      sql += ` AND r.customer_id = $${pIdx}`;
      params.push(parseInt(customerId, 10));
      pIdx++;
    }

    sql += ` ORDER BY r.created_at DESC`;

    const reqRes = await query(sql, params);

    return res.json({
      success: true,
      count: reqRes.rows.length,
      requests: reqRes.rows.map(r => ({
        id: r.id,
        customerId: r.customer_id,
        customerName: r.customer_name || 'Showroom Customer',
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone || 'N/A',
        productId: r.product_id,
        productName: r.product_name || 'General Product Inquiry',
        productPrice: r.price_inr ? parseFloat(r.price_inr) : null,
        productImage: r.main_image_url || null,
        productCategory: r.product_category || 'Electronics',
        productBrand: r.product_brand || 'OptiBuy',
        preferredCategory: r.preferred_category || null,
        preferredBrand: r.preferred_brand || null,
        budgetMin: r.minimum_budget_inr ? parseFloat(r.minimum_budget_inr) : null,
        budgetMax: r.maximum_budget_inr ? parseFloat(r.maximum_budget_inr) : null,
        preferredFeatures: typeof r.preferred_features === 'string'
          ? JSON.parse(r.preferred_features)
          : (r.preferred_features || []),
        requestType: r.request_type,
        status: r.status,
        notes: r.notes,
        salesPersonId: r.sales_person_id,
        assignedSalesPerson: r.assigned_sales_person || null,
        salesPersonPhone: r.sales_person_phone || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });
  } catch (error) {
    console.error('[Sales Requests GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/sales-person/requests/:id
 * @desc    Protected: Update status of a customer assistance request with validation
 * @access  Private (Approved Sales Person & Admin)
 */
router.put('/requests/:id', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const spUserId = req.user.userId;
    const { status, notes } = req.body;

    // 1. Fetch current request
    const currRes = await query(
      `SELECT id, status, customer_id, sales_person_id FROM public.customer_assistance_requests WHERE id = $1`,
      [requestId]
    );

    if (currRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assistance request not found.' });
    }

    const currentReq = currRes.rows[0];
    const currentStatus = currentReq.status;

    // 2. Validate status and transitions
    let targetStatus = currentStatus;
    if (status) {
      const normalizedStatus = status.toUpperCase().trim();
      if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status '${status}'. Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}.`
        });
      }

      // Validate allowed transitions
      if (currentStatus === 'NEW') {
        if (!['NEW', 'IN_PROGRESS', 'CANCELLED'].includes(normalizedStatus)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status transition from NEW to ${normalizedStatus}. A request must be accepted (IN_PROGRESS) before being completed.`
          });
        }
      } else if (currentStatus === 'IN_PROGRESS') {
        if (!['IN_PROGRESS', 'RESOLVED', 'CANCELLED'].includes(normalizedStatus)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status transition from IN_PROGRESS to ${normalizedStatus}.`
          });
        }
      } else if (currentStatus === 'RESOLVED') {
        if (!['RESOLVED', 'IN_PROGRESS'].includes(normalizedStatus)) {
          return res.status(400).json({
            success: false,
            message: `Completed requests can only be reopened to IN_PROGRESS.`
          });
        }
      } else if (currentStatus === 'CANCELLED') {
        if (normalizedStatus !== 'CANCELLED') {
          return res.status(400).json({
            success: false,
            message: `Cancelled requests cannot transition to another status.`
          });
        }
      }

      targetStatus = normalizedStatus;
    }

    // 3. Assign to this sales person if not yet assigned and transitioning to IN_PROGRESS
    const targetSalesPersonId = currentReq.sales_person_id || (targetStatus === 'IN_PROGRESS' ? spUserId : null);

    // 4. Update in database
    const updateRes = await query(
      `UPDATE public.customer_assistance_requests
       SET status = $1,
           notes = COALESCE($2, notes),
           sales_person_id = COALESCE($3, sales_person_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [targetStatus, notes ? notes.trim() : null, targetSalesPersonId, requestId]
    );

    // 5. Log activity
    const activityDetail = targetStatus === 'RESOLVED'
      ? `Completed assistance request #${requestId}.`
      : targetStatus === 'IN_PROGRESS'
        ? `Accepted assistance request #${requestId}.`
        : `Updated assistance request #${requestId} status to ${targetStatus}.`;

    await query(
      `INSERT INTO public.sales_activities (sales_person_id, activity_type, customer_id, details)
       VALUES ($1, $2, $3, $4)`,
      [spUserId, targetStatus === 'RESOLVED' ? 'ASSISTANCE_RESOLVED' : 'ASSISTANCE_STATUS_UPDATE', currentReq.customer_id, activityDetail]
    );

    const updatedRow = updateRes.rows[0];
    return res.json({
      success: true,
      message: `Assistance request #${requestId} status updated to ${targetStatus}.`,
      request: {
        ...updatedRow,
        id: updatedRow.id,
        salesPersonId: updatedRow.sales_person_id,
        sales_person_id: updatedRow.sales_person_id,
        customerId: updatedRow.customer_id,
        customer_id: updatedRow.customer_id,
        productId: updatedRow.product_id,
        product_id: updatedRow.product_id,
        status: updatedRow.status,
        notes: updatedRow.notes
      }
    });

  } catch (error) {
    console.error('[Sales Request PUT Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/recommendations/match-scores
 * @desc    Protected: Get tailored product options with OptiBuy Match Scores for a customer
 * @access  Private (Approved Sales Person & Admin)
 */
router.get('/recommendations/match-scores', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const { customerId, category, limit = 10 } = req.query;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'customerId query parameter is required.' });
    }

    const parsedCustId = parseInt(customerId, 10);

    // 1. Fetch customer preferences from public.customer_preferences
    const prefRes = await query(
      `SELECT preferred_category, preferred_brand, minimum_budget_inr, maximum_budget_inr, preferred_features
       FROM public.customer_preferences
       WHERE user_id = $1`,
      [parsedCustId]
    );

    const preferences = prefRes.rows[0] || {
      preferred_category: 'Smartphones',
      preferred_brand: null,
      minimum_budget_inr: 10000,
      maximum_budget_inr: 200000,
      preferred_features: []
    };

    // 2. Fetch active products with stock > 0
    let sql = `
      SELECT p.id, p.product_name, p.model_number, p.description, p.price_inr, p.original_price_inr,
             p.discount_percentage, p.rating, p.review_count, p.stock_quantity, p.stock_status,
             p.main_image_url, p.status, p.category_id, p.brand_id,
             c.category_name, b.brand_name
      FROM public.products p
      LEFT JOIN public.product_categories c ON p.category_id = c.id
      LEFT JOIN public.brands b ON p.brand_id = b.id
      WHERE p.status = 'ACTIVE' AND p.stock_quantity > 0
    `;
    const params = [];
    let pIdx = 1;

    if (category && category !== 'All') {
      sql += ` AND (LOWER(c.category_name) = LOWER($${pIdx}) OR LOWER(p.category_id::text) = LOWER($${pIdx}))`;
      params.push(category);
      pIdx++;
    }

    sql += ` ORDER BY p.rating DESC, p.review_count DESC LIMIT $${pIdx}`;
    params.push(Math.min(parseInt(limit, 10) || 10, 50));

    const prodRes = await query(sql, params);

    // 3. Fetch specs
    const productIds = prodRes.rows.map(p => p.id);
    const specsMap = {};
    if (productIds.length > 0) {
      const specsRes = await query(
        `SELECT product_id, specification_name, specification_value
         FROM public.product_specifications
         WHERE product_id = ANY($1)`,
        [productIds]
      );
      specsRes.rows.forEach(s => {
        if (!specsMap[s.product_id]) specsMap[s.product_id] = [];
        specsMap[s.product_id].push({ name: s.specification_name, value: s.specification_value });
      });
    }

    // 4. Calculate Match Scores using exact OptiBuy logic
    const results = prodRes.rows.map(p => {
      const specs = specsMap[p.id] || [];
      const scoreBreakdown = calculateMatchScore(p, specs, preferences);
      return {
        id: p.id,
        productId: p.id,
        name: p.product_name,
        productName: p.product_name,
        category: p.category_name || 'Electronics',
        brand: p.brand_name || 'OptiBuy',
        price: parseFloat(p.price_inr),
        originalPrice: p.original_price_inr ? parseFloat(p.original_price_inr) : null,
        rating: parseFloat(p.rating || 4.5),
        stockQuantity: parseInt(p.stock_quantity || 0, 10),
        stockStatus: p.stock_status,
        image: p.main_image_url,
        specifications: specs,
        matchScore: scoreBreakdown.totalScore,
        matchDetails: scoreBreakdown.details
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      customerId: parsedCustId,
      preferences: {
        preferredCategory: preferences.preferred_category,
        preferredBrand: preferences.preferred_brand,
        minimumBudgetINR: parseFloat(preferences.minimum_budget_inr || 10000),
        maximumBudgetINR: parseFloat(preferences.maximum_budget_inr || 200000),
        preferredFeatures: typeof preferences.preferred_features === 'string'
          ? JSON.parse(preferences.preferred_features)
          : (preferences.preferred_features || [])
      },
      products: results
    });

  } catch (error) {
    console.error('[Sales Match Scores Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/sales-person/recommendations
 * @desc    Protected: Create a tailored product recommendation for a customer
 * @access  Private (Approved Sales Person & Admin)
 */
router.post('/recommendations', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const spUserId = req.user.userId;
    const { customerId, productId, recommendationNote } = req.body;

    if (!productId || !recommendationNote || !recommendationNote.trim()) {
      return res.status(400).json({ success: false, message: 'productId and recommendationNote are required.' });
    }

    // Verify product exists in active catalog
    const prodRes = await query(
      `SELECT id, product_name, price_inr FROM public.products WHERE id = $1`,
      [parseInt(productId, 10)]
    );
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected product not found in catalog.' });
    }

    const insertRes = await query(
      `INSERT INTO public.product_recommendations (sales_person_id, customer_id, product_id, recommendation_note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [spUserId, customerId ? parseInt(customerId, 10) : null, parseInt(productId, 10), recommendationNote.trim()]
    );

    // Log sales activity
    await query(
      `INSERT INTO public.sales_activities (sales_person_id, activity_type, customer_id, product_id, details)
       VALUES ($1, 'RECOMMENDATION_CREATED', $2, $3, $4)`,
      [spUserId, customerId ? parseInt(customerId, 10) : null, parseInt(productId, 10), `Created tailored recommendation for ${prodRes.rows[0].product_name}.`]
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

/**
 * @route   POST /api/sales-person/activities
 * @desc    Protected: Log a sales activity
 * @access  Private (Approved Sales Person)
 */
router.post('/activities', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const spUserId = req.user.userId;
    const { activityType, customerId, productId, details } = req.body;

    if (!activityType || !details) {
      return res.status(400).json({ success: false, message: 'activityType and details are required.' });
    }

    const insertRes = await query(
      `INSERT INTO public.sales_activities (sales_person_id, activity_type, customer_id, product_id, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [spUserId, activityType, customerId || null, productId ? parseInt(productId, 10) : null, details.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Sales activity logged successfully.',
      activity: insertRes.rows[0]
    });

  } catch (error) {
    console.error('[Sales Activity POST Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/activities
 * @desc    Protected: Get sales activities for this sales person
 * @access  Private (Approved Sales Person)
 */
router.get('/activities', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const spUserId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const actRes = await query(
      `SELECT a.id, a.activity_type, a.details, a.created_at,
              u.full_name as customer_name, u.email as customer_email,
              p.product_name, p.price_inr, p.main_image_url
       FROM public.sales_activities a
       LEFT JOIN public.users u ON a.customer_id = u.user_id
       LEFT JOIN public.products p ON a.product_id = p.id
       WHERE a.sales_person_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [spUserId, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return res.json({
      success: true,
      activities: actRes.rows.map(a => ({
        id: a.id,
        activityType: a.activity_type,
        details: a.details,
        createdAt: a.created_at,
        customerName: a.customer_name,
        customerEmail: a.customer_email,
        productName: a.product_name,
        productPrice: a.price_inr ? parseFloat(a.price_inr) : null,
        productImage: a.main_image_url
      }))
    });

  } catch (error) {
    console.error('[Sales Activities GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/performance
 * @desc    Protected: Get sales performance metrics for this sales person
 * @access  Private (Approved Sales Person)
 */
router.get('/performance', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const spUserId = req.user.userId;

    const ordersRes = await query(
      `SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_sales_inr
       FROM public.orders
       WHERE salesperson_id = $1`,
      [spUserId]
    );

    const recsRes = await query(
      `SELECT COUNT(*) as total_recommendations
       FROM public.product_recommendations
       WHERE sales_person_id = $1`,
      [spUserId]
    );

    const reqsRes = await query(
      `SELECT COUNT(*) as total_requests,
              COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_requests,
              COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_requests
       FROM public.customer_assistance_requests
       WHERE sales_person_id = $1`,
      [spUserId]
    );

    const actTypeRes = await query(
      `SELECT activity_type, COUNT(*) as count
       FROM public.sales_activities
       WHERE sales_person_id = $1
       GROUP BY activity_type
       ORDER BY count DESC`,
      [spUserId]
    );

    const trendRes = await query(
      `SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as total_revenue
       FROM public.orders
       WHERE salesperson_id = $1 AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) ASC`,
      [spUserId]
    );

    return res.json({
      success: true,
      performance: {
        totalSalesINR: parseFloat(ordersRes.rows[0].total_sales_inr || 0),
        totalOrders: parseInt(ordersRes.rows[0].total_orders || 0, 10),
        totalRecommendations: parseInt(recsRes.rows[0].total_recommendations || 0, 10),
        totalAssistanceRequests: parseInt(reqsRes.rows[0].total_requests || 0, 10),
        resolvedRequests: parseInt(reqsRes.rows[0].resolved_requests || 0, 10),
        inProgressRequests: parseInt(reqsRes.rows[0].in_progress_requests || 0, 10),
        activityBreakdown: actTypeRes.rows.map(r => ({
          type: r.activity_type,
          count: parseInt(r.count, 10)
        })),
        monthlyTrend: trendRes.rows.map(r => ({
          month: r.month,
          orders: parseInt(r.orders_count, 10),
          revenue: parseFloat(r.total_revenue)
        }))
      }
    });

  } catch (error) {
    console.error('[Sales Performance GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/sales-person/customers/:customerId
 * @desc    Protected: Get detailed customer info with order history for sales context
 * @access  Private (Approved Sales Person)
 */
router.get('/customers/:customerId', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);

    const custRes = await query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.address, u.date_of_birth, u.created_at, u.last_login_at,
              cp.preferred_category, cp.preferred_brand, cp.minimum_budget_inr, cp.maximum_budget_inr, cp.preferred_features
       FROM public.users u
       LEFT JOIN public.customer_preferences cp ON u.user_id = cp.user_id
       WHERE u.user_id = $1 AND u.role = 'CUSTOMER'`,
      [customerId]
    );

    if (custRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = custRes.rows[0];

    const ordersRes = await query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.payment_status, o.created_at,
              oi.product_id, oi.quantity, oi.unit_price,
              p.product_name, p.main_image_url, b.brand_name
       FROM public.orders o
       LEFT JOIN public.order_items oi ON o.order_id = oi.order_id
       LEFT JOIN public.products p ON oi.product_id = p.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       WHERE o.customer_id = $1
       ORDER BY o.created_at DESC`,
      [customerId]
    );

    const assistRes = await query(
      `SELECT r.id, r.request_type, r.status, r.notes, r.created_at,
              p.product_name, p.price_inr, p.main_image_url
       FROM public.customer_assistance_requests r
       LEFT JOIN public.products p ON r.product_id = p.id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [customerId]
    );

    const recsRes = await query(
      `SELECT r.id, r.recommendation_note, r.created_at,
              p.product_name, p.price_inr, p.main_image_url,
              sp.full_name as sales_person_name
       FROM public.product_recommendations r
       LEFT JOIN public.products p ON r.product_id = p.id
       LEFT JOIN public.users sp ON r.sales_person_id = sp.user_id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [customerId]
    );

    return res.json({
      success: true,
      customer: {
        id: customer.user_id,
        fullName: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        dateOfBirth: customer.date_of_birth,
        createdAt: customer.created_at,
        lastLoginAt: customer.last_login_at,
        preferences: {
          preferredCategory: customer.preferred_category,
          preferredBrand: customer.preferred_brand,
          minimumBudgetINR: customer.minimum_budget_inr ? parseFloat(customer.minimum_budget_inr) : null,
          maximumBudgetINR: customer.maximum_budget_inr ? parseFloat(customer.maximum_budget_inr) : null,
          preferredFeatures: typeof customer.preferred_features === 'string' 
            ? JSON.parse(customer.preferred_features) 
            : (customer.preferred_features || [])
        },
        orderHistory: ordersRes.rows.map(o => ({
          orderId: o.order_id,
          totalAmount: parseFloat(o.total_amount),
          orderStatus: o.order_status,
          paymentStatus: o.payment_status,
          createdAt: o.created_at,
          items: [{
            productId: o.product_id,
            productName: o.product_name,
            brand: o.brand_name,
            quantity: parseInt(o.quantity, 10),
            unitPrice: parseFloat(o.unit_price),
            image: o.main_image_url
          }]
        })),
        assistanceRequests: assistRes.rows.map(r => ({
          id: r.id,
          requestType: r.request_type,
          status: r.status,
          notes: r.notes,
          createdAt: r.created_at,
          productName: r.product_name,
          productPrice: r.price_inr ? parseFloat(r.price_inr) : null,
          productImage: r.main_image_url
        })),
        recommendations: recsRes.rows.map(r => ({
          id: r.id,
          recommendationNote: r.recommendation_note,
          createdAt: r.created_at,
          productName: r.product_name,
          productPrice: r.price_inr ? parseFloat(r.price_inr) : null,
          productImage: r.main_image_url,
          salesPersonName: r.sales_person_name
        }))
      }
    });

  } catch (error) {
    console.error('[Sales Customer Detail GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/sales-person/requests/:id/assign
 * @desc    Protected: Assign a customer assistance request to this sales person
 * @access  Private (Approved Sales Person)
 */
router.put('/requests/:id/assign', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), verifyActiveSalesPerson, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const spUserId = req.user.userId;

    // Check existing request
    const currRes = await query(
      `SELECT id, status, customer_id, sales_person_id FROM public.customer_assistance_requests WHERE id = $1`,
      [requestId]
    );

    if (currRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assistance request not found.' });
    }

    const currentReq = currRes.rows[0];
    if (currentReq.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot assign a cancelled assistance request.' });
    }
    if (currentReq.status === 'RESOLVED') {
      return res.status(400).json({ success: false, message: 'Cannot assign an already resolved assistance request.' });
    }

    const updateRes = await query(
      `UPDATE public.customer_assistance_requests
       SET sales_person_id = $1,
           status = COALESCE($2, 'IN_PROGRESS'),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [spUserId, req.body.status || 'IN_PROGRESS', requestId]
    );

    // Log sales activity
    await query(
      `INSERT INTO public.sales_activities (sales_person_id, activity_type, customer_id, details)
       VALUES ($1, 'REQUEST_ASSIGNED', $2, $3)`,
      [spUserId, currentReq.customer_id, `Accepted and assigned assistance request #${requestId} to self.`]
    );

    return res.json({
      success: true,
      message: 'Request assigned to you successfully.',
      request: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Sales Request Assign Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
