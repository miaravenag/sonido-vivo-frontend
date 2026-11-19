import { api } from "../api/axiosConfig";
import type { DatosProducto, Producto } from "../types/Producto";

export const productoService = {
  async obtenerTodos(): Promise<Producto[]> {
    const respuesta = await api.get<Producto[]>("/productos");
    return respuesta.data;
  },

  async crear(datos: DatosProducto): Promise<Producto> {
    const respuesta = await api.post<Producto>("/productos", datos);
    return respuesta.data;
  },

  async actualizar(id: number, datos: DatosProducto): Promise<Producto> {
    const respuesta = await api.put<Producto>(`/productos/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/productos/${id}`);
  },

  // Administrador y vendedor
  async actualizarStock(id: number, stock: number): Promise<Producto> {
    const respuesta = await api.patch<Producto>(`/productos/${id}/stock`, { stock });
    return respuesta.data;
  },
};
