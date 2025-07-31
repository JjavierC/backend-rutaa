// netlify/functions/api.js
const mongoose = require('mongoose');

// Define el esquema para los ítems del menú
const itemMenuSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    precio: { type: Number, required: true },
    imagen: String,
    categoria: { type: String, required: true },
    tipo: { type: String, required: true },
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
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        });
        cachedDb = db;
        console.log('DB connection established.');
        return db;
    } catch (dbError) {
        console.error('Failed to connect to DB:', dbError);
        throw new Error(`DB Connection Error: ${dbError.message}`);
    }
}

// Envuelve la lógica del handler en una función que será exportada
async function handler(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;
    let statusCode = 200;
    let body = {};

    try {
        await connectToDatabase();
        console.log('Handler started. Connected to DB.');

        const { httpMethod, path, body: requestBody } = event; // Renombrar 'body' del evento a 'requestBody' para evitar conflicto
        const pathSegments = path.split('/').filter(segment => segment && segment !== '.netlify' && segment !== 'functions');
        const resource = pathSegments[1]; // 'items'
        const id = pathSegments[2];      // The ID, if present

        console.log(`HTTP Method: ${httpMethod}, Resource: ${resource}, ID: ${id}`);

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
                        console.log('GET Query:', query);

                        const items = await ItemMenu.find(query);
                        body = items; // Asignar directamente el array de ítems
                        console.log('Items found:', items.length);
                    }
                    break;

                case 'POST':
                    const data = JSON.parse(requestBody); // Usar requestBody
                    console.log('POST Data:', data);
                    const nuevoItem = new ItemMenu(data);
                    await nuevoItem.save();
                    statusCode = 201;
                    body = nuevoItem;
                    break;

                case 'PUT':
                    if (id) {
                        const data = JSON.parse(requestBody); // Usar requestBody
                        console.log('PUT Data:', data);
                        const updatedItem = await ItemMenu.findByIdAndUpdate(id, data, { new: true, runValidators: true });
                        if (!updatedItem) {
                            statusCode = 404;
                            body = { message: 'Ítem no encontrado para actualizar' };
                        } else {
                            body = updatedItem;
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
        console.error('Error en Netlify Function (catch block):', error);
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
        console.log('Final Response to Netlify:', finalResponse);
        return finalResponse;
    }
}

// Exporta la función handler
exports.handler = handler;