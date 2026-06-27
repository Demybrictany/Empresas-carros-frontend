import { BASE_URL } from "../../config";
import TablaDesplegable from "./TablaDesplegable";

function TablaCarros({ carros, seleccionar, refrescar }) {

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este carro?")) return;

    await fetch(`${BASE_URL}/carros-predio/${id}`, {
      method: "DELETE",
    });

    refrescar();
  };

  return (
    <TablaDesplegable total={carros.length}>
      {(limite) => (
    <table className="table-modern">
      <thead>
        <tr>
          <th>Id</th>
          <th>Foto</th>
          <th>Placa</th>
          <th>Modelo</th>
          <th>Año</th>
          <th>Color</th>
          <th>VIN</th>
          <th>Motor</th>
          <th>Chasis</th>
          <th>Vendedor</th>
          <th>Comprador</th>
          <th>Días Traspaso</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {carros.slice(0, limite).map((c) => (
          <tr key={c.Id_Predio}>

            <td>{c.Id_Predio}</td>

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
              {c.Vendedor
                ? `${c.Vendedor.Nombre} (${c.Vendedor.Dpi})`
                : "No asignado"}
            </td>

            <td>
              {c.Comprador
                ? `${c.Comprador.Nombre} (${c.Comprador.DPI})`
                : "Sin comprador"}
            </td>

            <td>{c.Tiempo_Traspaso ?? "—"}</td>

            <td>
              <button
                className="btn-edit"
                onClick={() => seleccionar(c)}
              >
                Editar
              </button>

              <button
                className="btn-delete"
                onClick={() => eliminar(c.Id_Predio)}
              >
                Eliminar
              </button>

              <button
                className="btn-contrato"
                onClick={() =>
                  window.open(
                    `${BASE_URL}/contrato-compra-carro/${c.Id_Predio}`,
                    "_blank"
                  )
                }
              >
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
