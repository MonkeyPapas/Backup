const { getToken, getTransactionDetails } = require('../services/apiService');

const fetchTransactionDetails = async (req, res) => {
  const { startDate, endDate, databaseYear } = req.query; // Tomamos el parámetro `databaseYear` de la URL

  // Verificar que se pasaron startDate, endDate y databaseYear
  if (!startDate || !endDate || !databaseYear) {
    return res.status(400).json({
      success: false,
      message: 'startDate, endDate y databaseYear se requieren.',
    });
  }

  try {
    // Obtener el token
    const tokenData = await getToken();
    const token = tokenData.token;

    // Obtener los detalles de las transacciones con paginación automática
    const transactionData = await getTransactionDetails(token, startDate, endDate, databaseYear);

    // Retornar los detalles de las transacciones
    res.status(200).json({
      success: true,
      data: transactionData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { fetchTransactionDetails };
