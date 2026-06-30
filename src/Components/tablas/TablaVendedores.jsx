import TablaDesplegable from "./TablaDesplegable";
import { apiJson } from "../../utils/api";
import { backendErrorMessage, confirm, error, success } from "../../utils/alerts";

function TablaVendedores({ vendedores, seleccionar, refrescar }) {
  const eliminar = async (id) => {
    const confirmed = await confirm(
      "Eliminar registro",
      "Esta accion eliminara este vendedor.",
      { variant: "delete" }
    );
    if (!confirmed) return;

    try {
      await apiJson(`/vendedores/${id}`, { method: "DELETE" });
      success("Registro eliminado correctamente.");
      refrescar();
    } catch (err) {
      console.error("Error eliminando vendedor:", err);
      error(backendErrorMessage(err));
    }
  };

  return (
    <TablaDesplegable total={vendedores.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>DPI</th>
              <th>Direccion</th>
              <th>Relacion</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {vendedores.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No hay vendedores registrados
                </td>
              </tr>
            ) : (
              vendedores.slice(0, limite).map((v) => (
                <tr key={v.Id_Vendedor}>
                  <td>{v.Nombre}</td>
                  <td>{v.Telefono}</td>
                  <td>{v.Dpi}</td>
                  <td>{v.Direccion}</td>
                  <td>{v.Relacion_Dueno || v.Relacion_Dueno}</td>
                  <td>
                    <button className="btn-edit" onClick={() => seleccionar(v)}>
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => eliminar(v.Id_Vendedor)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </TablaDesplegable>
  );
}

export default TablaVendedores;
