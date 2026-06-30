import TablaDesplegable from "./TablaDesplegable";
import { apiJson } from "../../utils/api";
import { backendErrorMessage, confirm, error, success } from "../../utils/alerts";

function TablaColaboradores({ colaboradores, seleccionar, refrescar }) {
  const eliminar = async (id) => {
    const confirmed = await confirm(
      "Eliminar registro",
      "Esta accion eliminara este colaborador.",
      { variant: "delete" }
    );
    if (!confirmed) return;

    try {
      await apiJson(`/colaboradores/${id}`, { method: "DELETE" });
      success("Registro eliminado correctamente.");
      refrescar();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  return (
    <TablaDesplegable total={colaboradores.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DPI</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {colaboradores.slice(0, limite).map((c) => (
              <tr key={c.Id_Colaborador}>
                <td>{c.Nombre}</td>
                <td>{c.Apellido}</td>
                <td>{c.DPI}</td>
                <td>
                  <button className="btn-edit" onClick={() => seleccionar(c)}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => eliminar(c.Id_Colaborador)}>
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

export default TablaColaboradores;
