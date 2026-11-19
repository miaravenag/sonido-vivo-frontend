import type { Compra } from "../types/Compra";
import { formatearFecha, formatearPrecio } from "../utils/formato";

interface TablaComprasProps {
  compras: Compra[];
  mostrarCliente?: boolean; // el panel de administración también muestra quién compró
}

export const TablaCompras = ({ compras, mostrarCliente = false }: TablaComprasProps) => {
  return (
    <div className="table-responsive card border-0 shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>N°</th>
            <th>Fecha</th>
            {mostrarCliente && <th>Cliente</th>}
            <th>Productos</th>
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id}>
              <td className="fw-bold">#{compra.id}</td>
              <td className="text-nowrap">{formatearFecha(compra.fecha)}</td>
              {mostrarCliente && (
                <td>
                  {compra.clienteNombre}
                  <br />
                  <span className="small text-muted">{compra.clienteEmail}</span>
                </td>
              )}
              <td>
                <ul className="list-unstyled small mb-0">
                  {compra.items.map((item) => (
                    <li key={item.productoId}>
                      {item.cantidad} × {item.nombreProducto}{" "}
                      <span className="text-muted">({formatearPrecio(item.subtotal)})</span>
                    </li>
                  ))}
                </ul>
              </td>
              <td className="text-end fw-bold">{formatearPrecio(compra.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
