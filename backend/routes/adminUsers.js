import express from 'express';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles, normalizeRole } from '../middleware/auth.js';

const router = express.Router();
const TABLE_USERS = `${schemaName}.tbl_users`;
const MAIN_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'optibuyadmin@gmail.com').toLowerCase();

/**
 * @route   GET /api/admin/users
 * @desc    Get paginated, searchable, filterable user list for Admin Dashboard
 * @access  Private (ADMIN only)
 */
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const roleFilter = req.query.role ? req.query.role.trim().toUpperCase() : 'ALL';
    const statusFilter = req.query.status ? req.query.status.trim().toUpperCase() : 'ALL';

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Search condition (name or email)
    if (search) {
      whereConditions.push(`(LOWER(full_name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      whereConditions.push(`UPPER(role) = $${paramIndex}`);
      queryParams.push(roleFilter);
      paramIndex++;
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      whereConditions.push(`UPPER(status) = $${paramIndex}`);
      queryParams.push(statusFilter);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) FROM ${TABLE_USERS} ${whereClause}`,
      queryParams
    );
    const totalUsers = parseInt(countResult.rows[0].count, 10);

    // Data query
    const dataQueryParams = [...queryParams, limit, offset];
    const dataResult = await query(
      `SELECT user_id, full_name, email, phone, role, status, created_at, last_login 
       FROM ${TABLE_USERS} 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataQueryParams
    );

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    return res.json({
      success: true,
      users: dataResult.rows,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages
      }
    });

  } catch (error) {
    console.error('[Admin Users API Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user list: ' + error.message
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user profile details
 * @access  Private (ADMIN only)
 */
router.get('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const userResult = await query(
      `SELECT user_id, full_name, email, phone, role, status, created_at, updated_at, last_login FROM ${TABLE_USERS} WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: userResult.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user account status (ACTIVE, INACTIVE, SUSPENDED)
 * @access  Private (ADMIN only)
 */
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const allowedStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    const cleanStatus = (status || '').toUpperCase();

    if (!allowedStatuses.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account status. Allowed: ACTIVE, INACTIVE, SUSPENDED'
      });
    }

    // Check user target
    const userRes = await query(`SELECT email, role FROM ${TABLE_USERS} WHERE user_id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = userRes.rows[0];

    // Safeguard: Do NOT allow self-deactivation
    if (userId === req.user.userId && cleanStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Security Restriction: You cannot deactivate your own active administrator account.'
      });
    }

    // Safeguard: Do NOT allow deactivating or suspending main admin
    if (targetUser.email.toLowerCase() === MAIN_ADMIN_EMAIL && cleanStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Protection Alert: The primary system administrator account cannot be deactivated or suspended.'
      });
    }

    await query(
      `UPDATE ${TABLE_USERS} SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
      [cleanStatus, userId]
    );

    // Synchronize to public.users
    try {
      await query(
        `UPDATE public.users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 OR LOWER(email) = LOWER($3)`,
        [cleanStatus, userId, targetUser.email]
      );
    } catch (e) {}

    return res.json({
      success: true,
      message: `User status updated to ${cleanStatus} successfully.`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update user role (CUSTOMER, SALES_PERSON, ADMIN)
 * @access  Private (ADMIN only)
 */
router.patch('/:id/role', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    const allowedRoles = ['CUSTOMER', 'SALES_PERSON', 'ADMIN'];
    const cleanRole = normalizeRole(role || '');

    if (!allowedRoles.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed: CUSTOMER, SALES_PERSON, SALES_EXECUTIVE, ADMIN'
      });
    }

    // Check user target
    const userRes = await query(`SELECT email FROM ${TABLE_USERS} WHERE user_id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = userRes.rows[0];

    // Safeguard: Do NOT allow self-demotion
    if (userId === req.user.userId && cleanRole !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Security Restriction: You cannot change the role of your own active administrator account.'
      });
    }

    // Safeguard: Do NOT allow modifying main admin role
    if (targetUser.email.toLowerCase() === MAIN_ADMIN_EMAIL && cleanRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Protection Alert: Primary system administrator role cannot be demoted.'
      });
    }

    await query(
      `UPDATE ${TABLE_USERS} SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
      [cleanRole, userId]
    );

    // Synchronize to public.users
    try {
      await query(
        `UPDATE public.users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 OR LOWER(email) = LOWER($3)`,
        [cleanRole, userId, targetUser.email]
      );
    } catch (e) {}

    return res.json({
      success: true,
      message: `User role updated to ${cleanRole} successfully.`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account
 * @access  Private (ADMIN only)
 */
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Safeguard: Do NOT allow self-deletion
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Security Restriction: You cannot delete your own active administrator account.'
      });
    }

    const userRes = await query(`SELECT email FROM ${TABLE_USERS} WHERE user_id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = userRes.rows[0];

    // Safeguard: Do NOT allow deleting main admin
    if (targetUser.email.toLowerCase() === MAIN_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'Protection Alert: The primary administrator account cannot be deleted.'
      });
    }

    await query(`DELETE FROM ${TABLE_USERS} WHERE user_id = $1`, [userId]);

    // Synchronize to public.users
    try {
      await query(`DELETE FROM public.users WHERE user_id = $1 OR LOWER(email) = LOWER($2)`, [userId, targetUser.email]);
    } catch (e) {}

    return res.json({
      success: true,
      message: 'User deleted successfully.'
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
