import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alerta } from "../components/Alerta";
import { Cargando } from "../components/Cargando";
import { TablaCompras } from "../components/TablaCompras";
import { TituloPagina } from "../components/TituloPagina";
import { compraService } from "../services/compraService";
import type { Compra } from "../types/Compra";
import { mensajeDeError } from "../utils/errores";

// Historial de compras del usuario con sesión
export const HistorialCompras = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCompras() {
      try {
        setCompras(await compraService.obtenerMisCompras());
      } catch (e) {
        setError(mensajeDeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarCompras();
  }, []);

  return (
    <main className="container my-5">
      <TituloPagina texto="Mis compras" />

      <Alerta alerta={error ? { tipo: "danger", mensaje: error } : null} className="mb-3" />

      {cargando ? (
        <Cargando texto="Cargando tus compras..." />
      ) : (
        !error &&
        (compras.length === 0 ? (
          <div className="alert alert-info text-center p-5" role="alert">
            <i className="bi bi-receipt fs-1 d-block mb-3"></i>
            <h4>Aún no has realizado compras</h4>
            <Link to="/catalogo" className="btn btn-primary fw-bold mt-2">
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <TablaCompras compras={compras} />
        ))
      )}
    </main>
  );
};
