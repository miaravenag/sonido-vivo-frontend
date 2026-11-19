interface CargandoProps {
  texto?: string;
}

// Indicador mientras se espera la respuesta del servidor
export const Cargando = ({ texto = "Cargando..." }: CargandoProps) => {
  return (
    <div className="d-flex justify-content-center align-items-center gap-3 py-4" role="status">
      <div className="spinner-border text-primary" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
};
