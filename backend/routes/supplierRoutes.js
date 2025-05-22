const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabaseClient');

const router = express.Router();

// Create a new supplier
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Supplier name is required'),
    body('contact').notEmpty().withMessage('Contact information is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, contact, email, phone } = req.body;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ name, contact, email, phone }]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json(data[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a supplier by id
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Supplier name cannot be empty'),
    body('contact').optional().notEmpty().withMessage('Contact information cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplierId = req.params.id;
    const updates = req.body;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', supplierId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a supplier by id
router.delete('/:id', async (req, res) => {
  const supplierId = req.params.id;

  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
