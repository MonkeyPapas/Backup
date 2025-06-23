const express = require('express');
require('../common/database/mongoConfig');

const transactionRoutes = require('./routes/transactionRoutes');
const backupRoutes= require('./routes/backupRoutes')
const promosRoutes = require('./routes/promos');
const ticketsRoutes = require('./routes/ticketsRoutes');


const cors = require('cors');
const app = express();

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());
// app.use('/backend/webhook', webhookStripe);

// Middleware para manejar datos JSON y URL codificada
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1', transactionRoutes);
app.use('/api/v1', backupRoutes);
app.use('/api/v1', promosRoutes);
app.use('/api/v1', ticketsRoutes);

module.exports = app;

