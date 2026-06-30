import { useEffect, useState } from "react";
import TablaColaboradores from "../Components/tablas/TablaColaboradores";
import { apiJson } from "../utils/api";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";

function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState([]);
  const [Id_Colaborador, setIdColaborador] = useState(null);
  const [Nombre, setNombre] = useState("");
  const [Apellido, setApellido] = useState("");
  const [DPI, setDPI] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);

  const validarDPI = (dpi) => /^\d{13}$/.test(dpi);

  const cargarColaboradores = async () => {
    try {
      const data = await apiJson("/colaboradores");
      setColaboradores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando colaboradores:", err);
      setColaboradores([]);
    }
  };

  useEffect(() => {
    cargarColaboradores();
  }, []);

  const seleccionar = (c) => {
    setIdColaborador(c.Id_Colaborador);
    setNombre(c.Nombre || "");
    setApellido(c.Apellido || "");
    setDPI(c.DPI || "");
  };

  const limpiar = () => {
    setIdColaborador(null);
    setNombre("");
    setApellido("");
    setDPI("");
  };

  const validarFormulario = () => {
    if (!Nombre.trim() || !Apellido.trim()) return "Nombre y apellido son obligatorios.";
    if (!validarDPI(DPI)) return "El DPI debe tener exactamente 13 digitos.";
    return null;
  };

  const guardar = async () => {
    if (guardando) return;

    const validationError = validarFormulario();
    if (validationError) return warning(validationError);

    try {
      setGuardando(true);
      await apiJson(Id_Colaborador ? `/colaboradores/${Id_Colaborador}` : "/colaboradores", {
        method: Id_Colaborador ? "PUT" : "POST",
        body: JSON.stringify({ Nombre, Apellido, DPI }),
      });

      success(Id_Colaborador ? "Registro actualizado correctamente." : "Registro creado correctamente.");
      limpiar();
      cargarColaboradores();
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const colaboradoresFiltrados = colaboradores.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      (c.Nombre || "").toLowerCase().includes(texto) ||
      (c.Apellido || "").toLowerCase().includes(texto) ||
      String(c.DPI || "").toLowerCase().includes(texto)
    );
  });

  return (
    <div className="page-container">
      <h1>Gestion de Colaboradores</h1>

      <div className="form-box">
        <h3>{Id_Colaborador ? "Editar Colaborador" : "Nuevo Colaborador"}</h3>

        <input placeholder="Nombre" value={Nombre} onChange={(e) => setNombre(e.target.value)} />
        <input placeholder="Apellido" value={Apellido} onChange={(e) => setApellido(e.target.value)} />
        <input
          placeholder="DPI (13 digitos)"
          value={DPI}
          maxLength={13}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setDPI(e.target.value);
          }}
        />

        {Id_Colaborador ? (
          <>
            <button className="btn-primary" onClick={guardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Actualizar"}
            </button>
            <button className="btn-secondary" onClick={limpiar} disabled={guardando}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Agregar"}
          </button>
        )}
      </div>

      <div className="search-row">
        <input
          className="search-input-inside"
          type="text"
          placeholder="Buscar colaborador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <TablaColaboradores
        colaboradores={colaboradoresFiltrados}
        seleccionar={seleccionar}
        refrescar={cargarColaboradores}
      />
    </div>
  );
}

export default ColaboradoresPage;
