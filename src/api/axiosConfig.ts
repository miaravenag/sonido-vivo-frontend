import axios from "axios";

export const api = axios.create({
  // En desarrollo apunta al backend local; para otro servidor define VITE_API_URL (ver .env.example)
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  timeout: 5000,
});

// El token JWT se guarda en sessionStorage para que la sesión sobreviva a una recarga de la página.
// Se borra solo al cerrar la pestaña o al cerrar sesión. No se usa localStorage.
const CLAVE_TOKEN = "sonidovivo_token";

const leerTokenGuardado = (): string | null => {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
};

let token: string | null = leerTokenGuardado();
let alExpirarSesion: (() => void) | null = null;

export const leerToken = () => token;

export const guardarToken = (nuevo: string | null) => {
  token = nuevo;
  try {
    if (nuevo) sessionStorage.setItem(CLAVE_TOKEN, nuevo);
    else sessionStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Si el navegador bloquea el almacenamiento, la sesión sigue funcionando en memoria
  }
};

// AuthContext registra aquí qué hacer cuando el servidor rechaza el token (vencido o inválido)
export const registrarAlExpirarSesion = (callback: (() => void) | null) => {
  alExpirarSesion = callback;
};

// Cada petición sale con el token en la cabecera: Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el servidor responde 401 teniendo una sesión abierta, el token ya no sirve: se cierra la sesión
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && token) {
      guardarToken(null);
      alExpirarSesion?.();
    }
    return Promise.reject(error);
  },
);
