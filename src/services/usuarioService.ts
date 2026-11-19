import { api } from "../api/axiosConfig";
import type { DatosUsuario, Usuario } from "../types/Usuario";

export const usuarioService = {
  async obtenerTodos(): Promise<Usuario[]> {
    const respuesta = await api.get<Usuario[]>("/usuarios");
    return respuesta.data;
  },

  async crear(datos: DatosUsuario): Promise<Usuario> {
    const respuesta = await api.post<Usuario>("/usuarios", {
      ...datos,
      password: datos.password || undefined,
    });
    return respuesta.data;
  },

  async actualizar(id: number, datos: DatosUsuario): Promise<Usuario> {
    const respuesta = await api.put<Usuario>(`/usuarios/${id}`, {
      ...datos,
      password: datos.password || undefined,
    });
    return respuesta.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },

  // Cada usuario edita su propio perfil (sin rol, contraseña ni bloqueo)
  async actualizarPerfil(datos: DatosUsuario): Promise<Usuario> {
    const respuesta = await api.put<Usuario>("/usuarios/perfil", {
      nombre: datos.nombre,
      apellido: datos.apellido,
      fechaNacimiento: datos.fechaNacimiento,
      email: datos.email,
      direccion: datos.direccion,
      region: datos.region,
      genero: datos.genero,
    });
    return respuesta.data;
  },
};
