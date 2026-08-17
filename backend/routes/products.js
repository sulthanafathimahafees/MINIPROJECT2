import express from 'express';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories from PostgreSQL
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const catRes = await query(`SELECT id, category_name, description, icon, status FROM public.product_categories ORDER BY id ASC`);
    return res.json({
      success: true,
      categories: catRes.rows.map(c => ({
        id: c.id,
        name: c.category_name,
        category_name: c.category_name,
        description: c.description,
        icon: c.icon
      }))
    });
  } catch (error) {
    console.error('[Categories API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products/brands
 * @desc    Get all brands from PostgreSQL
 * @access  Public
 */
router.get('/brands', async (req, res) => {
  try {
    const brandRes = await query(`SELECT id, brand_name, description, logo_url FROM public.brands ORDER BY brand_name ASC`);
    return res.json({
      success: true,
      brands: brandRes.rows.map(b => ({
        id: b.id,
        name: b.brand_name,
        brand_name: b.brand_name,
        description: b.description,
        logoUrl: b.logo_url
      }))
    });
  } catch (error) {
    console.error('[Brands API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products
 * @desc    Public & Customer endpoint: Get products with Category, Brand, Search & Sort filters from PostgreSQL
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, sort } = req.query;

    let sql = `
      SELECT p.id, p.product_name, p.model_number, p.description, p.price_inr, p.original_price_inr,
             p.discount_percentage, p.rating, p.review_count, p.stock_quantity, p.stock_status,
             p.main_image_url, p.status, c.category_name, b.brand_name
      FROM public.products p
      LEFT JOIN public.product_categories c ON p.category_id = c.id
      LEFT JOIN public.brands b ON p.brand_id = b.id
      WHERE p.status = 'ACTIVE'
    `;

    const queryParams = [];
    let paramIdx = 1;

    if (category && category !== 'All') {
      sql += ` AND (LOWER(c.category_name) = LOWER($${paramIdx}) OR LOWER(p.category_id::text) = LOWER($${paramIdx}))`;
      queryParams.push(category);
      paramIdx++;
    }

    if (brand && brand !== 'All') {
      sql += ` AND (LOWER(b.brand_name) = LOWER($${paramIdx}) OR LOWER(p.brand_id::text) = LOWER($${paramIdx}))`;
      queryParams.push(brand);
      paramIdx++;
    }

    if (search && search.trim()) {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(p.product_name) LIKE $${paramIdx} OR LOWER(p.model_number) LIKE $${paramIdx} OR LOWER(b.brand_name) LIKE $${paramIdx} OR LOWER(c.category_name) LIKE $${paramIdx})`;
      queryParams.push(searchPattern);
      paramIdx++;
    }

    // Sort order
    if (sort === 'priceLowHigh') {
      sql += ` ORDER BY p.price_inr ASC`;
    } else if (sort === 'priceHighLow') {
      sql += ` ORDER BY p.price_inr DESC`;
    } else if (sort === 'rating') {
      sql += ` ORDER BY p.rating DESC`;
    } else if (sort === 'newest') {
      sql += ` ORDER BY p.created_at DESC`;
    } else {
      sql += ` ORDER BY p.id ASC`;
    }

    const prodRes = await query(sql, queryParams);

    const products = prodRes.rows.map(p => ({
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
      description: p.description
    }));

    return res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('[Products GET API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get detailed product info including specifications and reviews from PostgreSQL
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const prodRes = await query(
      `SELECT p.id, p.product_name, p.model_number, p.description, p.price_inr, p.original_price_inr,
              p.discount_percentage, p.rating, p.review_count, p.stock_quantity, p.stock_status,
              p.main_image_url, c.category_name, b.brand_name
       FROM public.products p
       LEFT JOIN public.product_categories c ON p.category_id = c.id
       LEFT JOIN public.brands b ON p.brand_id = b.id
       WHERE p.id = $1`,
      [productId]
    );

    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found in PostgreSQL catalog.' });
    }

    const p = prodRes.rows[0];

    // Specifications
    const specRes = await query(
      `SELECT specification_name, specification_value FROM public.product_specifications WHERE product_id = $1`,
      [productId]
    );

    // Reviews
    const revRes = await query(
      `SELECT r.id, r.rating, r.review_title, r.review_text, r.created_at, u.full_name as author
       FROM public.product_reviews r
       LEFT JOIN public.users u ON r.user_id = u.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    return res.json({
      success: true,
      product: {
        id: p.id,
        name: p.product_name,
        modelNumber: p.model_number,
        category: p.category_name,
        brand: p.brand_name,
        price: parseFloat(p.price_inr),
        originalPrice: p.original_price_inr ? parseFloat(p.original_price_inr) : null,
        discount: parseInt(p.discount_percentage || 0, 10),
        rating: parseFloat(p.rating || 4.5),
        reviewCount: parseInt(p.review_count || 0, 10),
        stockQuantity: parseInt(p.stock_quantity || 0, 10),
        stockStatus: p.stock_status,
        image: p.main_image_url,
        description: p.description,
        specifications: specRes.rows.map(s => ({ name: s.specification_name, value: s.specification_value })),
        reviews: revRes.rows.map(r => ({
          id: r.id,
          rating: parseFloat(r.rating),
          title: r.review_title,
          text: r.review_text,
          author: r.author || 'OptiBuy Verified Customer',
          createdAt: r.created_at
        }))
      }
    });

  } catch (error) {
    console.error('[Product Detail GET API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Submit a review for a product (Authenticated Customer)
 * @access  Private (Authenticated User)
 */
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { rating, reviewTitle, reviewText } = req.body;

    if (!rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'Rating and review text are required.' });
    }

    const insertRes = await query(
      `INSERT INTO public.product_reviews (product_id, user_id, rating, review_title, review_text, status)
       VALUES ($1, $2, $3, $4, $5, 'APPROVED')
       RETURNING *`,
      [productId, userId, parseFloat(rating), reviewTitle ? reviewTitle.trim() : 'Customer Review', reviewText.trim()]
    );

    // Update product rating & count
    await query(
      `UPDATE public.products
       SET review_count = review_count + 1
       WHERE id = $1`,
      [productId]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been saved in PostgreSQL.',
      review: insertRes.rows[0]
    });

  } catch (error) {
    console.error('[Product Review Submit Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/products
 * @desc    Admin endpoint: Add product to catalog
 * @access  Private (Admin only)
 */
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, brand, category, price, originalPrice, stockQuantity, image } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const insertRes = await query(
      `INSERT INTO public.products (product_name, price_inr, original_price_inr, stock_quantity, main_image_url, status)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
       RETURNING *`,
      [name.trim(), parseFloat(price), originalPrice ? parseFloat(originalPrice) : null, stockQuantity || 15, image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80']
    );

    return res.status(201).json({
      success: true,
      message: `Product "${name}" added successfully.`,
      product: insertRes.rows[0]
    });

  } catch (error) {
    console.error('[Admin Add Product Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
