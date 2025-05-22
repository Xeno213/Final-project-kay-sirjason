const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabaseClient');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to check and reserve stock
async function reserveStock(productId, warehouseId, quantity) {
  // Check existing stock
  const { data: stock, error: stockError } = await supabase
    .from('stock')
    .select('*')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .limit(1)
    .single();

  if (stockError && stockError.code !== 'PGRST116') {
    throw new Error(stockError.message);
  }

  if (!stock || stock.quantity < quantity) {
    // Insufficient stock, create backorder
    const backorderQuantity = stock ? quantity - stock.quantity : quantity;
    await supabase.from('backorders').insert([{
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: backorderQuantity,
      status: 'Pending',
      created_at: new Date().toISOString()
    }]);
    // Reserve whatever stock is available if any
    if (stock && stock.quantity > 0) {
      await supabase.from('stock').update({
        quantity: 0
      }).eq('id', stock.id);
      return stock.quantity; // reserved partial stock
    }
    return 0; // no stock reserved
  } else {
    // Sufficient stock, reserve by reducing stock quantity
    const newQuantity = stock.quantity - quantity;
    const { error: updateError } = await supabase
      .from('stock')
      .update({ quantity: newQuantity })
      .eq('id', stock.id);
    if (updateError) {
      throw new Error(updateError.message);
    }
    return quantity; // reserved full quantity
  }
}

// Place a new customer order and reserve stock
router.post(
  '/',
  authenticateToken,
  [
    body('customerId').isInt({ gt: 0 }).withMessage('Customer ID must be a positive integer'),
    body('warehouseId').isInt({ gt: 0 }).withMessage('Warehouse ID must be a positive integer'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
    body('items.*.quantity').isInt({ gt: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, warehouseId, items } = req.body;

    try {
      // Insert order record
      const { data: orderData, error: orderError } = await supabase
        .from('customer_orders')
        .insert([{ customer_id: customerId, warehouse_id: warehouseId, status: 'Placed', order_date: new Date().toISOString() }])
        .single();

      if (orderError) {
        return res.status(500).json({ error: orderError.message });
      }

      const orderId = orderData.id;

      // Process each item: reserve stock or create backorder
      const orderItems = [];
      for (const item of items) {
        const reservedQuantity = await reserveStock(item.productId, warehouseId, item.quantity);
        const backorderQuantity = item.quantity - reservedQuantity;

        orderItems.push({
          customer_order_id: orderId,
          product_id: item.productId,
          quantity_ordered: item.quantity,
          quantity_reserved: reservedQuantity,
          quantity_backordered: backorderQuantity,
        });
      }

      // Insert order items
      const { error: itemsError } = await supabase
        .from('customer_order_items')
        .insert(orderItems);

      if (itemsError) {
        return res.status(500).json({ error: itemsError.message });
      }

      res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Server error' });
    }
  }
);

// Ship an order and deduct reserved stock
router.post(
  '/:orderId/ship',
  authenticateToken,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    try {
      // Get order items with reserved quantities
      const { data: items, error: itemsError } = await supabase
        .from('customer_order_items')
        .select('*')
        .eq('customer_order_id', orderId);

      if (itemsError) {
        return res.status(500).json({ error: itemsError.message });
      }

      if (!items || items.length === 0) {
        return res.status(404).json({ error: 'Order items not found' });
      }

      // Deduct reserved stock (already reserved, so just confirm shipment)
      // Update order status to 'Shipped'
      const { error: orderUpdateError } = await supabase
        .from('customer_orders')
        .update({ status: 'Shipped', shipped_date: new Date().toISOString() })
        .eq('id', orderId);

      if (orderUpdateError) {
        return res.status(500).json({ error: orderUpdateError.message });
      }

      res.json({ message: 'Order shipped successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Server error' });
    }
  }
);

module.exports = router;
