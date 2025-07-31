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
        return cachedDb;
    }
    const db = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
    });
    cachedDb = db;
    return db;
}

// Envuelve la lógica del handler en una función que será exportada
// Esto a veces resuelve problemas de "HandlerNotFound" en ciertos entornos de Lambda
async function handler(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await connectToDatabase();

        const { httpMethod, path, body } = event;
        const pathSegments = path.split('/').filter(segment => segment && segment !== '.netlify' && segment !== 'functions');
        const resource = pathSegments[1];
        const id = pathSegments[2];

        let response;

        switch (httpMethod) {
            case 'GET':
                if (resource === 'items') {
                    if (id) {
                        const item = await ItemMenu.findById(id);
                        if (!item) {
                            response = { statusCode: 404, body: JSON.stringify({ message: 'Ítem no encontrado' }) };
                        } else {
                            response = { statusCode: 200, body: JSON.stringify(item) };
                        }
                    } else {
                        const { tipo, categoria } = event.queryStringParameters || {};
                        let query = {};
                        if (tipo) query.tipo = tipo;
                        if (categoria) query.categoria = categoria;

                        const items = await ItemMenu.find(query);
                        response = { statusCode: 200, body: JSON.stringify(items) };
                    }
                } else {
                    response = { statusCode: 400, body: JSON.stringify({ message: 'Ruta GET no válida' }) };
                }
                break;

            case 'POST':
                if (resource === 'items') {
                    const data = JSON.parse(body);
                    const nuevoItem = new ItemMenu(data);
                    await nuevoItem.save();
                    response = { statusCode: 201, body: JSON.stringify(nuevoItem) };
                } else {
                    response = { statusCode: 400, body: JSON.stringify({ message: 'Ruta POST no válida' }) };
                }
                break;

            case 'PUT':
                if (resource === 'items' && id) {
                    const data = JSON.parse(body);
                    const updatedItem = await ItemMenu.findByIdAndUpdate(id, data, { new: true, runValidators: true });
                    if (!updatedItem) {
                        response = { statusCode: 404, body: JSON.stringify({ message: 'Ítem no encontrado para actualizar' }) };
                    } else {
                        response = { statusCode: 200, body: JSON.stringify(updatedItem) };
                    }
                } else {
                    response = { statusCode: 400, body: JSON.stringify({ message: 'Ruta PUT no válida o ID faltante' }) };
                }
                break;

 case 'DELETE':
                if (resource === 'items' && id) {
                    const deletedItem = await ItemMenu.findByIdAndDelete(id); // Esta es la línea corregida
                    if (!deletedItem) {
                        response = { statusCode: 404, body: JSON.stringify({ message: 'Ítem no encontrado para eliminar' }) };
                    } else {
                        response = { statusCode: 200, body: JSON.stringify({ message: 'Ítem eliminado exitosamente' }) };
                    }
                } else {
                    response = { statusCode: 400, body: JSON.stringify({ message: 'Ruta DELETE no válida o ID faltante' }) };
                }
                break;
    
            default:
                response = { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido' }) };
        }
        return response;

    } catch (error) {
        console.error('Error en Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
        };
    }
}

// Exporta la función handler
exports.handler = handler;