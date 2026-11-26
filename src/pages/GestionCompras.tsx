import { useEffect, useState } from "react";
import { Alerta } from "../components/Alerta";
import { Cargando } from "../components/Cargando";
import { TablaCompras } from "../components/TablaCompras";
import { TituloPagina } from "../components/TituloPagina";
import { compraService } from "../services/compraService";
import type { Compra, EstadoCompra } from "../types/Compra";
import type { AlertaInfo } from "../types/Resultado";
import { mensajeDeError } from "../utils/errores";
import { etiquetaEstado } from "../utils/estadosCompra";

// Panel de administración: compras de todos los clientes y cambio de su estado
export const GestionCompras = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<AlertaInfo | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

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

  const cambiarEstado = async (compra: Compra, estado: EstadoCompra) => {
    if (
      estado === "CANCELADA" &&
      !window.confirm(`¿Cancelar la compra #${compra.id}? Se devolverá el stock de sus productos.`)
    ) {
      return;
    }

    setProcesandoId(compra.id);
    setAlerta(null);
    try {
      const actualizada = await compraService.actualizarEstado(compra.id, estado);
      setCompras((anteriores) => anteriores.map((c) => (c.id === actualizada.id ? actualizada : c)));
      setAlerta({
        tipo: "success",
        mensaje: `La compra #${compra.id} ahora está "${etiquetaEstado[estado]}".`,
      });
    } catch (e) {
      setAlerta({ tipo: "danger", mensaje: mensajeDeError(e) });
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <main className="container my-5">
      <TituloPagina texto="Compras de los clientes" />

      <Alerta alerta={error ? { tipo: "danger", mensaje: error } : null} className="mb-3" />
      <Alerta alerta={alerta} className="mb-3" />

      {cargando ? (
        <Cargando texto="Cargando compras..." />
      ) : (
        !error &&
        (compras.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            Todavía no se han registrado compras.
          </div>
        ) : (
          <TablaCompras
            compras={compras}
            mostrarCliente
            onCambiarEstado={cambiarEstado}
            procesandoId={procesandoId}
          />
        ))
      )}
    </main>
  );
};
