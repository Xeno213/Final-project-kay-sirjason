const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabaseClient');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new warehouse
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Warehouse Manager'),
  [
    body('name').notEmpty().withMessage('Warehouse name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('capacity').isInt({ gt: 0 }).withMessage('Capacity must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, capacity } = req.body;

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert([{ name, location, capacity }]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json(data[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all warehouses
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a warehouse by id
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Warehouse name cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('capacity').optional().isInt({ gt: 0 }).withMessage('Capacity must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const warehouseId = req.params.id;
    const updates = req.body;

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .update(updates)
        .eq('id', warehouseId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a warehouse by id
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Warehouse Manager'),
  async (req, res) => {
    const warehouseId = req.params.id;

    try {
      // Check for related stock_movements referencing this warehouse as destination_warehouse_id or source_warehouse_id
      const { data: relatedMovements, error: movementError } = await supabase
        .from('stock_movements')
        .select('id')
        .or(`destination_warehouse_id.eq.${warehouseId},source_warehouse_id.eq.${warehouseId}`)
        .limit(1);

      if (movementError) {
        return res.status(500).json({ error: movementError.message });
      }

      if (relatedMovements && relatedMovements.length > 0) {
        return res.status(400).json({ error: 'Cannot delete warehouse with related stock movements. Please remove related stock movements first.' });
      }

      // Check for related stock records referencing this warehouse
      const { data: relatedStock, error: stockError } = await supabase
        .from('stock')
        .select('id')
        .eq('warehouse_id', warehouseId)
        .limit(1);

      if (stockError) {
        return res.status(500).json({ error: stockError.message });
      }

      if (relatedStock && relatedStock.length > 0) {
        return res.status(400).json({ error: 'Cannot delete warehouse with related stock records. Please remove related stock first.' });
      }

      // Safe to delete warehouse
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', warehouseId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ message: 'Warehouse deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
