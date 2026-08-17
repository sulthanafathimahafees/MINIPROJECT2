import express from 'express';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const TABLE_ORDERS = `${schemaName}.tbl_orders`;
const TABLE_USERS = `${schemaName}.tbl_users`;
const TABLE_ORDER_ITEMS = `${schemaName}.tbl_order_items`;
const TABLE_PRODUCTS = `${schemaName}.tbl_products`;

/**
 * @route   GET /api/admin/orders
 * @desc    Get orders fulfillment list from PostgreSQL (Admin Only)
 * @access  Private (Admin only)
 */
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const ordersRes = await query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.payment_status, o.created_at,
              u.full_name as customer_name, u.email as customer_email,
              (SELECT COUNT(*) FROM ${TABLE_ORDER_ITEMS} i WHERE i.order_id = o.order_id) as item_count
       FROM ${TABLE_ORDERS} o
       LEFT JOIN ${TABLE_USERS} u ON o.customer_id = u.user_id
       ORDER BY o.created_at DESC`
    );

    const orders = ordersRes.rows.map(o => ({
      id: `ORD-2026-${o.order_id}`,
      orderId: o.order_id,
      customer: o.customer_name || o.customer_email || 'Walk-in Customer',
      customerEmail: o.customer_email || 'N/A',
      itemCount: parseInt(o.item_count || 1, 10),
      amount: parseFloat(o.total_amount),
      status: o.order_status || 'Completed',
      paymentStatus: o.payment_status || 'PAID',
      date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: o.created_at
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
 * @desc    Update order fulfillment status (Processing, Shipped, Completed, Cancelled)
 * @access  Private (Admin only)
 */
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Order status is required.' });
    }

    const updateRes = await query(
      `UPDATE ${TABLE_ORDERS}
       SET order_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $2
       RETURNING *`,
      [status.trim(), orderId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      message: `Order #${orderId} status updated to ${status}.`,
      order: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Admin Order Status Update Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/orders/revenue
 * @desc    Calculate revenue and metrics from PostgreSQL orders table
 * @access  Private (Admin only)
 */
router.get('/revenue', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const revenueRes = await query(
      `SELECT COALESCE(SUM(total_amount), 0) as gross_revenue,
              COUNT(*) as total_orders,
              COALESCE(AVG(total_amount), 0) as avg_order_value
       FROM ${TABLE_ORDERS}
       WHERE payment_status = 'PAID' OR order_status = 'COMPLETED'`
    );

    const data = revenueRes.rows[0];

    return res.json({
      success: true,
      data: {
        grossRevenue: parseFloat(data.gross_revenue),
        totalOrders: parseInt(data.total_orders, 10),
        avgOrderValue: parseFloat(data.avg_order_value)
      }
    });

  } catch (error) {
    console.error('[Revenue API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/orders/transactions
 * @desc    Get transaction history from PostgreSQL
 * @access  Private (Admin only)
 */
router.get('/transactions', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const transRes = await query(
      `SELECT o.order_id, o.total_amount, o.payment_status, o.created_at,
              u.full_name as customer_name, u.email as customer_email
       FROM ${TABLE_ORDERS} o
       LEFT JOIN ${TABLE_USERS} u ON o.customer_id = u.user_id
       ORDER BY o.created_at DESC`
    );

    const transactions = transRes.rows.map(t => ({
      id: `TXN-2026-${t.order_id}`,
      orderId: `ORD-2026-${t.order_id}`,
      customer: t.customer_name || 'Walk-in Customer',
      amount: parseFloat(t.total_amount),
      status: t.payment_status || 'PAID',
      method: 'Razorpay / UPI',
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

export default router;
