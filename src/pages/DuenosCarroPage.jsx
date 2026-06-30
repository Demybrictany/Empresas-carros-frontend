import { useEffect, useState } from "react";
import TablaDuenosCarro from "../Components/tablas/TablaDuenosCarro";
import { apiJson } from "../utils/api";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";

function DuenosCarroPage() {
  const [duenos, setDuenos] = useState([]);
  const [Id_Dueno_Carro, setIdDuenoCarro] = useState(null);

  const [Nombre, setNombre] = useState("");
  const [Apellido, setApellido] = useState("");
  const [DPI, setDPI] = useState("");
  const [Telefono, setTelefono] = useState("");
  const [Direccion, setDireccion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);

  const validarFormulario = () => {
    if (!Nombre.trim()) return "El nombre del dueno es obligatorio.";
    if (DPI && !/^\d{13}$/.test(DPI)) return "El DPI del dueno debe tener exactamente 13 digitos.";
    return null;
  };

  const cargarDuenos = () => {
    apiJson("/dueno-carro")
      .then((data) => setDuenos(Array.isArray(data) ? data : []))
      .catch(() => setDuenos([]));
  };

  useEffect(() => {
    cargarDuenos();
  }, []);

  const limpiar = () => {
    setIdDuenoCarro(null);
    setNombre("");
    setApellido("");
    setDPI("");
    setTelefono("");
    setDireccion("");
  };

  const seleccionar = (d) => {
    setIdDuenoCarro(d.Id_Dueno_Carro);
    setNombre(d.Nombre || "");
    setApellido(d.Apellido || "");
    setDPI(d.DPI || "");
    setTelefono(d.Telefono || "");
    setDireccion(d.Direccion || "");
  };

  const guardar = async () => {
    if (guardando) return;

    const validationError = validarFormulario();
    if (validationError) return warning(validationError);

    const url = Id_Dueno_Carro ? `/dueno-carro/${Id_Dueno_Carro}` : "/dueno-carro";
    const method = Id_Dueno_Carro ? "PUT" : "POST";

    try {
      setGuardando(true);
      await apiJson(url, {
        method,
        body: JSON.stringify({
          Nombre,
          Apellido,
          DPI,
          Telefono,
          Direccion,
        }),
      });

      success(Id_Dueno_Carro ? "Registro actualizado correctamente." : "Registro creado correctamente.");
      limpiar();
      cargarDuenos();
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const duenosFiltrados = duenos.filter((d) => {
    const texto = busqueda.toLowerCase();

    return (
      (d.Nombre || "").toLowerCase().includes(texto) ||
      (d.Apellido || "").toLowerCase().includes(texto) ||
      (d.DPI || "").toLowerCase().includes(texto) ||
      (d.Telefono || "").toLowerCase().includes(texto) ||
      (d.Direccion || "").toLowerCase().includes(texto)
    );
  });

  return (
    <div className="page-container">
      <h1>Gestion de Duenos del Carro</h1>

      <div className="form-box">
        <h3>{Id_Dueno_Carro ? "Editar Dueno del Carro" : "Nuevo Dueno del Carro"}</h3>

        <input placeholder="Nombre del dueno" value={Nombre} onChange={(e) => setNombre(e.target.value)} />
        <input placeholder="Apellido del dueno" value={Apellido} onChange={(e) => setApellido(e.target.value)} />

        <input
          placeholder="DPI dueno (13 digitos)"
          value={DPI}
          maxLength={13}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setDPI(e.target.value);
          }}
        />

        <input
          placeholder="Telefono dueno"
          value={Telefono}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setTelefono(e.target.value);
          }}
        />

        <input placeholder="Direccion dueno" value={Direccion} onChange={(e) => setDireccion(e.target.value)} />

        {Id_Dueno_Carro ? (
          <>
            <button className="btn-primary" onClick={guardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Actualizar Dueno"}
            </button>
            <button className="btn-secondary" onClick={limpiar} disabled={guardando}>Cancelar</button>
          </>
        ) : (
          <button className="btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar Dueno"}
          </button>
        )}
      </div>

      <div className="search-row">
        <input
          className="search-input-inside"
          type="text"
          placeholder="Buscar dueno..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <TablaDuenosCarro
        duenos={duenosFiltrados}
        seleccionar={seleccionar}
        refrescar={cargarDuenos}
      />
    </div>
  );
}

export default DuenosCarroPage;
