import express from 'express';
import bcrypt from 'bcryptjs';
import { query, schemaName } from '../db/index.js';

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
 * Validate password strength:
 * Min 6 chars
 */
const validatePasswordStrength = (pass) => {
  if (!pass || pass.length < 6) return false;
  return true;
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
    const declarationConfirmed = req.body.declarationConfirmed;

    // Backend strictly enforces role = 'SALES_PERSON' and status = 'PENDING'
    const role = 'SALES_PERSON';
    const status = 'PENDING';

    // 1. Server-Side Input Validation
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

    // 2. Duplicate Account & Existing Request Checks
    const existingRes = await query(
      `SELECT user_id, email, role, status FROM ${TABLE_USERS} WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (existingRes.rows.length > 0) {
      const existingUser = existingRes.rows[0];
      const userStatus = (existingUser.status || 'ACTIVE').toUpperCase();
      const userRole = (existingUser.role || 'CUSTOMER').toUpperCase();

      // Case A: Request already pending
      if (userStatus === 'PENDING') {
        return res.status(409).json({
          success: false,
          message: 'An access request for this email address is already awaiting administrator approval.'
        });
      }

      // Case B: Active Sales Person or Admin account already exists
      if (userStatus === 'ACTIVE' && (userRole === 'SALES_PERSON' || userRole === 'ADMIN')) {
        return res.status(409).json({
          success: false,
          message: 'An active staff or administrator account already exists with this email address.'
        });
      }

      // Case C: Customer or previously rejected request -> Re-submit request for approval
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(password, saltRounds);

      const updateRes = await query(
        `UPDATE ${TABLE_USERS}
         SET full_name = $1, phone = $2, password_hash = $3, department = $4, employee_id = $5, reason = $6, role = 'SALES_PERSON', status = 'PENDING', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7
         RETURNING user_id, full_name, email, phone, department, employee_id, role, status, created_at`,
        [fullName.trim(), cleanPhone, newPasswordHash, cleanDepartment, cleanEmployeeId, reason ? reason.trim() : null, existingUser.user_id]
      );

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

    // 3. New User Registration
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertRes = await query(
      `INSERT INTO ${TABLE_USERS} (full_name, email, phone, password_hash, department, employee_id, reason, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING user_id, full_name, email, phone, department, employee_id, role, status, created_at`,
      [fullName.trim(), cleanEmail, cleanPhone, passwordHash, cleanDepartment, cleanEmployeeId, reason ? reason.trim() : null, role, status]
    );

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

export default router;
