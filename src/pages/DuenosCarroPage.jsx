import { useEffect, useState } from "react";
import TablaDuenosCarro from "../Components/tablas/TablaDuenosCarro";
import { BASE_URL } from "../config";

function DuenosCarroPage() {
  const [duenos, setDuenos] = useState([]);
  const [Id_Dueno_Carro, setIdDuenoCarro] = useState(null);

  const [Nombre, setNombre] = useState("");
  const [Apellido, setApellido] = useState("");
  const [DPI, setDPI] = useState("");
  const [Telefono, setTelefono] = useState("");
  const [Direccion, setDireccion] = useState("");
  const [Foto_DPI, setFotoDPI] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const validarFormulario = () => {
    if (!Nombre.trim()) return "El nombre del dueño es obligatorio.";

    if (DPI && !/^\d{13}$/.test(DPI)) {
      return "El DPI del dueño debe tener exactamente 13 digitos.";
    }

    return null;
  };

  const cargarDuenos = () => {
    fetch(`${BASE_URL}/dueno-carro`)
      .then((res) => res.json())
      .then((data) => setDuenos(data));
  };

  useEffect(() => {
    cargarDuenos();
  }, []);

  const convertirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFotoDPI(reader.result);
    reader.readAsDataURL(file);
  };

  const limpiar = () => {
    setIdDuenoCarro(null);
    setNombre("");
    setApellido("");
    setDPI("");
    setTelefono("");
    setDireccion("");
    setFotoDPI("");
  };

  const seleccionar = (d) => {
    setIdDuenoCarro(d.Id_Dueno_Carro);
    setNombre(d.Nombre || "");
    setApellido(d.Apellido || "");
    setDPI(d.DPI || "");
    setTelefono(d.Telefono || "");
    setDireccion(d.Direccion || "");
    setFotoDPI(d.Foto_DPI || "");
  };

  const guardar = async () => {
    const error = validarFormulario();
    if (error) return alert(error);

    const url = Id_Dueno_Carro
      ? `${BASE_URL}/dueno-carro/${Id_Dueno_Carro}`
      : `${BASE_URL}/dueno-carro`;

    const method = Id_Dueno_Carro ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Nombre,
        Apellido,
        DPI,
        Telefono,
        Direccion,
        Foto_DPI,
      }),
    });

    limpiar();
    cargarDuenos();
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
      <h1>Gestion de Dueños del Carro</h1>

      <div className="form-box">
        <h3>{Id_Dueno_Carro ? "Editar Dueño del Carro" : "Nuevo Dueño del Carro"}</h3>

        <input placeholder="Nombre del dueño" value={Nombre} onChange={(e) => setNombre(e.target.value)} />

        <input placeholder="Apellido del dueño" value={Apellido} onChange={(e) => setApellido(e.target.value)} />

        <input
          placeholder="DPI dueño (13 digitos)"
          value={DPI}
          maxLength={13}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setDPI(e.target.value);
          }}
        />

        <input
          placeholder="Telefono dueño"
          value={Telefono}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setTelefono(e.target.value);
          }}
        />

        <input placeholder="Direccion dueño" value={Direccion} onChange={(e) => setDireccion(e.target.value)} />

        <label>Foto DPI dueño:</label>
        <input type="file" accept="image/*" onChange={convertirImagen} />

        {Id_Dueno_Carro ? (
          <>
            <button className="btn-primary" onClick={guardar}>Actualizar Dueño</button>
            <button className="btn-secondary" onClick={limpiar}>Cancelar</button>
          </>
        ) : (
          <button className="btn-primary" onClick={guardar}>Guardar Dueño</button>
        )}
      </div>

      <div className="search-row">
        <input
          className="search-input-inside"
          type="text"
          placeholder="Buscar dueño..."
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
