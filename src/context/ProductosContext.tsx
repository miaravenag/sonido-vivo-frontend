import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { productoService } from "../services/productoService";
import type { DatosProducto, Producto } from "../types/Producto";
import type { Resultado } from "../types/Resultado";
import { ejecutar, mensajeDeError } from "../utils/errores";

interface ProductosContextType {
  productos: Producto[];
  cargando: boolean; // true mientras se espera la respuesta del servidor
  error: string | null; // mensaje si no se pudieron cargar los productos
  recargar: () => void; // vuelve a pedir la lista al servidor
  buscarProductoPorId: (id: number) => Producto | undefined;
  crearProducto: (datos: DatosProducto) => Promise<Resultado>;
  actualizarProducto: (id: number, datos: DatosProducto) => Promise<Resultado>;
  eliminarProducto: (id: number) => Promise<Resultado>;
  actualizarStock: (id: number, stock: number) => Promise<Resultado>;
}

const ProductosContext = createContext<ProductosContextType | null>(null);

export const ProductosProvider = ({ children }: { children: ReactNode }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que cambia "version" se vuelve a pedir la lista al servidor
  const [version, setVersion] = useState(0);
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  // GET /productos (ruta pública)
  useEffect(() => {
    async function cargarProductos() {
      try {
        setProductos(await productoService.obtenerTodos());
        setError(null);
      } catch (e) {
        setError(mensajeDeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, [version]);

  const buscarProductoPorId = (id: number) => productos.find((producto) => producto.id === id);

  // Después de cada cambio exitoso se vuelve a pedir la lista al servidor
  const conRecarga = async (accion: () => Promise<unknown>, mensaje: string): Promise<Resultado> => {
    const resultado = await ejecutar(accion, mensaje);
    if (resultado.exito) recargar();
    return resultado;
  };

  const crearProducto = (datos: DatosProducto) =>
    conRecarga(() => productoService.crear(datos), "Producto creado correctamente.");

  const actualizarProducto = (id: number, datos: DatosProducto) =>
    conRecarga(() => productoService.actualizar(id, datos), "Producto actualizado correctamente.");

  const eliminarProducto = (id: number) =>
    conRecarga(() => productoService.eliminar(id), "Producto eliminado correctamente.");

  const actualizarStock = (id: number, stock: number) =>
    conRecarga(() => productoService.actualizarStock(id, stock), "Stock actualizado correctamente.");

  return (
    <ProductosContext
      value={{
        productos,
        cargando,
        error,
        recargar,
        buscarProductoPorId,
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        actualizarStock,
      }}
    >
      {children}
    </ProductosContext>
  );
};

export const useProductos = () => {
  const contexto = useContext(ProductosContext);

  if (contexto === null) {
    throw new Error("useProductos requiere ProductosProvider");
  }

  return contexto;
};
