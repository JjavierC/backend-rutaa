document.addEventListener('DOMContentLoaded', () => {
  const btnCategorias = document.getElementById('btn-categorias');
  const btnAtras = document.getElementById('btn-atras');
  const panelCategorias = document.querySelector('.filtro-categorias');

  // Botón "Categorías" - abre o cierra el panel
  if (btnCategorias && panelCategorias) {
    btnCategorias.addEventListener('click', () => {
      panelCategorias.classList.toggle('abierto');
      panelCategorias.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Botón "Atrás" - redirige a menut.html
  if (btnAtras) {
    btnAtras.addEventListener('click', () => {
      window.location.href = 'menut.html';
    });
  }
});
