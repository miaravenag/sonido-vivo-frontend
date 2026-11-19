import type { Producto } from "../types/Producto";

export const formatearPrecio = (precio: number): string =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(precio);

// Precio que realmente paga el cliente: la oferta si existe, si no el normal
export const precioEfectivo = (producto: Pick<Producto, "precio" | "precioOferta">): number =>
  producto.precioOferta ?? producto.precio;

// Fecha y hora de una compra (llega en formato ISO desde el servidor)
export const formatearFecha = (iso: string): string =>
  new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
