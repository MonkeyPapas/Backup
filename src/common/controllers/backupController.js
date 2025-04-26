const db = require('../database/mongoConfig'); // Importamos la configuración de MongoDB

exports.getShopById = async (req, res) => {
  const { id } = req.params;
  try {
    const collection = db.db.collection(id); // ← importante usar .db aquí
    const shopData = await collection.find({}).toArray();

    if (shopData && shopData.length > 0) {
      return res.status(200).json(shopData);
    } else {
      return res.status(404).json({ message: `Shop con shopCode ${id} no encontrado` });
    }
  } catch (error) {
    console.error('Error al consultar el backup:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos' });
  }
};

exports.getAllShops = async (req, res) => {
  try {
    const dbNative = db.db;  // Accede al db nativo de MongoDB
    const collections = await dbNative.listCollections().toArray();  // Llama al método listCollections()

    const shops = [];

    for (const collectionInfo of collections) {
      const collection = dbNative.collection(collectionInfo.name);  // Accede a cada colección por nombre
      const data = await collection.find({}).toArray();  // Obtener los documentos
      shops.push(...data);  // Agregar los documentos a la lista de shops
    }

    res.status(200).json(shops);  // Devolver todos los shops encontrados
  } catch (error) {
    console.error('Error al consultar los backups:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos' });
  }
};