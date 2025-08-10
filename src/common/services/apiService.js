const axios = require('axios');
const getTransactionModel = require('../models/Transaction');
const { connectToDatabase } = require('../database/mongoConfig');

// Función para obtener el token
const getToken = async () => {
  try {
    const response = await axios.post('https://mx-api.bistrosoft.com/api/v1/token', {
      username: 'jsalas@monkeypapas.com',
      password: '0306Cristo#1',
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el token:', error.response?.data || error.message);
    throw new Error('No se pudo obtener el token');
  }
};

// Función para extraer los datos con la estructura de shopCode -> tickets -> items ordenados
const extractShopDataWithItemsAndTickets = (items) => {
  const shopData = {};

  items.forEach(item => {
    const shopCode = item.shopCode;
    const shop = item.shop;
    const ticketNumber = item.ticketNumber;

    if (!shopData[shopCode]) {
      shopData[shopCode] = {
        shopCode,
        shop,
        tickets: [],
      };
    }

    let ticket = shopData[shopCode].tickets.find(ticket => ticket.ticketNumber === ticketNumber);

    if (!ticket) {
      ticket = {
        ticketNumber,
        items: [],
      };
      shopData[shopCode].tickets.push(ticket);
    }

    const itemDetails = {
      transactionType: item.transactionType || "- ITEM",
      comments: item.comments || null,
      client: item.client || null,
      date: item.date || null,
      hour: item.hour || null,
      quantity: item.quantity || null,
      amount: item.amount || null,
      origin: item.origin || null,
      product: item.product || null,
      paymentMethod: item.paymentMethod || null,
      user: item.user || null,
      timestamp: item.timestamp || null,
      status: item.status || null,
      uuid: item.uuid || null,
      dinnersQty: item.dinnersQty || null,
      unitPrice: item.unitPrice || null,
      vat: item.vat || null,
      unitCost: item.unitCost || null,
      totalCost: item.totalCost || null,
      sku: item.sku || null,
      category: item.category || null,
      waiter: item.waiter || null,
      tableName: item.tableName || null,
    };

    ticket.items.push(itemDetails);
  });

  // Ordenar los items dentro de cada ticket: primero COMANDA, luego el resto
  Object.values(shopData).forEach(shop => {
    shop.tickets.forEach(ticket => {
      ticket.items.sort((a, b) => {
        if (a.transactionType === 'COMANDA' && b.transactionType !== 'COMANDA') return -1;
        if (a.transactionType !== 'COMANDA' && b.transactionType === 'COMANDA') return 1;
        return 0;
      });
    });
  });

  return Object.values(shopData);
};

// Función para obtener los detalles de las transacciones
const getTransactionDetails = async (token, startDate, endDate, databaseYear) => {
  console.log(`📆 Iniciando escaneo desde ${startDate} hasta ${endDate}`);

  let pageNumber = 0;
  let allItems = [];
  let totalFetched = 0;
  let requestCount = 0;

  while (true) {
    try {
      const response = await axios.get('https://mx-api.bistrosoft.com/api/v1/transactiondetailreport', {
        params: { startDate, endDate, pageNumber },
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = response.data.items;

      if (!items || items.length === 0) {
        console.log(`📦 Paginación terminada. Total de items: ${totalFetched}`);
        break;
      }

      allItems = allItems.concat(items);
      totalFetched += items.length;
      console.log(`📄 Página ${pageNumber}: ${items.length} items`);

      pageNumber++;
      requestCount++;

      // Esperar 1 segundo después de cada request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cada 11 requests, pausar 60 segundos adicionales
      if (requestCount % 11 === 0) {
        console.log('🛑 Pausando 60 segundos para respetar el límite de 11 requests/minuto...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }

    } catch (error) {
      console.error(`❌ Error en la página ${pageNumber}:`, error.response?.data || error.message);
      console.log('🚫 Se detuvo el proceso debido a un error.');
      return [];
    }
  }

  if (allItems.length === 0) {
    console.log('⚠️ No se encontraron transacciones en ninguna página.');
    return [];
  }

  const shopData = extractShopDataWithItemsAndTickets(allItems);

  try {
    // Aseguramos la conexión a la base de datos correcta antes de guardar
    await connectToDatabase(databaseYear);

    await saveTransactionsToDB(shopData, databaseYear);
    console.log('✅ Datos guardados exitosamente en MongoDB.');
  } catch (saveError) {
    console.error('❌ Error al guardar en MongoDB:', saveError.message);
    return [];
  }

  return shopData;
};

// Función para guardar los datos en MongoDB
const saveTransactionsToDB = async (shopData, databaseYear) => {
  try {
    for (const shop of shopData) {
      const Transaction = getTransactionModel(shop.shopCode);

      let inserted = 0;
      let updated = 0;
      let failed = 0;

      for (const ticket of shop.tickets) {
        try {
          // ✅ Asegurar que items sea un array
          const items = Array.isArray(ticket.items)
            ? ticket.items
            : ticket.items ? [ticket.items] : [];

          // ✅ Sanitizar campos numéricos (evita errores con "N/A", null, etc.)
          const sanitizedItems = items.map(item => ({
            ...item,
            quantity: isNaN(item.quantity) ? null : Number(item.quantity),
            amount: isNaN(item.amount) ? null : Number(item.amount),
            dinnersQty: isNaN(item.dinnersQty) ? null : Number(item.dinnersQty),
            unitPrice: isNaN(item.unitPrice) ? null : Number(item.unitPrice),
            vat: isNaN(item.vat) ? null : Number(item.vat),
            unitCost: isNaN(item.unitCost) ? null : Number(item.unitCost),
            totalCost: isNaN(item.totalCost) ? null : Number(item.totalCost),
          }));

          // ✅ Guardar usando upsert
          const result = await Transaction.updateOne(
            { ticketNumber: ticket.ticketNumber },
            {
              $set: {
                shopCode: shop.shopCode,
                shop: shop.shop,
                items: sanitizedItems,
              }
            },
            { upsert: true }
          );

          if (result.upsertedCount > 0) inserted++;
          else if (result.modifiedCount > 0) updated++;
        } catch (err) {
          failed++;
          console.error(`❌ Error al guardar ticket ${ticket.ticketNumber} en ${shop.shopCode}: ${err.message}`);
        }
      }

      console.log(`✅ Resultados en colección '${shop.shopCode}':
  ${inserted} nuevos,
  ${updated} actualizados,
  ${failed} fallidos`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error general al guardar:', error.message);
    throw error;
  }
};


module.exports = { getToken, getTransactionDetails, saveTransactionsToDB };
