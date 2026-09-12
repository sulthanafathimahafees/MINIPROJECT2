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
    const brandRes = await query(`SELECT id, brand_name, description, logo_url, status FROM public.brands ORDER BY brand_name ASC`);
    return res.json({
      success: true,
      brands: brandRes.rows.map(b => ({
        id: b.id,
        name: b.brand_name,
        brand_name: b.brand_name,
        description: b.description,
        logoUrl: b.logo_url,
        status: b.status
      }))
    });
  } catch (error) {
    console.error('[Brands API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/products/brands
 * @desc    Admin endpoint: Add a new brand
 * @access  Private (Admin only)
 */
router.post('/brands', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Brand name is required.' });
    }

    const cleanName = name.trim();

    const existing = await query(
      `SELECT id FROM public.brands WHERE LOWER(brand_name) = $1`,
      [cleanName.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'A brand with this name already exists.' });
    }

    const insertRes = await query(
      `INSERT INTO public.brands (brand_name, description, logo_url, status)
       VALUES ($1, $2, $3, 'ACTIVE')
       RETURNING *`,
      [cleanName, description ? description.trim() : null, logoUrl ? logoUrl.trim() : null]
    );

    // Mirror to optibuy.tbl_brands if exists
    try {
      await query(
        `INSERT INTO ${schemaName}.tbl_brands (name, description, logo_url, status)
         VALUES ($1, $2, $3, 'ACTIVE') ON CONFLICT DO NOTHING`,
        [cleanName, description ? description.trim() : null, logoUrl ? logoUrl.trim() : null]
      );
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: `Brand "${cleanName}" created successfully!`,
      brand: insertRes.rows[0]
    });

  } catch (error) {
    console.error('[Add Brand Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/products/brands/:id
 * @desc    Admin endpoint: Update brand
 * @access  Private (Admin only)
 */
router.put('/brands/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const brandId = parseInt(req.params.id, 10);
    const { name, description, logoUrl, status } = req.body;

    const setClauses = [];
    const queryParams = [];
    let paramIdx = 1;

    if (name) {
      setClauses.push(`brand_name = $${paramIdx}`);
      queryParams.push(name.trim());
      paramIdx++;
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIdx}`);
      queryParams.push(description ? description.trim() : null);
      paramIdx++;
    }
    if (logoUrl !== undefined) {
      setClauses.push(`logo_url = $${paramIdx}`);
      queryParams.push(logoUrl ? logoUrl.trim() : null);
      paramIdx++;
    }
    if (status) {
      setClauses.push(`status = $${paramIdx}`);
      queryParams.push(status.toUpperCase());
      paramIdx++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'No brand fields provided for update.' });
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(brandId);

    const updateRes = await query(
      `UPDATE public.brands SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      queryParams
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    return res.json({
      success: true,
      message: 'Brand updated successfully.',
      brand: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Update Brand Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/products/brands/:id
 * @desc    Admin endpoint: Delete brand
 * @access  Private (Admin only)
 */
router.delete('/brands/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const brandId = parseInt(req.params.id, 10);

    // Check if brand has products
    const productCheck = await query(
      `SELECT COUNT(*) FROM public.products WHERE brand_id = $1`,
      [brandId]
    );

    if (parseInt(productCheck.rows[0].count, 10) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete brand with associated products. Reassign products first.'
      });
    }

    await query(`DELETE FROM public.brands WHERE id = $1`, [brandId]);

    return res.json({
      success: true,
      message: 'Brand deleted successfully.'
    });

  } catch (error) {
    console.error('[Delete Brand Error]', error);
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

    const specArray = specRes.rows.map(s => ({ name: s.specification_name, value: s.specification_value }));
    const specMap = {};
    specRes.rows.forEach(s => {
      specMap[s.specification_name] = s.specification_value;
      specArray[s.specification_name] = s.specification_value;
    });

    return res.json({
      success: true,
      product: {
        id: p.id,
        name: p.product_name,
        productName: p.product_name,
        modelNumber: p.model_number,
        category: p.category_name,
        brand: p.brand_name,
        price: parseFloat(p.price_inr),
        priceINR: parseFloat(p.price_inr),
        originalPrice: p.original_price_inr ? parseFloat(p.original_price_inr) : null,
        discount: parseInt(p.discount_percentage || 0, 10),
        rating: parseFloat(p.rating || 4.5),
        reviewCount: parseInt(p.review_count || 0, 10),
        stockQuantity: parseInt(p.stock_quantity || 0, 10),
        stockStatus: p.stock_status,
        image: p.main_image_url,
        description: p.description,
        specifications: specMap,
        specificationsList: specArray,
        specs: specMap,
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
    const rawName = req.body.name || req.body.productName || req.body.product_name;
    const rawPrice = req.body.price !== undefined ? req.body.price : (req.body.priceINR !== undefined ? req.body.priceINR : req.body.price_inr);
    const rawOriginalPrice = req.body.originalPrice !== undefined ? req.body.originalPrice : (req.body.originalPriceINR !== undefined ? req.body.originalPriceINR : req.body.original_price);
    const rawStock = req.body.stockQuantity !== undefined ? req.body.stockQuantity : (req.body.stock !== undefined ? req.body.stock : req.body.stock_quantity);
    const brand = req.body.brand || req.body.brandName;
    const category = req.body.category || req.body.categoryName;
    const categoryId = req.body.categoryId || req.body.category_id;
    const brandId = req.body.brandId || req.body.brand_id;
    const modelNumber = req.body.modelNumber || req.body.model_number;
    const description = req.body.description;
    const image = req.body.image || req.body.main_image_url || req.body.imageUrl;
    const specifications = req.body.specifications || req.body.specs;

    if (!rawName || !rawName.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
      return res.status(400).json({ success: false, message: 'Product price is required.' });
    }

    const numPrice = parseFloat(rawPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Product price must be a valid non-negative number.' });
    }

    let numOriginalPrice = null;
    if (rawOriginalPrice !== undefined && rawOriginalPrice !== null && rawOriginalPrice !== '') {
      numOriginalPrice = parseFloat(rawOriginalPrice);
      if (isNaN(numOriginalPrice) || numOriginalPrice < 0) {
        return res.status(400).json({ success: false, message: 'Original price must be a valid non-negative number.' });
      }
    }

    let numStock = 15;
    if (rawStock !== undefined && rawStock !== null && rawStock !== '') {
      numStock = parseInt(rawStock, 10);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
      }
    }

    const stockStatus = numStock === 0 ? 'OUT_OF_STOCK' : (numStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK');
    const brandName = brand && brand.trim() ? brand.trim() : 'OptiBuy';
    const catName = category && category.trim() ? category.trim() : 'Electronics';

    const insertRes = await query(
      `INSERT INTO public.products (
         name, product_name, brand, category, price, price_inr, original_price, original_price_inr,
         stock_quantity, stock_status, image_url, main_image_url, model_number, description, status, category_id, brand_id
       )
       VALUES ($1, $1, $2, $3, $4, $4, $5, $5, $6, $7, $8, $8, $9, $10, 'ACTIVE', $11, $12)
       RETURNING *`,
      [
        rawName.trim(),
        brandName,
        catName,
        numPrice,
        numOriginalPrice,
        numStock,
        stockStatus,
        image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
        modelNumber ? modelNumber.trim() : null,
        description ? description.trim() : null,
        categoryId || null,
        brandId || null
      ]
    );

    const insertedProduct = insertRes.rows[0];

    // Insert specifications if provided
    if (specifications && insertedProduct.id) {
      if (Array.isArray(specifications)) {
        for (const spec of specifications) {
          if (spec.name && spec.value) {
            await query(
              `INSERT INTO public.product_specifications (product_id, specification_name, specification_value)
               VALUES ($1, $2, $3)`,
              [insertedProduct.id, spec.name, String(spec.value)]
            );
          }
        }
      } else if (typeof specifications === 'object') {
        for (const [key, val] of Object.entries(specifications)) {
          if (val !== undefined && val !== null) {
            await query(
              `INSERT INTO public.product_specifications (product_id, specification_name, specification_value)
               VALUES ($1, $2, $3)`,
              [insertedProduct.id, key, String(val)]
            );
          }
        }
      }
    }

    // Mirror to tbl_products if exists
    try {
      await query(
        `INSERT INTO ${schemaName}.tbl_products (name, brand, category, price, original_price, stock_quantity, status, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7) ON CONFLICT DO NOTHING`,
        [rawName.trim(), brandName, catName, numPrice, numOriginalPrice, numStock, image || '']
      );
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: `Product "${rawName}" added successfully.`,
      product: {
        id: insertedProduct.id || insertedProduct.product_id,
        product_id: insertedProduct.product_id || insertedProduct.id,
        name: insertedProduct.product_name,
        productName: insertedProduct.product_name,
        price: parseFloat(insertedProduct.price_inr),
        priceINR: parseFloat(insertedProduct.price_inr),
        stock: parseInt(insertedProduct.stock_quantity, 10),
        stockQuantity: parseInt(insertedProduct.stock_quantity, 10),
        ...insertedProduct
      }
    });

  } catch (error) {
    console.error('[Admin Add Product Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Admin endpoint: Update product details
 * @access  Private (Admin only)
 */
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { name, brand, category, price, originalPrice, stockQuantity, image, modelNumber, description, status, categoryId, brandId, discountPercentage } = req.body;

    const setClauses = [];
    const queryParams = [];
    let paramIdx = 1;

    if (name) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Product name cannot be empty.' });
      }
      setClauses.push(`product_name = $${paramIdx}`);
      queryParams.push(name.trim());
      paramIdx++;
    }
    if (modelNumber !== undefined) {
      setClauses.push(`model_number = $${paramIdx}`);
      queryParams.push(modelNumber ? modelNumber.trim() : null);
      paramIdx++;
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIdx}`);
      queryParams.push(description ? description.trim() : null);
      paramIdx++;
    }
    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ success: false, message: 'Product price must be a valid non-negative number.' });
      }
      setClauses.push(`price_inr = $${paramIdx}`);
      queryParams.push(numPrice);
      paramIdx++;
    }
    if (originalPrice !== undefined) {
      let numOriginalPrice = null;
      if (originalPrice !== null && originalPrice !== '') {
        numOriginalPrice = parseFloat(originalPrice);
        if (isNaN(numOriginalPrice) || numOriginalPrice < 0) {
          return res.status(400).json({ success: false, message: 'Original price must be a valid non-negative number.' });
        }
      }
      setClauses.push(`original_price_inr = $${paramIdx}`);
      queryParams.push(numOriginalPrice);
      paramIdx++;
    }
    if (discountPercentage !== undefined) {
      const numDisc = parseInt(discountPercentage, 10);
      setClauses.push(`discount_percentage = $${paramIdx}`);
      queryParams.push(isNaN(numDisc) ? 0 : Math.max(0, Math.min(100, numDisc)));
      paramIdx++;
    }
    if (stockQuantity !== undefined) {
      const numStock = parseInt(stockQuantity, 10);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
      }
      setClauses.push(`stock_quantity = $${paramIdx}`);
      queryParams.push(numStock);
      paramIdx++;

      const stockStatus = numStock === 0 ? 'OUT_OF_STOCK' : (numStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK');
      setClauses.push(`stock_status = $${paramIdx}`);
      queryParams.push(stockStatus);
      paramIdx++;
    }
    if (image) {
      setClauses.push(`main_image_url = $${paramIdx}`);
      queryParams.push(image.trim());
      paramIdx++;
    }
    if (status) {
      setClauses.push(`status = $${paramIdx}`);
      queryParams.push(status.toUpperCase());
      paramIdx++;
    }
    if (categoryId !== undefined) {
      setClauses.push(`category_id = $${paramIdx}`);
      queryParams.push(categoryId || null);
      paramIdx++;
    }
    if (brandId !== undefined) {
      setClauses.push(`brand_id = $${paramIdx}`);
      queryParams.push(brandId || null);
      paramIdx++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'No product fields provided for update.' });
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(productId);

    const updateRes = await query(
      `UPDATE public.products SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      queryParams
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Also update optibuy.tbl_products for backward compatibility
    try {
      await query(
        `UPDATE ${schemaName}.tbl_products 
         SET name = COALESCE($1, name),
             price = COALESCE($2, price),
             original_price = COALESCE($3, original_price),
             stock_quantity = COALESCE($4, stock_quantity),
             status = COALESCE($5, status),
             image_url = COALESCE($6, image_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $7`,
        [name, price, originalPrice, stockQuantity, status, image, productId]
      );
    } catch (tblErr) {
      // Ignore if alias table doesn't exist
    }

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Admin Update Product Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Admin endpoint: Update product stock quantity
 * @access  Private (Admin only)
 */
router.patch('/:id/stock', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { stockQuantity, stockStatus } = req.body;

    if (stockQuantity === undefined && !stockStatus) {
      return res.status(400).json({ success: false, message: 'stockQuantity or stockStatus is required.' });
    }

    const setClauses = [];
    const queryParams = [];
    let paramIdx = 1;

    let computedStock = null;
    if (stockQuantity !== undefined) {
      computedStock = parseInt(stockQuantity, 10);
      if (isNaN(computedStock) || computedStock < 0) {
        return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
      }
      setClauses.push(`stock_quantity = $${paramIdx}`);
      queryParams.push(computedStock);
      paramIdx++;
      
      // Auto-update stock_status based on quantity if not explicitly provided
      if (!stockStatus) {
        if (computedStock === 0) {
          setClauses.push(`stock_status = 'OUT_OF_STOCK'`);
        } else if (computedStock <= 5) {
          setClauses.push(`stock_status = 'LOW_STOCK'`);
        } else {
          setClauses.push(`stock_status = 'IN_STOCK'`);
        }
      }
    }
    if (stockStatus) {
      setClauses.push(`stock_status = $${paramIdx}`);
      queryParams.push(stockStatus.toUpperCase());
      paramIdx++;
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(productId);

    const updateRes = await query(
      `UPDATE public.products SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      queryParams
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Also update optibuy.tbl_products
    try {
      await query(
        `UPDATE ${schemaName}.tbl_products 
         SET stock_quantity = COALESCE($1, stock_quantity),
             status = COALESCE($2, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $3`,
        [computedStock !== null ? computedStock : null, stockStatus || null, productId]
      );
    } catch (tblErr) {
      // Ignore if alias table doesn't exist
    }

    const updatedStockProd = updateRes.rows[0];
    return res.json({
      success: true,
      message: 'Product stock updated successfully.',
      product: {
        ...updatedStockProd,
        stockQuantity: parseInt(updatedStockProd.stock_quantity, 10),
        stock: parseInt(updatedStockProd.stock_quantity, 10)
      }
    });

  } catch (error) {
    console.error('[Admin Update Stock Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Admin endpoint: Deactivate/Delete product (soft delete via status)
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { hardDelete } = req.query;

    if (hardDelete === 'true') {
      // Hard delete - remove completely
      await query(`DELETE FROM public.product_specifications WHERE product_id = $1`, [productId]);
      await query(`DELETE FROM public.product_images WHERE product_id = $1`, [productId]);
      await query(`DELETE FROM public.products WHERE id = $1`, [productId]);
      
      return res.json({
        success: true,
        message: 'Product permanently deleted from PostgreSQL.'
      });
    } else {
      // Soft delete - set status to INACTIVE
      const updateRes = await query(
        `UPDATE public.products SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [productId]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      // Also update optibuy.tbl_products
      try {
        await query(
          `UPDATE ${schemaName}.tbl_products SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE product_id = $1`,
          [productId]
        );
      } catch (tblErr) {
        // Ignore
      }

      return res.json({
        success: true,
        message: 'Product deactivated (soft deleted).',
        product: updateRes.rows[0]
      });
    }

  } catch (error) {
    console.error('[Admin Delete Product Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products/admin/inventory
 * @desc    Admin endpoint: Get full inventory with all products (including inactive)
 * @access  Private (Admin only)
 */
router.get('/admin/inventory', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { status, category, brand, search, lowStock } = req.query;

    let sql = `
      SELECT p.id, p.product_name, p.model_number, p.description, p.price_inr, p.original_price_inr,
             p.discount_percentage, p.rating, p.review_count, p.stock_quantity, p.stock_status,
             p.main_image_url, p.status, p.category_id, p.brand_id,
             c.category_name, b.brand_name
      FROM public.products p
      LEFT JOIN public.product_categories c ON p.category_id = c.id
      LEFT JOIN public.brands b ON p.brand_id = b.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIdx = 1;

    if (status && status !== 'All') {
      sql += ` AND p.status = $${paramIdx}`;
      queryParams.push(status.toUpperCase());
      paramIdx++;
    }

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

    if (lowStock === 'true') {
      sql += ` AND p.stock_quantity > 0 AND p.stock_quantity <= 5`;
    }

    sql += ` ORDER BY p.created_at DESC`;

    const prodRes = await query(sql, queryParams);

    const products = prodRes.rows.map(p => ({
      id: p.id,
      product_id: p.id,
      name: p.product_name,
      product_name: p.product_name,
      modelNumber: p.model_number,
      category: p.category_name || 'Electronics',
      categoryId: p.category_id,
      brand: p.brand_name || 'OptiBuy',
      brandId: p.brand_id,
      price: parseFloat(p.price_inr),
      priceINR: parseFloat(p.price_inr),
      originalPrice: p.original_price_inr ? parseFloat(p.original_price_inr) : null,
      discount: parseInt(p.discount_percentage || 0, 10),
      rating: parseFloat(p.rating || 4.5),
      reviewCount: parseInt(p.review_count || 0, 10),
      stock: parseInt(p.stock_quantity || 0, 10),
      stockQuantity: parseInt(p.stock_quantity || 0, 10),
      stockStatus: p.stock_status,
      status: p.status,
      image: p.main_image_url,
      description: p.description
    }));

    return res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('[Admin Inventory GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products/sales/inventory
 * @desc    Sales Executive endpoint: Get product availability (read-only)
 * @access  Private (Sales Person & Admin)
 */
router.get('/sales/inventory', authenticateToken, authorizeRoles('SALES_PERSON', 'ADMIN'), async (req, res) => {
  try {
    const { category, brand, search, inStockOnly } = req.query;

    let sql = `
      SELECT p.id, p.product_name, p.model_number, p.price_inr, p.original_price_inr,
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

    if (inStockOnly === 'true') {
      sql += ` AND p.stock_quantity > 0`;
    }

    sql += ` ORDER BY p.stock_status ASC, p.product_name ASC`;

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
      priceINR: parseFloat(p.price_inr),
      originalPrice: p.original_price_inr ? parseFloat(p.original_price_inr) : null,
      discount: parseInt(p.discount_percentage || 0, 10),
      rating: parseFloat(p.rating || 4.5),
      reviewCount: parseInt(p.review_count || 0, 10),
      stock: parseInt(p.stock_quantity || 0, 10),
      stockQuantity: parseInt(p.stock_quantity || 0, 10),
      stockStatus: p.stock_status,
      status: p.status,
      image: p.main_image_url
    }));

    return res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('[Sales Inventory GET Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products/inventory/stats
 * @desc    Get inventory statistics
 * @access  Private (Admin only)
 */
router.get('/inventory/stats', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const statsRes = await query(
      `SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_products,
        COUNT(*) FILTER (WHERE status = 'INACTIVE') as inactive_products,
        COUNT(*) FILTER (WHERE stock_quantity = 0) as out_of_stock,
        COUNT(*) FILTER (WHERE stock_quantity > 0 AND stock_quantity <= 5) as low_stock,
        COUNT(*) FILTER (WHERE stock_quantity > 5) as healthy_stock,
        COALESCE(SUM(stock_quantity), 0) as total_units,
        COALESCE(SUM(price_inr * stock_quantity), 0) as inventory_value
      FROM public.products`
    );

    const stats = statsRes.rows[0];

    // Category breakdown
    const catRes = await query(
      `SELECT c.category_name, 
        COUNT(p.id) as product_count,
        SUM(p.stock_quantity) as total_stock,
        COUNT(*) FILTER (WHERE p.stock_quantity = 0) as out_of_stock,
        COUNT(*) FILTER (WHERE p.stock_quantity > 0 AND p.stock_quantity <= 5) as low_stock
      FROM public.product_categories c
      LEFT JOIN public.products p ON c.id = p.category_id AND p.status = 'ACTIVE'
      GROUP BY c.category_name
      ORDER BY c.category_name`
    );

    // Brand breakdown
    const brandRes = await query(
      `SELECT b.brand_name, 
        COUNT(p.id) as product_count,
        SUM(p.stock_quantity) as total_stock,
        COUNT(*) FILTER (WHERE p.stock_quantity = 0) as out_of_stock,
        COUNT(*) FILTER (WHERE p.stock_quantity > 0 AND p.stock_quantity <= 5) as low_stock
      FROM public.brands b
      LEFT JOIN public.products p ON b.id = p.brand_id AND p.status = 'ACTIVE'
      GROUP BY b.brand_name
      ORDER BY b.brand_name`
    );

    return res.json({
      success: true,
      stats: {
        totalProducts: parseInt(stats.total_products, 10),
        activeProducts: parseInt(stats.active_products, 10),
        inactiveProducts: parseInt(stats.inactive_products, 10),
        outOfStock: parseInt(stats.out_of_stock, 10),
        lowStock: parseInt(stats.low_stock, 10),
        healthyStock: parseInt(stats.healthy_stock, 10),
        totalUnits: parseInt(stats.total_units, 10),
        inventoryValue: parseFloat(stats.inventory_value)
      },
      byCategory: catRes.rows.map(c => ({
        category: c.category_name,
        productCount: parseInt(c.product_count, 10),
        totalStock: parseInt(c.total_stock || 0, 10),
        outOfStock: parseInt(c.out_of_stock, 10),
        lowStock: parseInt(c.low_stock, 10)
      })),
      byBrand: brandRes.rows.map(b => ({
        brand: b.brand_name,
        productCount: parseInt(b.product_count, 10),
        totalStock: parseInt(b.total_stock || 0, 10),
        outOfStock: parseInt(b.out_of_stock, 10),
        lowStock: parseInt(b.low_stock, 10)
      }))
    });

  } catch (error) {
    console.error('[Inventory Stats Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
