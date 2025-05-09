const mongoose = require('mongoose');

// Función para conectar a MongoDB según el año de la base de datos
const connectToDatabase = async (databaseYear) => {
  try {
    // Cierra cualquier conexión previa (importante si se reintenta)
    await mongoose.disconnect();

    // Concatena el nombre de la base de datos a la URI base
    const MONGO_URI = process.env.MONGO_URI + databaseYear;

    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true, // Activa reintentos automáticos en caso de cambios de primario
    });

    console.log(`✅ Conectado a MongoDB - Base de datos: ${databaseYear}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB - ${databaseYear}:`, error);
    throw new Error('Error al conectar a la base de datos');
  }
};

module.exports = { connectToDatabase };
