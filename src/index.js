require('dotenv').config();
const app = require('./common/app');

// Obtener el puerto desde las variables de entorno
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

