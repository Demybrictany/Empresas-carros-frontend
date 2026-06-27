import { BASE_URL } from "../../config";
import TablaDesplegable from "./TablaDesplegable";
function TablaGastos({ gastos, seleccionar, refrescar }) {

  const eliminar = async (id) => {
    await fetch(`${BASE_URL}/gastos/${id}`, {
      method: "DELETE"
    });
    refrescar();
  };

  return (
    <TablaDesplegable total={gastos.length}>
      {(limite) => (
    <table className="table-modern">
      <thead>
        <tr>
          <th>ID</th>
          <th>Descripción</th>
          <th>Monto</th>
          <th>Fecha</th>
          <th>Carro</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {gastos.slice(0, limite).map((g) => (
          <tr key={g.Id_Gastos}>
            <td>{g.Id_Gastos}</td>
            <td>{g.Descripcion}</td>
            <td>Q {g.Monto}</td>
            <td>{g.Fecha}</td>
            <td>{g.Carro ? `${g.Carro.Placa} - ${g.Carro.Modelo}` : "General"}</td>
            <td>
              <button className="btn-edit" onClick={() => seleccionar(g)}>Editar</button>
              <button className="btn-delete" onClick={() => eliminar(g.Id_Gastos)}>Eliminar</button>
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
