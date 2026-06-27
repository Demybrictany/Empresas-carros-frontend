import { BASE_URL } from "../../config";
import TablaDesplegable from "./TablaDesplegable";

function TablaDuenosCarro({ duenos, seleccionar, refrescar }) {
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este dueño del carro?")) return;

    try {
      await fetch(`${BASE_URL}/dueno-carro/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      refrescar();
    } catch (error) {
      console.error("Error eliminando dueño del carro:", error);
    }
  };

  return (
    <TablaDesplegable total={duenos.length}>
      {(limite) => (
        <table className="table-modern">
          <thead>
            <tr>
              <th>ID</th>
              <th>Foto DPI</th>
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
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No hay dueños registrados
                </td>
              </tr>
            ) : (
              duenos.slice(0, limite).map((d) => (
                <tr key={d.Id_Dueno_Carro}>
                  <td>{d.Id_Dueno_Carro}</td>

                  <td>
                    {d.Foto_DPI ? (
                      <img
                        src={d.Foto_DPI}
                        alt="Foto DPI"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      />
                    ) : (
                      "Sin foto"
                    )}
                  </td>

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
