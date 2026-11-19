import { Link } from "react-router-dom";
import { useProductos } from "../context/ProductosContext";
import { Alerta } from "./Alerta";
import { Cargando } from "./Cargando";
import { ProductoCard } from "./ProductoCard";

export const ProductosDestacados = () => {
  const { productos, cargando, error } = useProductos();

  // Los primeros 3 productos se muestran como destacados
  const destacados = productos.slice(0, 3);

  return (
    <section className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold border-bottom border-warning border-3 pb-2">
          Productos Destacados
        </h2>
        <Link to="/catalogo" className="text-decoration-none">
          Ver todos <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <Alerta alerta={error ? { tipo: "danger", mensaje: error } : null} className="mb-3" />
      {cargando && <Cargando texto="Cargando productos..." />}

      <div className="row g-4">
        {destacados.map((producto) => (
          <div className="col-md-4" key={producto.id}>
            <ProductoCard producto={producto} variante="destacado" />
          </div>
        ))}
      </div>
    </section>
  );
};
