const express = require('express');
const productRoutes = require('./productRoutes');
const warehouseRoutes = require('./warehouseRoutes');
const orderRoutes = require('./orderRoutes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/orders', orderRoutes);

const stockRoutes = require('./stockRoutes');

const authRoutes = require('./authRoutes');

const supplierRoutes = require('./supplierRoutes');
const purchaseOrderRoutes = require('./purchaseOrderRoutes');

const auditRoutes = require('./auditRoutes');
const reportRoutes = require('./reportRoutes');

// TODO: Add other routes for users, authentication, etc.

router.use('/auth', authRoutes);
router.use('/stock', stockRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
