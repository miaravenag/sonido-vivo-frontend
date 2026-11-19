import { api } from "../api/axiosConfig";
import type { Categoria } from "../types/Categoria";

export const categoriaService = {
  async obtenerTodas(): Promise<Categoria[]> {
    const respuesta = await api.get<Categoria[]>("/categorias");
    return respuesta.data;
  },

  async crear(nombre: string): Promise<Categoria> {
    const respuesta = await api.post<Categoria>("/categorias", { nombre });
    return respuesta.data;
  },

  async renombrar(id: number, nombre: string): Promise<Categoria> {
    const respuesta = await api.put<Categoria>(`/categorias/${id}`, { nombre });
    return respuesta.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`);
  },
};
