// js/admin.js

const itemForm = document.getElementById('itemForm');
const itemIdInput = document.getElementById('itemId');
const nombreInput = document.getElementById('nombre');
const precioInput = document.getElementById('precio');
const descripcionInput = document.getElementById('descripcion');
const imagenFileInput = document.getElementById('imagenFile');
const imagenPreview = document.getElementById('imagenPreview');
const tipoInput = document.getElementById('tipo');
const categoriaInput = document.getElementById('categoria');
const destacadoInput = document.getElementById('destacado');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formMessage = document.getElementById('formMessage');
const itemsList = document.getElementById('itemsList');
const listMessage = document.getElementById('listMessage');

// NUEVOS elementos de búsqueda y filtro
const searchInput = document.getElementById('searchInput');
const filterCategorySelect = document.getElementById('filterCategorySelect');

// Base URL para nuestras Netlify Functions
const API_BASE_URL = '/.netlify/functions/api';

let isEditing = false;
let allItems = []; // Para almacenar todos los ítems y realizar búsquedas en el cliente
let currentImageUrl = '';
const CLOUDINARY_CLOUD_NAME = 'dfihjzwho';
const CLOUDINARY_UPLOAD_PRESET = 'ruta66_preset';

const categoryMap = {
    'plato': ['entradas', 'grill-66', 'ruta-del-mar', 'hamburguesas', 'parrilladas', 'menu-infantil', 'pastas', 'sandwiches', 'lasagna', 'arroces', 'ensaladas', 'pizzas-tradicionales', 'pizzas-gourmet'],
    'bebida': ['Jugos', 'Limonadas', 'Gaseosas', 'cocteles', 'sodas-micheladas', 'sodas-organicas'],
    'licor': ['cervezas', 'micheladas', 'licores', 'tragos', 'vino-tinto', 'vino-rosado', 'vino-blanco'],
    'postre': ['postres', 'malteadas', 'cafe', 'infusiones'],
    'combo': ['combos'],
};

function capitalize(text) {
    if (!text) return '';
    return text.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

function clearForm() {
    itemForm.reset();
    itemIdInput.value = '';
    submitBtn.textContent = 'Agregar Ítem';
    cancelEditBtn.style.display = 'none';
    isEditing = false;
    currentImageUrl = '';
    imagenPreview.style.display = 'none';
    populateCategorySelect('');
}

async function uploadImage(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error al subir la imagen a Cloudinary:', error);
        showMessage(formMessage, 'Error al subir la imagen.', 'error');
        return null;
    }
}

imagenFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagenPreview.src = e.target.result;
            imagenPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagenPreview.src = '';
        imagenPreview.style.display = 'none';
    }
});


function populateCategorySelect(selectedType, selectedCategory = '') {
    categoriaInput.innerHTML = '<option value="">Selecciona una categoría</option>';
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

tipoInput.addEventListener('change', () => {
    populateCategorySelect(tipoInput.value);
});


// NUEVA FUNCIÓN: Llenar el filtro de categorías en la lista de ítems
function populateFilterCategories(items) {
  const uniqueCategories = new Set(items.map(item => item.categoria).filter(Boolean));
  filterCategorySelect.innerHTML = '<option value="todos">Todas las Categorías</option>';
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = capitalize(category);
    filterCategorySelect.appendChild(option);
  });
}

// NUEVA FUNCIÓN: Renderizar los ítems filtrados
function renderItems(itemsToRender) {
    itemsList.innerHTML = '';
    if (itemsToRender.length === 0) {
        listMessage.textContent = 'No se encontraron ítems.';
        listMessage.className = 'message';
        listMessage.style.display = 'block';
        return;
    }
    listMessage.style.display = 'none';
    itemsToRender.forEach(item => {
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
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => editItem(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => deleteItem(e.target.dataset.id));
    });
}

// NUEVA FUNCIÓN: Filtrar y buscar items
function filterAndSearchItems() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategorySelect.value;
    const filteredItems = allItems.filter(item => {
        const matchesSearch = item.nombre.toLowerCase().includes(searchTerm) || 
                              item.descripcion.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'todos' || item.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    renderItems(filteredItems);
}


async function loadItems() {
    listMessage.textContent = 'Cargando ítems...';
    listMessage.className = 'message';
    listMessage.style.display = 'block';
    itemsList.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        allItems = await response.json(); // Cargar todos los ítems
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        populateFilterCategories(allItems); // Llenar el select de categorías
        filterAndSearchItems(); // Renderizar con todos los ítems al inicio
    } catch (error) {
        console.error('Error al cargar ítems:', error);
        showMessage(listMessage, 'Error de conexión al cargar los ítems.', 'error');
    }
}

itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!tipoInput.value || !categoriaInput.value) {
        showMessage(formMessage, 'Por favor, selecciona un Tipo y una Categoría válidos.', 'error');
        return;
    }

    const file = imagenFileInput.files[0];
    let imageUrlToSave = currentImageUrl;
    if (file) {
        showMessage(formMessage, 'Subiendo imagen...', 'info');
        submitBtn.disabled = true;
        imageUrlToSave = await uploadImage(file);
        submitBtn.disabled = false;
        if (!imageUrlToSave) {
            return;
        }
    }

    const itemData = {
        nombre: nombreInput.value,
        precio: parseFloat(precioInput.value),
        descripcion: descripcionInput.value,
        imagen: imageUrlToSave,
        tipo: tipoInput.value,
        categoria: categoriaInput.value,
        destacado: destacadoInput.checked
    };

    try {
        let response;
        if (isEditing) {
            const itemId = itemIdInput.value;
            response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        }
        if (response.ok) {
            showMessage(formMessage, `Ítem ${isEditing ? 'actualizado' : 'agregado'} exitosamente!`, 'success');
            clearForm();
            loadItems();
        } else {
            const result = await response.json();
            showMessage(formMessage, `Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        showMessage(formMessage, 'Error de conexión al guardar el ítem.', 'error');
    }
});

async function editItem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`);
        const item = await response.json();
        if (response.ok) {
            itemIdInput.value = item._id;
            nombreInput.value = item.nombre;
            precioInput.value = item.precio;
            descripcionInput.value = item.descripcion;
            currentImageUrl = item.imagen;
            if (currentImageUrl) {
                imagenPreview.src = currentImageUrl;
                imagenPreview.style.display = 'block';
            } else {
                imagenPreview.src = '';
                imagenPreview.style.display = 'none';
            }
            tipoInput.value = item.tipo;
            populateCategorySelect(item.tipo, item.categoria);
            destacadoInput.checked = item.destacado;
            submitBtn.textContent = 'Actualizar Ítem';
            cancelEditBtn.style.display = 'inline-block';
            isEditing = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showMessage(formMessage, `No se encontró el ítem para editar: ${item.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al cargar ítem para edición:', error);
        showMessage(formMessage, 'Error de conexión al cargar el ítem para edición.', 'error');
    }
}

async function deleteItem(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este ítem?')) {
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok) {
            showMessage(listMessage, 'Ítem eliminado exitosamente!', 'success');
            loadItems();
        } else {
            showMessage(listMessage, `Error al eliminar: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al eliminar ítem:', error);
        showMessage(listMessage, 'Error de conexión al eliminar el ítem.', 'error');
    }
}

cancelEditBtn.addEventListener('click', clearForm);

// NUEVOS EVENT LISTENERS para búsqueda y filtro
searchInput.addEventListener('input', filterAndSearchItems);
filterCategorySelect.addEventListener('change', filterAndSearchItems);

document.addEventListener('DOMContentLoaded', loadItems);