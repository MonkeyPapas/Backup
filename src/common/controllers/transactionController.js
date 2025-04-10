
const { getToken, getTransactionDetails } = require('../services/apiService');

// Función para obtener el token y luego las transacciones
const fetchTransactionDetails = async (req, res) => {
  const { startDate, endDate, pageNumber } = req.body;

  try {
    // Obtener el token
    const tokenData = await getToken();
    const token = tokenData.token;

    // Obtener los detalles de las transacciones (solo una página)
    const transactionData = await getTransactionDetails(token, startDate, endDate, pageNumber);

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
