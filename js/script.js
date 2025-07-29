var splide = new Splide('.splide', {
    type: 'fade',
    rewind: true,
    autoplay: true,
    interval: 3500,
    pauseOnHover: true,
    arrows: false,
    pagination: false,
    speed: 500,
  });
  
  splide.mount();
  // Cuando agregas un producto
function agregarProducto(nombre) {
  const item = document.createElement('li');
  item.textContent = nombre;
  item.classList.add('agregando');
  
  const carritoLista = document.querySelector('.carrito-lista');
  carritoLista.appendChild(item);
  
  // Actualizar contador con animación
  const contador = document.querySelector('.contador-carrito');
  contador.classList.add('actualizando');
  setTimeout(() => contador.classList.remove('actualizando'), 300);
  
  // Remover clase de animación después de completarse
  setTimeout(() => item.classList.remove('agregando'), 300);
}

// Cuando eliminas un producto
function eliminarProducto(item) {
  item.classList.add('eliminando');
  
  // Esperar a que termine la animación para remover el elemento
  setTimeout(() => {
    item.remove();
  }, 300);
}

// Ejemplo de uso:
document.querySelectorAll('.carrito-lista button.eliminar').forEach(btn => {
  btn.addEventListener('click', function() {
    eliminarProducto(this.parentElement);
  });
});