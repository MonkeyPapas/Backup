const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

router.get('/shop', backupController.getShopById);

// Nuevo endpoint por rango de fechas
router.get('/shop-range', backupController.getShopByIdByDateRange);

module.exports = router;

