import TablaDesplegable from "./TablaDesplegable";
import { apiBlob, apiJson } from "../../utils/api";
import { backendErrorMessage, confirm, error, success } from "../../utils/alerts";

function TablaCarros({ carros, seleccionar, refrescar }) {
  const eliminar = async (id) => {
    const confirmed = await confirm(
      "Eliminar registro",
      "Esta accion eliminara este carro del predio.",
      { variant: "delete" }
    );
    if (!confirmed) return;

    try {
      await apiJson(`/carros-predio/${id}`, { method: "DELETE" });
      success("Registro eliminado correctamente.");
      refrescar();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  const descargarContratoCompra = async (id) => {
    try {
      const blob = await apiBlob(`/contrato-compra-carro/${id}`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato_compra_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  return (
    <TablaDesplegable total={carros.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Anio</th>
              <th>Color</th>
              <th>VIN</th>
              <th>Motor</th>
              <th>Chasis</th>
              <th>Vendedor</th>
              <th>Comprador</th>
              <th>Dias Traspaso</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {carros.slice(0, limite).map((c) => (
              <tr key={c.Id_Predio}>
                <td>
                  {c.FotoCarro ? (
                    <img
                      src={c.FotoCarro}
                      alt="Foto del carro"
                      style={{
                        width: "80px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                      }}
                    />
                  ) : (
                    "Sin foto"
                  )}
                </td>

                <td>{c.Placa}</td>
                <td>{c.Modelo}</td>
                <td>{c.Anio}</td>
                <td>{c.Color}</td>
                <td>{c.Vin}</td>
                <td>{c.Num_Motor}</td>
                <td>{c.Num_Chasis}</td>

                <td>
                  {c.Vendedor ? `${c.Vendedor.Nombre} (${c.Vendedor.Dpi})` : "No asignado"}
                </td>

                <td>
                  {c.Comprador ? `${c.Comprador.Nombre} (${c.Comprador.DPI})` : "Sin comprador"}
                </td>

                <td>{c.Tiempo_Traspaso ?? "-"}</td>

                <td>
                  <button className="btn-edit" onClick={() => seleccionar(c)}>
                    Editar
                  </button>

                  <button className="btn-delete" onClick={() => eliminar(c.Id_Predio)}>
                    Eliminar
                  </button>

                  <button className="btn-contrato" onClick={() => descargarContratoCompra(c.Id_Predio)}>
                    Descargar Contrato Compra
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

export default TablaCarros;
