import { useState } from "react";
import { apiBlob } from "../../utils/api";
import { backendErrorMessage, error, success } from "../../utils/alerts";

const BotonContrato = ({ idVenta }) => {
  const [urlContrato, setUrlContrato] = useState(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const generarContrato = async () => {
    try {
      const blob = await apiBlob(`/contrato/${idVenta}`);
      const url = URL.createObjectURL(blob);
      setUrlContrato(url);

      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato_${idVenta}.pdf`;
      link.click();

      success("Contrato generado correctamente.");
      setMostrarOpciones(false);
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  const handleClick = () => {
    if (!urlContrato) {
      generarContrato();
    } else {
      setMostrarOpciones(true);
    }
  };

  const descargar = () => {
    if (!urlContrato) return;
    const link = document.createElement("a");
    link.href = urlContrato;
    link.download = `contrato_${idVenta}.pdf`;
    link.click();
  };

  const imprimir = () => {
    if (!urlContrato) return;
    window.open(urlContrato, "_blank");
  };

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={handleClick}
        style={{ marginLeft: "5px" }}
      >
        Contrato
      </button>

      {mostrarOpciones && (
        <div className="modal-contrato">
          <div className="modal-content">
            <h3>Contrato ya generado</h3>
            <button onClick={generarContrato}>Reemplazar contrato</button>
            <button onClick={descargar}>Descargar nuevamente</button>
            <button onClick={imprimir}>Imprimir</button>
            <button onClick={() => setMostrarOpciones(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default BotonContrato;
