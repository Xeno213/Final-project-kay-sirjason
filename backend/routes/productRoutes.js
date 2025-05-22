const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabaseClient');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new product
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Warehouse Manager'),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('supplier').notEmpty().withMessage('Supplier information is required'),
    body('costPrice').isFloat({ gt: 0 }).withMessage('Cost price must be a positive number'),
    body('sellingPrice').isFloat({ gt: 0 }).withMessage('Selling price must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, sku, category, supplier, costPrice, sellingPrice } = req.body;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, sku, category, supplier, cost_price: costPrice, selling_price: sellingPrice }]);

      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json(data[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all products
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a product by id
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Warehouse Manager'),
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('sku').optional().notEmpty().withMessage('SKU cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('supplier').optional().notEmpty().withMessage('Supplier information cannot be empty'),
    body('costPrice').optional().isFloat({ gt: 0 }).withMessage('Cost price must be a positive number'),
    body('sellingPrice').optional().isFloat({ gt: 0 }).withMessage('Selling price must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const updates = req.body;

    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          sku: updates.sku,
          category: updates.category,
          supplier: updates.supplier,
          cost_price: updates.costPrice,
          selling_price: updates.sellingPrice,
        })
        .eq('id', productId);

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a product by id
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Warehouse Manager'),
  async (req, res) => {
    const productId = req.params.id;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Supabase delete error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;

module.exports = router;
