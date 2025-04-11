const { getToken, getTransactionDetails } = require('../services/apiService');

// Función para obtener el token y luego las transacciones
const fetchTransactionDetails = async (req, res) => {
  // Obtener los parámetros de la URL (req.query) en lugar de req.body
  const { startDate, endDate, pageNumber = 1 } = req.query;

  // Verificar que se pasaron startDate y endDate
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate y endDate son requeridos.',
    });
  }

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
