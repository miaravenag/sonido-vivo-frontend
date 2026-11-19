import { useEffect, useState } from "react";
import { Alerta } from "../components/Alerta";
import { Cargando } from "../components/Cargando";
import { TablaCompras } from "../components/TablaCompras";
import { TituloPagina } from "../components/TituloPagina";
import { compraService } from "../services/compraService";
import type { Compra } from "../types/Compra";
import { mensajeDeError } from "../utils/errores";

// Panel de administración: historial de compras de todos los clientes
export const GestionCompras = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCompras() {
      try {
        setCompras(await compraService.obtenerTodas());
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
      <TituloPagina texto="Historial de compras" />

      <Alerta alerta={error ? { tipo: "danger", mensaje: error } : null} className="mb-3" />

      {cargando ? (
        <Cargando texto="Cargando compras..." />
      ) : (
        !error &&
        (compras.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            Todavía no se han registrado compras.
          </div>
        ) : (
          <TablaCompras compras={compras} mostrarCliente />
        ))
      )}
    </main>
  );
};
