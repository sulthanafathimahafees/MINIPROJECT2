import express from 'express';
import { query, schemaName } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

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

    return res.json({
      success: true,
      message: 'Decision support preferences updated in PostgreSQL.',
      preferences: upsertRes.rows[0]
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
router.get('/comparison', authenticateToken, async (req, res) => {
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
      image: item.main_image_url
    }));

    return res.json({
      success: true,
      count: comparisons.length,
      comparisons
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
router.post('/comparison', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
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
router.delete('/comparison/:productId', authenticateToken, async (req, res) => {
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

export default router;
