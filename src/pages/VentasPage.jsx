import { useCallback, useEffect, useState } from "react";
import TablaVentas from "../Components/tablas/TablaVentas";
import { apiJson } from "../utils/api";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";

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
  const [guardando, setGuardando] = useState(false);

  const cargarVentas = useCallback(async () => {
    try {
      setVentas(await apiJson("/ventas"));
    } catch (error) {
      console.error("Error cargando ventas", error);
      setVentas([]);
    }
  }, []);

  const cargarCarros = useCallback(async () => {
    try {
      setCarros(await apiJson("/carros-predio"));
    } catch (error) {
      console.error("Error cargando carros", error);
      setCarros([]);
    }
  }, []);

  const cargarCompradores = useCallback(async () => {
    try {
      setCompradores(await apiJson("/compradores"));
    } catch (error) {
      console.error("Error cargando compradores", error);
      setCompradores([]);
    }
  }, []);

  const cargarColaboradores = useCallback(async () => {
    try {
      setListaColaboradores(await apiJson("/colaboradores"));
    } catch (error) {
      console.error("Error cargando colaboradores", error);
      setListaColaboradores([]);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
    cargarCarros();
    cargarCompradores();
    cargarColaboradores();
  }, [cargarVentas, cargarCarros, cargarCompradores, cargarColaboradores]);

  useEffect(() => {
    const total = colaboradores.reduce((suma, c) => suma + Number(c.comision || 0), 0);
    setComision(total.toFixed(2));
  }, [colaboradores]);

  const agregarColaborador = () => {
    setColaboradores([...colaboradores, { id_colaborador: "", comision: "", rol: "Vendedor" }]);
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
    setIdVenta(v.Id_Venta || null);
    setIdPredio(v.Id_Predio || "");
    setIdCompra(v.Id_Compra || "");
    setFecha(v.Fecha || "");
    setPrecioVenta(v.PrecioVenta || "");
    setComision(v.Comision || "0.00");
    setDiasContrato(v.DiasContrato || "");

    const colabs = v.venta_colaboradores || v.venta_colaborador || v.colaboradores || v.Colaboradores || [];
    setColaboradores(
      colabs.map((col) => ({
        id_colaborador: col.id_colaborador || col.Id_Colaborador || "",
        comision: col.comision || col.Comision || "",
        rol: col.rol || col.Rol || "Vendedor",
      }))
    );
  };

  const guardar = async () => {
    if (guardando) return;

    if (!Id_Predio) return warning("Debe seleccionar un carro.");
    if (!Id_Compra) return warning("Debe seleccionar un comprador.");
    if (!Fecha) return warning("Debe ingresar la fecha.");
    if (!PrecioVenta) return warning("Debe ingresar el precio de venta.");

    if (new Date(Fecha) > new Date()) {
      return warning("La fecha no puede ser mayor a hoy.");
    }

    const colaboradoresValidos = colaboradores.filter(
      (c) => c.id_colaborador && c.comision !== "" && c.comision !== null && c.comision !== undefined
    );

    if (colaboradores.length !== colaboradoresValidos.length) {
      return warning("Si agrega un colaborador, debe seleccionarlo y colocar su comision.");
    }

    const repetidos = colaboradoresValidos.some(
      (c, index, array) => array.findIndex((x) => x.id_colaborador === c.id_colaborador) !== index
    );

    if (repetidos) return warning("No puede agregar el mismo colaborador dos veces.");

    const body = {
      Id_Predio: parseInt(Id_Predio, 10),
      Id_Compra: parseInt(Id_Compra, 10),
      Fecha,
      PrecioVenta: parseFloat(PrecioVenta),
      Comision: parseFloat(Comision),
      DiasContrato: DiasContrato ? parseInt(DiasContrato, 10) : null,
      Colaboradores: colaboradoresValidos.map((c) => ({
        Id_Colaborador: parseInt(c.id_colaborador, 10),
        Comision: parseFloat(c.comision),
        Rol: c.rol || "Vendedor",
      })),
    };

    try {
      setGuardando(true);
      await apiJson(Id_Venta ? `/ventas/${Id_Venta}` : "/ventas", {
        method: Id_Venta ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      success(Id_Venta ? "Registro actualizado correctamente." : "Venta registrada.");
      limpiar();
      cargarVentas();
      window.dispatchEvent(new Event("ventasActualizadas"));
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const ventasFiltradas = ventas
    .map((v) => {
      const carro = v.Carro || carros.find((c) => c.Id_Predio === v.Id_Predio);
      const comprador = v.Comprador || compradores.find((c) => c.Id_Compra === v.Id_Compra);

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
              {c.Placa} - {c.Modelo}
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

        <input type="date" value={Fecha} onChange={(e) => setFecha(e.target.value)} />
        <input type="number" placeholder="Precio Venta" value={PrecioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />

        <label>Comision total</label>
        <input type="number" value={Comision} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed", fontWeight: "bold" }} />

        <label>Dias para contrato (opcional)</label>
        <input type="number" value={DiasContrato} onChange={(e) => setDiasContrato(e.target.value)} placeholder="Ej: 15" />

        <h3>Colaboradores</h3>

        {colaboradores.map((c, index) => (
          <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
            <select value={c.id_colaborador} onChange={(e) => actualizarColaborador(index, "id_colaborador", e.target.value)} style={{ flex: 1, padding: "8px" }}>
              <option value="">Seleccione colaborador</option>
              {listaColaboradores.map((col) => (
                <option key={col.Id_Colaborador} value={col.Id_Colaborador}>
                  {col.Nombre} {col.Apellido}
                </option>
              ))}
            </select>

            <input type="number" placeholder="Comision" value={c.comision} onChange={(e) => actualizarColaborador(index, "comision", e.target.value)} style={{ flex: 0.6, padding: "8px" }} />

            <button type="button" onClick={() => eliminarColaborador(index)} className="btn-delete" style={{ width: "auto" }}>
              Eliminar
            </button>
          </div>
        ))}

        <button type="button" onClick={agregarColaborador} className="btn-secondary">
          + Agregar colaborador
        </button>

        <button className="btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : Id_Venta ? "Actualizar" : "Registrar Venta"}
        </button>
      </div>

      <div className="search-row">
        <input className="search-input-inside" type="text" placeholder="Buscar ..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      <TablaVentas ventas={ventasFiltradas} seleccionar={seleccionar} refrescar={cargarVentas} />
    </div>
  );
}

export default VentasPage;
