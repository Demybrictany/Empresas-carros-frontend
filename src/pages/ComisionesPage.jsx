import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { apiJson } from "../utils/api";
import TablaDesplegable from "../Components/tablas/TablaDesplegable";
import { confirm, error, success, warning } from "../utils/alerts";

function ComisionesPage() {
  const [searchParams] = useSearchParams();
  const [ventas, setVentas] = useState([]);
  const [carros, setCarros] = useState([]);
  const [listaColaboradores, setListaColaboradores] = useState([]);
  const [search, setSearch] = useState("");
  const tabInicial = ["pendientes", "pagadas", "resumen", "carros"].includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "pendientes";
  const [activeTab, setActiveTab] = useState(tabInicial);
  const [loading, setLoading] = useState(false);

  // Modal para pagar comisión
  const [modalPago, setModalPago] = useState(null);
  const [montoPago, setMontoPago] = useState("");
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split("T")[0]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [referencia, setReferencia] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const tabUrl = searchParams.get("tab");
    if (["pendientes", "pagadas", "resumen", "carros"].includes(tabUrl)) {
      setActiveTab(tabUrl);
    }
  }, [searchParams]);

  const cargarVentas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson("/ventas");
      console.log("📥 Ventas cargadas:", JSON.stringify(data, null, 2));
      setVentas(data);
    } catch (error) {
      console.error("Error cargando ventas", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCarros = useCallback(async () => {
    try {
      const data = await apiJson("/carros-predio");
      setCarros(data);
    } catch (error) {
      console.error("Error cargando carros", error);
    }
  }, []);

  const cargarColaboradores = useCallback(async () => {
    try {
      const data = await apiJson("/colaboradores");
      setListaColaboradores(data);
    } catch (error) {
      console.error("Error cargando colaboradores", error);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
    cargarCarros();
    cargarColaboradores();
  }, [cargarVentas, cargarCarros, cargarColaboradores]);

  // Escuchar evento cuando se agregan ventas
  useEffect(() => {
    const handleVentasActualizadas = () => {
      cargarVentas();
    };
    window.addEventListener("ventasActualizadas", handleVentasActualizadas);
    return () => {
      window.removeEventListener("ventasActualizadas", handleVentasActualizadas);
    };
  }, [cargarVentas]);

  // Obtener colaboradores de venta (flexible con diferentes nombres de BD)
  const obtenerColaboradoresDeVenta = (venta) => {
    return (
      venta.venta_colaborador ||
      venta.venta_colaboradores ||
      venta.colaboradores ||
      venta.Colaboradores ||
      []
    );
  };

  // Encontrar datos del colaborador
  const encontrarPersona = (colaboradorId) => {
    return (
      listaColaboradores.find(
        (c) => String(c.Id_Colaborador) === String(colaboradorId)
      ) || {}
    );
  };

  const toNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const obtenerIdVenta = (venta) => venta.Id_Venta || venta.id_venta || venta.id || venta.Id;

  const encontrarCarro = (idPredio) => (
    carros.find((c) => String(c.Id_Predio) === String(idPredio)) || {}
  );

  const generarComisionesPorCarro = () => {
    return ventas
      .map((venta, index) => {
        const idVenta = obtenerIdVenta(venta);
        const carro = encontrarCarro(venta.Id_Predio || venta.id_predio || venta.IdPredio);
        const comision = toNumber(venta.Comision || venta.comision);
        const keyPago = `carro-${idVenta || venta.Id_Predio || venta.id_predio || index}`;

        return {
          idVenta,
          keyPago,
          carro: carro.Placa || venta.Carro?.Placa || venta.Placa || `ID ${venta.Id_Predio || venta.id_predio}`,
          modelo: carro.Modelo || venta.Carro?.Modelo || "",
          fechaVenta: venta.Fecha || venta.fecha,
          comision,
          pagada: localStorage.getItem(keyPago) === "true",
        };
      })
      .filter((fila) => fila.comision > 0);
  };

  // Construir tabla de comisiones con estado
  const generarFilasComisiones = () => {
    return ventas.flatMap((venta) => {
      const idVenta = venta.Id_Venta || venta.id_venta;
      const carro = carros.find((c) => c.Id_Predio === venta.Id_Predio);
      const colaboradoresVenta = obtenerColaboradoresDeVenta(venta);

      return colaboradoresVenta
        .map((colaborador) => {
          const idColaborador = colaborador.id_colaborador || colaborador.Id_Colaborador;
          if (!idColaborador) return null;

          const persona = encontrarPersona(idColaborador);
          const comision = parseFloat(colaborador.comision || colaborador.Comision || 0);

          // Verificar si está pagada (guardar en localStorage)
          const keyPago = `${idVenta}-${idColaborador}`;
          const estadoPago = localStorage.getItem(keyPago) === "true" ? "PAGADA" : "PENDIENTE";

          return {
            idVenta,
            idColaborador,
            keyPago,
            fechaVenta: venta.Fecha,
            carro: carro ? `${carro.Placa} - ${carro.Modelo}` : `ID ${venta.Id_Predio}`,
            persona: `${persona.Nombre || "N/A"} ${persona.Apellido || ""}`.trim(),
            comision,
            rol: colaborador.rol || colaborador.Rol || "Vendedor",
            estado: estadoPago,
          };
        })
        .filter(Boolean);
    });
  };

  const todasLasComisiones = generarFilasComisiones();
  const comisionesPorCarro = generarComisionesPorCarro();
  const comisionesPendientes = todasLasComisiones.filter((c) => c.estado === "PENDIENTE");
  const comisionesPagadas = todasLasComisiones.filter((c) => c.estado === "PAGADA");

  // Calcular totales
  const totalPendiente = comisionesPendientes.reduce((sum, c) => sum + c.comision, 0);
  const totalPagado = comisionesPagadas.reduce((sum, c) => sum + c.comision, 0);
  const totalGeneral = totalPendiente + totalPagado;
  const totalPorCarro = comisionesPorCarro.reduce((sum, c) => sum + c.comision, 0);

  // Resumen por colaborador
  const obtenerResumenPorColaborador = () => {
    const resumen = {};

    todasLasComisiones.forEach((comision) => {
      const id = comision.idColaborador;
      if (!resumen[id]) {
        const persona = encontrarPersona(id);
        resumen[id] = {
          id,
          nombre: `${persona.Nombre || "N/A"} ${persona.Apellido || ""}`.trim(),
          totalComisiones: 0,
          totalPagado: 0,
          totalPendiente: 0,
          numVentas: 0,
        };
      }

      resumen[id].totalComisiones += comision.comision;
      resumen[id].numVentas += 1;

      if (comision.estado === "PAGADA") {
        resumen[id].totalPagado += comision.comision;
      } else {
        resumen[id].totalPendiente += comision.comision;
      }
    });

    return Object.values(resumen).sort((a, b) => b.totalPendiente - a.totalPendiente);
  };

  const resumenColaboradores = obtenerResumenPorColaborador();

  // Marcar comisión como pagada
  const marcarComoPagada = (fila) => {
    setModalPago(fila);
    setMontoPago(fila.comision.toString());
    setFechaPago(new Date().toISOString().split("T")[0]);
    setMetodoPago("Efectivo");
    setReferencia("");
    setObservaciones("");
  };

  const procesarPago = async () => {
    if (!montoPago) {
      warning("Ingresa un monto.");
      return;
    }

    const monto = parseFloat(montoPago);
    if (monto <= 0 || monto > modalPago.comision) {
      warning("Monto invalido.");
      return;
    }

    try {
      localStorage.setItem(modalPago.keyPago, "true");
      success("Comision marcada como pagada.");
      setModalPago(null);
      cargarVentas();
    } catch (err) {
      console.error("Error al procesar pago", err);
      error(err?.message);
    }
  };

  const desmarcarComoPagada = async (fila) => {
    const confirmed = await confirm(
      "Marcar como pendiente",
      `Marcar comision de ${fila.persona} como pendiente.`,
      { variant: "disable" }
    );
    if (!confirmed) return;

    localStorage.setItem(fila.keyPago, "false");
    success("Registro actualizado correctamente.");
    cargarVentas();
  };
  const toggleComisionCarroPagada = (fila) => {
    localStorage.setItem(fila.keyPago, fila.pagada ? "false" : "true");
    cargarVentas();
  };

  // Filtrar datos
  const filtrarDatos = (datos) => {
    return datos.filter(
      (d) =>
        d.carro.toLowerCase().includes(search.toLowerCase()) ||
        (d.persona || "").toLowerCase().includes(search.toLowerCase()) ||
        d.comision.toString().includes(search)
    );
  };

  const comisionesPendientesFiltradas = filtrarDatos(comisionesPendientes);
  const comisionesPagadasFiltradas = filtrarDatos(comisionesPagadas);
  const comisionesPorCarroFiltradas = filtrarDatos(comisionesPorCarro);
  const tabButtonStyle = (tab) => ({
    padding: "10px 20px",
    background: activeTab === tab ? "#0066cc" : "#24384a",
    color: activeTab === tab ? "#ffffff" : "#e8f1f8",
    border: activeTab === tab ? "1px solid #0066cc" : "1px solid #3d5367",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
    fontWeight: activeTab === tab ? "bold" : "600",
  });
  const tableHeaderStyle = (align = "left") => ({
    padding: "12px",
    textAlign: align,
    color: "#1f2937",
    fontWeight: "700",
  });
  const actionButtonStyle = (background) => ({
    padding: "6px 12px",
    background,
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  });

  return (
    <div className="page-container">
      <h1>💰 Control de Comisiones</h1>

      {/* RESUMEN SUPERIOR */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "#fff3cd",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ffeeba",
          }}
        >
          <h4 style={{ margin: "0 0 8px", color: "#856404" }}>⏳ Pendientes</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#856404", margin: 0 }}>
            Q{totalPendiente.toFixed(2)}
          </p>
          <small style={{ color: "#666" }}>{comisionesPendientes.length} comisiones</small>
        </div>

        <div
          style={{
            background: "#d4edda",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #c3e6cb",
          }}
        >
          <h4 style={{ margin: "0 0 8px", color: "#155724" }}>✅ Pagadas</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#155724", margin: 0 }}>
            Q{totalPagado.toFixed(2)}
          </p>
          <small style={{ color: "#666" }}>{comisionesPagadas.length} comisiones</small>
        </div>

        <div
          style={{
            background: "#d1ecf1",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #bee5eb",
          }}
        >
          <h4 style={{ margin: "0 0 8px", color: "#0c5460" }}>📊 Total</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#0c5460", margin: 0 }}>
            Q{totalGeneral.toFixed(2)}
          </p>
          <small style={{ color: "#666" }}>
            {totalGeneral > 0 ? ((totalPagado / totalGeneral) * 100).toFixed(0) : 0}% pagado
          </small>
        </div>
        <div
          style={{
            background: "#e8f4ff",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #b8ddff",
          }}
        >
          <h4 style={{ margin: "0 0 8px", color: "#0b4f8a" }}>🚗 Por carro</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#0b4f8a", margin: 0 }}>
            Q{totalPorCarro.toFixed(2)}
          </p>
          <small style={{ color: "#666" }}>{comisionesPorCarro.length} registros</small>
        </div>
      </div>

      {/* BUSCADOR */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por carro, persona o monto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "14px",
          }}
        />
      </div>

      {/* TABS */}
      <div style={{ borderBottom: "2px solid #ddd", marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setActiveTab("pendientes")}
          style={tabButtonStyle("pendientes")}
        >
          ⏳ Pendientes ({comisionesPendientes.length})
        </button>
        <button
          onClick={() => setActiveTab("pagadas")}
          style={tabButtonStyle("pagadas")}
        >
          ✅ Pagadas ({comisionesPagadas.length})
        </button>
        <button
          onClick={() => setActiveTab("resumen")}
          style={tabButtonStyle("resumen")}
        >
          📈 Resumen
        </button>
        <button
          onClick={() => setActiveTab("carros")}
          style={tabButtonStyle("carros")}
        >
          🚗 Por carro ({comisionesPorCarro.length})
        </button>
      </div>

      {/* TAB: COMISIONES PENDIENTES */}
      {activeTab === "pendientes" && (
        <div>
          {loading ? (
            <p style={{ textAlign: "center", color: "#999" }}>Cargando...</p>
          ) : comisionesPendientesFiltradas.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              ✅ No hay comisiones pendientes
            </p>
          ) : (
            <TablaDesplegable total={comisionesPendientesFiltradas.length}>
              {(limite) => (
              <table className="table-modern">
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={tableHeaderStyle()}>Carro</th>
                    <th style={tableHeaderStyle()}>Fecha</th>
                    <th style={tableHeaderStyle()}>Colaborador</th>
                    <th style={tableHeaderStyle()}>Rol</th>
                    <th style={tableHeaderStyle("right")}>Comisión</th>
                    <th style={tableHeaderStyle("center")}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {comisionesPendientesFiltradas.slice(0, limite).map((comision, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{comision.carro}</td>
                      <td style={{ padding: "12px" }}>
                        {new Date(comision.fechaVenta).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px" }}>{comision.persona}</td>
                      <td style={{ padding: "12px", fontSize: "12px" }}>{comision.rol}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>
                        Q{comision.comision.toFixed(2)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() => marcarComoPagada(comision)}
                          style={{
                            ...actionButtonStyle("#198754"),
                          }}
                        >
                          💳 Pagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </TablaDesplegable>
          )}
        </div>
      )}

      {/* TAB: COMISIONES PAGADAS */}
      {activeTab === "pagadas" && (
        <div>
          {loading ? (
            <p style={{ textAlign: "center", color: "#999" }}>Cargando...</p>
          ) : comisionesPagadasFiltradas.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              Sin comisiones pagadas
            </p>
          ) : (
            <TablaDesplegable total={comisionesPagadasFiltradas.length}>
              {(limite) => (
              <table className="table-modern">
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={tableHeaderStyle()}>Carro</th>
                    <th style={tableHeaderStyle()}>Fecha</th>
                    <th style={tableHeaderStyle()}>Colaborador</th>
                    <th style={tableHeaderStyle()}>Rol</th>
                    <th style={tableHeaderStyle("right")}>Comisión</th>
                    <th style={tableHeaderStyle("center")}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {comisionesPagadasFiltradas.slice(0, limite).map((comision, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{comision.carro}</td>
                      <td style={{ padding: "12px" }}>
                        {new Date(comision.fechaVenta).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px" }}>{comision.persona}</td>
                      <td style={{ padding: "12px", fontSize: "12px" }}>{comision.rol}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>
                        Q{comision.comision.toFixed(2)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() => desmarcarComoPagada(comision)}
                          style={{
                            ...actionButtonStyle("#c82333"),
                          }}
                        >
                          ↩️ Deshacer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </TablaDesplegable>
          )}
        </div>
      )}

      {/* TAB: RESUMEN */}
      {activeTab === "resumen" && (
        <div>
          {loading ? (
            <p style={{ textAlign: "center", color: "#999" }}>Cargando...</p>
          ) : resumenColaboradores.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              Sin datos
            </p>
          ) : (
            <TablaDesplegable total={resumenColaboradores.length}>
              {(limite) => (
              <table className="table-modern">
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={tableHeaderStyle()}>Colaborador</th>
                    <th style={tableHeaderStyle("center")}>Ventas</th>
                    <th style={tableHeaderStyle("right")}>Total</th>
                    <th style={tableHeaderStyle("right")}>Pagado</th>
                    <th style={tableHeaderStyle("right")}>Pendiente</th>
                    <th style={tableHeaderStyle("center")}>% Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenColaboradores.slice(0, limite).map((r, idx) => {
                    const porcentaje = r.totalComisiones > 0 
                      ? ((r.totalPagado / r.totalComisiones) * 100).toFixed(0) 
                      : 0;
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px" }}>{r.nombre}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>{r.numVentas}</td>
                        <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>
                          Q{r.totalComisiones.toFixed(2)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: "#28a745" }}>
                          Q{r.totalPagado.toFixed(2)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: "#dc3545" }}>
                          Q{r.totalPendiente.toFixed(2)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div
                            style={{
                              background: "#e9ecef",
                              borderRadius: "4px",
                              overflow: "hidden",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                background: porcentaje === "100" ? "#28a745" : "#ffc107",
                                height: "100%",
                                width: `${porcentaje}%`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {porcentaje}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </TablaDesplegable>
          )}
        </div>
      )}

      {/* MODAL PARA PAGAR COMISIÓN */}
      {/* TAB: COMISIONES POR CARRO */}
      {activeTab === "carros" && (
        <div>
          {loading ? (
            <p style={{ textAlign: "center", color: "#999" }}>Cargando...</p>
          ) : comisionesPorCarroFiltradas.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              No hay comisiones por carro registradas
            </p>
          ) : (
            <TablaDesplegable total={comisionesPorCarroFiltradas.length}>
              {(limite) => (
              <table className="table-modern">
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={tableHeaderStyle()}>Carro</th>
                    <th style={tableHeaderStyle()}>Modelo</th>
                    <th style={tableHeaderStyle()}>Fecha</th>
                    <th style={tableHeaderStyle("right")}>Comision</th>
                    <th style={tableHeaderStyle("center")}>Pagada</th>
                  </tr>
                </thead>
                <tbody>
                  {comisionesPorCarroFiltradas.slice(0, limite).map((comision) => (
                    <tr key={comision.keyPago} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{comision.carro}</td>
                      <td style={{ padding: "12px" }}>{comision.modelo || "Sin modelo"}</td>
                      <td style={{ padding: "12px" }}>
                        {comision.fechaVenta ? new Date(comision.fechaVenta).toLocaleDateString() : "Sin fecha"}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>
                        Q{comision.comision.toFixed(2)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={comision.pagada}
                          onChange={() => toggleComisionCarroPagada(comision)}
                          style={{ width: "auto", margin: 0 }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </TablaDesplegable>
          )}
        </div>
      )}

      {modalPago && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "8px",
              maxWidth: "450px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>💳 Registrar Pago de Comisión</h3>

            <div style={{ marginBottom: "15px", background: "#f9f9f9", padding: "12px", borderRadius: "4px" }}>
              <p style={{ margin: "5px 0" }}>
                <strong>Colaborador:</strong> {modalPago.persona}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Carro:</strong> {modalPago.carro}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Comisión Total:</strong> Q{modalPago.comision.toFixed(2)}
              </p>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold" }}>Monto a Pagar:</label>
              <input
                type="number"
                max={modalPago.comision}
                step="0.01"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold" }}>Fecha de Pago:</label>
              <input
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold" }}>Método de Pago:</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Cheque">Cheque</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold" }}>Referencia (Opcional):</label>
              <input
                type="text"
                placeholder="Número de transferencia, cheque, etc."
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "70px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={procesarPago}
                style={{
                  padding: "10px 20px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✅ Confirmar Pago
              </button>
              <button
                onClick={() => setModalPago(null)}
                style={{
                  padding: "10px 20px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ✖ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComisionesPage;
