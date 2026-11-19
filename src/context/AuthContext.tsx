import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { guardarToken, leerToken, registrarAlExpirarSesion } from "../api/axiosConfig";
import { authService } from "../services/authService";
import { usuarioService } from "../services/usuarioService";
import type { Resultado } from "../types/Resultado";
import type { DatosUsuario, Usuario } from "../types/Usuario";
import { ejecutar, mensajeDeError } from "../utils/errores";

// Cada cuánto se pide un token nuevo mientras hay sesión (el token dura 2 horas)
const MINUTOS_RENOVACION = 30;

interface AuthContextType {
  usuarioActual: Usuario | null;
  cargandoSesion: boolean; // true mientras se restaura la sesión después de recargar la página
  registrar: (datos: DatosUsuario) => Promise<Resultado>;
  iniciarSesion: (email: string, password: string) => Promise<Resultado>;
  cerrarSesion: () => void;
  actualizarPerfil: (datos: DatosUsuario) => Promise<Resultado>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // El usuario vive en memoria; el token JWT queda en sessionStorage (ver axiosConfig.ts)
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(() => leerToken() !== null);

  // Si el servidor rechaza el token (vencido), se cierra la sesión y las rutas protegidas redirigen al login
  useEffect(() => {
    registrarAlExpirarSesion(() => setUsuarioActual(null));
    return () => registrarAlExpirarSesion(null);
  }, []);

  // Al abrir o recargar la página: si hay un token guardado, el servidor lo valida (POST /auth/renovar),
  // entrega uno nuevo y los datos del usuario, y así la sesión se restaura sin pedir la contraseña
  useEffect(() => {
    if (leerToken() === null) return;

    async function restaurarSesion() {
      try {
        const respuesta = await authService.renovar();
        guardarToken(respuesta.token);
        setUsuarioActual(respuesta.usuario);
      } catch {
        guardarToken(null); // token vencido, alterado o cuenta bloqueada
      } finally {
        setCargandoSesion(false);
      }
    }

    restaurarSesion();
  }, []);

  // Mientras hay sesión abierta, se renueva el token cada cierto tiempo
  const haySesion = usuarioActual !== null;
  useEffect(() => {
    if (!haySesion) return;

    const temporizador = setInterval(async () => {
      try {
        const respuesta = await authService.renovar();
        guardarToken(respuesta.token);
        setUsuarioActual(respuesta.usuario);
      } catch {
        // Si el servidor responde 401, el interceptor de axiosConfig cierra la sesión
      }
    }, MINUTOS_RENOVACION * 60 * 1000);

    return () => clearInterval(temporizador);
  }, [haySesion]);

  // Registro público: el servidor siempre crea clientes
  const registrar = (datos: DatosUsuario): Promise<Resultado> =>
    ejecutar(
      () => authService.registrar(datos),
      "¡Registro exitoso! Redirigiendo al inicio de sesión...",
    );

  const iniciarSesion = async (email: string, password: string): Promise<Resultado> => {
    try {
      const respuesta = await authService.login(email.trim().toLowerCase(), password);
      guardarToken(respuesta.token);
      setUsuarioActual(respuesta.usuario);
      return {
        exito: true,
        mensaje: `¡Bienvenido de nuevo, ${respuesta.usuario.nombre}! Redirigiendo...`,
      };
    } catch (error) {
      return { exito: false, mensaje: mensajeDeError(error) };
    }
  };

  const cerrarSesion = () => {
    guardarToken(null);
    setUsuarioActual(null);
  };

  // Edición del propio perfil: el rol, el estado y la contraseña NO se modifican aquí
  const actualizarPerfil = async (datos: DatosUsuario): Promise<Resultado> => {
    try {
      const actualizado = await usuarioService.actualizarPerfil(datos);
      setUsuarioActual(actualizado);
      return { exito: true, mensaje: "Perfil actualizado correctamente." };
    } catch (error) {
      return { exito: false, mensaje: mensajeDeError(error) };
    }
  };

  return (
    <AuthContext value={{ usuarioActual, cargandoSesion, registrar, iniciarSesion, cerrarSesion, actualizarPerfil }}>
      {children}
    </AuthContext>
  );
};

export const useAuth = () => {
  const contexto = useContext(AuthContext);

  if (contexto === null) {
    throw new Error("useAuth requiere AuthProvider");
  }

  return contexto;
};
