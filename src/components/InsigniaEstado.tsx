import type { EstadoCompra } from "../types/Compra";
import { colorEstado, etiquetaEstado } from "../utils/estadosCompra";

interface InsigniaEstadoProps {
  estado: EstadoCompra;
}

export const InsigniaEstado = ({ estado }: InsigniaEstadoProps) => {
  return <span className={`badge ${colorEstado[estado]}`}>{etiquetaEstado[estado]}</span>;
};
