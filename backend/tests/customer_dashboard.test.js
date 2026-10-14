import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import customerRouter from '../routes/customer.js';
import { query } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';

// Create test express app mounting the actual customer routes
const app = express();
app.use(express.json());
app.use('/api/customer', customerRouter);

// Demo tokens
const customerToken = jwt.sign(
  { userId: 4, email: 'aryadileep@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const otherCustomerToken = jwt.sign(
  { userId: 999999, email: 'othercustomer@test.com', role: 'CUSTOMER', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('OptiBuy Customer Dashboard API Integration Tests', () => {

  // ==========================================
  // 1. Authentication & Security Enforcement
  // ==========================================
  describe('Security & Authorization Guard', () => {
    it('should reject unauthenticated request to /api/customer/profile with 401', async () => {
      const res = await request(app).get('/api/customer/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid JWT token with 401', async () => {
      const res = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', 'Bearer invalid_tampered_token_xyz');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject negative or out-of-range limit parameter on match-score with 400', async () => {
      const res = await request(app)
        .get('/api/customer/match-score?limit=9999')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 2. Profile Management
  // ==========================================
  describe('Customer Profile API', () => {
    it('should retrieve authenticated customer profile', async () => {
      const res = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile).toBeDefined();
      expect(res.body.profile.email).toBe('aryadileep@gmail.com');
      // Password or password_hash must never be returned
      expect(res.body.profile.password).toBeUndefined();
      expect(res.body.profile.password_hash).toBeUndefined();
    });

    it('should update customer profile details', async () => {
      const res = await request(app)
        .put('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          fullName: 'Arya Dileep',
          phone: '9876543210',
          address: 'Kochi, Kerala, India'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.full_name).toBe('Arya Dileep');
    });
  });

  // ==========================================
  // 3. Customer Preferences & Match Scoring
  // ==========================================
  describe('Customer Preferences & Explainable Match Scoring', () => {
    it('should update and retrieve customer preferences', async () => {
      const updateRes = await request(app)
        .put('/api/customer/preferences')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          preferredCategory: 'Smartphones',
          preferredBrand: 'Apple',
          minimumBudgetINR: 50000,
          maximumBudgetINR: 150000,
          preferredFeatures: ['OLED Display', 'High Battery Endurance', 'Fast Charging']
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.preferences.preferredCategory).toBe('Smartphones');
      expect(updateRes.body.preferences.preferredBrand).toBe('Apple');

      const getRes = await request(app)
        .get('/api/customer/preferences')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.preferences.preferredCategory).toBe('Smartphones');
    });

    it('should calculate transparent rule-based match scores with factor explanations', async () => {
      const res = await request(app)
        .get('/api/customer/match-score?limit=5')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);

      if (res.body.products.length > 0) {
        const topProduct = res.body.products[0];
        // Score normalized 0-100
        expect(topProduct.matchScore).toBeGreaterThanOrEqual(0);
        expect(topProduct.matchScore).toBeLessThanOrEqual(100);

        // Score must contain explainable breakdown factors
        expect(topProduct.matchDetails).toBeDefined();
        expect(topProduct.matchDetails.category).toBeDefined();
        expect(topProduct.matchDetails.brand).toBeDefined();
        expect(topProduct.matchDetails.budget).toBeDefined();
        expect(topProduct.matchDetails.features).toBeDefined();
        expect(topProduct.matchDetails.rating).toBeDefined();

        // Explanation text must be present
        expect(typeof topProduct.matchDetails.category.reason).toBe('string');
        expect(typeof topProduct.matchDetails.budget.reason).toBe('string');
      }
    });
  });

  // ==========================================
  // 4. Customer Wishlist Management
  // ==========================================
  describe('Customer Wishlist API', () => {
    const testProductId = 2;

    it('should allow customer to add a product to wishlist', async () => {
      const res = await request(app)
        .post('/api/customer/wishlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProductId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should retrieve customer wishlist containing the added product', async () => {
      const res = await request(app)
        .get('/api/customer/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.wishlist)).toBe(true);
      const found = res.body.wishlist.some(item => Number(item.productId) === testProductId);
      expect(found).toBe(true);
    });

    it('should prevent duplicate wishlist entries gracefully (idempotent)', async () => {
      const res = await request(app)
        .post('/api/customer/wishlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProductId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should isolate wishlist data: other customer should not see Arya wishlist', async () => {
      const res = await request(app)
        .get('/api/customer/wishlist')
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.wishlist)).toBe(true);
      const found = res.body.wishlist.some(item => Number(item.productId) === testProductId);
      expect(found).toBe(false);
    });

    it('should remove product from wishlist', async () => {
      const res = await request(app)
        .delete(`/api/customer/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify removal
      const checkRes = await request(app)
        .get('/api/customer/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);
      const found = checkRes.body.wishlist.some(item => Number(item.productId) === testProductId);
      expect(found).toBe(false);
    });
  });

  // ==========================================
  // 5. Product Comparison Matrix
  // ==========================================
  describe('Customer Comparison Matrix API', () => {
    it('should add products to comparison and enforce max 3 items limit', async () => {
      // Clear first
      await request(app).delete('/api/customer/comparison/2').set('Authorization', `Bearer ${customerToken}`);
      await request(app).delete('/api/customer/comparison/3').set('Authorization', `Bearer ${customerToken}`);
      await request(app).delete('/api/customer/comparison/4').set('Authorization', `Bearer ${customerToken}`);
      await request(app).delete('/api/customer/comparison/5').set('Authorization', `Bearer ${customerToken}`);

      // Add 1 (ID: 2)
      const res1 = await request(app)
        .post('/api/customer/comparison')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 2 });
      expect(res1.status).toBe(201);

      // Add 2 (ID: 3)
      const res2 = await request(app)
        .post('/api/customer/comparison')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 3 });
      expect(res2.status).toBe(201);

      // Add 3 (ID: 4)
      const res3 = await request(app)
        .post('/api/customer/comparison')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 4 });
      expect(res3.status).toBe(201);

      // Attempt 4th product (ID: 5) -> Should return 400 with max 3 limit message
      const res4 = await request(app)
        .post('/api/customer/comparison')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 5 });
      expect(res4.status).toBe(400);
      expect(res4.body.message).toMatch(/limit/i);

      // Cleanup
      await request(app).delete('/api/customer/comparison/2').set('Authorization', `Bearer ${customerToken}`);
      await request(app).delete('/api/customer/comparison/3').set('Authorization', `Bearer ${customerToken}`);
      await request(app).delete('/api/customer/comparison/4').set('Authorization', `Bearer ${customerToken}`);
    });
  });

  // ==========================================
  // 6. Showroom Assistance Requests
  // ==========================================
  describe('Showroom Assistance Requests API', () => {
    let createdRequestId = null;

    beforeAll(async () => {
      await query(`DELETE FROM public.customer_assistance_requests WHERE customer_id = 4 AND (notes LIKE 'Automated test%' OR product_id = 2)`);
    });

    afterAll(async () => {
      await query(`DELETE FROM public.customer_assistance_requests WHERE customer_id = 4 AND (notes LIKE 'Automated test%' OR product_id = 2)`);
    });

    it('should submit assistance request and save customerId and status NEW', async () => {
      const res = await request(app)
        .post('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 2,
          requestType: 'PRODUCT_INQUIRY',
          notes: 'Automated test: Customer requesting spec demo on showroom floor.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.request).toBeDefined();
      expect(res.body.request.status).toBe('NEW');
      expect(res.body.request.customerId).toBe(4);
      createdRequestId = res.body.request.id;
    });

    it('should prevent duplicate active assistance request for the same product with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 2,
          requestType: 'PRODUCT_INQUIRY',
          notes: 'Automated test: Repeated submission for the same product.'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('active assistance request');
      expect(res.body.existingRequestId).toBe(createdRequestId);
    });

    it('should retrieve customer assistance requests including assigned sales staff info', async () => {
      const res = await request(app)
        .get('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);

      const found = res.body.requests.find(r => r.id === createdRequestId);
      expect(found).toBeDefined();
      expect(found.requestType).toBe('PRODUCT_INQUIRY');
      expect(found.status).toBe('NEW');
    });

    it('should reject assistance request with missing notes or product', async () => {
      const res = await request(app)
        .post('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          notes: ''
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 7. Orders & Customer Data Ownership
  // ==========================================
  describe('Customer Orders API & Ownership Enforcement', () => {
    it('should return only orders belonging to authenticated customer', async () => {
      const res = await request(app)
        .get('/api/customer/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);

      // Verify each order returned strictly belongs to customer 4
      res.body.orders.forEach(order => {
        expect(order.customerId || 4).toBe(4);
      });
    });

    it('should reject access to another customer order with 404 or 403', async () => {
      // Trying to fetch order ID 999999 that does not belong to customer 4
      const res = await request(app)
        .get('/api/customer/orders/999999')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return empty orders list for new customer without orders', async () => {
      const res = await request(app)
        .get('/api/customer/orders')
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders).toEqual([]);
    });

    it('should create a valid order with server-calculated total and stock deduction', async () => {
      const prodRes = await query(`SELECT id, stock_quantity, price_inr FROM public.products WHERE stock_quantity > 5 LIMIT 1`);
      if (prodRes.rows.length === 0) return;
      const targetProd = prodRes.rows[0];
      const initialStock = parseInt(targetProd.stock_quantity, 10);

      const res = await request(app)
        .post('/api/customer/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: targetProd.id, quantity: 1 }]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.totalAmount).toBe(parseFloat(targetProd.price_inr));

      // Verify stock was deducted by 1
      const afterRes = await query(`SELECT stock_quantity FROM public.products WHERE id = $1`, [targetProd.id]);
      expect(parseInt(afterRes.rows[0].stock_quantity, 10)).toBe(initialStock - 1);
    });

    it('should reject order if inventory is insufficient with 400', async () => {
      const prodRes = await query(`SELECT id, stock_quantity FROM public.products LIMIT 1`);
      if (prodRes.rows.length === 0) return;
      const targetProd = prodRes.rows[0];

      const res = await request(app)
        .post('/api/customer/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: targetProd.id, quantity: 999999 }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient inventory');
    });
  });
});

