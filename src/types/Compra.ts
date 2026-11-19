export interface DetalleCompra {
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Compra {
  id: number;
  fecha: string; // ISO, ej. 2026-11-16T14:30:00
  total: number;
  clienteId: number;
  clienteNombre: string;
  clienteEmail: string;
  items: DetalleCompra[];
}

// Lo que se envía al comprar: el servidor calcula los precios
export interface ItemCompra {
  productoId: number;
  cantidad: number;
}
