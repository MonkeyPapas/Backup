
// const { CloudTasksClient } = require('@google-cloud/tasks');

// // Cargar credenciales desde el .env
// const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
// // Crear cliente con las credenciales
// const client = new CloudTasksClient({ credentials });

// // Configuración de Google Cloud Tasks
// const project = 'dtox-ai-a6f48';
// const queue = 'AMPIUsers';
// const location = 'us-central1';
// const serviceUrl = 'https://ampi-jhsby.ondigitalocean.app/api/runTask';

// // Función para programar una tarea en Google Cloud Tasks
// const scheduleTask = async (payload, dateTime, taskName) => {
//   try {
//     // Construcción de la tarea
//     const parent = client.queuePath(project, location, queue);

//     const task = {
//       name: `${parent}/tasks/${taskName}`,
//       httpRequest: {
//         httpMethod: 'POST',
//         url: serviceUrl,
//         headers: { 'Content-Type': 'application/json' },
//         body: Buffer.from(JSON.stringify(payload)).toString('base64'),
//       },
//       scheduleTime: { seconds: Math.floor(dateTime.getTime() / 1000) },
//     };

//     // Programar la tarea en Google Cloud Tasks
//     const [response] = await client.createTask({ parent, task });
//     console.log(`✅ Tarea programada correctamente: ${response.name}`);
//   } catch (error) {
//     console.error('❌ Error al programar la tarea:', error);
//   }
// };

// module.exports = scheduleTask;
