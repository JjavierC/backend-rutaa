document.addEventListener('DOMContentLoaded', () => {
  const menuUrl = 'https://reliable-beijinho-c4580c.netlify.app/.netlify/functions/api';
  const productosContainer = document.getElementById('productos-container');
  const categoriaTitulo = document.getElementById('categoria-titulo');
  const filtroCategoriasUl = document.querySelector('.filtro-categorias ul');
  const modalesDinamicosContainer = document.getElementById('modales-dinamicos-container');
  let allItems = []; 

  // Función para capitalizar texto
  function capitalize(text) {
    if (!text) return '';
    return text.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Función para obtener los productos de la API de Netlify
  async function getItems(query = {}) {
    try {
      const url = new URL(menuUrl);
      Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener ítems:', error);
      return [];
    }
  }

  // Función para crear el HTML de una tarjeta de producto
  function createProductCard(item) {
    const productoCard = document.createElement('div');
    productoCard.className = `producto-card ${item.categoria} ${item.tipo}`;
    productoCard.setAttribute('data-id', item._id);

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
    modal.className = 'modal';
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

  // Abre un modal dinámico
  function abrirModalDinamico(itemId) {
    const modal = document.getElementById(`modal-${itemId}`);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  // Cierra un modal dinámico
  function cerrarModalDinamico(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Función para renderizar los productos en la página
  function renderProducts(productsToRender) {
    productosContainer.innerHTML = '';
    modalesDinamicosContainer.innerHTML = '';

    if (productsToRender.length === 0) {
      productosContainer.innerHTML = '<p style="color: #ccc; text-align: center;">No hay productos en esta categoría.</p>';
      return;
    }

    const groupedProducts = productsToRender.reduce((acc, item) => {
      const categoryKey = item.categoria || 'sin-categoria';
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(item);
      return acc;
    }, {});

    for (const category in groupedProducts) {
      const section = document.createElement('section');
      section.className = `categoria-productos ${category}`;
      
      groupedProducts[category].forEach(item => {
        section.appendChild(createProductCard(item));
        modalesDinamicosContainer.appendChild(createProductModal(item));
      });
      productosContainer.appendChild(section);
    }
  }

  // Función para filtrar los ítems mostrados
  function filtrar(categoria) {
    const filtros = document.querySelectorAll('.filtro-categorias li');
    filtros.forEach(f => f.classList.remove('activo'));
    const seleccionado = Array.from(filtros).find(f =>
      f.textContent.trim().toLowerCase().includes(capitalize(categoria).toLowerCase())
    );
    if (seleccionado) seleccionado.classList.add('activo');
    categoriaTitulo.textContent = capitalize(categoria);
    const filteredItems = categoria === 'todos' ? allItems : allItems.filter(item => item.categoria === categoria);
    renderProducts(filteredItems);
  }

  // Función principal para cargar y mostrar los ítems de un tipo específico
  async function loadAndDisplayItems(type = 'postre', initialCategory = 'todos') {
    categoriaTitulo.textContent = 'Cargando...';
    try {
      const allItemsData = await getItems({ tipo: type });
      allItems = allItemsData;

      if (allItems.length > 0) {
        const uniqueCategories = new Set(allItems.map(item => item.categoria).filter(Boolean));
        filtroCategoriasUl.innerHTML = `<li class="activo" onclick="filtrar('todos')">Todos</li>`;
        uniqueCategories.forEach(category => {
          filtroCategoriasUl.innerHTML += `<li onclick="filtrar('${category}')">${capitalize(category)}</li>`;
        });
        filtrar(initialCategory);
      } else {
        productosContainer.innerHTML = '<p style="color: #ccc; text-align: center;">No hay productos en esta categoría.</p>';
        filtroCategoriasUl.innerHTML = `<li class="activo">Todos</li>`;
      }
    } catch (error) {
      console.error('Error al cargar los ítems del menú:', error);
      categoriaTitulo.textContent = 'Error al cargar el menú. Intenta de nuevo más tarde.';
      productosContainer.innerHTML = '';
    }
  }

  // Lógica del DOMContentLoaded
  window.abrirModalDinamico = abrirModalDinamico;
  window.cerrarModalDinamico = cerrarModalDinamico;
  window.filtrar = filtrar;
  
  document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayItems('postre');
  });
});