// El producto trae el nombre de su categoría
export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  precioOferta: number | null;
  stock: number;
  imagen: string;
  descripcion: string;
}

// Datos para crear o actualizar un producto (el id lo asigna el servidor)
export type DatosProducto = Omit<Producto, "id">;

// Estado del formulario de producto (todo texto hasta que se valida)
export interface FormularioProducto {
  nombre: string;
  categoria: string;
  precio: string;
  precioOferta: string;
  stock: string;
  imagen: string;
  descripcion: string;
}
