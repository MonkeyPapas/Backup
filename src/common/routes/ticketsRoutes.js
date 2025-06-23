const express = require('express');
const router = express.Router();
const getSelectedTickets  = require('../controllers/ticketsController');


router.get('/tickets/filtered', getSelectedTickets);

module.exports = router;
