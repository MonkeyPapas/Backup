const mongoose = require('mongoose');  // Asegúrate de importar mongoose
const { connectToDatabase } = require('../database/mongoConfig');  // Importamos la función para conectar a la base de datos
const getTransactionModel = require('../models/Transaction'); // mantiene el modelo vivo en mongoose

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

// GET /api/v1/shop-range?ids=...&year=2025&start=YYYY-MM-DD&end=YYYY-MM-DD
exports.getShopByIdByDateRange = async (req, res) => {
  const { ids, year, start, end } = req.query;

  // Validaciones mínimas
  if (!ids || !year || !start || !end) {
    return res.status(400).json({
      message: 'Debe enviar ids, year, start y end. Ej: ?ids=52000569&year=2025&start=2025-01-01&end=2025-01-07'
    });
  }

  // BOUNDS tipo día completo
  const startBound = `${start}T00:00:00`;
  const endBound   = `${end}T23:59:59`;
  const idsArray   = ids.split(',').map(s => s.trim()).filter(Boolean);

  try {
    await connectToDatabase(String(year)); // asegura string

    const out = [];

    for (const shopCode of idsArray) {
      // Asegura que el modelo exista (coherente con tu diseño)
      getTransactionModel(shopCode);

      // Usa la colección nativa para evitar issues de versión con allowDiskUse
      const col = mongoose.connection.collection(shopCode);

      // Índice seguro (si no tienes permisos, no rompe)
      try { await col.createIndex({ "items.timestamp": 1 }); } catch (e) {
        console.warn(`[shop-range] No se pudo crear índice en ${shopCode}: ${e?.message}`);
      }

      const pipeline = [
        // 1) Usa el índice para reducir documentos que tengan items en rango
        { $match: { "items.timestamp": { $gte: startBound, $lte: endBound } } },

        // 2) Devuelve SOLO los items dentro del rango
        {
          $project: {
            ticketNumber: 1,
            shop: 1,
            shopCode: 1,
            items: {
              $filter: {
                input: "$items",
                as: "it",
                cond: {
                  $and: [
                    { $gte: ["$$it.timestamp", startBound] },
                    { $lte: ["$$it.timestamp", endBound] }
                  ]
                }
              }
            }
          }
        },

        // 3) Quita tickets que quedaron sin items
        { $match: { "items.0": { $exists: true } } }
      ];

      // ¡Clave!: toArray() para ejecutar el cursor nativo
      const docs = await col.aggregate(pipeline, { allowDiskUse: true }).toArray();

      out.push({ shopCode, data: docs });
    }

    return res.status(200).json(out);

  } catch (err) {
    console.error('❌ /shop-range error:', err?.message, err);
    return res.status(500).json({ message: 'Error al consultar por rango de fechas' });
  }
};