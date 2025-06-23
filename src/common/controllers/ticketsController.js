const mongoose = require('mongoose');
const { connectToDatabase } = require('../database/mongoConfig');
const getModelForShop = require('../models/Transaction');

const getSelectedSKUTickets = async (req, res) => {
  const { year, page = 1, limit = 100 } = req.query;

  if (!year) {
    return res.status(400).json({ message: 'Debe enviar el parámetro year' });
  }

  try {
    await connectToDatabase(year);

    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const shopCodes = collections.map(c => c.name);

    // Los SKU deben ser string
    const targetSKUs = [
      '105200025249', '105200025245', '105200025248',
      '10520001653', '105200016521', '105200016520',
      '105200016522', '105200016567', '105200016569'
    ];

    const results = [];

    for (const shopCode of shopCodes) {
      const ShopModel = getModelForShop(shopCode);

      const tickets = await ShopModel.find({
        'items.sku': { $in: targetSKUs }
      });

      for (const ticket of tickets) {
        ticket.items.forEach(item => {
          if (targetSKUs.includes(item.sku)) {
            results.push({
              product: item.product || '',
              category: item.category || '',
              SKU: item.sku || '',
              amount: item.amount || 0,
              date: item.date || '',
              shopCode: ticket.shopCode || shopCode
            });
          }
        });
      }
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const start = (parsedPage - 1) * parsedLimit;
    const paginatedResults = results.slice(start, start + parsedLimit);

    return res.status(200).json({
      currentPage: parsedPage,
      totalPages: Math.ceil(results.length / parsedLimit),
      totalResults: results.length,
      data: paginatedResults
    });

  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ message: 'Error al consultar los tickets por SKU' });
  }
};

module.exports = 
  getSelectedSKUTickets
;
