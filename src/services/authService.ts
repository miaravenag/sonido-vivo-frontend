import { api } from "../api/axiosConfig";
import type { DatosUsuario, RespuestaLogin, Usuario } from "../types/Usuario";

export const authService = {
  async login(email: string, password: string): Promise<RespuestaLogin> {
    const respuesta = await api.post<RespuestaLogin>("/auth/login", { email, password });
    return respuesta.data;
  },

  // Con el token vigente pide uno nuevo y los datos actuales del usuario
  async renovar(): Promise<RespuestaLogin> {
    const respuesta = await api.post<RespuestaLogin>("/auth/renovar");
    return respuesta.data;
  },

  // El registro público siempre crea un cliente (lo decide el servidor)
  async registrar(datos: DatosUsuario): Promise<Usuario> {
    const respuesta = await api.post<Usuario>("/auth/registro", {
      ...datos,
      password: datos.password || undefined,
    });
    return respuesta.data;
  },
};
