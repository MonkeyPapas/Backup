const mongoose = require('mongoose');
const { connectToDatabase } = require('../database/mongoConfig');
const getModelForShop = require('../models/Transaction');

const getAllPromos = async (req, res) => {
  const { year, page = 1, limit = 5 } = req.query;

  if (!year) {
    return res.status(400).json({ message: 'Debe enviar el parámetro year' });
  }

  try {
    await connectToDatabase(year);

    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB no está conectado');

    const collections = await db.listCollections().toArray();
    const shopCodes = collections.map(c => c.name);
    const totalShops = shopCodes.length;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const totalPages = Math.ceil(totalShops / parsedLimit);

    const startIndex = (parsedPage - 1) * parsedLimit;
    const endIndex = startIndex + parsedLimit;
    const shopCodesSlice = shopCodes.slice(startIndex, endIndex);

    const categories = ['Promos Lunes', 'Promos Martes', 'Promos Miercoles'];
    const results = [];

    for (const shopCode of shopCodesSlice) {
      const ShopModel = getModelForShop(shopCode);

      const tickets = await ShopModel.find({
        'items.category': { $in: categories },
        'items.date': { $regex: `-${year}$` }
      });

      const promos = [];

      for (const ticket of tickets) {
        const matchingItems = ticket.items.filter(
          item => categories.includes(item.category) && item.date.endsWith(year)
        );

        matchingItems.forEach(item => {
          promos.push({
            product: item.product,
            category: item.category,
            amount: item.amount,
            date: item.date,
            shopCode: ticket.shopCode || shopCode
          });
        });
      }

      if (promos.length > 0) {
        results.push({
          shopCode,
          data: promos
        });
      }
    }

    return res.status(200).json({
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      totalShops,
      results
    });

  } catch (error) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ message: 'Error al consultar las promociones' });
  }
};

module.exports = getAllPromos;
