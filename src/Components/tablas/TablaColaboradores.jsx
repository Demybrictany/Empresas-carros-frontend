import { BASE_URL } from "../../config";
import TablaDesplegable from "./TablaDesplegable";

function TablaColaboradores({ colaboradores, seleccionar, refrescar }) {

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar colaborador?")) return;

    await fetch(`${BASE_URL}/colaboradores/${id}`, {
      method: "DELETE",
    });

    refrescar();
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

              <button
                className="btn-delete"
                onClick={() => eliminar(c.Id_Colaborador)}
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

export default TablaColaboradores;
