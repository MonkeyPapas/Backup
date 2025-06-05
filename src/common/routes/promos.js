const express = require('express');
const router = express.Router();
const getAllPromos  = require('../controllers/promosController');

router.get('/promos', getAllPromos);

module.exports = router;
