function filtrar(categoria) {
  const productos = document.querySelectorAll('.producto-card');
  const titulo = document.getElementById('categoria-titulo');
  const filtros = document.querySelectorAll('.filtro-categorias li');

  // Quitar clase activa
  filtros.forEach(f => f.classList.remove('activo'));

  // Agregar clase activa al clickeado
  const seleccionado = Array.from(filtros).find(f =>
    f.textContent.trim().toLowerCase().includes(categoria.replace('-', ' '))
  );
  if (seleccionado) seleccionado.classList.add('activo');

  // Mostrar título
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

function abrirModal(id) {
  document.getElementById(id).style.display = 'block';
}

function cerrarModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Cerrar modal con ESC
window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  }
});

// ✅ ESTE BLOQUE VA FUERA del keydown
document.addEventListener('DOMContentLoaded', () => {
  const botonCategorias = document.getElementById('toggle-categorias');
  const menuCategorias = document.querySelector('.filtro-categorias');

  // 👇 Esto hace que se abra automáticamente en móviles
  if (window.innerWidth <= 600 && menuCategorias) {
    menuCategorias.classList.add('abierto');
  }

  if (botonCategorias && menuCategorias) {
    botonCategorias.addEventListener('click', () => {
      menuCategorias.classList.toggle('abierto');
    });

    document.querySelectorAll('.filtro-categorias li').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 600) {
          menuCategorias.classList.remove('abierto');
        }
      });
    });
  }
});


document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});