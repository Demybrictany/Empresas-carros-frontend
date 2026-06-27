import { useState, useEffect, useCallback } from "react";
import TablaVentas from "../Components/tablas/TablaVentas";
import { BASE_URL } from "../config";

function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [carros, setCarros] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [listaColaboradores, setListaColaboradores] = useState([]);

  const [Id_Venta, setIdVenta] = useState(null);
  const [Id_Predio, setIdPredio] = useState("");
  const [Id_Compra, setIdCompra] = useState("");

  const [Fecha, setFecha] = useState("");
  const [PrecioVenta, setPrecioVenta] = useState("");
  const [Comision, setComision] = useState("0.00");
  const [DiasContrato, setDiasContrato] = useState("");

  const [colaboradores, setColaboradores] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const API = `${BASE_URL}`;

  const cargarVentas = useCallback(async () => {
    try {
      const res = await fetch(`${API}/ventas`);
      const data = await res.json();
      setVentas(data);
    } catch (error) {
      console.error("Error cargando ventas", error);
    }
  }, [API]);

  const cargarCarros = useCallback(async () => {
    try {
      const res = await fetch(`${API}/carros-predio`);
      const data = await res.json();
      setCarros(data);
    } catch (error) {
      console.error("Error cargando carros", error);
    }
  }, [API]);

  const cargarCompradores = useCallback(async () => {
    try {
      const res = await fetch(`${API}/compradores`);
      const data = await res.json();
      setCompradores(data);
    } catch (error) {
      console.error("Error cargando compradores", error);
    }
  }, [API]);

  const cargarColaboradores = useCallback(async () => {
    try {
      const res = await fetch(`${API}/colaboradores`);
      const data = await res.json();
      setListaColaboradores(data);
    } catch (error) {
      console.error("Error cargando colaboradores", error);
    }
  }, [API]);

  useEffect(() => {
    cargarVentas();
    cargarCarros();
    cargarCompradores();
    cargarColaboradores();
  }, [cargarVentas, cargarCarros, cargarCompradores, cargarColaboradores]);

  useEffect(() => {
    const total = colaboradores.reduce(
      (suma, c) => suma + Number(c.comision || 0),
      0
    );

    setComision(total.toFixed(2));
  }, [colaboradores]);

  const agregarColaborador = () => {
    setColaboradores([
      ...colaboradores,
      {
        id_colaborador: "",
        comision: "",
        rol: "Vendedor",
      },
    ]);
  };

  const eliminarColaborador = (index) => {
    setColaboradores(colaboradores.filter((_, i) => i !== index));
  };

  const actualizarColaborador = (index, campo, valor) => {
    const copia = [...colaboradores];
    copia[index][campo] = valor;
    setColaboradores(copia);
  };

  const limpiar = () => {
    setIdVenta(null);
    setIdPredio("");
    setIdCompra("");
    setFecha("");
    setPrecioVenta("");
    setComision("0.00");
    setDiasContrato("");
    setColaboradores([]);
  };

  const seleccionar = (v) => {
    setIdVenta(v.Id_Venta || v.id_venta || v.id || null);
    setIdPredio(v.Id_Predio || v.id_predio || v.IdPredio || v.idPredio || "");
    setIdCompra(v.Id_Compra || v.id_compra || v.IdCompra || v.idCompra || "");
    setFecha(v.Fecha || v.fecha || "");
    setPrecioVenta(v.PrecioVenta || v.precioVenta || "");
    setComision(v.Comision || v.comision || "0.00");
    setDiasContrato(v.DiasContrato || v.diasContrato || "");
    
    // Obtener colaboradores desde venta_colaborador (flexible con diferentes nombres)
    const colabs = v.venta_colaboradores || v.venta_colaborador || v.colaboradores || v.Colaboradores || [];
    setColaboradores(
      colabs.map((col) => ({
        id_colaborador: col.id_colaborador || col.Id_Colaborador || col.ColaboradorId || col.colaboradorId || "",
        comision: col.comision || col.Comision || "",
        rol: col.rol || col.Rol || "Vendedor",
      }))
    );
  };

  const guardar = async () => {
    if (!Id_Predio) return alert("Debe seleccionar un carro.");
    if (!Id_Compra) return alert("Debe seleccionar un comprador.");
    if (!Fecha) return alert("Debe ingresar la fecha.");
    if (!PrecioVenta) return alert("Debe ingresar el precio de venta.");

    const hoy = new Date();
    if (new Date(Fecha) > hoy) {
      return alert("La fecha no puede ser mayor a hoy.");
    }

    const colaboradoresValidos = colaboradores.filter(
      (c) => c.id_colaborador && c.comision !== "" && c.comision !== null && c.comision !== undefined
    );

    if (colaboradores.length !== colaboradoresValidos.length) {
      return alert(
        "Si agrega un colaborador, debe seleccionar el colaborador y colocar su comisión."
      );
    }

    const repetidos = colaboradoresValidos.some(
      (c, index, array) =>
        array.findIndex((x) => x.id_colaborador === c.id_colaborador) !== index
    );

    if (repetidos) {
      return alert("No puede agregar el mismo colaborador dos veces.");
    }

    const colaboradoresPayload = colaboradoresValidos.map((c) => ({
      Id_Colaborador: parseInt(c.id_colaborador),
      Comision: parseFloat(c.comision),
      Rol: c.rol || "Vendedor",
    }));

    const body = {
      Id_Predio: parseInt(Id_Predio),
      Id_Compra: parseInt(Id_Compra),
      Fecha,
      PrecioVenta: parseFloat(PrecioVenta),
      Comision: parseFloat(Comision),
      DiasContrato: DiasContrato ? parseInt(DiasContrato) : null,
      Colaboradores: colaboradoresPayload,
    };

    // Debug: muestra estructura que se enviará
    console.log("📤 Payload a enviar:", JSON.stringify(body, null, 2));

    const metodo = Id_Venta ? "PUT" : "POST";
    const url = Id_Venta ? `${API}/ventas/${Id_Venta}` : `${API}/ventas`;

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("❌ Error: " + data.error);
        return;
      }

      alert("✅ Venta registrada correctamente");
      limpiar();
      cargarVentas();
      window.dispatchEvent(new Event("ventasActualizadas"));
    } catch (error) {
      alert("❌ Error al registrar venta");
      console.error(error);
    }
  };

  const ventasFiltradas = ventas
    .map((v) => {
      const carro = carros.find((c) => c.Id_Predio === v.Id_Predio);
      const comprador = compradores.find((c) => c.Id_Compra === v.Id_Compra);

      return {
        ...v,
        Placa: carro?.Placa || "",
        Modelo: carro?.Modelo || "",
        NombreComprador: comprador?.Nombre || "",
      };
    })
    .filter((v) => {
      const texto = busqueda.toLowerCase();

      return (
        (v.Placa || "").toLowerCase().includes(texto) ||
        (v.Modelo || "").toLowerCase().includes(texto) ||
        (v.NombreComprador || "").toLowerCase().includes(texto) ||
        (v.Fecha || "").toLowerCase().includes(texto)
      );
    });

  return (
    <div className="page-container">
      <h1>Registro de Ventas</h1>

      <div className="form-box">
        <label>Carro</label>
        <select value={Id_Predio} onChange={(e) => setIdPredio(e.target.value)}>
          <option value="">Seleccione un carro</option>
          {carros.map((c) => (
            <option key={c.Id_Predio} value={c.Id_Predio}>
              {c.Placa} — {c.Modelo}
            </option>
          ))}
        </select>

        <label>Comprador</label>
        <select value={Id_Compra} onChange={(e) => setIdCompra(e.target.value)}>
          <option value="">Seleccione comprador</option>
          {compradores.map((c) => (
            <option key={c.Id_Compra} value={c.Id_Compra}>
              {c.Nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={Fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <input
          type="number"
          placeholder="Precio Venta"
          value={PrecioVenta}
          onChange={(e) => setPrecioVenta(e.target.value)}
        />

        <label>Comisión total</label>
        <input
          type="number"
          value={Comision}
          readOnly
          style={{
            backgroundColor: "#e9ecef",
            cursor: "not-allowed",
            fontWeight: "bold",
          }}
        />

        <div>
          <label>Días para contrato (opcional)</label>
          <input
            type="number"
            value={DiasContrato}
            onChange={(e) => setDiasContrato(e.target.value)}
            placeholder="Ej: 15"
          />
        </div>

        <h3>Colaboradores</h3>

        {colaboradores.map((c, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "12px",
              alignItems: "center",
            }}
          >
            <select
              value={c.id_colaborador}
              onChange={(e) =>
                actualizarColaborador(index, "id_colaborador", e.target.value)
              }
              style={{ flex: 1, padding: "8px" }}
            >
              <option value="">Seleccione colaborador</option>
              {listaColaboradores.map((col) => (
                <option key={col.Id_Colaborador} value={col.Id_Colaborador}>
                  {col.Nombre} {col.Apellido}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Comisión"
              value={c.comision}
              onChange={(e) =>
                actualizarColaborador(index, "comision", e.target.value)
              }
              style={{ flex: 0.6, padding: "8px" }}
            />

            <button
              type="button"
              onClick={() => eliminarColaborador(index)}
              aria-label="Eliminar colaborador"
              style={{
                background: "rgba(240, 28, 28, 0.14)",
                border: "1px solid rgba(214, 0, 0, 0.28)",
                color: "#d60000",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🗑️
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={agregarColaborador}
          style={{
            background: "rgba(0,150,255,0.14)",
            border: "1px solid rgba(0,150,255,0.32)",
            color: "#007acc",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "8px",
            marginBottom: "18px",
            display: "inline-block",
          }}
        >
          + Agregar colaborador
        </button>

        <button className="btn-primary" onClick={guardar}>
          {Id_Venta ? "Actualizar" : "Registrar Venta"}
        </button>
      </div>

      <div className="search-row">
        <input
          className="search-input-inside"
          type="text"
          placeholder="Buscar ..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <TablaVentas
        ventas={ventasFiltradas}
        seleccionar={seleccionar}
        refrescar={cargarVentas}
      />
    </div>
  );
}

export default VentasPage;