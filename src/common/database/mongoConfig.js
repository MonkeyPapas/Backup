
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI; // Leer la variable desde .env

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB - Base de datos: MonkeyPapas"))
    .catch(err => console.error("❌ Error conectando a MongoDB:", err));

module.exports = mongoose.connection; // Exportamos la conexión
