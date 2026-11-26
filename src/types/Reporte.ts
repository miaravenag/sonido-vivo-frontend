import type { EstadoCompra } from "./Compra";

export type PeriodoReporte = "semana" | "mes" | "anio" | "todo";

export interface ProductoMasVendido {
  productoId: number;
  nombre: string;
  unidades: number;
  monto: number;
}

// Un punto del gráfico: un día (yyyy-MM-dd) o un mes (yyyy-MM)
export interface PuntoVentas {
  etiqueta: string;
  operaciones: number;
  monto: number;
}

export interface ReporteResumen {
  periodo: PeriodoReporte;
  desde: string | null;
  hasta: string;
  totalOperaciones: number;
  montoTotal: number;
  unidadesVendidas: number;
  ticketPromedio: number;
  operacionesCanceladas: number;
  operacionesPorEstado: Record<EstadoCompra, number>;
  masVendidos: ProductoMasVendido[];
  serie: PuntoVentas[];
}
