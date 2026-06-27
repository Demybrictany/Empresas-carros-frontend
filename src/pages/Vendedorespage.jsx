import { useState, useEffect } from "react";
import TablaVendedores from "../Components/tablas/TablaVendedores";
import { BASE_URL } from "../config";

function VendedoresPage() {
  const [vendedores, setVendedores] = useState([]);
  const [Id_Vendedor, setId] = useState(null);

  const [Nombre, setNombre] = useState("");
  const [Telefono, setTelefono] = useState("");
  const [Dpi, setDpi] = useState("");
  const [Foto_DPI, setFotoDPI] = useState("");
  const [Direccion, setDireccion] = useState("");
  const [RelacionDueno, setRelacion] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const validarFormulario = () => {
    if (!Nombre.trim()) return "El nombre del vendedor es obligatorio.";
    if (!Telefono.trim()) return "El telefono del vendedor es obligatorio.";
    if (!/^\d{13}$/.test(Dpi)) return "El DPI del vendedor debe tener exactamente 13 digitos.";
    return null;
  };

  const cargarVendedores = () => {
    fetch(`${BASE_URL}/vendedores`)
      .then((res) => res.json())
      .then((data) => setVendedores(data));
  };

  useEffect(() => {
    cargarVendedores();
  }, []);

  const convertirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFotoDPI(reader.result);
    reader.readAsDataURL(file);
  };

  const limpiar = () => {
    setId(null);
    setNombre("");
    setTelefono("");
    setDpi("");
    setFotoDPI("");
    setDireccion("");
    setRelacion("");
  };

  const seleccionar = (v) => {
    setId(v.Id_Vendedor);
    setNombre(v.Nombre || "");
    setTelefono(v.Telefono || "");
    setDpi(v.Dpi || "");
    setFotoDPI(v.Foto_DPI || "");
    setDireccion(v.Direccion || "");
    setRelacion(v.Relacion_Dueno || v.Relacion_Dueño || "");
  };

  const crearBody = () => ({
    Nombre,
    Telefono,
    Dpi,
    Foto_DPI,
    Direccion,
    Relacion_Dueno: RelacionDueno,
    Relacion_Dueño: RelacionDueno,
  });

  const agregar = async () => {
    const error = validarFormulario();
    if (error) return alert(error);

    await fetch(`${BASE_URL}/vendedores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(crearBody()),
    });

    limpiar();
    cargarVendedores();
  };

  const actualizar = async () => {
    const error = validarFormulario();
    if (error) return alert(error);

    await fetch(`${BASE_URL}/vendedores/${Id_Vendedor}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(crearBody()),
    });

    limpiar();
    cargarVendedores();
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

        <label>Foto DPI:</label>
        <input type="file" accept="image/*" onChange={convertirImagen} />

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
            <button className="btn-primary" onClick={actualizar}>Actualizar</button>
            <button className="btn-secondary" onClick={limpiar}>Cancelar</button>
          </>
        ) : (
          <button className="btn-primary" onClick={agregar}>Agregar</button>
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
