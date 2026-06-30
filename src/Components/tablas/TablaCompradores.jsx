import TablaDesplegable from "./TablaDesplegable";
import { apiJson } from "../../utils/api";
import { backendErrorMessage, confirm, error, success } from "../../utils/alerts";

function TablaCompradores({ compradores, seleccionarComprador, refrescar }) {
  const eliminar = async (id) => {
    const confirmed = await confirm(
      "Eliminar registro",
      "Esta accion eliminara este comprador.",
      { variant: "delete" }
    );
    if (!confirmed) return;

    try {
      await apiJson(`/compradores/${id}`, { method: "DELETE" });
      success("Registro eliminado correctamente.");
      refrescar();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  return (
    <TablaDesplegable total={compradores.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DPI</th>
              <th>Telefono</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {compradores.slice(0, limite).map((c) => (
              <tr key={c.Id_Compra}>
                <td>{c.Nombre}</td>
                <td>{c.Apellido}</td>
                <td>{c.DPI}</td>
                <td>{c.Telefono}</td>
                <td>
                  <button className="btn-edit" onClick={() => seleccionarComprador(c)}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => eliminar(c.Id_Compra)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </TablaDesplegable>
  );
}

export default TablaCompradores;
