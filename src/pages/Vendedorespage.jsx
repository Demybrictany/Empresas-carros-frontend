import { useState, useEffect } from "react";
import TablaVendedores from "../Components/tablas/TablaVendedores";
import { apiJson } from "../utils/api";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";

function VendedoresPage() {
  const [vendedores, setVendedores] = useState([]);
  const [Id_Vendedor, setId] = useState(null);

  const [Nombre, setNombre] = useState("");
  const [Telefono, setTelefono] = useState("");
  const [Dpi, setDpi] = useState("");
  const [Direccion, setDireccion] = useState("");
  const [RelacionDueno, setRelacion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);

  const validarFormulario = () => {
    if (!Nombre.trim()) return "El nombre del vendedor es obligatorio.";
    if (!Telefono.trim()) return "El telefono del vendedor es obligatorio.";
    if (!/^\d{13}$/.test(Dpi)) return "El DPI del vendedor debe tener exactamente 13 digitos.";
    return null;
  };

  const cargarVendedores = () => {
    apiJson("/vendedores")
      .then((data) => setVendedores(data));
  };

  useEffect(() => {
    cargarVendedores();
  }, []);

  const limpiar = () => {
    setId(null);
    setNombre("");
    setTelefono("");
    setDpi("");
    setDireccion("");
    setRelacion("");
  };

  const seleccionar = (v) => {
    setId(v.Id_Vendedor);
    setNombre(v.Nombre || "");
    setTelefono(v.Telefono || "");
    setDpi(v.Dpi || "");
    setDireccion(v.Direccion || "");
    setRelacion(v.Relacion_Dueno || v.Relacion_Dueño || "");
  };

  const crearBody = () => ({
    Nombre,
    Telefono,
    Dpi,
    Direccion,
    Relacion_Dueno: RelacionDueno,
    Relacion_Dueño: RelacionDueno,
  });

  const agregar = async () => {
    if (guardando) return;

    const validationError = validarFormulario();
    if (validationError) return warning(validationError);

    try {
      setGuardando(true);
      await apiJson("/vendedores", {
        method: "POST",
        body: JSON.stringify(crearBody()),
      });

      success("Registro creado correctamente.");
      limpiar();
      cargarVendedores();
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const actualizar = async () => {
    if (guardando) return;

    const validationError = validarFormulario();
    if (validationError) return warning(validationError);

    try {
      setGuardando(true);
      await apiJson(`/vendedores/${Id_Vendedor}`, {
        method: "PUT",
        body: JSON.stringify(crearBody()),
      });

      success("Registro actualizado correctamente.");
      limpiar();
      cargarVendedores();
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const vendedoresFiltrados = vendedores.filter((v) => {
    const texto = busqueda.toLowerCase();
    const relacion = v.Relacion_Dueno || v.Relacion_Dueño || "";

    return (
      (v.Nombre || "").toLowerCase().includes(texto) ||
      (v.Telefono || "").toLowerCase().includes(texto) ||
      (v.Dpi || "").toLowerCase().includes(texto) ||
      (v.Direccion || "").toLowerCase().includes(texto) ||
      relacion.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="page-container">
      <h1>Gestion de Vendedores</h1>

      <div className="form-box">
        <h3>{Id_Vendedor ? "Editar Vendedor" : "Nuevo Vendedor"}</h3>

        <input placeholder="Nombre" value={Nombre} onChange={(e) => setNombre(e.target.value)} />

        <input
          placeholder="Telefono"
          value={Telefono}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setTelefono(e.target.value);
          }}
        />

        <input
          placeholder="DPI (13 digitos)"
          value={Dpi}
          maxLength={13}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setDpi(e.target.value);
          }}
        />

        <input placeholder="Direccion" value={Direccion} onChange={(e) => setDireccion(e.target.value)} />

        <select value={RelacionDueno} onChange={(e) => setRelacion(e.target.value)}>
          <option value="">Seleccione relacion</option>
          <option value="Mismo dueño">Mismo dueño</option>
          <option value="Hermano">Hermano</option>
          <option value="Padre">Padre</option>
          <option value="Madre">Madre</option>
          <option value="Amigo">Amigo</option>
          <option value="Intermediario">Intermediario</option>
        </select>

        {Id_Vendedor ? (
          <>
            <button className="btn-primary" onClick={actualizar} disabled={guardando}>
              {guardando ? "Guardando..." : "Actualizar"}
            </button>
            <button className="btn-secondary" onClick={limpiar} disabled={guardando}>Cancelar</button>
          </>
        ) : (
          <button className="btn-primary" onClick={agregar} disabled={guardando}>
            {guardando ? "Guardando..." : "Agregar"}
          </button>
        )}
      </div>

      <div className="search-row">
        <input
          className="search-input-inside"
          type="text"
          placeholder="Buscar vendedor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <TablaVendedores
        vendedores={vendedoresFiltrados}
        seleccionar={seleccionar}
        refrescar={cargarVendedores}
      />
    </div>
  );
}

export default VendedoresPage;
