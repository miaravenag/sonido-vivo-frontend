import { useEffect, useState } from "react";
import { Alerta } from "../components/Alerta";
import { Cargando } from "../components/Cargando";
import { InsigniaEstado } from "../components/InsigniaEstado";
import { TituloPagina } from "../components/TituloPagina";
import { reporteService } from "../services/reporteService";
import type { EstadoCompra } from "../types/Compra";
import type { PeriodoReporte, PuntoVentas, ReporteResumen } from "../types/Reporte";
import { mensajeDeError } from "../utils/errores";
import { formatearPrecio } from "../utils/formato";

const PERIODOS: { valor: PeriodoReporte; texto: string }[] = [
  { valor: "semana", texto: "Semana (7 días)" },
  { valor: "mes", texto: "Mes (30 días)" },
  { valor: "anio", texto: "Año (12 meses)" },
  { valor: "todo", texto: "Todo" },
];

const ALTURA_GRAFICO = 180;

// "2026-11-16" -> "16/11"   |   "2026-11" -> "11/26"
const etiquetaCorta = (etiqueta: string): string => {
  const partes = etiqueta.split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}` : `${partes[1]}/${partes[0].slice(2)}`;
};

interface TarjetaProps {
  titulo: string;
  valor: string;
  icono: string;
  detalle?: string;
}

const Tarjeta = ({ titulo, valor, icono, detalle }: TarjetaProps) => (
  <div className="col-6 col-lg-3">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <span className="text-muted small">{titulo}</span>
          <i className={`bi ${icono} fs-4 text-warning`} aria-hidden="true" />
        </div>
        <div className="fs-4 fw-bold">{valor}</div>
        {detalle && <div className="small text-muted">{detalle}</div>}
      </div>
    </div>
  </div>
);

// Gráfico de barras hecho con Bootstrap (sin librerías extra)
const GraficoVentas = ({ serie }: { serie: PuntoVentas[] }) => {
  const maximo = Math.max(...serie.map((p) => p.monto), 1);
  const paso = Math.ceil(serie.length / 8); // evita amontonar las etiquetas

  return (
    <div role="img" aria-label="Gráfico de monto vendido por periodo">
      <div className="d-flex align-items-end gap-1 border-bottom" style={{ height: ALTURA_GRAFICO }}>
        {serie.map((punto) => (
          <div
            key={punto.etiqueta}
            className="flex-fill bg-primary rounded-top"
            style={{ height: `${(punto.monto / maximo) * 100}%`, minHeight: punto.monto > 0 ? 3 : 0 }}
            title={`${etiquetaCorta(punto.etiqueta)}: ${formatearPrecio(punto.monto)} (${punto.operaciones} compra(s))`}
          />
        ))}
      </div>
      <div className="d-flex gap-1 mt-1">
        {serie.map((punto, i) => (
          <div key={punto.etiqueta} className="flex-fill text-center text-muted" style={{ fontSize: "0.7rem" }}>
            {i % paso === 0 ? etiquetaCorta(punto.etiqueta) : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard del administrador: todos los indicadores salen de la base de datos
export const Reportes = () => {
  const [periodo, setPeriodo] = useState<PeriodoReporte>("mes");
  const [recarga, setRecarga] = useState(0); // al aumentar, se vuelven a pedir los datos
  const [resumen, setResumen] = useState<ReporteResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarResumen() {
      try {
        const datos = await reporteService.obtenerResumen(periodo);
        if (!cancelado) {
          setResumen(datos);
          setError(null);
        }
      } catch (e) {
        if (!cancelado) setError(mensajeDeError(e));
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarResumen();
    // Si el administrador cambia de periodo antes de que responda el servidor, se ignora la respuesta vieja
    return () => {
      cancelado = true;
    };
  }, [periodo, recarga]);

  const cambiarPeriodo = (nuevo: PeriodoReporte) => {
    if (nuevo === periodo) return;
    setCargando(true);
    setPeriodo(nuevo);
  };

  const actualizar = () => {
    setCargando(true);
    setRecarga((n) => n + 1);
  };

  const maxUnidades = resumen ? Math.max(...resumen.masVendidos.map((p) => p.unidades), 1) : 1;

  return (
    <main className="container my-5">
      <TituloPagina texto="Reportes de ventas">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={actualizar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
          Actualizar
        </button>
      </TituloPagina>

      <div className="btn-group flex-wrap mb-4" role="group" aria-label="Periodo del reporte">
        {PERIODOS.map(({ valor, texto }) => (
          <button
            key={valor}
            type="button"
            className={`btn btn-sm ${periodo === valor ? "btn-primary" : "btn-outline-primary"}`}
            aria-pressed={periodo === valor}
            onClick={() => cambiarPeriodo(valor)}
          >
            {texto}
          </button>
        ))}
      </div>

      <Alerta alerta={error ? { tipo: "danger", mensaje: error } : null} className="mb-3" />

      {cargando && <Cargando texto="Calculando indicadores..." />}

      {!cargando && resumen && !error && (
        <>
          <p className="text-muted small">
            {resumen.desde ? `Del ${resumen.desde} al ${resumen.hasta}` : `Hasta el ${resumen.hasta}`}. Las compras
            canceladas no se cuentan como venta.
          </p>

          <div className="row g-3 mb-4">
            <Tarjeta titulo="Operaciones" valor={String(resumen.totalOperaciones)} icono="bi-receipt"
              detalle={`${resumen.operacionesCanceladas} cancelada(s)`} />
            <Tarjeta titulo="Monto vendido" valor={formatearPrecio(resumen.montoTotal)} icono="bi-cash-coin" />
            <Tarjeta titulo="Unidades vendidas" valor={String(resumen.unidadesVendidas)} icono="bi-box-seam" />
            <Tarjeta titulo="Ticket promedio" valor={formatearPrecio(resumen.ticketPromedio)} icono="bi-calculator" />
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5 mb-3">Monto vendido</h2>
                  {resumen.totalOperaciones === 0 ? (
                    <p className="text-muted mb-0">No hay ventas en este periodo.</p>
                  ) : (
                    <GraficoVentas serie={resumen.serie} />
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5 mb-3">Productos más vendidos</h2>
                  {resumen.masVendidos.length === 0 ? (
                    <p className="text-muted mb-0">No hay ventas en este periodo.</p>
                  ) : (
                    <ol className="list-unstyled mb-0">
                      {resumen.masVendidos.map((p, i) => (
                        <li key={p.productoId} className="mb-3">
                          <div className="d-flex justify-content-between gap-2">
                            <span className="fw-semibold">
                              {i + 1}. {p.nombre}
                            </span>
                            <span className="text-nowrap">{p.unidades} u.</span>
                          </div>
                          <div className="progress" style={{ height: 6 }}>
                            <div
                              className="progress-bar bg-warning"
                              role="progressbar"
                              style={{ width: `${(p.unidades / maxUnidades) * 100}%` }}
                              aria-label={`${p.unidades} unidades de ${p.nombre}`}
                            />
                          </div>
                          <div className="small text-muted">{formatearPrecio(p.monto)}</div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-3">Compras por estado</h2>
                  <div className="d-flex flex-wrap gap-4">
                    {(Object.entries(resumen.operacionesPorEstado) as [EstadoCompra, number][]).map(
                      ([estado, cantidad]) => (
                        <div key={estado} className="d-flex align-items-center gap-2">
                          <InsigniaEstado estado={estado} />
                          <span className="fw-bold">{cantidad}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};
