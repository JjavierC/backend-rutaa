function filtrar(categoria) { 
  const productos = document.querySelectorAll('.producto-card');
  const titulo = document.getElementById('categoria-titulo');
  const filtros = document.querySelectorAll('.filtro-categorias li');

  // Quitar clase activa
  filtros.forEach(f => f.classList.remove('activo'));

  // Activar el seleccionado
  const seleccionado = Array.from(filtros).find(f =>
    f.textContent.trim().toLowerCase().includes(categoria.replace('-', ' '))
  );
  if (seleccionado) seleccionado.classList.add('activo');

  // Cambiar título
  const nombreBonito = categoria === 'todos' ? 'Todos' : capitalize(categoria);
  titulo.textContent = nombreBonito;

  // Mostrar/ocultar productos
  productos.forEach(producto => {
    if (categoria === 'todos' || producto.classList.contains(categoria)) {
      producto.style.display = 'block';
    } else {
      producto.style.display = 'none';
    }
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).replace('-', ' ');
}

document.addEventListener('DOMContentLoaded', () => {
  const botonCategorias = document.getElementById('toggle-categorias');
  const menuCategorias = document.querySelector('.filtro-categorias');

  if (botonCategorias && menuCategorias) {
    // Abrir/cerrar menú al hacer clic en el botón
    botonCategorias.addEventListener('click', (e) => {
      e.stopPropagation(); // evitar cierre inmediato
      menuCategorias.classList.toggle('abierto');
    });

    // Cerrar menú al hacer clic en un item (solo móviles)
    document.querySelectorAll('.filtro-categorias li').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 600) {
          menuCategorias.classList.remove('abierto');
        }
      });
    });

    // Cerrar menú al hacer clic fuera del menú o del botón
    document.addEventListener('click', (e) => {
      const clickFueraMenu = !e.target.closest('.filtro-categorias');
      const clickFueraBoton = !e.target.closest('#toggle-categorias');
      if (clickFueraMenu && clickFueraBoton && menuCategorias.classList.contains('abierto')) {
        menuCategorias.classList.remove('abierto');
      }
    });
  }

  // Cierra el menú en móvil por defecto al cargar
  if (window.innerWidth <= 600) {
    const menu = document.querySelector('.filtro-categorias');
    if (menu) {
      menu.classList.remove('abierto');
    }
  }
});

// Cerrar modal al hacer click fuera de .modal-content
document.querySelectorAll('.close').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});document.addEventListener('DOMContentLoaded', () => {
  const botonCategorias = document.getElementById('toggle-categorias');
  const menuCategorias = document.querySelector('.filtro-categorias');

  // Abrir/cerrar menú con el botón
  botonCategorias.addEventListener('click', (e) => {
    e.stopPropagation(); // evita que se cierre de inmediato
    menuCategorias.classList.toggle('abierto');
  });

  // Cerrar menú al hacer clic fuera de él
  document.addEventListener('click', (e) => {
    const clickFueraMenu = !menuCategorias.contains(e.target);
    const clickFueraBoton = !botonCategorias.contains(e.target);

    if (clickFueraMenu && clickFueraBoton && menuCategorias.classList.contains('abierto')) {
      menuCategorias.classList.remove('abierto');
    }
  });

  // Cerrar el menú al hacer clic en un filtro (solo móvil)
  document.querySelectorAll('.filtro-categorias li').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 600) {
        menuCategorias.classList.remove('abierto');
      }
    });
  });
});

