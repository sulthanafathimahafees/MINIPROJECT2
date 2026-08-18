import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { query, schemaName } from '../db/index.js';
import { normalizeRole } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';
const TABLE_NAME = `${schemaName}.tbl_users`;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '55004420182-lkoeq9nh90l6b37u5b5h15bci6fet5nt.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter for Forgot Password (max 5 requests per 15 minutes per email/IP)
const forgotPasswordRateLimitMap = new Map();

const isRateLimited = (identifier) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 5;

  const record = forgotPasswordRateLimitMap.get(identifier) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count += 1;
  }

  forgotPasswordRateLimitMap.set(identifier, record);
  return record.count > maxRequests;
};

/**
 * @route   POST /api/auth/google
 * @desc    Verify Google ID Token or Access Token, log in existing user (preserving role) or create new user with role='CUSTOMER'
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken, access_token } = req.body;
    const tokenToUse = accessToken || access_token;

    let googleEmail = null;
    let googleName = null;
    let isEmailVerified = false;

    if (credential) {
      // 1. Verify Google ID token on server side with google-auth-library
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        googleEmail = payload.email ? payload.email.trim().toLowerCase() : null;
        googleName = payload.name || payload.given_name || googleEmail;
        isEmailVerified = payload.email_verified;
      } catch (verifyError) {
        console.error('[Google OAuth] ID Token verification error:', verifyError.message);
        return res.status(400).json({
          success: false,
          message: 'Google authentication failed: Invalid or expired ID token.'
        });
      }
    } else if (tokenToUse) {
      // 2. Verify Google OAuth2 Access Token via Google UserInfo API
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenToUse}` }
        });
        if (!userInfoRes.ok) {
          return res.status(400).json({
            success: false,
            message: 'Invalid or expired Google OAuth access token.'
          });
        }
        const googleUser = await userInfoRes.json();
        googleEmail = googleUser.email ? googleUser.email.trim().toLowerCase() : null;
        googleName = googleUser.name || googleUser.given_name || googleEmail;
        isEmailVerified = googleUser.email_verified !== undefined ? googleUser.email_verified : true;
      } catch (tokenError) {
        console.error('[Google OAuth] Access token verification error:', tokenError.message);
        return res.status(400).json({
          success: false,
          message: 'Google authentication failed: Unable to verify access token with Google.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No Google credential or access token provided.'
      });
    }

    // 3. Validate verified email
    if (!googleEmail || !isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is not verified or invalid.'
      });
    }

    // 4. Query optibuy.tbl_users by verified email
    const userRes = await query(
      `SELECT user_id, full_name, email, phone, password_hash, role, status, created_at FROM ${TABLE_NAME} WHERE LOWER(email) = $1`,
      [googleEmail]
    );

    let user;

    if (userRes.rows.length > 0) {
      // CASE A — Existing OptiBuy user
      // Log in existing user and PRESERVE their existing role & account status
      user = userRes.rows[0];
    } else {
      // CASE B — New Google user
      // Create new account in optibuy.tbl_users strictly with role = 'CUSTOMER' & status = 'ACTIVE'
      // Client role requests are strictly IGNORED
      const role = 'CUSTOMER';
      const status = 'ACTIVE';
      const passwordHash = 'OAUTH_GOOGLE_USER';

      const insertRes = await query(
        `INSERT INTO ${TABLE_NAME} (full_name, email, phone, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING user_id, full_name, email, phone, role, status, created_at`,
        [googleName.trim(), googleEmail, null, passwordHash, role, status]
      );

      user = insertRes.rows[0];
    }

    const userRole = normalizeRole(user.role);
    const userStatus = (user.status || 'ACTIVE').toUpperCase();

    // 5. Enforce account status rules
    if (userStatus === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Your Sales Person access request is awaiting administrator approval.'
      });
    }

    if (userStatus === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: 'Your Sales Person access request has been denied by an administrator.'
      });
    }

    if (userStatus === 'INACTIVE' || userStatus === 'DEACTIVATED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an OptiBuy administrator.'
      });
    }

    // 6. Generate JWT Token containing role and status
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: userRole, status: userStatus },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: userRole,
        status: userStatus,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('[Google Auth API Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during Google authentication: ' + error.message
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Public Customer Registration. STRICTLY ENFORCES role = 'CUSTOMER' & status = 'ACTIVE'.
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const fullName = req.body.fullName || req.body.full_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    // Public registration MUST ALWAYS assign role = 'CUSTOMER' and status = 'ACTIVE'
    // Any role or status sent in body is strictly IGNORED/OVERRIDDEN by backend
    const role = 'CUSTOMER';
    const status = 'ACTIVE';

    // 1. Server-side validation for required fields
    if (!fullName || !fullName.trim() || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required fields.'
      });
    }

    if (fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Server-side validation for email format
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // 3. Server-side validation for phone format if provided
    if (phone && phone.trim()) {
      const phoneDigits = phone.trim().replace(/[^0-9]/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must contain between 10 and 15 digits.'
        });
      }
    }

    // 4. Server-side validation for password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 4. Check if email already exists in optibuy.tbl_users
    const existingUserRes = await query(
      `SELECT user_id FROM ${TABLE_NAME} WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (existingUserRes.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please log in.'
      });
    }

    // 5. Hash password using bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 6. Insert user into optibuy.tbl_users with role = 'CUSTOMER' & status = 'ACTIVE'
    const insertRes = await query(
      `INSERT INTO ${TABLE_NAME} (full_name, email, phone, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, full_name, email, phone, role, status, created_at, updated_at`,
      [fullName.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash, role, status]
    );

    const newUser = insertRes.rows[0];

    // 7. Generate JWT Token
    const token = jwt.sign(
      { userId: newUser.user_id, email: newUser.email, role: 'CUSTOMER', status: 'ACTIVE' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 8. Return success response (NEVER return password_hash)
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: 'CUSTOMER',
        status: newUser.status,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('[Auth API] Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user against optibuy.tbl_users & enforce status/role rules
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.'
      });
    }

    // Find user in optibuy.tbl_users or public.users by email
    let userRes = await query(
      `SELECT user_id, full_name, email, phone, password_hash, role, status, created_at FROM ${TABLE_NAME} WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      userRes = await query(
        `SELECT user_id, full_name, email, phone, password_hash, role, status, created_at FROM public.users WHERE LOWER(email) = $1`,
        [cleanEmail]
      );
    }

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = userRes.rows[0];
    const userRole = normalizeRole(user.role);
    const userStatus = (user.status || 'ACTIVE').toUpperCase();

    // 1. Check account status: PENDING
    if (userStatus === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Your Sales Person access request is awaiting administrator approval.'
      });
    }

    // 2. Check account status: REJECTED
    if (userStatus === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: 'Your Sales Person access request has been denied by an administrator.'
      });
    }

    // 3. Check account status: INACTIVE / DEACTIVATED
    if (userStatus === 'INACTIVE' || userStatus === 'DEACTIVATED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an OptiBuy administrator.'
      });
    }

    // 4. Compare entered password with stored password_hash using bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 5. Generate JWT Token containing role and status
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: userRole, status: userStatus },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: userRole,
        status: userStatus,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('[Auth API] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user info
 * @access  Private (Bearer Token)
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userRes = await query(
      `SELECT user_id, full_name, email, phone, role, status, created_at FROM ${TABLE_NAME} WHERE user_id = $1`,
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];
    const userRole = normalizeRole(user.role);
    const userStatus = (user.status || 'ACTIVE').toUpperCase();

    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: userRole,
        status: userStatus,
        created_at: user.created_at
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate a single-use SHA-256 hashed password reset token and send reset link via email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // Rate limit check
    const rateLimitKey = `${req.ip || 'ip'}_${cleanEmail}`;
    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({
        success: false,
        message: 'Too many password reset attempts. Please wait 15 minutes before trying again.'
      });
    }

    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    };

    // Look up user in optibuy.tbl_users
    const userRes = await query(
      `SELECT user_id, full_name, email, password_hash, status FROM ${TABLE_NAME} WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return res.json(genericResponse);
    }

    const user = userRes.rows[0];

    // If user is Google OAuth only (no password set)
    if (user.password_hash === 'OAUTH_GOOGLE_USER') {
      console.log(`[Forgot Password] Account ${cleanEmail} is a Google OAuth account. Skipping password reset.`);
      return res.json(genericResponse);
    }

    // Generate cryptographically secure random token (32 bytes -> 64 hex chars)
    const rawResetToken = crypto.randomBytes(32).toString('hex');

    // Hash token with SHA-256 for DB storage
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // Expiration: 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Save token hash and expiration in DB with auto-schema fallback
    try {
      await query(
        `UPDATE ${TABLE_NAME}
         SET password_reset_token_hash = $1, password_reset_expires_at = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3`,
        [tokenHash, expiresAt, user.user_id]
      );
    } catch (dbErr) {
      console.error('[Forgot Password DB Fallback]', dbErr.message);
      try {
        await query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN IF NOT EXISTS password_reset_token_hash VARCHAR(255);`);
        await query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP WITH TIME ZONE;`);
        await query(
          `UPDATE ${TABLE_NAME}
           SET password_reset_token_hash = $1, password_reset_expires_at = $2, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $3`,
          [tokenHash, expiresAt, user.user_id]
        );
      } catch (fallbackErr) {
        console.error('[Forgot Password DB Fallback Failed]', fallbackErr.message);
      }
    }

    const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetLink = `${frontendBaseUrl}/reset-password?token=${rawResetToken}`;

    console.log(`\n==================================================`);
    console.log(`🔑 OPTIBUY PASSWORD RESET LINK GENERATED FOR: ${cleanEmail}`);
    console.log(`🔗 Reset Link: ${resetLink}`);
    console.log(`==================================================\n`);

    // Send email asynchronously
    sendPasswordResetEmail(cleanEmail, resetLink).catch(err => {
      console.error('[Email Send Error]', err.message);
    });

    return res.json(genericResponse);

  } catch (error) {
    console.error('[Auth API] Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing password reset request.'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Validate token hash, verify expiration, update password_hash with bcrypt, and clear reset token fields
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing password reset link.'
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Hash the incoming raw token using SHA-256 to search DB
    const incomingTokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // Find matching user by password_reset_token_hash
    const userRes = await query(
      `SELECT user_id, email, password_reset_expires_at, role, status FROM ${TABLE_NAME} WHERE password_reset_token_hash = $1`,
      [incomingTokenHash]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link.'
      });
    }

    const user = userRes.rows[0];

    // Check expiration
    const expiresAt = user.password_reset_expires_at ? new Date(user.password_reset_expires_at).getTime() : 0;
    if (Date.now() > expiresAt) {
      // Invalidate expired token
      await query(
        `UPDATE ${TABLE_NAME}
         SET password_reset_token_hash = NULL, password_reset_expires_at = NULL
         WHERE user_id = $1`,
        [user.user_id]
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link.'
      });
    }

    // Hash new password using bcrypt
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password_hash and clear token hash + expiration in PostgreSQL
    // STRICTLY preserves user role, status, email, user_id
    await query(
      `UPDATE ${TABLE_NAME}
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [newPasswordHash, user.user_id]
    );

    return res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    });

  } catch (error) {
    console.error('[Auth API] Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting password: ' + error.message
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user's full_name and phone number in optibuy.tbl_users
 * @access  Private (Bearer Token)
 */
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const fullName = req.body.fullName || req.body.full_name;
    const phone = req.body.phone;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name cannot be empty.' });
    }

    const updateRes = await query(
      `UPDATE ${TABLE_NAME}
       SET full_name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING user_id, full_name, email, phone, role, status, created_at`,
      [fullName.trim(), phone ? phone.trim() : null, decoded.userId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const updatedUser = updateRes.rows[0];

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        user_id: updatedUser.user_id,
        full_name: updatedUser.full_name,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        status: updatedUser.status,
        created_at: updatedUser.created_at
      }
    });

  } catch (error) {
    console.error('[Auth API] Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile: ' + error.message });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change authenticated user's password securely in optibuy.tbl_users
 * @access  Private (Bearer Token)
 */
router.put('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const userRes = await query(
      `SELECT user_id, password_hash FROM ${TABLE_NAME} WHERE user_id = $1`,
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const user = userRes.rows[0];

    if (user.password_hash === 'OAUTH_GOOGLE_USER') {
      return res.status(400).json({
        success: false,
        message: 'Google OAuth accounts do not use password authentication.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await query(
      `UPDATE ${TABLE_NAME}
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [newPasswordHash, decoded.userId]
    );

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });

  } catch (error) {
    console.error('[Auth API] Change password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password: ' + error.message });
  }
});

export default router;

