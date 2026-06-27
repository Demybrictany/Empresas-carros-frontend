import { useState, useEffect } from "react";
import TablaCarros from "../Components/tablas/TablaCarros";
import InfoSideCard from "../Components/InfoSideCard";
import { BASE_URL } from "../config";

const parseOptionalId = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

function CarroPredioPage() {
  const [carros, setCarros] = useState([]);
  const [modalData, setModalData] = useState(null);

  const [vendedores, setVendedores] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [duenosCarro, setDuenosCarro] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [Id_Predio, setId] = useState(null);

  const [Placa, setPlaca] = useState("");
  const [Modelo, setModelo] = useState("");
  const [Anio, setAnio] = useState("");
  const [FotoCarro, setFoto] = useState("");
  const [Precio_Compra, setPrecio] = useState("");

  const [Vin, setVin] = useState("");
  const [Num_Motor, setMotor] = useState("");
  const [Num_Chasis, setChasis] = useState("");
  const [Color, setColor] = useState("");

  const [Id_Vendedor, setVendedor] = useState("");
  const [Id_Dueno_Carro, setDuenoCarro] = useState("");
  const [Id_Compra, setCompra] = useState("");
  const [Tiempo_Traspaso, setTraspaso] = useState("");

  const cargarCarros = () => {
    fetch(`${BASE_URL}/carros-predio`)
      .then((res) => res.json())
      .then((data) => setCarros(Array.isArray(data) ? data : []))
      .catch(() => setCarros([]));
  };

  const cargarVendedores = () => {
    fetch(`${BASE_URL}/vendedores`)
      .then((res) => res.json())
      .then((data) => setVendedores(Array.isArray(data) ? data : []))
      .catch(() => setVendedores([]));
  };

  const cargarCompradores = () => {
    fetch(`${BASE_URL}/compradores`)
      .then((res) => res.json())
      .then((data) => setCompradores(Array.isArray(data) ? data : []))
      .catch(() => setCompradores([]));
  };

  const cargarDuenosCarro = () => {
    fetch(`${BASE_URL}/dueno-carro`)
      .then((res) => res.json())
      .then((data) => setDuenosCarro(Array.isArray(data) ? data : []))
      .catch(() => setDuenosCarro([]));
  };

  useEffect(() => {
    cargarCarros();
    cargarVendedores();
    cargarCompradores();
    cargarDuenosCarro();
  }, []);

  const convertirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFoto(reader.result);
    reader.readAsDataURL(file);
  };

  const limpiar = () => {
    setId(null);
    setPlaca("");
    setModelo("");
    setAnio("");
    setFoto("");
    setPrecio("");
    setVin("");
    setMotor("");
    setChasis("");
    setColor("");
    setVendedor("");
    setDuenoCarro("");
    setCompra("");
    setTraspaso("");
    setModalData(null);
  };

  const guardar = async () => {
    if (!Placa.trim()) return alert("La placa es obligatoria");
    if (!Vin.trim()) return alert("VIN es obligatorio");
    if (!Anio) return alert("El año es obligatorio");
    if (!Id_Dueno_Carro) return alert("Debe seleccionar el dueño del carro");

    const body = {
      Placa,
      Modelo,
      Anio: parseInt(Anio, 10),
      FotoCarro,
      Precio_Compra: Precio_Compra ? parseFloat(Precio_Compra) : 0,
      Vin,
      Num_Motor,
      Num_Chasis,
      Color,
      Tiempo_Traspaso,
      Id_Vendedor: parseOptionalId(Id_Vendedor),
      Id_Dueno_Carro: parseOptionalId(Id_Dueno_Carro),
      Id_Compra: parseOptionalId(Id_Compra),
    };

    console.log("BODY A ENVIAR:", body);

    const url = Id_Predio
      ? `${BASE_URL}/carros-predio/${Id_Predio}`
      : `${BASE_URL}/carros-predio`;

    const response = await fetch(url, {
      method: Id_Predio ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return alert(data.error || "No se pudo guardar el carro");
    }

    limpiar();
    cargarCarros();
  };

  const seleccionar = (c) => {
    setId(c.Id_Predio ?? "");
    setPlaca(c.Placa ?? "");
    setModelo(c.Modelo ?? "");
    setAnio(c.Anio ?? "");
    setFoto(c.FotoCarro ?? "");
    setPrecio(c.Precio_Compra ?? "");
    setVin(c.Vin ?? "");
    setMotor(c.Num_Motor ?? "");
    setChasis(c.Num_Chasis ?? "");
    setColor(c.Color ?? "");
    setTraspaso(c.Tiempo_Traspaso ?? "");

    setVendedor(
      c.Id_Vendedor ??
      c.id_vendedor ??
      c.IdVendedor ??
      ""
    );

    setDuenoCarro(
      c.Id_Dueno_Carro ??
      c.id_dueno_carro ??
      c.IdDuenoCarro ??
      ""
    );

    setCompra(c.Id_Compra ?? "");

    const vendedorSeleccionado = vendedores.find(
      (v) =>
        v.Id_Vendedor ===
        (c.Id_Vendedor ?? c.id_vendedor ?? c.IdVendedor)
    );

    setModalData(vendedorSeleccionado || null);
  };

  const carrosFiltrados = carros.filter((c) => {
    const texto = busqueda.toLowerCase();

    return (
      (c.Placa ?? "").toLowerCase().includes(texto) ||
      (c.Modelo ?? "").toLowerCase().includes(texto) ||
      (c.Vin ?? "").toLowerCase().includes(texto) ||
      (c.Color ?? "").toLowerCase().includes(texto)
    );
  });

  return (
    <div className="page-container">
      <h1>Carros en Predio</h1>

      <div className="form-container">
        <div className="form-box">
          <input
            placeholder="Placa"
            value={Placa}
            onChange={(e) => setPlaca(e.target.value)}
          />

          <input
            placeholder="Modelo"
            value={Modelo}
            onChange={(e) => setModelo(e.target.value)}
          />

          <input
            placeholder="Año"
            value={Anio}
            type="number"
            onChange={(e) => setAnio(e.target.value)}
          />

          <label>Foto del carro:</label>
          <input type="file" accept="image/*" onChange={convertirImagen} />

          <input
            placeholder="Precio Compra"
            type="number"
            value={Precio_Compra}
            onChange={(e) => setPrecio(e.target.value)}
          />

          <input
            placeholder="VIN"
            value={Vin}
            onChange={(e) => setVin(e.target.value)}
          />

          <input
            placeholder="Motor"
            value={Num_Motor}
            onChange={(e) => setMotor(e.target.value)}
          />

          <input
            placeholder="Chasis"
            value={Num_Chasis}
            onChange={(e) => setChasis(e.target.value)}
          />

          <input
            placeholder="Color"
            value={Color}
            onChange={(e) => setColor(e.target.value)}
          />

          <input
            placeholder="Tiempo de Traspaso"
            value={Tiempo_Traspaso}
            onChange={(e) => setTraspaso(e.target.value)}
          />

          <label>Vendedor:</label>
          <select
            value={Id_Vendedor}
            onChange={(e) => {
              const value = e.target.value;
              setVendedor(value);

              const id = parseOptionalId(value);
              const seleccionado = vendedores.find(
                (x) => x.Id_Vendedor === id
              );

              setModalData(seleccionado || null);
            }}
          >
            <option value="">Sin vendedor asignado</option>
            {vendedores.map((v) => (
              <option key={v.Id_Vendedor} value={v.Id_Vendedor}>
                {v.Nombre} - {v.Dpi || v.DPI}
              </option>
            ))}
          </select>

          <label>Dueño del carro:</label>
          <select
            value={Id_Dueno_Carro}
            onChange={(e) => setDuenoCarro(e.target.value)}
          >
            <option value="">Seleccione dueño del carro</option>
            {duenosCarro.map((d) => (
              <option key={d.Id_Dueno_Carro} value={d.Id_Dueno_Carro}>
                {d.Nombre} {d.Apellido} - {d.DPI || d.Dpi}
              </option>
            ))}
          </select>

          <label>Comprador:</label>
          <select
            value={Id_Compra}
            disabled
            style={{ backgroundColor: "#2e3b4e", color: "#ccc" }}
          >
            <option value="">
              {Id_Compra ? "Comprador asignado en una venta" : "Sin comprador"}
            </option>
            {compradores.map((c) => (
              <option key={c.Id_Compra} value={c.Id_Compra}>
                {c.Nombre} - {c.DPI}
              </option>
            ))}
          </select>

          <button className="btn-primary" onClick={guardar}>
            {Id_Predio ? "Actualizar" : "Agregar"}
          </button>
        </div>

        <InfoSideCard data={modalData} />
      </div>

      <div className="search-row">
        <input
          className="search-input-inside"
          type="text"
          placeholder="Buscar carro..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <TablaCarros
        carros={carrosFiltrados}
        seleccionar={seleccionar}
        refrescar={cargarCarros}
      />
    </div>
  );
}

export default CarroPredioPage;