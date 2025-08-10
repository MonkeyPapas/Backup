const { getToken, getTransactionDetails } = require('../services/apiService');

const fetchTransactionDetails = async (req, res) => {
  const { startDate, endDate, databaseYear } = req.body; // 📌 Ahora los toma del body

  // Validar que se pasaron startDate, endDate y databaseYear
  if (!startDate || !endDate || !databaseYear) {
    return res.status(400).json({
      success: false,
      message: 'startDate, endDate y databaseYear se requieren.',
    });
  }

  try {
    // Obtener token de la API
    const tokenData = await getToken();
    const token = tokenData.token;

    // Llamar a la función que obtiene los datos con POST y paginación
    const transactionData = await getTransactionDetails(
      token,
      startDate,
      endDate,
      databaseYear
    );

    // Respuesta OK
    res.status(200).json({
      success: true,
      data: transactionData,
    });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { fetchTransactionDetails };
