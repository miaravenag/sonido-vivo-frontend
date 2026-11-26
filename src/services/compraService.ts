import { api } from "../api/axiosConfig";
import type { Compra, EstadoCompra, ItemCompra } from "../types/Compra";

export const compraService = {
  async crear(items: ItemCompra[]): Promise<Compra> {
    const respuesta = await api.post<Compra>("/compras", { items });
    return respuesta.data;
  },

  // Historial del usuario con sesión
  async obtenerMisCompras(): Promise<Compra[]> {
    const respuesta = await api.get<Compra[]>("/compras/mis-compras");
    return respuesta.data;
  },

  // Historial de todos los clientes (solo administrador)
  async obtenerTodas(): Promise<Compra[]> {
    const respuesta = await api.get<Compra[]>("/compras");
    return respuesta.data;
  },

  // Cambia el estado de una compra (solo administrador)
  async actualizarEstado(id: number, estado: EstadoCompra): Promise<Compra> {
    const respuesta = await api.patch<Compra>(`/compras/${id}/estado`, { estado });
    return respuesta.data;
  },
};
