const express = require('express');
const supabase = require('../supabaseClient');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Get stock movement history
router.get('/stock-movements', authenticateToken, authorizeRoles('Admin', 'Warehouse Manager'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, product:product_id(id, name), source_warehouse:source_warehouse_id(id, name), destination_warehouse:destination_warehouse_id(id, name)')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get inventory value analysis
router.get('/inventory-value', authenticateToken, authorizeRoles('Admin', 'Warehouse Manager'), async (req, res) => {
  try {
    // Fetch stock with product cost_price
    const { data: stockData, error: stockError } = await supabase
      .from('stock')
      .select('quantity, product:product_id(id, name, cost_price)');

    if (stockError) {
      return res.status(500).json({ error: stockError.message });
    }

    // Calculate inventory value per product
    const inventoryValue = {};

    stockData.forEach(item => {
      if (item.product && item.product.cost_price != null) {
        const value = item.quantity * item.product.cost_price;
        if (inventoryValue[item.product.id]) {
          inventoryValue[item.product.id].total_value += value;
          inventoryValue[item.product.id].total_quantity += item.quantity;
        } else {
          inventoryValue[item.product.id] = {
            product_id: item.product.id,
            product_name: item.product.name,
            total_quantity: item.quantity,
            total_value: value,
          };
        }
      }
    });

    // Convert to array
    const result = Object.values(inventoryValue);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
