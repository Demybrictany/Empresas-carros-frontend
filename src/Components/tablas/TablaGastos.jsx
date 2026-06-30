import TablaDesplegable from "./TablaDesplegable";
import { apiJson } from "../../utils/api";
import { backendErrorMessage, confirm, error, success } from "../../utils/alerts";

function TablaGastos({ gastos, seleccionar, refrescar }) {
  const eliminar = async (id) => {
    const confirmed = await confirm(
      "Eliminar registro",
      "Esta accion eliminara este gasto.",
      { variant: "delete" }
    );
    if (!confirmed) return;

    try {
      await apiJson(`/gastos/${id}`, { method: "DELETE" });
      success("Registro eliminado correctamente.");
      refrescar();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  return (
    <TablaDesplegable total={gastos.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>Descripcion</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Carro</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {gastos.slice(0, limite).map((g) => (
              <tr key={g.Id_Gastos}>
                <td>{g.Descripcion}</td>
                <td>Q {g.Monto}</td>
                <td>{g.Fecha}</td>
                <td>{g.Carro ? `${g.Carro.Placa} - ${g.Carro.Modelo}` : "General"}</td>
                <td>
                  <button className="btn-edit" onClick={() => seleccionar(g)}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => eliminar(g.Id_Gastos)}>
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

export default TablaGastos;
