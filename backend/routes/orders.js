import express from 'express';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const TABLE_ORDERS = `${schemaName}.tbl_orders`;
const TABLE_USERS = `${schemaName}.tbl_users`;
const TABLE_ORDER_ITEMS = `${schemaName}.tbl_order_items`;

const ALLOWED_ORDER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED'
];

/**
 * @route   GET /api/admin/orders
 * @desc    Get orders fulfillment list from PostgreSQL (Admin Only)
 * @access  Private (Admin only)
 */
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const ordersRes = await query(
      `SELECT DISTINCT ON (o.order_id)
         o.order_id, o.customer_id, o.salesperson_id, o.total_amount, o.order_status, o.payment_status, o.created_at, o.updated_at,
         COALESCE(u.full_name, tu.full_name, 'Showroom Customer') as customer_name,
         COALESCE(u.email, tu.email, 'N/A') as customer_email,
         COALESCE(sp.full_name, tsp.full_name, 'Unassigned') as salesperson_name,
         COALESCE(item_counts.cnt, 1) as item_count
       FROM (
         SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM public.orders
         UNION ALL
         SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM ${TABLE_ORDERS}
       ) o
       LEFT JOIN public.users u ON o.customer_id = u.user_id
       LEFT JOIN ${TABLE_USERS} tu ON o.customer_id = tu.user_id
       LEFT JOIN public.users sp ON o.salesperson_id = sp.user_id
       LEFT JOIN ${TABLE_USERS} tsp ON o.salesperson_id = tsp.user_id
       LEFT JOIN (
         SELECT order_id, COUNT(*) as cnt FROM (
           SELECT order_id FROM public.order_items
           UNION ALL
           SELECT order_id FROM ${TABLE_ORDER_ITEMS}
         ) items GROUP BY order_id
       ) item_counts ON o.order_id = item_counts.order_id
       ORDER BY o.order_id, o.created_at DESC`
    );

    const orders = ordersRes.rows.map(o => ({
      id: `ORD-2026-${o.order_id}`,
      orderId: o.order_id,
      order_id: o.order_id,
      customer: o.customer_name,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      salespersonName: o.salesperson_name,
      itemCount: parseInt(o.item_count || 1, 10),
      amount: parseFloat(o.total_amount),
      totalAmount: parseFloat(o.total_amount),
      status: o.order_status || 'PENDING',
      orderStatus: o.order_status || 'PENDING',
      paymentStatus: o.payment_status || 'PENDING',
      date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: o.created_at,
      updatedAt: o.updated_at
    }));

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('[Admin Orders API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Update order fulfillment status with validation (Admin Only)
 * @access  Private (Admin only)
 */
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ success: false, message: 'Order status is required.' });
    }

    const cleanStatus = status.trim().toUpperCase();

    if (!ALLOWED_ORDER_STATUSES.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status '${status}'. Allowed: ${ALLOWED_ORDER_STATUSES.join(', ')}`
      });
    }

    let updated = null;

    // Update in public.orders
    try {
      const pubRes = await query(
        `UPDATE public.orders
         SET order_status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $2
         RETURNING *`,
        [cleanStatus, orderId]
      );
      if (pubRes.rows.length > 0) {
        updated = pubRes.rows[0];
      }
    } catch (e) {}

    // Update in tbl_orders
    try {
      const tblRes = await query(
        `UPDATE ${TABLE_ORDERS}
         SET order_status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $2
         RETURNING *`,
        [cleanStatus, orderId]
      );
      if (tblRes.rows.length > 0 && !updated) {
        updated = tblRes.rows[0];
      }
    } catch (e) {}

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      message: `Order #${orderId} status updated to ${cleanStatus}.`,
      order: updated
    });

  } catch (error) {
    console.error('[Admin Order Status Update Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/orders/revenue
 * @desc    Calculate genuine revenue and metrics from PostgreSQL orders table
 * @access  Private (Admin only)
 */
router.get('/revenue', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const revenueRes = await query(
      `SELECT COALESCE(SUM(total_amount), 0) as gross_revenue,
              COUNT(*) as total_orders,
              COALESCE(AVG(total_amount), 0) as avg_order_value
       FROM (
         SELECT DISTINCT ON (order_id) order_id, total_amount, order_status, payment_status
         FROM (
           SELECT order_id, total_amount, order_status, payment_status FROM public.orders
           UNION ALL
           SELECT order_id, total_amount, order_status, payment_status FROM ${TABLE_ORDERS}
         ) all_o
       ) o
       WHERE payment_status = 'PAID' OR order_status IN ('COMPLETED', 'DELIVERED')`
    );

    const data = revenueRes.rows[0] || { gross_revenue: 0, total_orders: 0, avg_order_value: 0 };

    return res.json({
      success: true,
      data: {
        grossRevenue: parseFloat(data.gross_revenue || 0),
        totalOrders: parseInt(data.total_orders || 0, 10),
        avgOrderValue: parseFloat(data.avg_order_value || 0)
      }
    });

  } catch (error) {
    console.error('[Revenue API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/orders/transactions
 * @desc    Get genuine transaction history from PostgreSQL
 * @access  Private (Admin only)
 */
router.get('/transactions', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const transRes = await query(
      `SELECT DISTINCT ON (o.order_id)
              o.order_id, o.total_amount, o.payment_status, o.created_at,
              COALESCE(u.full_name, tu.full_name, 'Showroom Customer') as customer_name,
              COALESCE(u.email, tu.email, 'N/A') as customer_email
       FROM (
         SELECT order_id, customer_id, total_amount, payment_status, created_at FROM public.orders
         UNION ALL
         SELECT order_id, customer_id, total_amount, payment_status, created_at FROM ${TABLE_ORDERS}
       ) o
       LEFT JOIN public.users u ON o.customer_id = u.user_id
       LEFT JOIN ${TABLE_USERS} tu ON o.customer_id = tu.user_id
       ORDER BY o.order_id, o.created_at DESC`
    );

    const transactions = transRes.rows.map(t => ({
      id: `TXN-2026-${t.order_id}`,
      orderId: `ORD-2026-${t.order_id}`,
      customer: t.customer_name,
      customerEmail: t.customer_email,
      amount: parseFloat(t.total_amount),
      status: t.payment_status || 'PENDING',
      method: 'Razorpay / UPI / Cash',
      timestamp: t.created_at
    }));

    return res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('[Transactions API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get orders relevant to authenticated user (Sales Person, Admin, Customer)
 * @access  Private
 */
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let sql;
    let params = [];

    if (userRole === 'SALES_PERSON') {
      sql = `
        SELECT DISTINCT ON (o.order_id)
          o.order_id, o.customer_id, o.salesperson_id, o.total_amount, o.order_status, o.payment_status, o.created_at, o.updated_at,
          COALESCE(u.full_name, tu.full_name, 'Showroom Customer') as customer_name,
          COALESCE(u.email, tu.email, 'N/A') as customer_email
        FROM (
          SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM public.orders
          UNION ALL
          SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM ${TABLE_ORDERS}
        ) o
        LEFT JOIN public.users u ON o.customer_id = u.user_id
        LEFT JOIN ${TABLE_USERS} tu ON o.customer_id = tu.user_id
        WHERE o.salesperson_id = $1 OR o.salesperson_id IS NULL
        ORDER BY o.order_id, o.created_at DESC
      `;
      params = [userId];
    } else if (userRole === 'CUSTOMER') {
      sql = `
        SELECT DISTINCT ON (o.order_id)
          o.order_id, o.customer_id, o.salesperson_id, o.total_amount, o.order_status, o.payment_status, o.created_at, o.updated_at,
          COALESCE(u.full_name, tu.full_name, 'Showroom Customer') as customer_name,
          COALESCE(u.email, tu.email, 'N/A') as customer_email
        FROM (
          SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM public.orders
          UNION ALL
          SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM ${TABLE_ORDERS}
        ) o
        LEFT JOIN public.users u ON o.customer_id = u.user_id
        LEFT JOIN ${TABLE_USERS} tu ON o.customer_id = tu.user_id
        WHERE o.customer_id = $1
        ORDER BY o.order_id, o.created_at DESC
      `;
      params = [userId];
    } else {
      sql = `
        SELECT DISTINCT ON (o.order_id)
          o.order_id, o.customer_id, o.salesperson_id, o.total_amount, o.order_status, o.payment_status, o.created_at, o.updated_at,
          COALESCE(u.full_name, tu.full_name, 'Showroom Customer') as customer_name,
          COALESCE(u.email, tu.email, 'N/A') as customer_email
        FROM (
          SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM public.orders
          UNION ALL
          SELECT order_id, customer_id, salesperson_id, total_amount, order_status, payment_status, created_at, updated_at FROM ${TABLE_ORDERS}
        ) o
        LEFT JOIN public.users u ON o.customer_id = u.user_id
        LEFT JOIN ${TABLE_USERS} tu ON o.customer_id = tu.user_id
        ORDER BY o.order_id, o.created_at DESC
      `;
    }

    const ordersRes = await query(sql, params);

    const orders = ordersRes.rows.map(o => ({
      id: o.order_id,
      order_id: o.order_id,
      orderId: o.order_id,
      customer: o.customer_name,
      customerName: o.customer_name,
      full_name: o.customer_name,
      customerEmail: o.customer_email,
      total_amount: parseFloat(o.total_amount),
      price: parseFloat(o.total_amount),
      amount: parseFloat(o.total_amount),
      order_status: o.order_status || 'PENDING',
      orderStatus: o.order_status || 'PENDING',
      payment_status: o.payment_status || 'PENDING',
      paymentStatus: o.payment_status || 'PENDING',
      created_at: o.created_at,
      updated_at: o.updated_at
    }));

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('[My Orders API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
