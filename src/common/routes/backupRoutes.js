const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

router.get('/shop', backupController.getShopById);

module.exports = router;
