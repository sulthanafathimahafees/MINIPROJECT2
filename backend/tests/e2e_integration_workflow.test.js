import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import authRouter from '../routes/auth.js';
import productsRouter from '../routes/products.js';
import customerRouter from '../routes/customer.js';
import salesPersonRouter from '../routes/salesPerson.js';
import dashboardRouter from '../routes/dashboard.js';
import orderRouter from '../routes/orders.js';
import { query } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';

// Assemble complete Express API app matching backend/server.js
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/customer', customerRouter);
app.use('/api/sales-person', salesPersonRouter);
app.use('/api/admin/dashboard', dashboardRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin/orders', orderRouter);
app.use('/api/orders', orderRouter);

// Standard authenticated tokens for the 3 OptiBuy personas
const adminToken = jwt.sign(
  { userId: 2, email: 'optibuyadmin@gmail.com', role: 'ADMIN', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const customerToken = jwt.sign(
  { userId: 4, email: 'aryadileep@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const salesPersonToken = jwt.sign(
  { userId: 9, email: 'neeva@gmail.com', role: 'SALES_PERSON', status: 'ACTIVE' },
  JWT_SECRET,
  { expiresIn: '2h' }
);

describe('OptiBuy End-to-End Workflow Integration Test Suite', () => {
  let createdProductId = null;
  let testBrandId = 1;
  let testCategoryId = 1;
  let createdAssistanceRequestId = null;
  let customerUserId = 4;
  let sampleOrderId = null;

  beforeAll(async () => {
    // 1. Discover existing brand and category IDs from persistent PostgreSQL
    const brandRes = await query('SELECT id FROM public.brands LIMIT 1');
    if (brandRes.rows.length > 0) testBrandId = brandRes.rows[0].id;

    const catRes = await query('SELECT id FROM public.product_categories LIMIT 1');
    if (catRes.rows.length > 0) testCategoryId = catRes.rows[0].id;

    // 2. Discover an existing order ID for order fulfillment demonstration
    const orderRes = await query('SELECT order_id FROM public.orders LIMIT 1');
    if (orderRes.rows.length > 0) sampleOrderId = orderRes.rows[0].order_id;

    // 3. Clean up any leftover test data
    await query(`DELETE FROM public.customer_assistance_requests WHERE notes LIKE '%E2E Workflow Test%'`);
    await query(`DELETE FROM public.product_recommendations WHERE recommendation_note LIKE '%E2E Workflow Test%'`);
    await query(`DELETE FROM public.products WHERE product_name LIKE '%E2E Test%'`);
  });

  afterAll(async () => {
    // Clean up created test records from PostgreSQL
    if (createdAssistanceRequestId) {
      await query('DELETE FROM public.customer_assistance_requests WHERE id = $1', [createdAssistanceRequestId]);
    }
    await query(`DELETE FROM public.customer_assistance_requests WHERE notes LIKE '%E2E Workflow Test%'`);
    await query(`DELETE FROM public.product_recommendations WHERE recommendation_note LIKE '%E2E Workflow Test%'`);
    if (createdProductId) {
      await query('DELETE FROM public.product_specifications WHERE product_id = $1', [createdProductId]);
      await query('DELETE FROM public.customer_comparisons WHERE product_id = $1', [createdProductId]);
      await query('DELETE FROM public.products WHERE id = $1', [createdProductId]);
    }
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 1: Admin Adds or Verifies Consumer-Electronics Product
  // =========================================================================
  describe('DEMO WORKFLOW STEP 1: Administrator Product & Inventory Management', () => {
    it('should authenticate administrator and verify role-based access', async () => {
      // Verify admin token access to admin inventory
      const res = await request(app)
        .get('/api/products/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('should allow administrator to create a new consumer-electronics product with specifications, price, and inventory', async () => {
      const newProductPayload = {
        productName: 'E2E Test UltraBook Pro 16 AI',
        modelNumber: 'E2E-UBP-16-AI',
        brandId: testBrandId,
        categoryId: testCategoryId,
        priceINR: 149999,
        stockQuantity: 18,
        status: 'ACTIVE',
        specifications: {
          processor: 'Intel Core Ultra 9 185H',
          ram: '32GB LPDDR5X',
          storage: '1TB NVMe Gen4 SSD',
          display: '16-inch 3.2K OLED 120Hz',
          battery: '85Wh All-Day Battery'
        }
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProductPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.id).toBeDefined();
      expect(res.body.product.name).toBe('E2E Test UltraBook Pro 16 AI');
      expect(parseFloat(res.body.product.price)).toBe(149999);
      expect(parseInt(res.body.product.stock, 10)).toBe(18);

      createdProductId = res.body.product.id;
    });

    it('should verify the created product details, specifications, price, and inventory in PostgreSQL', async () => {
      const res = await request(app).get(`/api/products/${createdProductId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.id).toBe(createdProductId);
      expect(res.body.product.name).toBe('E2E Test UltraBook Pro 16 AI');
      expect(parseFloat(res.body.product.priceINR)).toBe(149999);
      expect(parseInt(res.body.product.stockQuantity, 10)).toBe(18);
      expect(res.body.product.specifications).toBeDefined();
      expect(res.body.product.specifications.processor).toBe('Intel Core Ultra 9 185H');
    });

    it('should allow administrator to update product inventory quantity via PATCH /:id/stock', async () => {
      const res = await request(app)
        .patch(`/api/products/${createdProductId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stockQuantity: 25 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(parseInt(res.body.product.stockQuantity, 10)).toBe(25);
    });

    it('should forbid non-administrators from modifying inventory or adding products', async () => {
      const customerRes = await request(app)
        .patch(`/api/products/${createdProductId}/stock`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ stockQuantity: 999 });

      expect(customerRes.status).toBe(403);
    });
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 2: Customer Preferences, Browsing, Compare, Match Score
  // =========================================================================
  describe('DEMO WORKFLOW STEP 2: Customer Preferences, Browsing, Comparison, and Match Score', () => {
    it('should allow customer to browse available consumer electronics including newly added product', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);

      const found = res.body.products.find(p => p.id === createdProductId);
      expect(found).toBeDefined();
      expect(found.name).toBe('E2E Test UltraBook Pro 16 AI');
    });

    it('should allow customer to update and retrieve shopping preferences', async () => {
      const preferencesPayload = {
        preferredCategory: 'Laptops',
        preferredBrand: 'OptiBuy',
        minimumBudgetINR: 50000,
        maximumBudgetINR: 180000,
        preferredFeatures: ['OLED', 'Long Battery', 'Fast Processor']
      };

      const updateRes = await request(app)
        .put('/api/customer/preferences')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(preferencesPayload);

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.preferences.maximumBudgetINR).toBe(180000);

      // Verify retrieval
      const getRes = await request(app)
        .get('/api/customer/preferences')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.preferences.maximumBudgetINR).toBe(180000);
    });

    it('should allow customer to add suitable products to comparison matrix and compare specifications', async () => {
      // Add newly created product to customer comparison
      const addRes = await request(app)
        .post('/api/customer/compare')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: createdProductId });

      expect([200, 201]).toContain(addRes.status);
      expect(addRes.body.success).toBe(true);

      // Retrieve customer comparison matrix
      const matrixRes = await request(app)
        .get('/api/customer/compare')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(matrixRes.status).toBe(200);
      expect(matrixRes.body.success).toBe(true);
      expect(Array.isArray(matrixRes.body.comparisonList)).toBe(true);
      const foundInMatrix = matrixRes.body.comparisonList.find(p => p.id === createdProductId);
      expect(foundInMatrix).toBeDefined();
      expect(foundInMatrix.specifications).toBeDefined();
    });

    it('should calculate transparent rule-based Product Match Score for the customer', async () => {
      const res = await request(app)
        .get(`/api/customer/match-score?productId=${createdProductId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.matchScore).toBeDefined();
      expect(typeof res.body.matchScore).toBe('number');
      expect(res.body.matchScore).toBeGreaterThanOrEqual(0);
      expect(res.body.matchScore).toBeLessThanOrEqual(100);
      expect(res.body.factors).toBeDefined();
      expect(res.body.factors.budgetFit).toBeDefined();
    });
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 3: Customer Submits Showroom Assistance Request
  // =========================================================================
  describe('DEMO WORKFLOW STEP 3: Customer Submits Assistance Request (with Duplicate Prevention)', () => {
    it('should submit showroom assistance request with shopping requirements and product details', async () => {
      const assistancePayload = {
        productId: createdProductId,
        requestType: 'DEMO_REQUEST',
        notes: 'E2E Workflow Test: Customer requesting live OLED display and thermal benchmark demo on showroom floor.'
      };

      const res = await request(app)
        .post('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(assistancePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.request).toBeDefined();
      expect(res.body.request.status).toBe('NEW');
      expect(res.body.request.customerId).toBe(customerUserId);
      expect(res.body.request.productId).toBe(createdProductId);

      createdAssistanceRequestId = res.body.request.id;
    });

    it('should prevent duplicate active assistance requests for the same product with 409 Conflict', async () => {
      const duplicatePayload = {
        productId: createdProductId,
        requestType: 'DEMO_REQUEST',
        notes: 'E2E Workflow Test: Repeated submission while request is still pending.'
      };

      const res = await request(app)
        .post('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(duplicatePayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/active assistance request|already open|recently submitted/i);
      expect(res.body.existingRequestId).toBe(createdAssistanceRequestId);
    });

    it('should reject assistance request with invalid or missing requirements', async () => {
      const invalidPayload = {
        productId: createdProductId,
        requestType: 'DEMO_REQUEST',
        notes: '   ' // Empty notes
      };

      const res = await request(app)
        .post('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 4: Sales Executive Queue Visibility
  // =========================================================================
  describe('DEMO WORKFLOW STEP 4: Sales Executive Queue Visibility', () => {
    it('should allow sales executive to see newly submitted request on sales dashboard', async () => {
      const res = await request(app)
        .get('/api/sales-person/requests?status=NEW')
        .set('Authorization', `Bearer ${salesPersonToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);

      const foundReq = res.body.requests.find(r => r.id === createdAssistanceRequestId);
      expect(foundReq).toBeDefined();
      expect(foundReq.status).toBe('NEW');
      expect(foundReq.productId).toBe(createdProductId);
      expect(foundReq.productName).toBe('E2E Test UltraBook Pro 16 AI');
      expect(foundReq.customerName).toBeDefined();
      expect(foundReq.notes).toContain('E2E Workflow Test');
    });
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 5: Sales Executive Fulfills Request & Recommends Products
  // =========================================================================
  describe('DEMO WORKFLOW STEP 5: Sales Executive Assistance Fulfillment & Recommendation', () => {
    it('should allow sales executive to check real-time showroom inventory', async () => {
      const res = await request(app)
        .get('/api/products/sales/inventory')
        .set('Authorization', `Bearer ${salesPersonToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);

      const invItem = res.body.products.find(p => p.id === createdProductId);
      expect(invItem).toBeDefined();
      expect(parseInt(invItem.stock, 10)).toBe(25);
    });

    it('should allow sales executive to accept request and transition status to IN_PROGRESS', async () => {
      const res = await request(app)
        .put(`/api/sales-person/requests/${createdAssistanceRequestId}`)
        .set('Authorization', `Bearer ${salesPersonToken}`)
        .send({
          status: 'IN_PROGRESS',
          notes: 'Sales Executive Neeva accepted request. Preparing showroom demo unit.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.status).toBe('IN_PROGRESS');
      expect(res.body.request.salesPersonId).toBe(9);
    });

    it('should allow sales executive to persist a tailored product recommendation for customer', async () => {
      const recommendationPayload = {
        customerId: customerUserId,
        productId: createdProductId,
        recommendationNote: 'E2E Workflow Test: Highly recommended for AI workloads, 3.2K OLED color grading, and superior battery life.'
      };

      const res = await request(app)
        .post('/api/sales-person/recommendations')
        .set('Authorization', `Bearer ${salesPersonToken}`)
        .send(recommendationPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.recommendation).toBeDefined();
      expect(res.body.recommendation.product_id).toBe(createdProductId);
      expect(res.body.recommendation.customer_id).toBe(customerUserId);
    });

    it('should allow sales executive to update request status to RESOLVED after showroom consultation', async () => {
      const res = await request(app)
        .put(`/api/sales-person/requests/${createdAssistanceRequestId}`)
        .set('Authorization', `Bearer ${salesPersonToken}`)
        .send({
          status: 'RESOLVED',
          notes: 'Showroom consultation completed. Customer tested OLED panel and benchmarked AI processing successfully.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.status).toBe('RESOLVED');
    });
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 6: Customer Views Updated Status and Recommendations
  // =========================================================================
  describe('DEMO WORKFLOW STEP 6: Customer Visibility of Updated Status & Recommendations', () => {
    it('should allow customer to view updated request status (RESOLVED) and assigned sales executive', async () => {
      const res = await request(app)
        .get('/api/customer/assistance')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);

      const customerReq = res.body.requests.find(r => r.id === createdAssistanceRequestId);
      expect(customerReq).toBeDefined();
      expect(customerReq.status).toBe('RESOLVED');
      expect(customerReq.assignedSalesPerson).toBeDefined();
      expect(customerReq.assignedSalesPerson).toContain('Neeva');
    });

    it('should allow customer to view tailored product recommendations created by sales executive', async () => {
      const res = await request(app)
        .get('/api/customer/recommendations')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.recommendations)).toBe(true);

      const matchingRec = res.body.recommendations.find(r => r.productId === createdProductId);
      expect(matchingRec).toBeDefined();
      expect(matchingRec.recommendationNote).toContain('E2E Workflow Test');
      expect(matchingRec.salesPersonName).toContain('Neeva');
    });
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 7: Administrator Monitoring & Catalog Oversight
  // =========================================================================
  describe('DEMO WORKFLOW STEP 7: Administrator Assistance & Inventory Oversight', () => {
    it('should allow administrator to monitor assistance requests and status breakdown in dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/assistance-requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.counts).toBeDefined();
      expect(typeof res.body.counts.total).toBe('number');
      expect(Array.isArray(res.body.requests)).toBe(true);

      const monitoredReq = res.body.requests.find(r => r.id === createdAssistanceRequestId);
      expect(monitoredReq).toBeDefined();
      expect(monitoredReq.status).toBe('RESOLVED');
      expect(monitoredReq.productName).toBe('E2E Test UltraBook Pro 16 AI');
    });

    it('should allow administrator to view real-time inventory records across all catalog items', async () => {
      const res = await request(app)
        .get('/api/products/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);

      const prodRecord = res.body.products.find(p => p.id === createdProductId);
      expect(prodRecord).toBeDefined();
      expect(prodRecord.stockQuantity).toBe(25);
      expect(prodRecord.priceINR).toBe(149999);
    });
  });

  // =========================================================================
  // DEMO WORKFLOW STEP 8: Order Workflow Demonstration Across Roles
  // =========================================================================
  describe('DEMO WORKFLOW STEP 8: Authentic Order Workflow Demonstration', () => {
    it('should allow customer to view authentic order history and order line items', async () => {
      const res = await request(app)
        .get('/api/customer/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);

      if (res.body.orders.length > 0) {
        const orderId = res.body.orders[0].orderId || res.body.orders[0].id;
        const detailRes = await request(app)
          .get(`/api/customer/orders/${orderId}`)
          .set('Authorization', `Bearer ${customerToken}`);

        expect(detailRes.status).toBe(200);
        expect(detailRes.body.success).toBe(true);
        expect(detailRes.body.order).toBeDefined();
        expect(Array.isArray(detailRes.body.order.items)).toBe(true);
      }
    });

    it('should allow sales executive to view showroom sales and orders via /api/orders/my-orders', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${salesPersonToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should allow administrator to view orders, revenue metrics, and update fulfillment status', async () => {
      // 1. Fetch Orders List
      const ordersRes = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(ordersRes.status).toBe(200);
      expect(ordersRes.body.success).toBe(true);
      expect(Array.isArray(ordersRes.body.orders)).toBe(true);

      // 2. Fetch Genuine Revenue Metrics
      const revRes = await request(app)
        .get('/api/admin/orders/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(revRes.status).toBe(200);
      expect(revRes.body.success).toBe(true);
      expect(revRes.body.data).toBeDefined();
      expect(typeof revRes.body.data.grossRevenue).toBe('number');

      // 3. Update Order Status (if existing order available in database)
      if (sampleOrderId) {
        const statusRes = await request(app)
          .patch(`/api/admin/orders/${sampleOrderId}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'PROCESSING' });

        expect(statusRes.status).toBe(200);
        expect(statusRes.body.success).toBe(true);
        expect(statusRes.body.order.order_status).toBe('PROCESSING');
      }
    });
  });
});
