const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabaseClient');

const router = express.Router();

// Create a new purchase order
router.post(
  '/',
  [
    body('supplierId').isInt({ gt: 0 }).withMessage('Supplier ID must be a positive integer'),
    body('orderDate').isISO8601().withMessage('Order date must be a valid date'),
    body('status').isIn(['Pending', 'Received', 'Cancelled']).withMessage('Invalid order status'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
    body('items.*.quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { supplierId, orderDate, status, items } = req.body;

    try {
      // Insert purchase order
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([{ supplier_id: supplierId, order_date: orderDate, status }])
        .single();

      if (orderError) {
        return res.status(500).json({ error: orderError.message });
      }

      const orderId = orderData.id;

      // Insert order items
      const orderItems = items.map(item => ({
        purchase_order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(orderItems);

      if (itemsError) {
        return res.status(500).json({ error: itemsError.message });
      }

      // If status is 'Received', update stock accordingly
      if (status === 'Received') {
        for (const item of items) {
          // Check if stock record exists
          const { data: existingStock, error: selectError } = await supabase
            .from('stock')
            .select('*')
            .eq('product_id', item.productId)
            .eq('warehouse_id', item.warehouseId)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            return res.status(500).json({ error: selectError.message });
          }

          if (existingStock) {
            // Update existing stock quantity
            const newQuantity = existingStock.quantity + item.quantity;
            const { error: updateError } = await supabase
              .from('stock')
              .update({ quantity: newQuantity })
              .eq('id', existingStock.id);

            if (updateError) {
              return res.status(500).json({ error: updateError.message });
            }
          } else {
            // Insert new stock record
            const { error: insertError } = await supabase
              .from('stock')
              .insert([{ product_id: item.productId, warehouse_id: item.warehouseId, quantity: item.quantity }]);

            if (insertError) {
              return res.status(500).json({ error: insertError.message });
            }
          }
        }
      }

      res.status(201).json({ message: 'Purchase order created successfully', orderId });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all purchase orders
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('purchase_orders').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
