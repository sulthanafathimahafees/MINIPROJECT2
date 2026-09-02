import express from 'express';
import { pool, query, schemaName } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateMatchScore, formatCurrency } from '../utils/matchScore.js';

const router = express.Router();

/**
 * @route   GET /api/customer/profile
 * @desc    Get customer profile from PostgreSQL users table
 * @access  Private (Authenticated Customer)
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userRes = await query(
      `SELECT user_id, full_name, email, phone, role, status, designation, date_of_birth, address, avatar_url, created_at, last_login_at
       FROM public.users
       WHERE user_id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const user = userRes.rows[0];

    return res.json({
      success: true,
      profile: {
        userId: user.user_id,
        user_id: user.user_id,
        fullName: user.full_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        designation: user.designation || 'Customer',
        dateOfBirth: user.date_of_birth,
        address: user.address || '',
        avatarUrl: user.avatar_url || '',
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      }
    });

  } catch (error) {
    console.error('[Customer Profile API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/customer/profile
 * @desc    Update customer profile details in PostgreSQL
 * @access  Private (Authenticated Customer)
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, address, dateOfBirth } = req.body;

    const updateRes = await query(
      `UPDATE public.users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           date_of_birth = COALESCE($4, date_of_birth),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING user_id, full_name, email, phone, address, date_of_birth, updated_at`,
      [fullName ? fullName.trim() : null, phone ? phone.trim() : null, address ? address.trim() : null, dateOfBirth || null, userId]
    );

    // Also mirror update to optibuy.tbl_users
    try {
      await query(
        `UPDATE ${schemaName}.tbl_users
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             address = COALESCE($3, address),
             date_of_birth = COALESCE($4, date_of_birth),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [fullName ? fullName.trim() : null, phone ? phone.trim() : null, address ? address.trim() : null, dateOfBirth || null, userId]
      );
    } catch (tblErr) {
      // Ignore if alias
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully in PostgreSQL.',
      profile: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Customer Profile Update Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/preferences
 * @desc    Get customer decision support preferences
 * @access  Private (Authenticated Customer)
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const prefRes = await query(
      `SELECT preferred_category, preferred_brand, minimum_budget_inr, maximum_budget_inr, preferred_features, updated_at
       FROM public.customer_preferences
       WHERE user_id = $1`,
      [userId]
    );

    if (prefRes.rows.length === 0) {
      return res.json({
        success: true,
        preferences: {
          preferredCategory: 'Smartphones',
          preferredBrand: 'All Brands',
          minimumBudgetINR: 10000,
          maximumBudgetINR: 200000,
          preferredFeatures: ['OLED Display', 'High Battery Endurance', 'Fast Charging']
        }
      });
    }

    const p = prefRes.rows[0];
    return res.json({
      success: true,
      preferences: {
        preferredCategory: p.preferred_category || 'Smartphones',
        preferredBrand: p.preferred_brand || 'All Brands',
        minimumBudgetINR: parseFloat(p.minimum_budget_inr || 10000),
        maximumBudgetINR: parseFloat(p.maximum_budget_inr || 200000),
        preferredFeatures: typeof p.preferred_features === 'string' ? JSON.parse(p.preferred_features) : (p.preferred_features || []),
        updatedAt: p.updated_at
      }
    });

  } catch (error) {
    console.error('[Customer Preferences API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/customer/preferences
 * @desc    Save or update customer preferences in customer_preferences table
 * @access  Private (Authenticated Customer)
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferredCategory, preferredBrand, minimumBudgetINR, maximumBudgetINR, preferredFeatures } = req.body;

    const upsertRes = await query(
      `INSERT INTO public.customer_preferences (
        user_id, preferred_category, preferred_brand, minimum_budget_inr, maximum_budget_inr, preferred_features
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE
       SET preferred_category = EXCLUDED.preferred_category,
           preferred_brand = EXCLUDED.preferred_brand,
           minimum_budget_inr = EXCLUDED.minimum_budget_inr,
           maximum_budget_inr = EXCLUDED.maximum_budget_inr,
           preferred_features = EXCLUDED.preferred_features,
           updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId,
        preferredCategory || 'Smartphones',
        preferredBrand || 'All Brands',
        minimumBudgetINR ? parseFloat(minimumBudgetINR) : 10000,
        maximumBudgetINR ? parseFloat(maximumBudgetINR) : 200000,
        JSON.stringify(preferredFeatures || [])
      ]
    );

    const row = upsertRes.rows[0];
    return res.json({
      success: true,
      message: 'Decision support preferences updated in PostgreSQL.',
      preferences: {
        preferredCategory: row.preferred_category,
        preferredBrand: row.preferred_brand,
        minimumBudgetINR: parseFloat(row.minimum_budget_inr),
        maximumBudgetINR: parseFloat(row.maximum_budget_inr),
        preferredFeatures: typeof row.preferred_features === 'string' ? JSON.parse(row.preferred_features) : (row.preferred_features || []),
        preferred_category: row.preferred_category,
        preferred_brand: row.preferred_brand,
        minimum_budget_inr: row.minimum_budget_inr,
        maximum_budget_inr: row.maximum_budget_inr,
        preferred_features: row.preferred_features,
        updated_at: row.updated_at
      }
    });

  } catch (error) {
    console.error('[Customer Preferences Save Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/wishlist
 * @desc    Get customer saved wishlist products from customer_wishlist table
 * @access  Private (Authenticated Customer)
 */
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlistRes = await query(
      `SELECT w.id as wishlist_id, w.created_at as added_at,
              p.id as product_id, p.product_name, p.model_number, p.price_inr, p.original_price_inr,
              p.discount_percentage, p.rating, p.review_count, p.stock_status, p.main_image_url,
              c.category_name, b.brand_name
       FROM public.customer_wishlist w
       JOIN public.products p ON w.product_id = p.id
       LEFT JOIN public.product_categories c ON p.category_id = c.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );

    const wishlist = wishlistRes.rows.map(item => ({
      wishlistId: item.wishlist_id,
      productId: item.product_id,
      id: item.product_id,
      name: item.product_name,
      modelNumber: item.model_number,
      category: item.category_name || 'Electronics',
      brand: item.brand_name || 'OptiBuy',
      price: parseFloat(item.price_inr),
      originalPrice: item.original_price_inr ? parseFloat(item.original_price_inr) : null,
      discount: parseInt(item.discount_percentage || 0, 10),
      rating: parseFloat(item.rating || 4.5),
      reviewCount: parseInt(item.review_count || 0, 10),
      stockStatus: item.stock_status,
      image: item.main_image_url,
      addedAt: item.added_at
    }));

    return res.json({
      success: true,
      count: wishlist.length,
      wishlist
    });

  } catch (error) {
    console.error('[Customer Wishlist GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/customer/wishlist
 * @desc    Add product to customer wishlist (Persisted in PostgreSQL)
 * @access  Private (Authenticated Customer)
 */
router.post('/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const insertRes = await query(
      `INSERT INTO public.customer_wishlist (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, parseInt(productId, 10)]
    );

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist in PostgreSQL database.',
      wishlist: insertRes.rows[0] || { user_id: userId, product_id: productId }
    });

  } catch (error) {
    console.error('[Customer Wishlist POST Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/customer/wishlist/:productId
 * @desc    Remove product from customer wishlist
 * @access  Private (Authenticated Customer)
 */
router.delete('/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = parseInt(req.params.productId, 10);

    await query(
      `DELETE FROM public.customer_wishlist WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );

    return res.json({
      success: true,
      message: 'Product removed from wishlist.',
      productId
    });

  } catch (error) {
    console.error('[Customer Wishlist DELETE Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/comparison
 * @desc    Get customer active compared products
 * @access  Private (Authenticated Customer)
 */
router.get(['/comparison', '/compare'], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const compRes = await query(
      `SELECT c.id as comparison_id, c.created_at,
              p.id as product_id, p.product_name, p.model_number, p.price_inr, p.original_price_inr,
              p.rating, p.review_count, p.stock_status, p.main_image_url,
              cat.category_name, b.brand_name
       FROM public.customer_comparisons c
       JOIN public.products p ON c.product_id = p.id
       LEFT JOIN public.product_categories cat ON p.category_id = cat.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    // Fetch specifications for compared products
    const productIds = compRes.rows.map(item => item.product_id);
    let specsByProd = {};
    if (productIds.length > 0) {
      const specRes = await query(
        `SELECT product_id, specification_name, specification_value
         FROM public.product_specifications
         WHERE product_id = ANY($1)`,
        [productIds]
      );
      specRes.rows.forEach(s => {
        if (!specsByProd[s.product_id]) specsByProd[s.product_id] = {};
        specsByProd[s.product_id][s.specification_name] = s.specification_value;
      });
    }

    const comparisons = compRes.rows.map(item => ({
      comparisonId: item.comparison_id,
      productId: item.product_id,
      id: item.product_id,
      name: item.product_name,
      modelNumber: item.model_number,
      category: item.category_name || 'Electronics',
      brand: item.brand_name || 'OptiBuy',
      price: parseFloat(item.price_inr),
      originalPrice: item.original_price_inr ? parseFloat(item.original_price_inr) : null,
      rating: parseFloat(item.rating || 4.5),
      reviewCount: parseInt(item.review_count || 0, 10),
      image: item.main_image_url,
      specifications: specsByProd[item.product_id] || {},
      specs: specsByProd[item.product_id] || {}
    }));

    return res.json({
      success: true,
      count: comparisons.length,
      comparisons,
      comparisonList: comparisons
    });

  } catch (error) {
    console.error('[Customer Comparison GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/customer/comparison
 * @desc    Add product to customer side-by-side comparison list
 * @access  Private (Authenticated Customer)
 */
router.post(['/comparison', '/compare'], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    // Enforce maximum 3 products in comparison matrix
    const countRes = await query(
      `SELECT COUNT(*) FROM public.customer_comparisons WHERE user_id = $1`,
      [userId]
    );
    const currentCount = parseInt(countRes.rows[0].count, 10);
    if (currentCount >= 3) {
      const existRes = await query(
        `SELECT 1 FROM public.customer_comparisons WHERE user_id = $1 AND product_id = $2`,
        [userId, parseInt(productId, 10)]
      );
      if (existRes.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comparison limit reached. You can compare a maximum of 3 products side-by-side.'
        });
      }
    }

    const insertRes = await query(
      `INSERT INTO public.customer_comparisons (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, parseInt(productId, 10)]
    );

    return res.status(201).json({
      success: true,
      message: 'Product added to comparison matrix in PostgreSQL.',
      comparison: insertRes.rows[0] || { user_id: userId, product_id: productId }
    });

  } catch (error) {
    console.error('[Customer Comparison POST Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/customer/comparison/:productId
 * @desc    Remove product from customer comparison matrix
 * @access  Private (Authenticated Customer)
 */
router.delete(['/comparison/:productId', '/compare/:productId'], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = parseInt(req.params.productId, 10);

    await query(
      `DELETE FROM public.customer_comparisons WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );

    return res.json({
      success: true,
      message: 'Product removed from comparison matrix.',
      productId
    });

  } catch (error) {
    console.error('[Customer Comparison DELETE Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/orders
 * @desc    Get customer order history from PostgreSQL
 * @access  Private (Authenticated Customer)
 */
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const ordersRes = await query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.payment_status, o.created_at, o.updated_at
       FROM public.orders o
       WHERE o.customer_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    const orders = ordersRes.rows.map(o => ({
      orderId: o.order_id,
      id: o.order_id,
      totalAmount: parseFloat(o.total_amount),
      orderStatus: o.order_status || 'PROCESSING',
      paymentStatus: o.payment_status || 'PENDING',
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      formattedDate: new Date(o.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    }));

    return res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('[Customer Orders GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/orders/:id
 * @desc    Get detailed customer order with items from PostgreSQL
 * @access  Private (Authenticated Customer)
 */
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id, 10);

    const orderRes = await query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.payment_status, o.created_at, o.updated_at
       FROM public.orders o
       WHERE o.order_id = $1 AND o.customer_id = $2`,
      [orderId, userId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    // Get order items
    const itemsRes = await query(
      `SELECT oi.item_id, oi.quantity, oi.unit_price,
              p.id as product_id, p.product_name, p.model_number, p.main_image_url,
              b.brand_name, c.category_name
       FROM public.order_items oi
       JOIN public.products p ON oi.product_id = p.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       LEFT JOIN public.product_categories c ON p.category_id = c.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    const items = itemsRes.rows.map(item => ({
      itemId: item.item_id,
      productId: item.product_id,
      productName: item.product_name,
      modelNumber: item.model_number,
      brand: item.brand_name || 'OptiBuy',
      category: item.category_name || 'Electronics',
      quantity: parseInt(item.quantity, 10),
      unitPrice: parseFloat(item.unit_price),
      image: item.main_image_url,
      lineTotal: parseFloat(item.unit_price) * parseInt(item.quantity, 10)
    }));

    return res.json({
      success: true,
      order: {
        orderId: order.order_id,
        totalAmount: parseFloat(order.total_amount),
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items
      }
    });

  } catch (error) {
    console.error('[Customer Order Detail GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/customer/orders
 * @desc    Create new customer order with ACID transactional inventory checks and server-side totals
 * @access  Private (Authenticated Customer)
 */
router.post('/orders', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.userId;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one order item is required.' });
    }

    await client.query('BEGIN');

    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const productId = parseInt(item.productId || item.product_id, 10);
      const quantity = Math.max(1, parseInt(item.quantity || 1, 10));

      if (isNaN(productId) || productId <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Invalid product ID in order items.' });
      }

      // Check stock with lock in public.products
      const prodRes = await client.query(
        `SELECT id, product_name, price_inr, stock_quantity FROM public.products WHERE id = $1 FOR UPDATE`,
        [productId]
      );

      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: `Product #${productId} not found.` });
      }

      const prod = prodRes.rows[0];
      const availableStock = parseInt(prod.stock_quantity || 0, 10);
      if (availableStock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${prod.product_name}. Requested: ${quantity}, Available: ${availableStock}.`
        });
      }

      const unitPrice = parseFloat(prod.price_inr);
      const lineTotal = unitPrice * quantity;
      totalAmount += lineTotal;

      // Deduct inventory
      await client.query(
        `UPDATE public.products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [quantity, productId]
      );

      // Also deduct in tbl_products if exists
      try {
        await client.query(
          `UPDATE ${schemaName}.tbl_products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE product_id = $2`,
          [quantity, productId]
        );
      } catch (tblStockErr) {}

      verifiedItems.push({
        productId,
        productName: prod.product_name,
        quantity,
        unitPrice,
        lineTotal
      });
    }

    // Insert order in public.orders
    const orderRes = await client.query(
      `INSERT INTO public.orders (customer_id, total_amount, order_status, payment_status, created_at, updated_at)
       VALUES ($1, $2, 'PENDING', 'PAID', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING order_id, customer_id, total_amount, order_status, payment_status, created_at`,
      [userId, totalAmount]
    );

    const orderId = orderRes.rows[0].order_id;

    // Insert order items
    for (const vItem of verifiedItems) {
      await client.query(
        `INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, vItem.productId, vItem.quantity, vItem.unitPrice]
      );
    }

    // Mirror to tbl_orders and tbl_order_items
    try {
      await client.query(
        `INSERT INTO ${schemaName}.tbl_orders (order_id, customer_id, total_amount, order_status, payment_status, created_at, updated_at)
         VALUES ($1, $2, $3, 'PENDING', 'PAID', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (order_id) DO NOTHING`,
        [orderId, userId, totalAmount]
      );

      for (const vItem of verifiedItems) {
        await client.query(
          `INSERT INTO ${schemaName}.tbl_order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, vItem.productId, vItem.quantity, vItem.unitPrice]
        );
      }
    } catch (mirrorErr) {}

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully with verified server-side totals and stock deduction.',
      order: {
        orderId,
        id: orderId,
        totalAmount,
        orderStatus: 'PENDING',
        paymentStatus: 'PAID',
        items: verifiedItems
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Customer Order Create Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

/**
 * @route   POST /api/customer/assistance
 * @desc    Create customer assistance request
 * @access  Private (Authenticated Customer)
 */
router.post(['/assistance', '/assistance-requests'], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, requestType, notes } = req.body;

    if (!requestType || !notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: 'Request type and notes are required.' });
    }

    const parsedProductId = productId ? parseInt(productId, 10) : null;

    // Prevent duplicate active requests caused by repeated submissions
    if (parsedProductId) {
      const activeRes = await query(
        `SELECT id, status, created_at 
         FROM public.customer_assistance_requests 
         WHERE customer_id = $1 AND product_id = $2 AND status IN ('NEW', 'IN_PROGRESS')
         LIMIT 1`,
        [userId, parsedProductId]
      );

      if (activeRes.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An active assistance request for this product is already open. A showroom sales executive is reviewing it.',
          existingRequestId: activeRes.rows[0].id,
          status: activeRes.rows[0].status
        });
      }
    } else {
      const activeRecent = await query(
        `SELECT id, status, created_at 
         FROM public.customer_assistance_requests 
         WHERE customer_id = $1 AND product_id IS NULL AND request_type = $2 AND status IN ('NEW', 'IN_PROGRESS')
           AND created_at > NOW() - INTERVAL '5 minutes'
         LIMIT 1`,
        [userId, requestType]
      );

      if (activeRecent.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'You have recently submitted a showroom assistance request of this type. A sales executive will assist you shortly.',
          existingRequestId: activeRecent.rows[0].id,
          status: activeRecent.rows[0].status
        });
      }
    }

    const insertRes = await query(
      `INSERT INTO public.customer_assistance_requests (customer_id, product_id, request_type, status, notes)
       VALUES ($1, $2, $3, 'NEW', $4)
       RETURNING *`,
      [userId, parsedProductId, requestType, notes.trim()]
    );

    const row = insertRes.rows[0];
    return res.status(201).json({
      success: true,
      message: 'Assistance request submitted successfully. A sales executive will contact you shortly.',
      request: {
        id: row.id,
        customerId: row.customer_id,
        customer_id: row.customer_id,
        productId: row.product_id,
        product_id: row.product_id,
        requestType: row.request_type,
        request_type: row.request_type,
        status: row.status,
        notes: row.notes,
        createdAt: row.created_at,
        created_at: row.created_at,
        updatedAt: row.updated_at,
        updated_at: row.updated_at
      }
    });

  } catch (error) {
    console.error('[Customer Assistance POST Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/assistance
 * @desc    Get customer assistance requests
 * @access  Private (Authenticated Customer)
 */
router.get(['/assistance', '/assistance-requests'], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const reqRes = await query(
      `SELECT r.id, r.request_type, r.status, r.notes, r.created_at, r.updated_at,
              r.sales_person_id, sp.full_name as assigned_sales_person_name, sp.phone as sales_person_phone,
              p.product_name, p.price_inr, p.main_image_url, b.brand_name
       FROM public.customer_assistance_requests r
       LEFT JOIN public.users sp ON r.sales_person_id = sp.user_id
       LEFT JOIN public.products p ON r.product_id = p.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const requests = reqRes.rows.map(r => ({
      id: r.id,
      requestType: r.request_type,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      salesPersonId: r.sales_person_id,
      assignedSalesPerson: r.assigned_sales_person_name || null,
      salesPersonPhone: r.sales_person_phone || null,
      productName: r.product_name,
      productPrice: r.price_inr ? parseFloat(r.price_inr) : null,
      productImage: r.main_image_url,
      productBrand: r.brand_name
    }));

    return res.json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('[Customer Assistance GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/recommendations
 * @desc    Get product recommendations sent by sales executives
 * @access  Private (Authenticated Customer)
 */
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const recRes = await query(
      `SELECT r.id, r.product_id, r.recommendation_note, r.created_at,
              u.full_name as sales_executive_name,
              p.product_name, p.model_number, p.price_inr, p.original_price_inr,
              p.discount_percentage, p.rating, p.review_count, p.stock_status, p.main_image_url,
              b.brand_name, c.category_name
       FROM public.product_recommendations r
       LEFT JOIN public.users u ON r.sales_person_id = u.user_id
       LEFT JOIN public.products p ON r.product_id = p.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       LEFT JOIN public.product_categories c ON p.category_id = c.id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const recommendations = recRes.rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      product_id: r.product_id,
      recommendationNote: r.recommendation_note,
      createdAt: r.created_at,
      salesExecutiveName: r.sales_executive_name || 'OptiBuy Sales Team',
      salesPersonName: r.sales_executive_name || 'OptiBuy Sales Team',
      product: r.product_name ? {
        id: r.product_id,
        productId: r.product_id,
        name: r.product_name,
        modelNumber: r.model_number,
        brand: r.brand_name || 'OptiBuy',
        category: r.category_name || 'Electronics',
        price: parseFloat(r.price_inr),
        originalPrice: r.original_price_inr ? parseFloat(r.original_price_inr) : null,
        discount: parseInt(r.discount_percentage || 0, 10),
        rating: parseFloat(r.rating || 4.5),
        reviewCount: parseInt(r.review_count || 0, 10),
        stockStatus: r.stock_status,
        image: r.main_image_url
      } : null
    }));

    return res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });

  } catch (error) {
    console.error('[Customer Recommendations GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/reviews
 * @desc    Get customer's own product reviews
 * @access  Private (Authenticated Customer)
 */
router.get('/reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const reviewsRes = await query(
      `SELECT r.id, r.rating, r.review_title, r.review_text, r.created_at, r.status,
              p.id as product_id, p.product_name, p.model_number, p.price_inr,
              p.main_image_url, b.brand_name, c.category_name
       FROM public.product_reviews r
       JOIN public.products p ON r.product_id = p.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       LEFT JOIN public.product_categories c ON p.category_id = c.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const reviews = reviewsRes.rows.map(r => ({
      id: r.id,
      rating: parseFloat(r.rating),
      title: r.review_title,
      text: r.review_text,
      status: r.status,
      createdAt: r.created_at,
      product: {
        id: r.product_id,
        name: r.product_name,
        modelNumber: r.model_number,
        brand: r.brand_name || 'OptiBuy',
        category: r.category_name || 'Electronics',
        price: parseFloat(r.price_inr),
        image: r.main_image_url
      }
    }));

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('[Customer Reviews GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/customer/match-score
 * @desc    Calculate product match scores based on customer preferences
 * @access  Private (Authenticated Customer)
 */
router.get('/match-score', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, limit = 20 } = req.query;

    // Validate limit parameter
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ success: false, message: 'Invalid limit parameter. Must be an integer between 1 and 100.' });
    }

    // 1. Get customer preferences
    const prefRes = await query(
      `SELECT preferred_category, preferred_brand, minimum_budget_inr, maximum_budget_inr, preferred_features
       FROM public.customer_preferences
       WHERE user_id = $1`,
      [userId]
    );

    const preferences = prefRes.rows[0] || {
      preferred_category: 'Smartphones',
      preferred_brand: null,
      minimum_budget_inr: 10000,
      maximum_budget_inr: 200000,
      preferred_features: []
    };

    // 2. Get products (active, in stock)
    let sql = `
      SELECT p.id, p.product_name, p.model_number, p.description, p.price_inr, p.original_price_inr,
             p.discount_percentage, p.rating, p.review_count, p.stock_quantity, p.stock_status,
             p.main_image_url, p.status, p.category_id, p.brand_id,
             c.category_name, b.brand_name
      FROM public.products p
      LEFT JOIN public.product_categories c ON p.category_id = c.id
      LEFT JOIN public.brands b ON p.brand_id = b.id
      WHERE p.status = 'ACTIVE' AND p.stock_quantity > 0
    `;

    const queryParams = [];
    let paramIdx = 1;

    if (category && category !== 'All') {
      sql += ` AND (LOWER(c.category_name) = LOWER($${paramIdx}) OR LOWER(p.category_id::text) = LOWER($${paramIdx}))`;
      queryParams.push(category);
      paramIdx++;
    }

    sql += ` ORDER BY p.rating DESC, p.review_count DESC LIMIT $${paramIdx}`;
    queryParams.push(parseInt(limit, 10));

    const prodRes = await query(sql, queryParams);

    // 3. Get specifications for all products
    const productIds = prodRes.rows.map(p => p.id);
    let specsMap = {};
    if (productIds.length > 0) {
      const specsRes = await query(
        `SELECT product_id, specification_name, specification_value
         FROM public.product_specifications
         WHERE product_id = ANY($1)`,
        [productIds]
      );
      specsRes.rows.forEach(s => {
        if (!specsMap[s.product_id]) specsMap[s.product_id] = [];
        specsMap[s.product_id].push({ name: s.specification_name, value: s.specification_value });
      });
    }

    // 4. Calculate match scores
    const results = prodRes.rows.map(p => {
      const specs = specsMap[p.id] || [];
      const scoreBreakdown = calculateMatchScore(p, specs, preferences);
      return {
        id: p.id,
        product_id: p.id,
        name: p.product_name,
        product_name: p.product_name,
        modelNumber: p.model_number,
        category: p.category_name || 'Electronics',
        brand: p.brand_name || 'OptiBuy',
        price: parseFloat(p.price_inr),
        originalPrice: p.original_price_inr ? parseFloat(p.original_price_inr) : null,
        discount: parseInt(p.discount_percentage || 0, 10),
        rating: parseFloat(p.rating || 4.5),
        reviewCount: parseInt(p.review_count || 0, 10),
        stockQuantity: parseInt(p.stock_quantity || 0, 10),
        stockStatus: p.stock_status,
        image: p.main_image_url,
        description: p.description,
        specifications: specs,
        matchScore: scoreBreakdown.totalScore,
        matchDetails: scoreBreakdown.details
      };
    });

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    const targetProduct = req.query.productId
      ? results.find(r => r.id === parseInt(req.query.productId, 10))
      : null;

    return res.json({
      success: true,
      count: results.length,
      matchScore: targetProduct ? targetProduct.matchScore : (results[0]?.matchScore || 0),
      factors: targetProduct ? targetProduct.matchDetails : (results[0]?.matchDetails || {}),
      matchDetails: targetProduct ? targetProduct.matchDetails : (results[0]?.matchDetails || {}),
      product: targetProduct || results[0] || null,
      preferences: {
        preferredCategory: preferences.preferred_category,
        preferredBrand: preferences.preferred_brand,
        minimumBudgetINR: parseFloat(preferences.minimum_budget_inr),
        maximumBudgetINR: parseFloat(preferences.maximum_budget_inr),
        preferredFeatures: typeof preferences.preferred_features === 'string' 
          ? JSON.parse(preferences.preferred_features) 
          : (preferences.preferred_features || [])
      },
      products: results
    });

  } catch (error) {
    console.error('[Customer Match Score Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/customer/match-score/calculate
 * @desc    Calculate match score for specific products with custom preferences
 * @access  Private (Authenticated Customer)
 */
router.post('/match-score/calculate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productIds, preferences: customPrefs } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'productIds array is required.' });
    }

    // Get customer's saved preferences as defaults
    const prefRes = await query(
      `SELECT preferred_category, preferred_brand, minimum_budget_inr, maximum_budget_inr, preferred_features
       FROM public.customer_preferences
       WHERE user_id = $1`,
      [userId]
    );

    const savedPrefs = prefRes.rows[0] || {
      preferred_category: 'Smartphones',
      preferred_brand: null,
      minimum_budget_inr: 10000,
      maximum_budget_inr: 200000,
      preferred_features: []
    };

    // Merge saved preferences with custom preferences
    const preferences = {
      preferred_category: customPrefs?.preferredCategory || savedPrefs.preferred_category,
      preferred_brand: customPrefs?.preferredBrand || savedPrefs.preferred_brand,
      minimum_budget_inr: customPrefs?.minimumBudgetINR || savedPrefs.minimum_budget_inr,
      maximum_budget_inr: customPrefs?.maximumBudgetINR || savedPrefs.maximum_budget_inr,
      preferred_features: customPrefs?.preferredFeatures || savedPrefs.preferred_features || []
    };

    // Get products
    const prodRes = await query(
      `SELECT p.id, p.product_name, p.model_number, p.description, p.price_inr, p.original_price_inr,
             p.discount_percentage, p.rating, p.review_count, p.stock_quantity, p.stock_status,
             p.main_image_url, p.status, p.category_id, p.brand_id,
             c.category_name, b.brand_name
       FROM public.products p
       LEFT JOIN public.product_categories c ON p.category_id = c.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       WHERE p.id = ANY($1) AND p.status = 'ACTIVE'`,
      [productIds]
    );

    // Get specifications
    const specsRes = await query(
      `SELECT product_id, specification_name, specification_value
       FROM public.product_specifications
       WHERE product_id = ANY($1)`,
      [productIds]
    );
    const specsMap = {};
    specsRes.rows.forEach(s => {
      if (!specsMap[s.product_id]) specsMap[s.product_id] = [];
      specsMap[s.product_id].push({ name: s.specification_name, value: s.specification_value });
    });

    // Calculate scores
    const results = prodRes.rows.map(p => {
      const specs = specsMap[p.id] || [];
      const scoreBreakdown = calculateMatchScore(p, specs, preferences);
      return {
        id: p.id,
        product_id: p.id,
        name: p.product_name,
        product_name: p.product_name,
        modelNumber: p.model_number,
        category: p.category_name || 'Electronics',
        brand: p.brand_name || 'OptiBuy',
        price: parseFloat(p.price_inr),
        originalPrice: p.original_price_inr ? parseFloat(p.original_price_inr) : null,
        discount: parseInt(p.discount_percentage || 0, 10),
        rating: parseFloat(p.rating || 4.5),
        reviewCount: parseInt(p.review_count || 0, 10),
        stockQuantity: parseInt(p.stock_quantity || 0, 10),
        stockStatus: p.stock_status,
        image: p.main_image_url,
        description: p.description,
        specifications: specs,
        matchScore: scoreBreakdown.totalScore,
        matchDetails: scoreBreakdown.details
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      count: results.length,
      products: results
    });

  } catch (error) {
    console.error('[Customer Match Score Calculate Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
