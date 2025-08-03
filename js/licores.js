// js/licores.js

let allItems = []; // Almacenará todos los ítems cargados desde la base de datos
const API_BASE_URL = '/.netlify/functions/api'; // La ruta a tu función 'api'

const productosContainer = document.getElementById('productos-container');
const categoriaTitulo = document.getElementById('categoria-titulo');
const filtroCategoriasUl = document.querySelector('.filtro-categorias ul');
const modalesDinamicosContainer = document.getElementById('modales-dinamicos-container');

// Función para capitalizar texto
function capitalize(text) {
  if (!text) return '';
  // Reemplaza guiones por espacios y capitaliza la primera letra de cada palabra
  return text.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Función para construir una tarjeta de producto
function createProductCard(item) {
  const productoCard = document.createElement('div');
  // Añade clases para filtrar, usando el tipo y la categoría del ítem
  productoCard.className = `producto-card ${item.categoria} ${item.tipo}`;
  productoCard.setAttribute('data-id', item._id); // Añade el ID de la base de datos para referencia

  productoCard.innerHTML = `
    <img src="${item.imagen || 'https://via.placeholder.com/250x250?text=No+Image'}" alt="${item.nombre}" onclick="abrirModalDinamico('${item._id}')">
    <h4>${item.nombre}</h4>
    <p>$${item.precio.toLocaleString('es-CO')}</p>
    <div class="producto-card-buttons">
      <button onclick="abrirModalDinamico('${item._id}')">Ver</button>
      <button onclick="agregarAlCarrito('${item.nombre}', ${item.precio})">Añadir</button>
    </div>
  `;
  return productoCard;
}

// Función para construir un modal de producto dinámico
function createProductModal(item) {
    const modal = document.createElement('div');
    modal.id = `modal-${item._id}`;
    modal.className = 'modal'; // Usa la clase 'modal' para tus estilos existentes
    modal.innerHTML = `
        <div class="modal-content">
            <span class="cerrar" onclick="cerrarModalDinamico('modal-${item._id}')">&times;</span>
            <img src="${item.imagen || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="${item.nombre}">
            ${item.destacado ? '<span class="badge">⭐ Recomendado</span>' : ''}
            <h2>${item.nombre}</h2>
            <p><strong>Precio:</strong> $${item.precio.toLocaleString('es-CO')}</p>
            <p>${item.descripcion || 'No hay descripción disponible.'}</p>
        </div>
    `;
    return modal;
}

// Abre un modal dinámico (expuesta globalmente para onclick)
function abrirModalDinamico(itemId) {
    const modal = document.getElementById(`modal-${itemId}`);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Cierra un modal dinámico (expuesta globalmente para onclick)
function cerrarModalDinamico(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para renderizar los productos en la página
function renderProducts(productsToRender) {
    // Clear existing products and modals
    productosContainer.innerHTML = '';
    modalesDinamicosContainer.innerHTML = '';

    if (productsToRender.length === 0) {
        productosContainer.innerHTML = '<p style="color: #ccc; text-align: center;">No hay productos en esta categoría.</p>';
        return;
    }

    // Agrupar productos por categoría para crear las secciones correspondientes
    // y mantener la estructura original de tu HTML
    const groupedProducts = productsToRender.reduce((acc, item) => {
        // Asegúrate de que item.categoria no sea null o undefined
        const categoryKey = item.categoria || 'sin-categoria'; 
        if (!acc[categoryKey]) {
            acc[categoryKey] = [];
        }
        acc[categoryKey].push(item);
        return acc;
    }, {});

    // Crear y añadir secciones de categoría al DOM
    for (const category in groupedProducts) {
        const section = document.createElement('section');
        section.className = `categoria-productos ${category}`; // Asigna la clase de la categoría
        
        groupedProducts[category].forEach(item => {
            section.appendChild(createProductCard(item));
            modalesDinamicosContainer.appendChild(createProductModal(item)); // Cada modal también se añade
        });
        productosContainer.appendChild(section);
    }
}

// Función principal para cargar y mostrar los ítems desde la API
async function loadAndDisplayItems(type = 'plato', initialCategory = 'todos') {
    categoriaTitulo.textContent = 'Cargando...'; // Muestra un estado de carga
    try {
        // Hacemos una petición GET a la API, filtrando por 'tipo' (ej. 'licor')
        const response = await fetch(`${API_BASE_URL}/items?tipo=${type}`);
        const data = await response.json();

        if (!response.ok) {
            categoriaTitulo.textContent = `Error: ${data.message || 'No se pudieron cargar los ítems.'}`;
            productosContainer.innerHTML = '';
            return;
        }

        allItems = data; // Guarda todos los ítems cargados en una variable global

        // Genera dinámicamente los filtros de categorías en la barra lateral
        const uniqueCategories = new Set();
        allItems.forEach(item => {
            if (item.categoria) { // Asegúrate de que la categoría exista
                uniqueCategories.add(item.categoria);
            }
        });

        // Limpia los filtros existentes y añade 'Todos'
        filtroCategoriasUl.innerHTML = `<li class="activo" onclick="filtrar('todos')">Todos</li>`;
        // Añade el resto de categorías únicas
        uniqueCategories.forEach(category => {
            filtroCategoriasUl.innerHTML += `<li onclick="filtrar('${category}')">${capitalize(category)}</li>`;
        });

        filtrar(initialCategory); // Aplica el filtro inicial (ej. 'todos')
        
    } catch (error) {
        console.error('Error al cargar los ítems del menú:', error);
        categoriaTitulo.textContent = 'Error al cargar el menú. Intenta de nuevo más tarde.';
        productosContainer.innerHTML = '';
    }
}

// Función para filtrar los ítems mostrados (expuesta globalmente para onclick en HTML)
function filtrar(categoria) {
  const filtros = document.querySelectorAll('.filtro-categorias li');

  // Remueve la clase 'activo' de todos los filtros
  filtros.forEach(f => f.classList.remove('activo'));

  // Añade la clase 'activo' al filtro seleccionado
  const seleccionado = Array.from(filtros).find(f =>
    f.textContent.trim().toLowerCase().includes(capitalize(categoria).toLowerCase())
  );
  if (seleccionado) seleccionado.classList.add('activo');

  // Actualiza el título de la categoría
  categoriaTitulo.textContent = capitalize(categoria);

  // Filtra los ítems y los renderiza
  const filteredItems = categoria === 'todos' ? allItems : allItems.filter(item => item.categoria === categoria);
  renderProducts(filteredItems);
}


// Lógica del DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Carga los ítems para el tipo 'licor' cuando la página carga
    loadAndDisplayItems('licor'); // <-- ¡IMPORTANTE! El tipo aquí es 'licor'

    // Lógica para el botón de categorías y el menú lateral (ya la tienes en tus js existentes)
    const botonCategorias = document.getElementById('toggle-categorias');
    const menuCategorias = document.querySelector('.filtro-categorias');

    if (botonCategorias && menuCategorias) {
        // Abrir/cerrar menú con el botón
        botonCategorias.addEventListener('click', (e) => {
            e.stopPropagation();
            menuCategorias.classList.toggle('abierto');
        });

        // Cerrar menú al hacer clic en un filtro (solo para pantallas pequeñas)
        document.querySelectorAll('.filtro-categorias li').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 600) {
                    menuCategorias.classList.remove('abierto');
                }
            });
        });

        // Cerrar menú al hacer clic fuera de él o del botón
        document.addEventListener('click', (e) => {
            const clickFueraMenu = !menuCategorias.contains(e.target);
            const clickFueraBoton = !botonCategorias.contains(e.target);
            if (clickFueraMenu && clickFueraBoton && menuCategorias.classList.contains('abierto')) {
                menuCategorias.classList.remove('abierto');
            }
        });
    }

    // Lógica para cerrar modales al presionar ESC o hacer clic fuera de su contenido
    window.addEventListener('keydown', function(e) {
      if (e.key === "Escape") {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
      }
    });

    document.addEventListener('click', function(e) {
        // Si el clic fue directamente en el fondo del modal (no en su contenido)
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

// Exponer funciones globales que se usan en el HTML (onclick)
window.abrirModalDinamico = abrirModalDinamico;
window.cerrarModalDinamico = cerrarModalDinamico;
window.filtrar = filtrar;
window.agregarAlCarrito = agregarAlCarrito; // Asumo que esta función ya es global desde carrito.js