const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    transactionType: String,
    comments: String,
    client: String,
    date: String,
    hour: String,
    quantity: Number,
    amount: Number,
    origin: String,
    product: String,
    paymentMethod: String,
    user: String,
    timestamp: String,
    status: String,
    uuid: String,
    dinnersQty: Number,
    unitPrice: Number,
    vat: Number,
    unitCost: Number,
    totalCost: Number,
    sku: String,
    category: String,
    waiter: String,
    tableName: String,
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: String,
    shopCode: String,
    shop: String,
    items: [itemSchema],
  },
  { versionKey: false }
);

// Exporta una función que devuelve un modelo para el shopCode
module.exports = (shopCode) => {
  return (
    mongoose.models[shopCode] ||
    mongoose.model(shopCode, ticketSchema, shopCode)
  );
};

ticketSchema.index({ "items.timestamp": 1 });
