import axios from "axios";
import type { Resultado } from "../types/Resultado";

// Convierte cualquier error de Axios en un mensaje legible para el usuario
export const mensajeDeError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Sin respuesta: el backend está apagado o no se pudo llegar a él
    if (!error.response) {
      return "No se pudo conectar con el servidor. Verifica que el backend esté encendido.";
    }
    // El backend responde { "mensaje": "..." } en sus errores
    const mensaje = (error.response.data as { mensaje?: string } | undefined)?.mensaje;
    if (mensaje) return mensaje;
    return `Ocurrió un error en el servidor (código ${error.response.status}).`;
  }
  return "Ocurrió un error inesperado.";
};

// Ejecuta una petición y la convierte en un Resultado { exito, mensaje }
export const ejecutar = async (
  accion: () => Promise<unknown>,
  mensajeExito: string,
): Promise<Resultado> => {
  try {
    await accion();
    return { exito: true, mensaje: mensajeExito };
  } catch (error) {
    return { exito: false, mensaje: mensajeDeError(error) };
  }
};
