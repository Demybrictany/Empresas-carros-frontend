import TablaDesplegable from "./TablaDesplegable";
import { apiJson } from "../../utils/api";
import { backendErrorMessage, confirm, error, success } from "../../utils/alerts";

function TablaDuenosCarro({ duenos, seleccionar, refrescar }) {
  const eliminar = async (id) => {
    const confirmed = await confirm(
      "Eliminar registro",
      "Esta accion eliminara este dueno del carro.",
      { variant: "delete" }
    );
    if (!confirmed) return;

    try {
      await apiJson(`/dueno-carro/${id}`, { method: "DELETE" });
      success("Registro eliminado correctamente.");
      refrescar();
    } catch (err) {
      console.error("Error eliminando dueno del carro:", err);
      error(backendErrorMessage(err));
    }
  };

  return (
    <TablaDesplegable total={duenos.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DPI</th>
              <th>Telefono</th>
              <th>Direccion</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {duenos.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No hay duenos registrados
                </td>
              </tr>
            ) : (
              duenos.slice(0, limite).map((d) => (
                <tr key={d.Id_Dueno_Carro}>
                  <td>{d.Nombre}</td>
                  <td>{d.Apellido}</td>
                  <td>{d.DPI}</td>
                  <td>{d.Telefono}</td>
                  <td>{d.Direccion}</td>
                  <td>
                    <button className="btn-edit" onClick={() => seleccionar(d)}>
                      Editar
                    </button>

                    <button className="btn-delete" onClick={() => eliminar(d.Id_Dueno_Carro)}>
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

export default TablaDuenosCarro;
