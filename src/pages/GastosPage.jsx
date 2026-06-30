import { useState, useEffect } from "react";
import TablaGastos from "../Components/tablas/TablaGastos";
import { apiJson } from "../utils/api";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";

function GastosPage() {
  const [gastos, setGastos] = useState([]);
  const [carros, setCarros] = useState([]);

  const [Id_Gastos, setId] = useState(null);
  const [Descripcion, setDescripcion] = useState("");
  const [Monto, setMonto] = useState("");
  const [Fecha, setFecha] = useState("");
  const [Id_Predio, setIdPredio] = useState("");
  const [guardando, setGuardando] = useState(false);

  
  useEffect(() => {
    cargarGastos();
    cargarCarros();
  }, []);

  const cargarGastos = () => {
    apiJson("/gastos")
      .then((data) => setGastos(data));
  };

  const cargarCarros = () => {
    apiJson("/carros-predio")
      .then((data) => setCarros(data));
  };

  const limpiar = () => {
    setId(null);
    setDescripcion("");
    setMonto("");
    setFecha("");
    setIdPredio("");
  };

  const guardar = async () => {
    if (guardando) return;

    if (!Descripcion.trim()) return warning("La descripcion es obligatoria.");
    if (!Monto) return warning("El monto es obligatorio.");
    if (!Fecha) return warning("La fecha es obligatoria.");

    const body = {
      Descripcion,
      Monto: parseFloat(Monto),
      Fecha,
      Id_Predio: Id_Predio ? parseInt(Id_Predio) : null
    };

    const url = Id_Gastos
      ? `/gastos/${Id_Gastos}`
      : `/gastos`;

    try {
      setGuardando(true);
      await apiJson(url, {
        method: Id_Gastos ? "PUT" : "POST",
        body: JSON.stringify(body)
      });

      success(Id_Gastos ? "Registro actualizado correctamente." : "Registro creado correctamente.");
      limpiar();
      cargarGastos();
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const seleccionar = (g) => {
    setId(g.Id_Gastos);
    setDescripcion(g.Descripcion);
    setMonto(g.Monto);
    setFecha(g.Fecha);
    setIdPredio(g.Id_Predio || "");
  };

  return (
    <div className="page-container">
      <h1>Gestión de Gastos</h1>

      <div className="form-box">

        <input
          placeholder="Descripción"
          value={Descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <input
          type="number"
          placeholder="Monto"
          value={Monto}
          onChange={(e) => setMonto(e.target.value)}
        />

        <input
          type="date"
          value={Fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <label>Carro (opcional)</label>
        <select value={Id_Predio} onChange={(e) => setIdPredio(e.target.value)}>
          <option value="">Gasto general</option>
          {carros.map((c) => (
            <option key={c.Id_Predio} value={c.Id_Predio}>
              {c.Placa} - {c.Modelo}
            </option>
          ))}
        </select>

        <button className="btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : Id_Gastos ? "Actualizar" : "Agregar"}
        </button>

      </div>

      <TablaGastos gastos={gastos} seleccionar={seleccionar} refrescar={cargarGastos} />
    </div>
  );
}

export default GastosPage;
