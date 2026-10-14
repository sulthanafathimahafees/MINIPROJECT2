import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticateToken, authorizeRoles, normalizeRole } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';

// Create test app with role-protected endpoints
const app = express();
app.use(express.json());

// Public login simulation endpoint adhering to OptiBuy auth logic
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
  }

  // Known test accounts matching database seed
  const mockUsers = [
    { id: 2, email: 'optibuyadmin@gmail.com', password: 'adminpassword', role: 'ADMIN', status: 'ACTIVE', fullName: 'OptiBuy Admin' },
    { id: 9, email: 'neeva@gmail.com', password: 'salespassword', role: 'SALES_PERSON', status: 'ACTIVE', fullName: 'Neeva Sunish Mathew' },
    { id: 4, email: 'aryadileep@gmail.com', password: 'customerpassword', role: 'CUSTOMER', status: 'ACTIVE', fullName: 'Arya Dileep' },
    { id: 20, email: 'pendingstaff@gmail.com', password: 'staffpassword', role: 'SALES_PERSON', status: 'PENDING', fullName: 'Pending Staff' },
  ];

  const user = mockUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.status === 'PENDING') {
    return res.status(403).json({ success: false, message: 'Your Sales Person access request is awaiting administrator approval.' });
  }

  const userRole = normalizeRole(user.role);
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: userRole, status: user.status },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      user_id: user.id,
      fullName: user.fullName,
      full_name: user.fullName,
      email: user.email,
      role: userRole,
      status: user.status
    }
  });
});

// Protected Customer Endpoint
app.get('/api/customer/profile', authenticateToken, authorizeRoles('CUSTOMER', 'ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Customer profile accessed', user: req.user });
});

// Protected Sales Executive Endpoint
app.get('/api/sales-person/dashboard/stats', authenticateToken, authorizeRoles('SALES_PERSON', 'SALES_EXECUTIVE', 'ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Sales executive dashboard stats accessed', user: req.user });
});

// Protected Admin-Only Endpoint
app.get('/api/admin/users', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Admin user governance accessed', user: req.user });
});

describe('End-to-End Role-Based Authentication & Authorization Tests', () => {

  // Helper tokens
  const customerToken = jwt.sign({ userId: 4, email: 'aryadileep@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' }, JWT_SECRET);
  const salesToken = jwt.sign({ userId: 9, email: 'neeva@gmail.com', role: 'SALES_PERSON', status: 'ACTIVE' }, JWT_SECRET);
  const salesExecToken = jwt.sign({ userId: 10, email: 'salesexec@optibuy.com', role: 'SALES_EXECUTIVE', status: 'ACTIVE' }, JWT_SECRET);
  const adminToken = jwt.sign({ userId: 2, email: 'optibuyadmin@gmail.com', role: 'ADMIN', status: 'ACTIVE' }, JWT_SECRET);
  const expiredToken = jwt.sign({ userId: 4, email: 'aryadileep@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' }, JWT_SECRET, { expiresIn: '-1s' });

  describe('1. Login Credential Validation & Role Redirection Data', () => {
    it('should successfully log in Customer and return role CUSTOMER', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'aryadileep@gmail.com', password: 'customerpassword' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('CUSTOMER');
      expect(res.body.user.fullName).toBe('Arya Dileep');
      expect(res.body.user).not.toHaveProperty('password_hash');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should successfully log in Sales Executive and return role SALES_PERSON', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'neeva@gmail.com', password: 'salespassword' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('SALES_PERSON');
      expect(res.body.user.fullName).toBe('Neeva Sunish Mathew');
    });

    it('should successfully log in Admin and return role ADMIN', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'optibuyadmin@gmail.com', password: 'adminpassword' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMIN');
      expect(res.body.user.fullName).toBe('OptiBuy Admin');
    });

    it('should reject invalid password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'optibuyadmin@gmail.com', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should reject non-existent user with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@optibuy.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject pending staff account with 403', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'pendingstaff@gmail.com', password: 'staffpassword' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('awaiting administrator approval');
    });
  });

  describe('2. Protected Routes & Role Authorization Enforcement', () => {
    it('should deny unauthenticated requests to protected endpoints (401)', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should deny expired JWT token requests (401)', async () => {
      const res = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid or expired session token');
    });

    it('should deny Customer from accessing Admin endpoints (403)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
      expect(res.body.message).toContain('Authorized roles: [ADMIN]');
    });

    it('should deny Customer from accessing Sales Executive endpoints (403)', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should deny Sales Executive from accessing Admin endpoints (403)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should allow Sales Executive with role SALES_PERSON to access Sales endpoint (200)', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Sales executive dashboard stats accessed');
    });

    it('should allow Sales Executive with role SALES_EXECUTIVE alias to access Sales endpoint (200)', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', `Bearer ${salesExecToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow Admin to access Admin endpoint (200)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Admin user governance accessed');
    });

    it('should allow Customer to access Customer endpoint (200)', async () => {
      const res = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
