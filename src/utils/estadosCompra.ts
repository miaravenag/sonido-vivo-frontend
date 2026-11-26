import type { EstadoCompra } from "../types/Compra";

export const etiquetaEstado: Record<EstadoCompra, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENVIADA: "Enviada",
  ENTREGADA: "Entregada",
  CANCELADA: "Cancelada",
};

// Clases de la insignia de Bootstrap para cada estado
export const colorEstado: Record<EstadoCompra, string> = {
  PENDIENTE: "bg-warning text-dark",
  EN_PREPARACION: "bg-info text-dark",
  ENVIADA: "bg-primary",
  ENTREGADA: "bg-success",
  CANCELADA: "bg-danger",
};

// Mismas transiciones que valida el backend (ENTREGADA y CANCELADA son finales)
export const estadosSiguientes: Record<EstadoCompra, EstadoCompra[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADA"],
  EN_PREPARACION: ["ENVIADA", "CANCELADA"],
  ENVIADA: ["ENTREGADA"],
  ENTREGADA: [],
  CANCELADA: [],
};
