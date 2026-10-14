import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import salesPersonRouter from '../routes/salesPerson.js';
import productsRouter from '../routes/products.js';
import { query } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';

// Create test express app mounting salesPerson and products routes
const app = express();
app.use(express.json());
app.use('/api/sales-person', salesPersonRouter);
app.use('/api/products', productsRouter);

// Tokens
// Active Sales Executive (User ID 9: neeva@gmail.com)
const salesExecutiveToken = jwt.sign(
  { userId: 9, email: 'neeva@gmail.com', role: 'SALES_PERSON', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Customer Token (User ID 4: aryadileep@gmail.com)
const customerToken = jwt.sign(
  { userId: 4, email: 'aryadileep@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Pending Sales Executive token placeholder
let pendingUserId;
let pendingSalesToken;

// Showroom Admin Token (User ID 2: optibuyadmin@gmail.com)
const adminToken = jwt.sign(
  { userId: 2, email: 'optibuyadmin@gmail.com', role: 'ADMIN', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('OptiBuy Sales Executive Dashboard API Integration Tests', () => {

  beforeAll(async () => {
    // Also sync sequence if needed
    try {
      await query(`SELECT setval('users_user_id_seq', GREATEST((SELECT MAX(user_id) FROM public.users), 1))`);
    } catch (e) {
      // ignore
    }
    const maxRes = await query(`SELECT COALESCE(MAX(user_id), 0) + 100 as nid FROM public.users`);
    pendingUserId = parseInt(maxRes.rows[0].nid, 10);
    await query(
      `INSERT INTO public.users (user_id, email, full_name, password_hash, role, status)
       VALUES ($1, 'pending_test_staff@optibuy.com', 'Pending Sales Staff', 'hash123', 'SALES_PERSON', 'PENDING')
       ON CONFLICT (email) DO UPDATE SET status = 'PENDING'
       RETURNING user_id`,
      [pendingUserId]
    );
    pendingSalesToken = jwt.sign(
      { userId: pendingUserId, email: 'pending_test_staff@optibuy.com', role: 'SALES_PERSON', status: 'PENDING' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (pendingUserId) {
      await query(`DELETE FROM public.users WHERE user_id = $1`, [pendingUserId]);
    }
  });

  // ==========================================
  // 1. Access Control & Authorization
  // ==========================================
  describe('Access Control & Role Guards', () => {
    it('should reject unauthenticated request to sales stats with 401', async () => {
      const res = await request(app).get('/api/sales-person/dashboard/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject tampered or invalid JWT token with 401', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', 'Bearer invalid_tampered_token_xyz');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should prevent CUSTOMER role from accessing Sales Executive routes (403)', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent PENDING sales executive from accessing dashboard until approved (403)', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', `Bearer ${pendingSalesToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('administrator approval');
    });

    it('should allow approved ACTIVE Sales Executive to access dashboard (200)', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should prevent Sales Executive from modifying product stock (Admin Only - 403)', async () => {
      const res = await request(app)
        .patch('/api/products/1/stock')
        .set('Authorization', `Bearer ${salesExecutiveToken}`)
        .send({ stockQuantity: 99 });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent Sales Executive from creating new products (Admin Only - 403)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${salesExecutiveToken}`)
        .send({ name: 'Unauthorized Product', price: 9999 });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 2. Dashboard Statistics & Sales Target
  // ==========================================
  describe('Sales Dashboard Stats & Targets API', () => {
    it('should retrieve authentic backend metrics without fabricated stats', async () => {
      const res = await request(app)
        .get('/api/sales-person/dashboard/stats')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const stats = res.body.stats;
      expect(stats).toBeDefined();

      // Sales & Targets
      expect(typeof stats.mySalesINR).toBe('number');
      expect(stats.mySalesINR).toBeGreaterThanOrEqual(0);
      expect(typeof stats.myOrdersCount).toBe('number');
      expect(stats.myOrdersCount).toBeGreaterThanOrEqual(0);
      expect(typeof stats.monthlyTargetINR).toBe('number');
      expect(stats.monthlyTargetINR).toBeGreaterThan(0);
      expect(typeof stats.targetProgressPct).toBe('number');
      expect(stats.targetProgressPct).toBeGreaterThanOrEqual(0);
      expect(stats.targetProgressPct).toBeLessThanOrEqual(100);

      // Assistance Tickets breakdown
      expect(typeof stats.totalRequestsCount).toBe('number');
      expect(typeof stats.pendingRequestsCount).toBe('number');
      expect(typeof stats.inProgressRequestsCount).toBe('number');
      expect(typeof stats.resolvedRequestsCount).toBe('number');

      // Showroom Inventory Health
      expect(typeof stats.inStockCount).toBe('number');
      expect(typeof stats.lowStockCount).toBe('number');
      expect(typeof stats.outOfStockCount).toBe('number');
    });
  });

  // ==========================================
  // 3. Customer Assistance Requests
  // ==========================================
  describe('Customer Assistance Workflow API', () => {
    it('should retrieve customer assistance requests with customer preferences and product details', async () => {
      const res = await request(app)
        .get('/api/sales-person/requests')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);

      if (res.body.requests.length > 0) {
        const reqItem = res.body.requests[0];
        expect(reqItem.id).toBeDefined();
        expect(reqItem.customerName).toBeDefined();
        expect(reqItem.requestType).toBeDefined();
        expect(reqItem.status).toBeDefined();
        // Should include customer preferences if available
        expect(reqItem).toHaveProperty('preferredCategory');
        expect(reqItem).toHaveProperty('preferredBrand');
        expect(reqItem).toHaveProperty('budgetMin');
        expect(reqItem).toHaveProperty('budgetMax');
        expect(reqItem).toHaveProperty('preferredFeatures');
      }
    });

    it('should filter assistance requests by status', async () => {
      const res = await request(app)
        .get('/api/sales-person/requests?status=NEW')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.requests.forEach(r => {
        expect(r.status).toBe('NEW');
      });
    });

    it('should reject invalid status string with 400', async () => {
      const res = await request(app)
        .put('/api/sales-person/requests/1')
        .set('Authorization', `Bearer ${salesExecutiveToken}`)
        .send({ status: 'INVALID_STATUS_XYZ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid status');
    });

    it('should reject direct transition from NEW to RESOLVED without IN_PROGRESS (400)', async () => {
      // Create a test request in NEW status
      const insertRes = await query(
        `INSERT INTO public.customer_assistance_requests (customer_id, request_type, status, notes)
         VALUES (4, 'GENERAL_ASSISTANCE', 'NEW', 'Test Direct Resolve Rejection')
         RETURNING id`,
        []
      );
      const testReqId = insertRes.rows[0].id;

      const res = await request(app)
        .put(`/api/sales-person/requests/${testReqId}`)
        .set('Authorization', `Bearer ${salesExecutiveToken}`)
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('must be accepted (IN_PROGRESS) before being completed');

      // Cleanup
      await query(`DELETE FROM public.customer_assistance_requests WHERE id = $1`, [testReqId]);
    });

    it('should validate complete lifecycle: NEW -> IN_PROGRESS -> RESOLVED', async () => {
      // 1. Create request
      const insertRes = await query(
        `INSERT INTO public.customer_assistance_requests (customer_id, request_type, status, notes)
         VALUES (4, 'PRODUCT_INQUIRY', 'NEW', 'Lifecycle Validation Test')
         RETURNING id`,
        []
      );
      const reqId = insertRes.rows[0].id;

      // 2. Accept / Assign request (NEW -> IN_PROGRESS)
      const assignRes = await request(app)
        .put(`/api/sales-person/requests/${reqId}/assign`)
        .set('Authorization', `Bearer ${salesExecutiveToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.success).toBe(true);
      expect(assignRes.body.request.status).toBe('IN_PROGRESS');
      expect(assignRes.body.request.sales_person_id).toBe(9);

      // 3. Complete request (IN_PROGRESS -> RESOLVED)
      const resolveRes = await request(app)
        .put(`/api/sales-person/requests/${reqId}`)
        .set('Authorization', `Bearer ${salesExecutiveToken}`)
        .send({ status: 'RESOLVED', notes: 'Completed in showroom consultation.' });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.success).toBe(true);
      expect(resolveRes.body.request.status).toBe('RESOLVED');

      // 4. Verify activity was logged
      const actRes = await query(
        `SELECT activity_type FROM public.sales_activities WHERE sales_person_id = 9 AND activity_type = 'ASSISTANCE_RESOLVED' ORDER BY created_at DESC LIMIT 1`
      );
      expect(actRes.rows.length).toBeGreaterThan(0);

      // Cleanup
      await query(`DELETE FROM public.customer_assistance_requests WHERE id = $1`, [reqId]);
    });
  });

  // ==========================================
  // 4. Tailored Recommendations & Match Scoring
  // ==========================================
  describe('Tailored Recommendations API', () => {
    it('should reject match-scores request if customerId is missing (400)', async () => {
      const res = await request(app)
        .get('/api/sales-person/recommendations/match-scores')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should calculate OptiBuy match scores for a customer using shared engine', async () => {
      const res = await request(app)
        .get('/api/sales-person/recommendations/match-scores?customerId=4&limit=5')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.preferences).toBeDefined();
      expect(Array.isArray(res.body.products)).toBe(true);

      if (res.body.products.length > 0) {
        const topProduct = res.body.products[0];
        expect(typeof topProduct.matchScore).toBe('number');
        expect(topProduct.matchScore).toBeGreaterThanOrEqual(0);
        expect(topProduct.matchScore).toBeLessThanOrEqual(100);
        expect(topProduct.matchDetails).toBeDefined();
        expect(topProduct.matchDetails).toHaveProperty('budget');
        expect(topProduct.matchDetails).toHaveProperty('category');
        expect(topProduct.matchDetails.budget).toHaveProperty('score');
      }
    });

    it('should save a tailored product recommendation to the database', async () => {
      // Find a valid active product
      const prodRes = await query(`SELECT id FROM public.products WHERE status = 'ACTIVE' LIMIT 1`);
      const prodId = prodRes.rows[0].id;

      const res = await request(app)
        .post('/api/sales-person/recommendations')
        .set('Authorization', `Bearer ${salesExecutiveToken}`)
        .send({
          customerId: 4,
          productId: prodId,
          recommendationNote: 'Integration test tailored recommendation note for customer.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.recommendation).toBeDefined();
      expect(res.body.recommendation.sales_person_id).toBe(9);
      expect(res.body.recommendation.product_id).toBe(prodId);

      // Verify recommendation is retrievable
      const getRes = await request(app)
        .get('/api/sales-person/recommendations')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      const found = getRes.body.recommendations.find(r => r.id === res.body.recommendation.id);
      expect(found).toBeDefined();

      // Cleanup test recommendation
      await query(`DELETE FROM public.product_recommendations WHERE id = $1`, [res.body.recommendation.id]);
    });
  });

  // ==========================================
  // 5. Showroom Inventory Visibility
  // ==========================================
  describe('Showroom Inventory API', () => {
    it('should allow Sales Executive to view real-time inventory and stock levels', async () => {
      const res = await request(app)
        .get('/api/products/sales/inventory')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);

      if (res.body.products.length > 0) {
        const p = res.body.products[0];
        expect(p.id).toBeDefined();
        expect(p.name).toBeDefined();
        expect(typeof p.stockQuantity).toBe('number');
        expect(p.stockStatus).toBeDefined();
      }
    });

    it('should support inStockOnly filter on inventory endpoint', async () => {
      const res = await request(app)
        .get('/api/products/sales/inventory?inStockOnly=true')
        .set('Authorization', `Bearer ${salesExecutiveToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.products.forEach(p => {
        expect(p.stockQuantity).toBeGreaterThan(0);
      });
    });
  });

});
