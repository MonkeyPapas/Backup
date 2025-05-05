const mongoose = require('mongoose');

let isConnected = false; // Variable para controlar si ya está conectado

// Función para conectar a MongoDB según el año de la base de datos
const connectToDatabase = async (databaseYear) => {
  if (isConnected) {
    console.log(`🌐 Usando la conexión existente a MongoDB - Base de datos: ${databaseYear}`);
    return;  // Si ya estamos conectados, no volvemos a conectar
  }

  try {
    // Concatenamos el nombre de la base de datos a la URI
    const MONGO_URI = process.env.MONGO_URI + databaseYear;

    // Conectar a MongoDB con la URI completa
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,  // Opciones recomendadas de conexión
      useUnifiedTopology: true
    });
    isConnected = true; // Marcamos como conectado
    console.log(`✅ Conectado a MongoDB - Base de datos: ${databaseYear}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB - ${databaseYear}:`, error);
    throw new Error('Error al conectar a la base de datos');
  }
};

module.exports = { connectToDatabase };

