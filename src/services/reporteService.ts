import { api } from "../api/axiosConfig";
import type { PeriodoReporte, ReporteResumen } from "../types/Reporte";

export const reporteService = {
  // Indicadores calculados por el backend con los datos de la base (solo administrador)
  async obtenerResumen(periodo: PeriodoReporte): Promise<ReporteResumen> {
    const respuesta = await api.get<ReporteResumen>("/reportes/resumen", { params: { periodo } });
    return respuesta.data;
  },
};
