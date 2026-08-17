import express from 'express';
import { query, schemaName } from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const TABLE_CATEGORIES = `${schemaName}.tbl_categories`;

/**
 * @route   GET /api/categories
 * @desc    Get all product categories from PostgreSQL
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const catRes = await query(
      `SELECT category_id, name, description, status, created_at
       FROM ${TABLE_CATEGORIES}
       ORDER BY category_id ASC`
    );

    return res.json({
      success: true,
      count: catRes.rows.length,
      categories: catRes.rows.map(c => ({
        id: c.category_id,
        category_id: c.category_id,
        name: c.name,
        description: c.description,
        status: c.status,
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('[Categories API Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/categories
 * @desc    Admin endpoint: Add a new category to PostgreSQL
 * @access  Private (Admin only)
 */
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const cleanName = name.trim();

    // Check duplicate
    const existing = await query(
      `SELECT category_id FROM ${TABLE_CATEGORIES} WHERE LOWER(name) = $1`,
      [cleanName.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists.'
      });
    }

    const insertRes = await query(
      `INSERT INTO ${TABLE_CATEGORIES} (name, description, status)
       VALUES ($1, $2, 'ACTIVE')
       RETURNING category_id, name, description, status, created_at`,
      [cleanName, description ? description.trim() : null]
    );

    return res.status(201).json({
      success: true,
      message: `Category "${cleanName}" created successfully!`,
      category: insertRes.rows[0]
    });

  } catch (error) {
    console.error('[Add Category Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Admin endpoint: Edit category name, description, or toggle status (ACTIVE/INACTIVE)
 * @access  Private (Admin only)
 */
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    const { name, description, status } = req.body;

    let updateQuery = `UPDATE ${TABLE_CATEGORIES} SET `;
    const queryParams = [];
    const setClauses = [];
    let paramIdx = 1;

    if (name) {
      setClauses.push(`name = $${paramIdx}`);
      queryParams.push(name.trim());
      paramIdx++;
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIdx}`);
      queryParams.push(description ? description.trim() : null);
      paramIdx++;
    }
    if (status) {
      setClauses.push(`status = $${paramIdx}`);
      queryParams.push(status.toUpperCase());
      paramIdx++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'No category fields provided for update.' });
    }

    updateQuery += setClauses.join(', ') + ` WHERE category_id = $${paramIdx} RETURNING category_id, name, description, status`;
    queryParams.push(categoryId);

    const updateRes = await query(updateQuery, queryParams);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      category: updateRes.rows[0]
    });

  } catch (error) {
    console.error('[Edit Category Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
