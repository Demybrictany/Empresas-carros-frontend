import BotonContrato from "../botones/BotonContrato";
import TablaDesplegable from "./TablaDesplegable";
import { apiJson } from "../../utils/api";
import { backendErrorMessage, confirm, error, success } from "../../utils/alerts";

function TablaVentas({ ventas, seleccionar, refrescar }) {
  const eliminar = async (id) => {
    const confirmed = await confirm(
      "Eliminar registro",
      "Esta accion eliminara esta venta.",
      { variant: "delete" }
    );
    if (!confirmed) return;

    try {
      await apiJson(`/ventas/${id}`, { method: "DELETE" });
      success("Registro eliminado correctamente.");
      refrescar();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  return (
    <TablaDesplegable total={ventas.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>Carro</th>
              <th>Comprador</th>
              <th>Fecha</th>
              <th>Precio Venta</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {ventas.slice(0, limite).map((v) => (
              <tr key={v.Id_Venta}>
                <td>{v.Carro ? `${v.Carro.Placa} - ${v.Carro.Modelo}` : "-"}</td>
                <td>{v.Comprador ? v.Comprador.Nombre : "-"}</td>
                <td>{v.Fecha}</td>
                <td>Q {v.PrecioVenta}</td>
                <td>
                  <button className="btn-edit" onClick={() => seleccionar(v)}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => eliminar(v.Id_Venta)}>
                    Eliminar
                  </button>
                  <BotonContrato idVenta={v.Id_Venta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </TablaDesplegable>
  );
}

export default TablaVentas;
