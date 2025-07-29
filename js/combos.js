// Funciones para abrir y cerrar modales por ID
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'block';
}

function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

// Cerrar con la tecla ESC
window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    const abierto = document.querySelector('.modal[style*="display: block"]');
    if (abierto) abierto.style.display = 'none';
  }
});

// Cerrar al hacer clic fuera del contenido del modal
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});

