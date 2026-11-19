export type Rol = "administrador" | "vendedor" | "cliente";
export type Genero = "Masculino" | "Femenino" | "Otro";

// El servidor nunca devuelve la contraseña
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  email: string;
  direccion: string;
  region: string;
  genero: Genero;
  rol: Rol;
  bloqueado: boolean;
}

// Datos para crear o actualizar un usuario (el id lo asigna el servidor).
// La contraseña es opcional: al editar, vacía significa "no cambiarla".
export interface DatosUsuario extends Omit<Usuario, "id"> {
  password?: string;
}

// Respuesta de POST /auth/login
export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

// Estado del formulario de usuario (todo texto hasta que se valida)
export interface FormularioUsuario {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  email: string;
  password: string;
  confirmPassword: string;
  direccion: string;
  region: string;
  genero: Genero | "";
  rol: Rol;
  bloqueado: boolean;
  terminos: boolean;
}
