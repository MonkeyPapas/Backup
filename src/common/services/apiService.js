// /src/services/apiService.js
const axios = require('axios');

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

// Función para obtener los detalles de la transacción
const getTransactionDetails = async (token, startDate, endDate, pageNumber = 1) => {
  try {
    const response = await axios.get('https://mx-api.bistrosoft.com/api/v1/transactiondetailreport', {
      params: {
        startDate,
        endDate,
        pageNumber,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    if (!response.data.items || response.data.items.length === 0) {
      console.log('No se encontraron transacciones en la respuesta.');
      return [];
    }

    const shopData = extractShopDataWithItemsAndTickets(response.data.items);
    return shopData;
  } catch (error) {
    console.error('Error al obtener los detalles de la transacción:', error.response?.data || error.message);
    throw new Error('No se pudieron obtener los detalles de la transacción');
  }
};

module.exports = { getToken, getTransactionDetails };
