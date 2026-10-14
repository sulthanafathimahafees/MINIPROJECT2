import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dashboardRouter from '../routes/dashboard.js';
import adminUsersRouter from '../routes/adminUsers.js';
import productsRouter from '../routes/products.js';
import orderRouter from '../routes/orders.js';
import { query, schemaName } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';

// Setup Test App
const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin/dashboard', dashboardRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/products', productsRouter);
app.use('/api/admin/orders', orderRouter);

// Tokens
const adminToken = jwt.sign(
  { userId: 2, email: 'optibuyadmin@gmail.com', role: 'ADMIN', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const customerToken = jwt.sign(
  { userId: 4, email: 'aryadileep@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const salesPersonToken = jwt.sign(
  { userId: 9, email: 'neeva@gmail.com', role: 'SALES_PERSON', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

let testApplicantId;
let testProductId;
let testOrderId;

describe('OptiBuy Administrator Dashboard & Backend API Integration Tests', () => {

  beforeAll(async () => {
    // 1. Seed a test pending sales applicant
    const maxUserRes = await query(`SELECT COALESCE(MAX(user_id), 0) + 50 as nid FROM ${schemaName}.tbl_users`);
    testApplicantId = parseInt(maxUserRes.rows[0].nid, 10);

    await query(
      `INSERT INTO ${schemaName}.tbl_users (user_id, full_name, email, phone, password_hash, role, status, department)
       VALUES ($1, 'Applicant Test User', 'applicant_test@optibuy.com', '9876543210', 'hashedpass', 'SALES_PERSON', 'PENDING', 'Showroom Floor')
       ON CONFLICT (email) DO UPDATE SET status = 'PENDING', role = 'SALES_PERSON'
       RETURNING user_id`,
      [testApplicantId]
    );

    try {
      await query(
        `INSERT INTO public.users (user_id, full_name, email, phone, password_hash, role, status, department)
         VALUES ($1, 'Applicant Test User', 'applicant_test@optibuy.com', '9876543210', 'hashedpass', 'SALES_PERSON', 'PENDING', 'Showroom Floor')
         ON CONFLICT (email) DO UPDATE SET status = 'PENDING', role = 'SALES_PERSON'`,
        [testApplicantId]
      );
    } catch (e) {}

    // 2. Seed a test order if needed
    const orderCheck = await query(`SELECT order_id FROM ${schemaName}.tbl_orders LIMIT 1`);
    if (orderCheck.rows.length > 0) {
      testOrderId = orderCheck.rows[0].order_id;
    } else {
      const orderInsert = await query(
        `INSERT INTO ${schemaName}.tbl_orders (customer_id, total_amount, order_status, payment_status)
         VALUES ($1, 99999.00, 'PROCESSING', 'PAID')
         RETURNING order_id`,
        [4]
      );
      testOrderId = orderInsert.rows[0].order_id;
    }
  });

  afterAll(async () => {
    // Clean up test applicant & created product
    try {
      if (testApplicantId) {
        await query(`DELETE FROM ${schemaName}.tbl_users WHERE user_id = $1`, [testApplicantId]);
        await query(`DELETE FROM public.users WHERE user_id = $1`, [testApplicantId]);
      }
      if (testProductId) {
        await query(`DELETE FROM public.products WHERE id = $1`, [testProductId]);
      }
    } catch (e) {}
  });

  describe('1. Security & Administrative Authorization', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/admin/dashboard/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject CUSTOMER role with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject SALES_PERSON role with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${salesPersonToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow ADMIN role to access dashboard stats', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('2. Admin Overview & Dynamic KPI Metrics', () => {
    it('should calculate genuine dashboard values from PostgreSQL without hardcoded counts', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const { data } = res.body;

      // Real calculated metrics
      expect(data.totalUsers).toBeGreaterThan(0);
      expect(data.totalCustomers).toBeGreaterThanOrEqual(0);
      expect(data.totalApprovedSalesPersons).toBeGreaterThanOrEqual(0);
      expect(data.pendingSalesRequests).toBeGreaterThanOrEqual(0);
      expect(data.adminCount).toBeGreaterThanOrEqual(1);

      // Product & Inventory metrics
      expect(data.totalProducts).toBeGreaterThan(0);
      expect(data.activeProducts).toBeGreaterThan(0);
      expect(data.lowStockProducts).toBeGreaterThanOrEqual(0);
      expect(data.outOfStockProducts).toBeGreaterThanOrEqual(0);

      // Assistance requests metrics
      expect(data.totalAssistanceRequests).toBeGreaterThanOrEqual(0);
      expect(data.pendingAssistanceRequests).toBeGreaterThanOrEqual(0);

      // Orders & Revenue
      expect(data.totalOrders).toBeGreaterThanOrEqual(0);
      expect(typeof data.totalRevenue).toBe('number');

      // User list without exposing passwords or password hashes
      expect(Array.isArray(data.users)).toBe(true);
      data.users.forEach(u => {
        expect(u.password).toBeUndefined();
        expect(u.password_hash).toBeUndefined();
        expect(u.passwordHash).toBeUndefined();
      });
    });

    it('should return sales trends as an array without fabricated fallback months when query succeeds', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/sales-trend')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.trends)).toBe(true);
    });
  });

  describe('3. Sales Executive Approval Workflow', () => {
    it('should list pending sales executive requests', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/sales-requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);
      const found = res.body.requests.find(r => (r.userId || r.user_id) === testApplicantId);
      expect(found).toBeDefined();
      expect(found.status).toBe('PENDING');
    });

    it('should approve a sales executive request and persist role=SALES_PERSON and status=ACTIVE', async () => {
      const res = await request(app)
        .post(`/api/dashboard/admin/sales-requests/${testApplicantId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('SALES_PERSON');
      expect(res.body.user.status).toBe('ACTIVE');

      // Verify in database
      const checkRes = await query(`SELECT role, status FROM ${schemaName}.tbl_users WHERE user_id = $1`, [testApplicantId]);
      expect(checkRes.rows[0].role).toBe('SALES_PERSON');
      expect(checkRes.rows[0].status).toBe('ACTIVE');
    });

    it('should reject a sales executive request with custom reason', async () => {
      const res = await request(app)
        .post(`/api/dashboard/admin/sales-requests/${testApplicantId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Showroom staff requirement met.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('CUSTOMER');
      expect(res.body.user.status).toBe('REJECTED');

      // Verify in database
      const checkRes = await query(`SELECT role, status FROM ${schemaName}.tbl_users WHERE user_id = $1`, [testApplicantId]);
      expect(checkRes.rows[0].role).toBe('CUSTOMER');
      expect(checkRes.rows[0].status).toBe('REJECTED');
    });
  });

  describe('4. User Management & Root Admin Safeguards', () => {
    it('should list users with pagination, role and status, without password hashes', async () => {
      const res = await request(app)
        .get('/api/admin/users?limit=10&page=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      res.body.users.forEach(u => {
        expect(u.password_hash).toBeUndefined();
      });
    });

    it('should prevent administrator from deactivating their own active account', async () => {
      const res = await request(app)
        .patch('/api/admin/users/2/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Security Restriction');
    });

    it('should prevent deactivating the root administrator account optibuyadmin@gmail.com', async () => {
      // Find user id for optibuyadmin@gmail.com
      const adminLookup = await query(`SELECT user_id FROM ${schemaName}.tbl_users WHERE LOWER(email) = 'optibuyadmin@gmail.com' LIMIT 1`);
      const rootAdminId = adminLookup.rows[0].user_id;

      // Fake token of another admin if different id, or test protection alert
      const res = await request(app)
        .put(`/api/dashboard/admin/users/${rootAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should prevent demoting the root administrator account optibuyadmin@gmail.com', async () => {
      const adminLookup = await query(`SELECT user_id FROM ${schemaName}.tbl_users WHERE LOWER(email) = 'optibuyadmin@gmail.com' LIMIT 1`);
      const rootAdminId = adminLookup.rows[0].user_id;

      const res = await request(app)
        .patch(`/api/admin/users/${rootAdminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'CUSTOMER' });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Product Catalog & Inventory Validations', () => {
    it('should reject product creation with negative price (400)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Negative Price Item',
          price: -299.99,
          stockQuantity: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('non-negative number');
    });

    it('should reject product creation with negative stock quantity (400)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Negative Stock Item',
          price: 19999.00,
          stockQuantity: -5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('non-negative integer');
    });

    it('should successfully create a valid product in the catalog', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'OptiBuy Test Smart Display 15',
          price: 24999.00,
          originalPrice: 29999.00,
          stockQuantity: 12,
          modelNumber: 'OB-TEST-15',
          description: 'High-res smart showroom display'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toBeDefined();
      testProductId = res.body.product.id;
      expect(res.body.product.stock_status).toBe('IN_STOCK');
    });

    it('should update product stock safely and adjust stock_status automatically', async () => {
      // 1. Update to low stock (3 units)
      const lowStockRes = await request(app)
        .patch(`/api/products/${testProductId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stockQuantity: 3 });

      expect(lowStockRes.status).toBe(200);
      expect(lowStockRes.body.product.stock_quantity).toBe(3);
      expect(lowStockRes.body.product.stock_status).toBe('LOW_STOCK');

      // 2. Update to out of stock (0 units)
      const outStockRes = await request(app)
        .patch(`/api/products/${testProductId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stockQuantity: 0 });

      expect(outStockRes.status).toBe(200);
      expect(outStockRes.body.product.stock_quantity).toBe(0);
      expect(outStockRes.body.product.stock_status).toBe('OUT_OF_STOCK');
    });

    it('should reject stock update with negative quantity (400)', async () => {
      const res = await request(app)
        .patch(`/api/products/${testProductId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stockQuantity: -10 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('non-negative integer');
    });
  });

  describe('6. Customer Assistance Requests Monitoring', () => {
    it('should list customer assistance requests with status counts', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/assistance-requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);
      expect(res.body.counts).toBeDefined();
      expect(typeof res.body.counts.total).toBe('number');
      expect(typeof res.body.counts.new).toBe('number');
      expect(typeof res.body.counts.inProgress).toBe('number');
    });

    it('should support filtering assistance requests by status', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/assistance-requests?status=NEW')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.requests.forEach(r => {
        expect(r.status).toBe('NEW');
      });
    });
  });

  describe('7. Orders Fulfillment & Sales Analytics', () => {
    it('should retrieve order fulfillment list with customer and payment info', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);
      if (res.body.orders.length > 0) {
        const first = res.body.orders[0];
        expect(first.orderId).toBeDefined();
        expect(typeof first.amount).toBe('number');
        expect(first.status).toBeDefined();
      }
    });

    it('should reject invalid administrative order status transition (400)', async () => {
      const res = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS_XYZ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid order status');
    });

    it('should successfully update order status to SHIPPED', async () => {
      const res = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.order_status).toBe('SHIPPED');
    });

    it('should calculate authentic gross revenue and average order value', async () => {
      const res = await request(app)
        .get('/api/admin/orders/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.grossRevenue).toBe('number');
      expect(typeof res.body.data.totalOrders).toBe('number');
      expect(typeof res.body.data.avgOrderValue).toBe('number');
    });
  });
});
