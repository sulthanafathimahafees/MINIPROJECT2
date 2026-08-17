import express from 'express';
import bcrypt from 'bcryptjs';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const TABLE_USERS = `${schemaName}.tbl_users`;

/**
 * @route   GET /api/admin/profile
 * @desc    Get logged-in administrator profile from PostgreSQL
 * @access  Private (Admin only)
 */
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user.userId;

    const userRes = await query(
      `SELECT user_id, full_name, email, phone, role, status, department, designation, date_of_birth, address, avatar_url, created_at, updated_at, last_login_at, settings
       FROM ${TABLE_USERS}
       WHERE user_id = $1`,
      [adminId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Administrator account not found.' });
    }

    const user = userRes.rows[0];

    return res.json({
      success: true,
      profile: {
        userId: user.user_id,
        user_id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        role: user.role,
        roleBadge: 'SYSTEM ADMINISTRATOR',
        status: user.status || 'ACTIVE',
        department: user.department || 'Executive Technology Operations',
        designation: user.designation || 'Senior System Administrator',
        dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '1990-05-15',
        address: user.address || 'OptiBuy Tech Park, Showroom HQ, Bengaluru, Karnataka, India',
        avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at || new Date().toISOString(),
        settings: user.settings || {
          emailNotifications: true,
          lowStockAlerts: true,
          salesRequestAlerts: true,
          refreshRate: 30,
          theme: 'dark'
        }
      }
    });

  } catch (error) {
    console.error('[Admin Profile GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/admin/profile
 * @desc    Update administrator editable profile fields (Full Name, Phone, Designation, Department, Address, DOB, Avatar)
 * @access  Private (Admin only)
 */
router.put('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { fullName, phone, designation, department, address, dateOfBirth, avatarUrl } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name cannot be empty.' });
    }

    const updateRes = await query(
      `UPDATE ${TABLE_USERS}
       SET full_name = $1,
           phone = $2,
           designation = $3,
           department = $4,
           address = $5,
           date_of_birth = $6,
           avatar_url = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8
       RETURNING user_id, full_name, email, phone, role, status, department, designation, date_of_birth, address, avatar_url, updated_at`,
      [
        fullName.trim(),
        phone ? phone.trim() : null,
        designation ? designation.trim() : 'Senior System Administrator',
        department ? department.trim() : 'Executive Technology Operations',
        address ? address.trim() : null,
        dateOfBirth || null,
        avatarUrl || null,
        adminId
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    const updated = updateRes.rows[0];

    return res.json({
      success: true,
      message: 'Administrator profile updated successfully.',
      profile: {
        userId: updated.user_id,
        fullName: updated.full_name,
        email: updated.email,
        phone: updated.phone,
        designation: updated.designation,
        department: updated.department,
        address: updated.address,
        dateOfBirth: updated.date_of_birth ? new Date(updated.date_of_birth).toISOString().split('T')[0] : '',
        avatarUrl: updated.avatar_url,
        updatedAt: updated.updated_at
      }
    });

  } catch (error) {
    console.error('[Admin Profile PUT Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/admin/profile/change-password
 * @desc    Change administrator password securely in PostgreSQL
 * @access  Private (Admin only)
 */
router.post('/change-password', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Current password, new password, and confirmation are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation password do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    // 1. Fetch current password hash
    const userRes = await query(`SELECT password_hash FROM ${TABLE_USERS} WHERE user_id = $1`, [adminId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Administrator user not found.' });
    }

    const currentHash = userRes.rows[0].password_hash;
    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password entered is incorrect.' });
    }

    // 2. Hash new password securely
    const newHash = await bcrypt.hash(newPassword, 10);

    // 3. Update in PostgreSQL
    await query(
      `UPDATE ${TABLE_USERS}
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [newHash, adminId]
    );

    return res.json({
      success: true,
      message: 'Password changed successfully! Please use your new password on your next login.'
    });

  } catch (error) {
    console.error('[Admin Change Password Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/profile/settings
 * @desc    Get admin notification & system preferences
 * @access  Private (Admin only)
 */
router.get('/settings', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user.userId;
    const userRes = await query(`SELECT settings FROM ${TABLE_USERS} WHERE user_id = $1`, [adminId]);
    
    const settings = (userRes.rows.length > 0 && userRes.rows[0].settings) || {
      emailNotifications: true,
      lowStockAlerts: true,
      salesRequestAlerts: true,
      refreshRate: 30,
      theme: 'dark'
    };

    return res.json({ success: true, settings });
  } catch (error) {
    console.error('[Admin Settings GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/admin/profile/settings
 * @desc    Update admin notification & system preferences in PostgreSQL
 * @access  Private (Admin only)
 */
router.put('/settings', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings payload object is required.' });
    }

    const updateRes = await query(
      `UPDATE ${TABLE_USERS}
       SET settings = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING settings`,
      [JSON.stringify(settings), adminId]
    );

    return res.json({
      success: true,
      message: 'Account preferences saved successfully.',
      settings: updateRes.rows[0].settings
    });

  } catch (error) {
    console.error('[Admin Settings PUT Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
