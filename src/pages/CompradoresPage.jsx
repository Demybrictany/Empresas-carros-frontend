import { useEffect, useState } from "react";
import TablaCompradores from "../Components/tablas/TablaCompradores";
import { apiJson } from "../utils/api";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";

function CompradoresPage() {
  const [compradores, setCompradores] = useState([]);
  const [Id_Compra, setIdCompra] = useState(null);
  const [Nombre, setNombre] = useState("");
  const [Apellido, setApellido] = useState("");
  const [DPI, setDPI] = useState("");
  const [Telefono, setTelefono] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const validarFormulario = () => {
    if (!Nombre.trim()) return "El nombre es obligatorio.";
    if (!Apellido.trim()) return "El apellido es obligatorio.";
    if (!/^\d{13}$/.test(DPI)) return "El DPI debe tener exactamente 13 digitos.";
    if (Telefono && !/^\d{8}$/.test(Telefono)) return "El telefono debe tener 8 digitos.";
    return null;
  };

  const cargarCompradores = () => {
    apiJson("/compradores")
      .then((data) => setCompradores(Array.isArray(data) ? data : []))
      .catch((err) => error(backendErrorMessage(err)));
  };

  useEffect(() => {
    cargarCompradores();
  }, []);

  const seleccionarComprador = (c) => {
    setIdCompra(c.Id_Compra);
    setNombre(c.Nombre || "");
    setApellido(c.Apellido || "");
    setDPI(c.DPI || "");
    setTelefono(c.Telefono || "");
  };

  const limpiar = () => {
    setIdCompra(null);
    setNombre("");
    setApellido("");
    setDPI("");
    setTelefono("");
  };

  const payload = () => ({ Nombre, Apellido, DPI, Telefono });

  const agregar = async () => {
    const validationError = validarFormulario();
    if (validationError) return warning(validationError);

    try {
      await apiJson("/compradores", {
        method: "POST",
        body: JSON.stringify(payload()),
      });
      success("Registro creado correctamente.");
      limpiar();
      cargarCompradores();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  const actualizar = async () => {
    const validationError = validarFormulario();
    if (validationError) return warning(validationError);

    try {
      await apiJson(`/compradores/${Id_Compra}`, {
        method: "PUT",
        body: JSON.stringify(payload()),
      });
      success("Registro actualizado correctamente.");
      limpiar();
      cargarCompradores();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  const compradoresFiltrados = compradores.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      (c.Nombre || "").toLowerCase().includes(texto) ||
      (c.Apellido || "").toLowerCase().includes(texto) ||
      (c.DPI || "").toLowerCase().includes(texto) ||
      (c.Telefono || "").toLowerCase().includes(texto)
    );
  });

  return (
    <div className="page-container">
      <h1>Gestion de Compradores</h1>

      <div className="form-box">
        <h3>{Id_Compra ? "Editar Comprador" : "Nuevo Comprador"}</h3>

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

        <input
          placeholder="Telefono"
          value={Telefono}
          maxLength={8}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setTelefono(e.target.value);
          }}
        />

        {Id_Compra ? (
          <>
            <button className="btn-primary" onClick={actualizar}>
              Actualizar
            </button>
            <button className="btn-secondary" onClick={limpiar}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={agregar}>
            Agregar
          </button>
        )}
      </div>

      <div className="search-row">
        <input
          className="search-input-inside"
          type="text"
          placeholder="Buscar compradores..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <TablaCompradores
        compradores={compradoresFiltrados}
        seleccionarComprador={seleccionarComprador}
        refrescar={cargarCompradores}
      />
    </div>
  );
}

export default CompradoresPage;
