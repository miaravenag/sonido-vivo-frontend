import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { categoriaService } from "../services/categoriaService";
import type { Categoria } from "../types/Categoria";
import type { Resultado } from "../types/Resultado";
import { ejecutar, mensajeDeError } from "../utils/errores";
import { validarNombreCategoria } from "../utils/validaciones";

interface CategoriasContextType {
  categorias: Categoria[];
  cargando: boolean;
  error: string | null;
  recargar: () => void;
  crearCategoria: (nombre: string) => Promise<Resultado>;
  renombrarCategoria: (id: number, nuevo: string) => Promise<Resultado>;
  eliminarCategoria: (id: number) => Promise<Resultado>;
}

const CategoriasContext = createContext<CategoriasContextType | null>(null);

export const CategoriasProvider = ({ children }: { children: ReactNode }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que cambia "version" se vuelve a pedir la lista al servidor
  const [version, setVersion] = useState(0);
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  // GET /categorias (ruta pública)
  useEffect(() => {
    async function cargarCategorias() {
      try {
        setCategorias(await categoriaService.obtenerTodas());
        setError(null);
      } catch (e) {
        setError(mensajeDeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarCategorias();
  }, [version]);

  const conRecarga = async (accion: () => Promise<unknown>, mensaje: string): Promise<Resultado> => {
    const resultado = await ejecutar(accion, mensaje);
    if (resultado.exito) recargar();
    return resultado;
  };

  const crearCategoria = (nombre: string): Promise<Resultado> => {
    const mensajeError = validarNombreCategoria(nombre, categorias.map((c) => c.nombre));
    if (mensajeError) return Promise.resolve({ exito: false, mensaje: mensajeError });

    return conRecarga(() => categoriaService.crear(nombre.trim()), "Categoría creada correctamente.");
  };

  const renombrarCategoria = (id: number, nuevo: string): Promise<Resultado> => {
    const anterior = categorias.find((c) => c.id === id)?.nombre;
    const mensajeError = validarNombreCategoria(nuevo, categorias.map((c) => c.nombre), anterior);
    if (mensajeError) return Promise.resolve({ exito: false, mensaje: mensajeError });

    return conRecarga(
      () => categoriaService.renombrar(id, nuevo.trim()),
      "Categoría actualizada correctamente.",
    );
  };

  const eliminarCategoria = (id: number) =>
    conRecarga(() => categoriaService.eliminar(id), "Categoría eliminada correctamente.");

  return (
    <CategoriasContext
      value={{ categorias, cargando, error, recargar, crearCategoria, renombrarCategoria, eliminarCategoria }}
    >
      {children}
    </CategoriasContext>
  );
};

export const useCategorias = () => {
  const contexto = useContext(CategoriasContext);

  if (contexto === null) {
    throw new Error("useCategorias requiere CategoriasProvider");
  }

  return contexto;
};
