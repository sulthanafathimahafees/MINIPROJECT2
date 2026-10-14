import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { normalizeRole, authorizeRoles } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';

describe('Auth Utility & Password Security Unit Tests', () => {
  it('should correctly hash and compare passwords using bcrypt', async () => {
    const plainPassword = 'OptiBuySecretPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    expect(hashedPassword).not.toBe(plainPassword);

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);
    expect(isWrongMatch).toBe(false);
  });

  it('should normalize all recognized role variations accurately', () => {
    // Customer
    expect(normalizeRole('CUSTOMER')).toBe('CUSTOMER');
    expect(normalizeRole('customer')).toBe('CUSTOMER');
    expect(normalizeRole('')).toBe('CUSTOMER');
    expect(normalizeRole(null)).toBe('CUSTOMER');

    // Sales Executive / Person aliases
    expect(normalizeRole('SALES_EXECUTIVE')).toBe('SALES_PERSON');
    expect(normalizeRole('SALES EXECUTIVE')).toBe('SALES_PERSON');
    expect(normalizeRole('sales_executive')).toBe('SALES_PERSON');
    expect(normalizeRole('SALES_PERSON')).toBe('SALES_PERSON');
    expect(normalizeRole('salesperson')).toBe('SALES_PERSON');
    expect(normalizeRole('SALES')).toBe('SALES_PERSON');

    // Admin
    expect(normalizeRole('ADMIN')).toBe('ADMIN');
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole('ADMINISTRATOR')).toBe('ADMIN');
  });

  it('should generate and verify JWT session tokens containing user role and status', () => {
    const roles = ['CUSTOMER', 'SALES_PERSON', 'ADMIN'];

    for (const role of roles) {
      const payload = { userId: 101, email: `${role.toLowerCase()}@optibuy.com`, role, status: 'ACTIVE' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.userId).toBe(101);
      expect(decoded.role).toBe(role);
      expect(decoded.status).toBe('ACTIVE');
    }
  });

  it('should enforce role authorization via authorizeRoles middleware', () => {
    const adminMiddleware = authorizeRoles('ADMIN');
    const salesMiddleware = authorizeRoles('SALES_PERSON', 'SALES_EXECUTIVE');

    // Case 1: Unauthenticated request (no user object)
    let errorResponse = null;
    let nextCalled = false;
    const mockRes = {
      status: (code) => ({
        json: (data) => { errorResponse = { code, ...data }; }
      })
    };

    adminMiddleware({ user: null }, mockRes, () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(errorResponse.code).toBe(403);

    // Case 2: Customer attempts to access Admin endpoint -> 403 Forbidden
    errorResponse = null;
    nextCalled = false;
    adminMiddleware({ user: { role: 'CUSTOMER' } }, mockRes, () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(errorResponse.code).toBe(403);
    expect(errorResponse.message).toContain('Access denied');

    // Case 3: Customer attempts to access Sales Executive endpoint -> 403 Forbidden
    errorResponse = null;
    nextCalled = false;
    salesMiddleware({ user: { role: 'CUSTOMER' } }, mockRes, () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(errorResponse.code).toBe(403);

    // Case 4: Sales Executive accesses Sales Executive endpoint -> next() called
    nextCalled = false;
    salesMiddleware({ user: { role: 'SALES_EXECUTIVE' } }, mockRes, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);

    // Case 5: Sales Person accesses Sales Executive endpoint -> next() called
    nextCalled = false;
    salesMiddleware({ user: { role: 'SALES_PERSON' } }, mockRes, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);

    // Case 6: Admin accesses Admin endpoint -> next() called
    nextCalled = false;
    adminMiddleware({ user: { role: 'ADMIN' } }, mockRes, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
  });
});
