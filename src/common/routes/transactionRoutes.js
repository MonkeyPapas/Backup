// /src/routes/transactionRoutes.js
const express = require('express');
const { fetchTransactionDetails } = require('../controllers/transactionController');

const router = express.Router();

// Ruta para obtener las transacciones
router.get('/data-warehouse', fetchTransactionDetails);

module.exports = router;
