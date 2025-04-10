const express = require('express');


const transactionRoutes = require('./routes/transactionRoutes'); // Ruta correcta
const cors = require('cors');
const app = express();

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());
// app.use('/backend/webhook', webhookStripe);

// Middleware para manejar datos JSON y URL codificada
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1', transactionRoutes);
module.exports = app;

