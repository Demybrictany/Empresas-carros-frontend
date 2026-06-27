import { BASE_URL } from "../../config";
import TablaDesplegable from "./TablaDesplegable";

function TablaVendedores({ vendedores, seleccionar, refrescar }) {

  const eliminar = async (id) => {

    if (!window.confirm("¿Eliminar este vendedor?")) return;

    try {

      await fetch(`${BASE_URL}/vendedores/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      refrescar();

    } catch (error) {

      console.error("Error eliminando vendedor:", error);

    }
  };

  return (
    <TablaDesplegable total={vendedores.length}>
      {(limite) => (
    <table className="table-modern">

      <thead>

        <tr>
          <th>ID</th>
          <th>Foto DPI</th>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>DPI</th>
          <th>Dirección</th>
          <th>Relación</th>
          <th>Acciones</th>
        </tr>

      </thead>

      <tbody>

        {vendedores.length === 0 ? (

          <tr>
            <td colSpan="8" style={{ textAlign: "center" }}>
              No hay vendedores registrados
            </td>
          </tr>

        ) : (

          vendedores.slice(0, limite).map((v) => (

            <tr key={v.Id_Vendedor}>

              <td>{v.Id_Vendedor}</td>

              <td>
                {v.Foto_DPI ? (
                  <img
                    src={v.Foto_DPI}
                    alt="Foto DPI"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                  />
                ) : (
                  "Sin foto"
                )}
              </td>

              <td>{v.Nombre}</td>
              <td>{v.Telefono}</td>
              <td>{v.Dpi}</td>
              <td>{v.Direccion}</td>
              <td>{v.Relacion_Dueno}</td>

              <td>

                <button
                  className="btn-edit"
                  onClick={() => seleccionar(v)}
                >
                  Editar
                </button>

                <button
                  className="btn-delete"
                  onClick={() => eliminar(v.Id_Vendedor)}
                >
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
