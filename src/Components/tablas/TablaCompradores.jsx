import { BASE_URL } from "../../config";
import TablaDesplegable from "./TablaDesplegable";
function TablaCompradores({ compradores, seleccionarComprador, refrescar }) {


  const eliminar = async (id) => {
    await fetch(`${BASE_URL}/compradores/${id}`, {
      method: "DELETE",
    });
    refrescar();
  };

  return (
    <TablaDesplegable total={compradores.length}>
      {(limite) => (
    <table className="table-modern">
      <thead>
        <tr>
          <th>Foto DPI</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>DPI</th>
          <th>Teléfono</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {compradores.slice(0, limite).map((c) => (
          <tr key={c.Id_Compra}>
            <td>
              {c.Foto_DPI ? (
                <img
                  src={c.Foto_DPI}
                  alt="Foto DPI"
                  width="60"
                  style={{ borderRadius: "6px" }}
                />
              ) : (
                "Sin foto"
              )}
            </td>

            <td>{c.Nombre}</td>
            <td>{c.Apellido}</td>
            <td>{c.DPI}</td>
            <td>{c.Telefono}</td>

            <td>
              <button
                className="btn-edit"
                onClick={() => seleccionarComprador(c)}
              >
                Editar
              </button>

              <button
                className="btn-delete"
                onClick={() => eliminar(c.Id_Compra)}
              >
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
