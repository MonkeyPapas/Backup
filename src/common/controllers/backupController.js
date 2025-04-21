const db = require('../database/mongoConfig'); // Importamos la configuración de MongoDB

// Obtener un shop por su shopCode (el nombre de la colección)
exports.getShopById = async (req, res) => {
  const { id } = req.params; // Obtenemos el id del shop desde la URL
  try {
    const collection = db.collection(id);  // `id` es el shopCode, que será el nombre de la colección
    const shopData = await collection.find({}).toArray(); 

    if (shopData && shopData.length > 0) {
      return res.status(200).json(shopData);  // Si se encuentran documentos, retornamos los datos
    } else {
      return res.status(404).json({ message: `Shop con shopCode ${id} no encontrado` });  
    }
  } catch (error) {
    console.error('Error al consultar el backup:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos' });
  }
};

// Obtener todos los shops
exports.getAllShops = async (req, res) => {
  try {
    const collections = await db.listCollections().toArray(); // Obtiene todas las colecciones
    const shops = [];
    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name); // Accedemos a la colección por su nombre
      const data = await collection.find({}).toArray();  // Obtenemos todos los documentos de esa colección
      shops.push(...data);  // Agregamos los documentos de esa colección a la lista de shops
    }

    res.status(200).json(shops);  // Retornamos todos los datos de todas las colecciones
  } catch (error) {
    console.error('Error al consultar los backups:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos' });
  }
};
