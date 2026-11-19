// Lo único que guarda el carrito: qué producto y cuántas unidades
export interface LineaCarrito {
  id: number;
  cantidad: number;
}

// Línea del carrito con los datos ACTUALES del producto (precio, stock, nombre...)
export interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number; // precio efectivo (oferta si existe)
  imagen: string;
  categoria: string;
  cantidad: number;
  stockMaximo: number;
}
