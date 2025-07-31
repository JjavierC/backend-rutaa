// js/admin.js

const itemForm = document.getElementById('itemForm');
const itemIdInput = document.getElementById('itemId');
const nombreInput = document.getElementById('nombre');
const precioInput = document.getElementById('precio');
const descripcionInput = document.getElementById('descripcion');
const imagenInput = document.getElementById('imagen');
const tipoInput = document.getElementById('tipo'); // Ahora es un select
const categoriaInput = document.getElementById('categoria'); // Ahora es un select
const destacadoInput = document.getElementById('destacado');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formMessage = document.getElementById('formMessage');
const itemsList = document.getElementById('itemsList');
const listMessage = document.getElementById('listMessage');

// Base URL para nuestras Netlify Functions
const API_BASE_URL = '/.netlify/functions/api';

let isEditing = false;

// Mapeo de Tipos a Categorías permitidas (AJUSTA ESTO A TUS NECESIDADES REALES)
const categoryMap = {
    'plato': ['entradas', 'grill-66', 'ruta-del-mar', 'hamburguesas', 'parrilladas', 'menu-infantil', 'pastas', 'sandwiches', 'lasagna', 'arroces', 'ensaladas', 'pizzas-tradicionales', 'pizzas-gourmet'],
    'bebida': ['Jugos', 'Limonadas', 'Gaseosas', 'cocteles', 'sodas-micheladas', 'sodas-organicas'],
    'licor': ['cervezas', 'micheladas', 'licores', 'tragos', 'vino-tinto', 'vino-rosado', 'vino-blanco'],
    'postre': ['postres', 'malteadas', 'cafe', 'infusiones'],
    'combo': ['combos'], // Si tienes subcategorías para combos, añádelas aquí
};

// Función para capitalizar texto y reemplazar guiones
function capitalize(text) {
    if (!text) return '';
    return text.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Función para mostrar mensajes
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Función para limpiar el formulario
function clearForm() {
    itemForm.reset();
    itemIdInput.value = '';
    submitBtn.textContent = 'Agregar Ítem';
    cancelEditBtn.style.display = 'none';
    isEditing = false;
    populateCategorySelect(''); // Limpiar las categorías al resetear el formulario
}

// Función para poblar el select de categorías basado en el tipo seleccionado
function populateCategorySelect(selectedType, selectedCategory = '') {
    categoriaInput.innerHTML = '<option value="">Selecciona una categoría</option>'; // Opción por defecto
    if (selectedType && categoryMap[selectedType]) {
        categoryMap[selectedType].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = capitalize(category);
            if (category === selectedCategory) {
                option.selected = true;
            }
            categoriaInput.appendChild(option);
        });
    }
}

// Event Listener para el cambio del select de Tipo
tipoInput.addEventListener('change', () => {
    populateCategorySelect(tipoInput.value);
});


// Función para cargar los ítems del menú
async function loadItems() {
    listMessage.textContent = 'Cargando ítems...';
    listMessage.className = 'message';
    listMessage.style.display = 'block';
    itemsList.innerHTML = ''; // Limpiar lista existente

    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        const items = await response.json();

        if (response.ok) {
            if (items.length === 0) {
                listMessage.textContent = 'No hay ítems en el menú.';
                listMessage.className = 'message';
            } else {
                listMessage.style.display = 'none';
                items.forEach(item => {
                    const itemCard = document.createElement('div');
                    itemCard.className = 'item-card';
                    itemCard.innerHTML = `
                        <img src="${item.imagen || 'https://via.placeholder.com/150?text=No+Image'}" alt="${item.nombre}">
                        <div class="item-card-content">
                            <h3>${item.nombre}</h3>
                            <p class="price">$${item.precio.toLocaleString('es-CO')}</p>
                            <p>${item.descripcion || 'Sin descripción.'}</p>
                            <p class="category-type">Tipo: ${capitalize(item.tipo || 'N/A')} | Categoría: ${capitalize(item.categoria || 'N/A')}</p>
                            ${item.destacado ? '<span class="badge">⭐ Destacado</span>' : ''}
                            <div class="item-card-actions">
                                <button class="edit-btn" data-id="${item._id}">Editar</button>
                                <button class="delete-btn" data-id="${item._id}">Eliminar</button>
                            </div>
                        </div>
                    `;
                    itemsList.appendChild(itemCard);
                });

                // Añadir event listeners a los botones de editar y eliminar
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', (e) => editItem(e.target.dataset.id));
                });
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', (e) => deleteItem(e.target.dataset.id));
                });
            }
        } else {
            showMessage(listMessage, `Error al cargar ítems: ${items.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al cargar ítems:', error);
        showMessage(listMessage, 'Error de conexión al cargar los ítems.', 'error');
    }
}

// Función para enviar el formulario (Agregar/Editar)
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar que Tipo y Categoría no sean la opción por defecto vacía
    if (!tipoInput.value || !categoriaInput.value) {
        showMessage(formMessage, 'Por favor, selecciona un Tipo y una Categoría válidos.', 'error');
        return;
    }

    const itemData = {
        nombre: nombreInput.value,
        precio: parseFloat(precioInput.value),
        descripcion: descripcionInput.value,
        imagen: imagenInput.value,
        tipo: tipoInput.value,
        categoria: categoriaInput.value,
        destacado: destacadoInput.checked
    };

    try {
        let response;
        let result;

        if (isEditing) {
            const itemId = itemIdInput.value;
            response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            result = await response.json();

            if (response.ok) {
                showMessage(formMessage, 'Ítem actualizado exitosamente!', 'success');
                clearForm();
                loadItems();
            } else {
                showMessage(formMessage, `Error al actualizar: ${result.message}`, 'error');
            }
        } else {
            response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            result = await response.json();

            if (response.ok) {
                showMessage(formMessage, 'Ítem agregado exitosamente!', 'success');
                clearForm();
                loadItems();
            } else {
                showMessage(formMessage, `Error al agregar: ${result.message}`, 'error');
            }
        }
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        showMessage(formMessage, 'Error de conexión al guardar el ítem.', 'error');
    }
});

// Función para precargar el formulario con datos de un ítem para edición
async function editItem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`);
        const item = await response.json();

        if (response.ok) {
            itemIdInput.value = item._id;
            nombreInput.value = item.nombre;
            precioInput.value = item.precio;
            descripcionInput.value = item.descripcion;
            imagenInput.value = item.imagen;
            
            // Establecer el tipo y luego poblar la categoría antes de establecerla
            tipoInput.value = item.tipo;
            populateCategorySelect(item.tipo, item.categoria); // Pasa la categoría para que se seleccione

            destacadoInput.checked = item.destacado;

            submitBtn.textContent = 'Actualizar Ítem';
            cancelEditBtn.style.display = 'inline-block';
            isEditing = true;
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al formulario
        } else {
            showMessage(formMessage, `No se encontró el ítem para editar: ${item.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al cargar ítem para edición:', error);
        showMessage(formMessage, 'Error de conexión al cargar el ítem para edición.', 'error');
    }
}

// Función para eliminar un ítem
async function deleteItem(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este ítem?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (response.ok) {
            showMessage(listMessage, 'Ítem eliminado exitosamente!', 'success');
            loadItems();
        } else {
            showMessage(listMessage, `Error al eliminar: ${result.message}`, 'error');
        }
    }
    catch (error) {
        console.error('Error al eliminar ítem:', error);
        showMessage(listMessage, 'Error de conexión al eliminar el ítem.', 'error');
    }
}

// Event listener para el botón cancelar edición
cancelEditBtn.addEventListener('click', clearForm);

// Cargar ítems al cargar la página
document.addEventListener('DOMContentLoaded', loadItems);