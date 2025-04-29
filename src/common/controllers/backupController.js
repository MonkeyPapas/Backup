const mongoose = require('mongoose');  // Asegúrate de importar mongoose
const { connectToDatabase } = require('../database/mongoConfig');  // Importamos la función para conectar a la base de datos

exports.getShopById = async (req, res) => {
  const { ids, year } = req.query;  // Recibimos los IDs y el año desde los parámetros de la consulta

  if (!ids || !year) {
    return res.status(400).json({ message: 'Debe enviar los parámetros ids y year' });
  }

  const idsArray = ids.split(',');  // Convertimos los IDs en un array
  const databaseYear = year;  // Usamos el parámetro 'year' como nombre de la base de datos

  try {
    // Llamamos a la función para conectar con la base de datos del año indicado
    await connectToDatabase(databaseYear);  // Conectamos a la base de datos correspondiente (2024, 2025, etc.)

    const results = [];  // Array para almacenar los resultados de las consultas

    // Iteramos sobre cada ID para consultar la base de datos
    for (const id of idsArray) {
      const collection = mongoose.connection.collection(id.trim());  // Accedemos a la colección usando el ID
      const shopData = await collection.find({}).toArray();  // Buscamos todos los documentos en la colección

      // Si encontramos datos, los agregamos al resultado
      if (shopData && shopData.length > 0) {
        results.push({ shopCode: id.trim(), data: shopData });
      } else {
        results.push({ shopCode: id.trim(), message: `Shop con shopCode ${id} no encontrado` });
      }
    }

    // Devolvemos los resultados de todos los IDs consultados
    return res.status(200).json(results);

  } catch (error) {
    console.error('Error al consultar el backup:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos' });
  }
};

exports.getAllShops = async (req, res) => {
  try {
    const databaseName = 'BackupMonkey';  // Asegúrate de usar la base de datos correcta
    await connectToDatabase(databaseName);  // Conecta a la base de datos BackupMonkey

    const dbNative = mongoose.connection.db;  // Accede al db nativo de MongoDB
    const collections = await dbNative.listCollections().toArray();  // Lista todas las colecciones

    const shops = [];

    for (const collectionInfo of collections) {
      const collection = dbNative.collection(collectionInfo.name);  // Accede a cada colección por nombre
      const data = await collection.find({}).toArray();  // Obtener los documentos de la colección
      shops.push(...data);  // Agregar los documentos a la lista de shops
    }

    res.status(200).json(shops);  // Devolver todos los shops encontrados
  } catch (error) {
    console.error('Error al consultar los backups:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos' });
  }
};