import { useState } from "react";
import type { Categoria } from "../types/Categoria";
import type { Resultado } from "../types/Resultado";

interface CategoriaFilaProps {
  categoria: Categoria;
  onRenombrar: (id: number, nuevo: string) => Promise<Resultado>;
  onEliminar: (categoria: Categoria) => void;
}

export const CategoriaFila = ({ categoria, onRenombrar, onEliminar }: CategoriaFilaProps) => {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(categoria.nombre);

  const guardar = async () => {
    const resultado = await onRenombrar(categoria.id, texto);
    if (resultado.exito) setEditando(false);
  };

  const cancelar = () => {
    setTexto(categoria.nombre);
    setEditando(false);
  };

  return (
    <tr>
      <td>
        {editando ? (
          <input
            type="text"
            className="form-control form-control-sm"
            aria-label={`Nuevo nombre para ${categoria.nombre}`}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        ) : (
          <span className="fw-semibold">{categoria.nombre}</span>
        )}
      </td>
      <td>{categoria.cantidadProductos}</td>
      <td className="text-nowrap">
        {editando ? (
          <>
            <button type="button" className="btn btn-success btn-sm me-2" onClick={guardar}>
              Guardar
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelar}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm me-2"
              aria-label={`Editar ${categoria.nombre}`}
              onClick={() => setEditando(true)}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              aria-label={`Eliminar ${categoria.nombre}`}
              onClick={() => onEliminar(categoria)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </>
        )}
      </td>
    </tr>
  );
};
