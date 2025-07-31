// netlify/functions/api.js
const mongoose = require('mongoose');

// Define el esquema para los ítems del menú
const itemMenuSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    precio: { type: Number, required: true },
    imagen: String,
    categoria: { type: String, required: true },
    tipo: { type: String, required: true }, // Asegurado como required
    destacado: { type: Boolean, default: false }
});

const ItemMenu = mongoose.models.ItemMenu || mongoose.model('ItemMenu', itemMenuSchema);

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        console.log('Using cached DB connection.');
        return cachedDb;
    }
    console.log('Connecting to new DB instance...');
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true, // Advertencia: depreciado en versiones recientes de Mongoose
            useUnifiedTopology: true, // Advertencia: depreciado en versiones recientes de Mongoose
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        });
        cachedDb = db;
        console.log('DB connection established.');
        return db;
    } catch (dbError) {
        console.error('Failed to connect to DB:', dbError);
        throw new Error(`DB Connection Error: ${dbError.message}`); // Lanza el error para que sea capturado por el bloque catch de la función handler
    }
}

// Envuelve la lógica del handler en una función que será exportada
async function handler(event, context) {
    // Esto es crucial para reusar la conexión de la base de datos en serverless
    context.callbackWaitsForEmptyEventLoop = false;

    let statusCode = 200;
    let body = {};

    try {
        await connectToDatabase();
        console.log('Handler started. Connected to DB.');

        // Renombrar 'body' del evento a 'requestBody' para evitar conflicto de nombres con la variable 'body' de la respuesta
        const { httpMethod, path, body: requestBody } = event;
        const pathSegments = path.split('/').filter(segment => segment && segment !== '.netlify' && segment !== 'functions');
        const resource = pathSegments[1]; // 'items'
        const id = pathSegments[2];      // The ID, if present

        console.log(`HTTP Method: ${httpMethod}, Resource: ${resource}, ID: ${id}`);
        console.log('Query String Parameters:', event.queryStringParameters);

        if (resource === 'items') {
            switch (httpMethod) {
                case 'GET':
                    if (id) {
                        const item = await ItemMenu.findById(id);
                        if (!item) {
                            statusCode = 404;
                            body = { message: 'Ítem no encontrado' };
                        } else {
                            body = item;
                        }
                    } else {
                        const { tipo, categoria } = event.queryStringParameters || {};
                        let query = {};
                        if (tipo) query.tipo = tipo;
                        if (categoria) query.categoria = categoria;
                        console.log('GET Query applied to MongoDB:', query);

                        const items = await ItemMenu.find(query);
                        body = items; // Asignar directamente el array de ítems
                        console.log('Items found by Mongoose query:', items.length);
                        console.log('Sample item from Mongoose query (first 2):', items.slice(0, 2)); // Para ver una muestra de los datos
                    }
                    break;

                case 'POST':
                    const data = JSON.parse(requestBody); // Usar requestBody
                    console.log('POST Data received:', data);
                    const nuevoItem = new ItemMenu(data);
                    await nuevoItem.save();
                    statusCode = 201;
                    body = nuevoItem;
                    console.log('New item created:', nuevoItem._id);
                    break;

                case 'PUT':
                    if (id) {
                        const data = JSON.parse(requestBody); // Usar requestBody
                        console.log('PUT Data received for ID:', id, 'Data:', data);
                        const updatedItem = await ItemMenu.findByIdAndUpdate(id, data, { new: true, runValidators: true });
                        if (!updatedItem) {
                            statusCode = 404;
                            body = { message: 'Ítem no encontrado para actualizar' };
                        } else {
                            body = updatedItem;
                            console.log('Item updated:', updatedItem._id);
                        }
                    } else {
                        statusCode = 400;
                        body = { message: 'Ruta PUT no válida o ID faltante' };
                    }
                    break;

                case 'DELETE':
                    if (id) {
                        const deletedItem = await ItemMenu.findByIdAndDelete(id);
                        if (!deletedItem) {
                            statusCode = 404;
                            body = { message: 'Ítem no encontrado para eliminar' };
                        } else {
                            body = { message: 'Ítem eliminado exitosamente' };
                            console.log('Item deleted:', id);
                        }
                    } else {
                        statusCode = 400;
                        body = { message: 'Ruta DELETE no válida o ID faltante' };
                    }
                    break;

                default:
                    statusCode = 405;
                    body = { message: 'Método no permitido' };
            }
        } else {
            statusCode = 400;
            body = { message: 'Recurso no válido' };
        }

    } catch (error) {
        console.error('Error in Netlify Function (caught in try-catch block):', error);
        statusCode = 500;
        body = { message: 'Error interno del servidor', error: error.message };
    } finally {
        // Asegurarse de que el cuerpo de la respuesta sea siempre un string JSON
        const finalResponse = {
            statusCode: statusCode,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        };
        console.log('Final Response Object to Netlify:', finalResponse); // Log del objeto de respuesta final
        console.log('Final Response Body (JSON String):', finalResponse.body); // Log del cuerpo JSON como string
        return finalResponse;
    }
}

// Exporta la función handler
exports.handler = handler;