const connectToMongo = require('../database/mongoConfig');

exports.getShopBackupById = async (_id) => {
  const db = await connectToMongo();
  const result = await db.collection('Backup').findOne({ _id }); // busca por shopCode
  return result;
};

exports.getAllShops = async () => {
  const db = await connectToMongo();
  const result = await db.collection('Backup').find({}).toArray();
  return result;
};
