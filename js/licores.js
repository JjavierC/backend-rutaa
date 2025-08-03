document.addEventListener('DOMContentLoaded', () => {
  const menuUrl = 'https://reliable-beijinho-c4580c.netlify.app/.netlify/functions/api';
  const productosContainer = document.getElementById('productos-container');
  const filtrosContainer = document.getElementById('filtros-container');
  const modalesContainer = document.getElementById('modales-dinamicos-container');

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
    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="producto-img">
      <div class="producto-info">
        <h3 class="producto-nombre">${item.nombre}</h3>
        <p class="producto-precio">$${item.precio.toLocaleString('es-CO')}</p>
      </div>
    `;
    card.onclick = () => showModal(item);
    return card;
  }

  // Función para crear el HTML de un modal
  function createProductModal(item) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = `modal-${item._id}`;
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <img src="${item.imagen}" alt="${item.nombre}" class="modal-img">
        <h3 class="modal-nombre">${item.nombre}</h3>
        <p class="modal-descripcion">${item.descripcion}</p>
        <p class="modal-precio">$${item.precio.toLocaleString('es-CO')}</p>
        <a href="https://wa.me/573177890787" class="btn-pedir" target="_blank">Pedir por WhatsApp</a>
      </div>
    `;
    modal.querySelector('.close-btn').onclick = () => closeModal(modal.id);
    modal.addEventListener('click', (e) => {
      if (e.target.className === 'modal') {
        closeModal(modal.id);
      }
    });
    return modal;
  }

  // Función para mostrar un modal
  function showModal(item) {
    let modal = document.getElementById(`modal-${item._id}`);
    if (!modal) {
      modal = createProductModal(item);
      modalesContainer.appendChild(modal);
    }
    modal.style.display = 'block';
  }

  // Función para cerrar un modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Función para renderizar todos los productos y modales
  function renderProducts(items) {
    productosContainer.innerHTML = '';
    modalesContainer.innerHTML = '';
    if (items.length > 0) {
      items.forEach(item => {
        productosContainer.appendChild(createProductCard(item));
        modalesContainer.appendChild(createProductModal(item));
      });
    } else {
      productosContainer.innerHTML = '<p class="message-info">No se encontraron productos en esta categoría.</p>';
    }
  }

  // Función para crear y renderizar los botones de filtro
  function createFilters(items) {
    const categorias = new Set(items.map(item => item.categoria));
    filtrosContainer.innerHTML = '';
    
    // Botón para mostrar todo
    const allBtn = document.createElement('button');
    allBtn.className = 'filtro-btn active';
    allBtn.textContent = 'Todas';
    allBtn.onclick = () => {
      filtrar('all', items);
      setActiveButton(allBtn);
    };
    filtrosContainer.appendChild(allBtn);

    // Botones para cada categoría
    categorias.forEach(categoria => {
      const btn = document.createElement('button');
      btn.className = 'filtro-btn';
      btn.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
      btn.onclick = () => {
        filtrar(categoria, items);
        setActiveButton(btn);
      };
      filtrosContainer.appendChild(btn);
    });
  }
  
  // Función para establecer el botón activo
  function setActiveButton(activeButton) {
    document.querySelectorAll('.filtro-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    activeButton.classList.add('active');
  }

  // Función para filtrar productos
  function filtrar(categoria, allItems) {
    if (categoria === 'all') {
      renderProducts(allItems);
    } else {
      const filteredItems = allItems.filter(item => item.categoria === categoria);
      renderProducts(filteredItems);
    }
  }

  // Función principal para cargar y mostrar los ítems de un tipo específico
  async function loadAndDisplayItems(tipo) {
    const allItems = await getItems({ tipo: tipo });
    if (allItems.length > 0) {
      renderProducts(allItems);
      createFilters(allItems);
    } else {
      productosContainer.innerHTML = '<p class="message-info">No se encontraron productos en esta categoría.</p>';
      filtrosContainer.innerHTML = '';
    }
  }

  // Iniciar la carga de los productos de tipo 'licor'
  loadAndDisplayItems('licor');
});