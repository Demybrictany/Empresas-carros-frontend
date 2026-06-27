import { useState } from "react";

function TablaDesplegable({ total, initialRows = 8, children }) {
  const [desplegada, setDesplegada] = useState(false);
  const debeMostrarBoton = total > initialRows;

  return (
    <div className="collapsible-panel table-panel">
      <div className="table-container">{children(desplegada ? total : initialRows)}</div>

      {debeMostrarBoton && (
        <button
          type="button"
          className="btn-secondary list-toggle"
          onClick={() => setDesplegada((prev) => !prev)}
        >
          {desplegada ? "Ocultar" : `Desplegar todos (${total})`}
        </button>
      )}
    </div>
  );
}

export default TablaDesplegable;
