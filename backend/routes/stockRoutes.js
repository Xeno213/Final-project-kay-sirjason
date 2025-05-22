const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabaseClient');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { logAuditEvent } = require('../utils/auditLogger');

const router = express.Router();

// Add or update stock for a product in a warehouse
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Warehouse Manager'),
  [
    body('productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
    body('warehouseId').isInt({ gt: 0 }).withMessage('Warehouse ID must be a positive integer'),
    body('quantity').isInt().withMessage('Quantity must be an integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, warehouseId, quantity } = req.body;

    try {
      // Verify product exists
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      // Check if stock record exists
      const { data: existingStock, error: selectError } = await supabase
        .from('stock')
        .select('*')
        .eq('product_id', productId)
        .eq('warehouse_id', warehouseId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
        return res.status(500).json({ error: selectError.message });
      }

      if (existingStock) {
        // Update existing stock quantity
        const newQuantity = existingStock.quantity + quantity;
        let data, error;
        try {
          const response = await supabase
            .from('stock')
            .update({ quantity: newQuantity })
            .eq('id', existingStock.id)
            .select();
          data = response.data;
          error = response.error;
          console.log('Supabase update response:', response);
        } catch (ex) {
          console.error('Exception during Supabase update:', ex);
          return res.status(500).json({ error: 'Exception during stock update' });
        }

        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({ error: error.message });
        }

        // Insert stock movement record
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert([{
            product_id: productId,
            source_warehouse_id: warehouseId,
            destination_warehouse_id: warehouseId,
            quantity: quantity,
            status: 'Received',
            created_at: new Date().toISOString()
          }]);

        if (movementError) {
          return res.status(500).json({ error: movementError.message });
        }

        if (!data || data.length === 0) {
          console.error('Update stock failed, Supabase response data:', data);
          return res.status(500).json({ error: 'Failed to update stock' });
        }
        res.json(data[0]);
        // Log audit event for stock update
        await logAuditEvent(req.user.id, 'Stock Updated', `Updated stock for product ${productId} in warehouse ${warehouseId} by quantity ${quantity}`);
      } else {
        // Insert new stock record
        let data, error;
        try {
          const response = await supabase
            .from('stock')
            .insert([{ product_id: productId, warehouse_id: warehouseId, quantity }])
            .select();
          data = response.data;
          error = response.error;
          console.log('Supabase insert response:', response);
        } catch (ex) {
          console.error('Exception during Supabase insert:', ex);
          return res.status(500).json({ error: 'Exception during stock insert' });
        }

        if (error) {
          console.error('Supabase insert error:', error);
          return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
          console.error('Insert stock failed, Supabase response data:', data);
          return res.status(500).json({ error: 'Failed to add stock' });
        }
        res.status(201).json(data[0]);
        // Log audit event for new stock addition
        await logAuditEvent(req.user.id, 'Stock Added', `Added stock for product ${productId} in warehouse ${warehouseId} with quantity ${quantity}`);
      }
    } catch (err) {
      console.error('Error in stock route:', err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  }
);

// Get stock levels for all products in all warehouses
router.get('/', async (req, res) => {
  try {
    // Fetch stock data
    const { data: stockData, error: stockError } = await supabase
      .from('stock')
      .select('id, quantity, product_id, warehouse_id');

    if (stockError) {
      console.error('Supabase stock query error:', stockError);
      return res.status(500).json({ error: stockError.message });
    }

    // Fetch product data
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id, name, low_stock_threshold');

    if (productError) {
      console.error('Supabase product query error:', productError);
      return res.status(500).json({ error: productError.message });
    }

    // Fetch warehouse data
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id, capacity');

    if (warehouseError) {
      console.error('Supabase warehouse query error:', warehouseError);
      return res.status(500).json({ error: warehouseError.message });
    }

    // Map products by id
    const productMap = {};
    productData.forEach(product => {
      productMap[product.id] = product;
    });

    // Map warehouses by id
    const warehouseMap = {};
    warehouseData.forEach(warehouse => {
      warehouseMap[warehouse.id] = warehouse;
    });

    // Combine stock with product info and warehouse capacity
    const combinedData = stockData.map(stock => ({
      ...stock,
      product: productMap[stock.product_id],
      warehouse: warehouseMap[stock.warehouse_id]
    }));

    res.json(combinedData);
  } catch (err) {
    console.error('Unexpected error in GET /stock:', err);
    console.error(err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record a stock transfer between warehouses
router.post(
  '/transfer',
  authenticateToken,
  authorizeRoles('Admin', 'Warehouse Manager'),
  [
    body('productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
    body('sourceWarehouseId').isInt({ gt: 0 }).withMessage('Source Warehouse ID must be a positive integer'),
    body('destinationWarehouseId').isInt({ gt: 0 }).withMessage('Destination Warehouse ID must be a positive integer'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('status').isIn(['Pending', 'In Transit', 'Received']).withMessage('Invalid transfer status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, sourceWarehouseId, destinationWarehouseId, quantity, status } = req.body;

    try {
      // Verify product exists
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      // Insert transfer record
      const { data, error } = await supabase
        .from('stock_transfers')
        .insert([{
          product_id: productId,
          source_warehouse_id: sourceWarehouseId,
          destination_warehouse_id: destinationWarehouseId,
          quantity,
          status,
          transfer_date: new Date().toISOString()
        }]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Update stock quantities for source warehouse
      const { data: sourceStock, error: sourceError } = await supabase
        .from('stock')
        .select('*')
        .eq('product_id', productId)
        .eq('warehouse_id', sourceWarehouseId)
        .single();

      if (sourceError && sourceError.code !== 'PGRST116') {
        return res.status(500).json({ error: sourceError.message });
      }

      if (sourceStock) {
        const newSourceQuantity = sourceStock.quantity - quantity;
        const { error: updateSourceError } = await supabase
          .from('stock')
          .update({ quantity: newSourceQuantity })
          .eq('id', sourceStock.id);

        if (updateSourceError) {
          return res.status(500).json({ error: updateSourceError.message });
        }

        // Insert stock movement record for source warehouse (removal)
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert([{
            product_id: productId,
            source_warehouse_id: sourceWarehouseId,
            destination_warehouse_id: null,
            quantity: -quantity,
            status: 'In Transit',
            created_at: new Date().toISOString()
          }]);

        if (movementError) {
          return res.status(500).json({ error: movementError.message });
        }
      }

      // Update stock quantities for destination warehouse
      const { data: destStock, error: destError } = await supabase
        .from('stock')
        .select('*')
        .eq('product_id', productId)
        .eq('warehouse_id', destinationWarehouseId)
        .single();

      if (destError && destError.code !== 'PGRST116') {
        return res.status(500).json({ error: destError.message });
      }

      if (destStock) {
        const newDestQuantity = destStock.quantity + quantity;
        const { error: updateDestError } = await supabase
          .from('stock')
          .update({ quantity: newDestQuantity })
          .eq('id', destStock.id);

        if (updateDestError) {
          return res.status(500).json({ error: updateDestError.message });
        }
      } else {
        const { error: insertDestError } = await supabase
          .from('stock')
          .insert([{ product_id: productId, warehouse_id: destinationWarehouseId, quantity }]);

        if (insertDestError) {
          return res.status(500).json({ error: insertDestError.message });
        }
      }

      // Insert stock movement record for destination warehouse (addition)
      const { error: movementDestError } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: productId,
          source_warehouse_id: null,
          destination_warehouse_id: destinationWarehouseId,
          quantity: quantity,
          status: 'Received',
          created_at: new Date().toISOString()
        }]);

      if (movementDestError) {
        return res.status(500).json({ error: movementDestError.message });
      }

      res.status(201).json(data[0]);
      // Log audit event for stock transfer
      await logAuditEvent(req.user.id, 'Stock Transfer', `Transferred product ${productId} from warehouse ${sourceWarehouseId} to ${destinationWarehouseId} quantity ${quantity} status ${status}`);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get stock transfer history
router.get('/transfer/history', async (req, res) => {
  try {
    const { data, error } = await supabase.from('stock_transfers').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/low-stock-alerts', async (req, res) => {
  try {
    // Fetch stock data
    const { data: stockData, error: stockError } = await supabase
      .from('stock')
      .select('id, quantity, product_id, warehouse_id');

    if (stockError) {
      return res.status(500).json({ error: stockError.message });
    }

    // Fetch product data
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*');

    if (productError) {
      return res.status(500).json({ error: productError.message });
    }

    // Fetch warehouse data
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id, capacity');

    if (warehouseError) {
      return res.status(500).json({ error: warehouseError.message });
    }

    // Map products by id
    const productMap = {};
    productData.forEach(product => {
      productMap[product.id] = product;
    });

    // Map warehouses by id
    const warehouseMap = {};
    warehouseData.forEach(warehouse => {
      warehouseMap[warehouse.id] = warehouse;
    });

    // Combine stock with product info and warehouse capacity
    const combinedData = stockData.map(stock => ({
      ...stock,
      product: productMap[stock.product_id],
      warehouse: warehouseMap[stock.warehouse_id]
    }));

    // Filter low stock considering product threshold and capacity threshold (10%)
    const lowStockItems = combinedData.filter(item => {
      const capacityThreshold = item.warehouse && item.warehouse.capacity ? item.warehouse.capacity * 0.1 : null;
      const isLowStock = (
        item.product &&
        item.product.low_stock_threshold !== null &&
        (
          item.quantity < item.product.low_stock_threshold ||
          (capacityThreshold !== null && item.quantity < capacityThreshold)
        )
      );
      return isLowStock;
    });

    res.json(lowStockItems);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
