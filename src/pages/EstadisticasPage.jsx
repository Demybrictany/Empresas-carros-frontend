import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

const initialResumen = {
  vendido: 0,
  comprado: 0,
  gastos: 0,
  comisiones: 0,
  resultado: 0,
};

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toMonthValue = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const descargarArchivo = (contenido, nombre, tipo) => {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const normalizarPdf = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");

const escapePdf = (value) =>
  normalizarPdf(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const pdfText = (value, x, y, size = 8, color = "0 0 0") =>
  `${color} rg\nBT /F1 ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET\n`;

const truncateText = (value, maxLength) => {
  const text = normalizarPdf(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const crearPdfReporteMensual = ({ mes, ventas }) => {
  const pageWidth = 842;
  const pageHeight = 595;
  const left = 28;
  const rowHeight = 18;
  const rowsPerPage = 22;
  const columns = [
    { title: "Fecha", key: "fecha", x: left, width: 62 },
    { title: "Placa", key: "placa", x: left + 66, width: 62 },
    { title: "Modelo", key: "modelo", x: left + 132, width: 86 },
    { title: "Comprador", key: "comprador", x: left + 222, width: 100 },
    { title: "Compra", key: "precioCompra", x: left + 326, width: 70 },
    { title: "Venta", key: "precioVenta", x: left + 400, width: 70 },
    { title: "Gastos", key: "gastos", x: left + 474, width: 64 },
    { title: "Comision", key: "comision", x: left + 542, width: 72 },
    { title: "Ganancia", key: "ganancia", x: left + 618, width: 76 },
  ];

  const totalVenta = ventas.reduce((acc, venta) => acc + venta.precioVenta, 0);
  const totalGanancia = ventas.reduce((acc, venta) => acc + venta.ganancia, 0);
  const chunks = [];

  for (let i = 0; i < ventas.length; i += rowsPerPage) {
    chunks.push(ventas.slice(i, i + rowsPerPage));
  }

  const pages = chunks.map((chunk, pageIndex) => {
    let stream = "";
    stream += pdfText("Reporte de carros vendidos", left, pageHeight - 42, 18);
    stream += pdfText(`Mes: ${mes}`, left, pageHeight - 62, 11);
    stream += pdfText(`Pagina ${pageIndex + 1} de ${chunks.length}`, pageWidth - 110, pageHeight - 62, 9);

    const headerY = pageHeight - 94;
    stream += "0.13 0.30 0.45 rg\n";
    stream += `${left - 6} ${headerY - 6} 760 20 re f\n`;
    columns.forEach((column) => {
      stream += pdfText(column.title, column.x, headerY, 8, "1 1 1");
    });

    chunk.forEach((venta, index) => {
      const y = headerY - 24 - index * rowHeight;
      if (index % 2 === 0) {
        stream += "0.94 0.97 1 rg\n";
        stream += `${left - 6} ${y - 6} 760 16 re f\n`;
      }

      columns.forEach((column) => {
        const rawValue = venta[column.key];
        const value = typeof rawValue === "number"
          ? `Q ${rawValue.toFixed(2)}`
          : truncateText(rawValue, Math.max(8, Math.floor(column.width / 5)));
        stream += pdfText(value, column.x, y, 7);
      });
    });

    if (pageIndex === chunks.length - 1) {
      const totalY = 54;
      stream += pdfText(`Total carros: ${ventas.length}`, left, totalY, 10);
      stream += pdfText(`Total vendido: Q ${totalVenta.toFixed(2)}`, left + 170, totalY, 10);
      stream += pdfText(`Ganancia total: Q ${totalGanancia.toFixed(2)}`, left + 370, totalY, 10);
    }

    return stream;
  });

  const objects = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const pageObjectIds = pages.map((_, index) => 4 + index * 2);
  objects.push(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((stream, index) => {
    const pageId = 4 + index * 2;
    const contentId = pageId + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
};

const sameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const sameMonth = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth();

const sameYear = (left, right) => left.getFullYear() === right.getFullYear();

const calcularResumen = ({ ventas, gastos, carrosById, filtroVenta, filtroGasto }) => {
  const ventasFiltradas = ventas.filter((venta) => {
    const fecha = toDate(venta.Fecha);
    return fecha ? filtroVenta(fecha) : false;
  });

  const gastosFiltrados = gastos.filter((gasto) => {
    const fecha = toDate(gasto.Fecha);
    return fecha ? filtroGasto(fecha) : false;
  });

  const vendido = ventasFiltradas.reduce((acc, venta) => acc + toNumber(venta.PrecioVenta), 0);
  const comprado = ventasFiltradas.reduce((acc, venta) => {
    const carro = carrosById.get(venta.Id_Predio);
    return acc + toNumber(carro?.Precio_Compra);
  }, 0);
  const comisiones = ventasFiltradas.reduce((acc, venta) => acc + toNumber(venta.Comision), 0);
  const totalGastos = gastosFiltrados.reduce((acc, gasto) => acc + toNumber(gasto.Monto), 0);
  const resultado = vendido - comprado - totalGastos - comisiones;

  return {
    vendido,
    comprado,
    gastos: totalGastos,
    comisiones,
    resultado,
  };
};

function EstadisticasPage() {
  const navigate = useNavigate();
  const [resumenHoy, setResumenHoy] = useState(initialResumen);
  const [resumenMes, setResumenMes] = useState(initialResumen);
  const [resumenAnio, setResumenAnio] = useState(initialResumen);
  const [gananciasCarro, setGananciasCarro] = useState([]);
  const [ventasReporte, setVentasReporte] = useState([]);
  const [gastosReporte, setGastosReporte] = useState([]);
  const [carrosReporte, setCarrosReporte] = useState([]);
  const [mesReporte, setMesReporte] = useState(toMonthValue());
  const [mostrarGanancias, setMostrarGanancias] = useState(false);
  const [mostrarPerdidas, setMostrarPerdidas] = useState(false);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [ventasRes, gastosRes, carrosRes] = await Promise.all([
          fetch(`${BASE_URL}/ventas`),
          fetch(`${BASE_URL}/gastos`),
          fetch(`${BASE_URL}/carros-predio`),
        ]);

        const [ventasData, gastosData, carrosData] = await Promise.all([
          ventasRes.json(),
          gastosRes.json(),
          carrosRes.json(),
        ]);

        const ventas = Array.isArray(ventasData) ? ventasData : [];
        const gastos = Array.isArray(gastosData) ? gastosData : [];
        const carros = Array.isArray(carrosData) ? carrosData : [];
        const carrosById = new Map(carros.map((carro) => [carro.Id_Predio, carro]));
        const hoy = new Date();

        setVentasReporte(ventas);
        setGastosReporte(gastos);
        setCarrosReporte(carros);

        setResumenHoy(
          calcularResumen({
            ventas,
            gastos,
            carrosById,
            filtroVenta: (fecha) => sameDay(fecha, hoy),
            filtroGasto: (fecha) => sameDay(fecha, hoy),
          })
        );

        setResumenMes(
          calcularResumen({
            ventas,
            gastos,
            carrosById,
            filtroVenta: (fecha) => sameMonth(fecha, hoy),
            filtroGasto: (fecha) => sameMonth(fecha, hoy),
          })
        );

        setResumenAnio(
          calcularResumen({
            ventas,
            gastos,
            carrosById,
            filtroVenta: (fecha) => sameYear(fecha, hoy),
            filtroGasto: (fecha) => sameYear(fecha, hoy),
          })
        );

        const gastosPorCarro = gastos.reduce((acc, gasto) => {
          if (!gasto.Id_Predio) return acc;
          acc[gasto.Id_Predio] = (acc[gasto.Id_Predio] || 0) + toNumber(gasto.Monto);
          return acc;
        }, {});

        const ventasPorCarro = ventas.reduce((acc, venta) => {
          if (!acc[venta.Id_Predio]) {
            acc[venta.Id_Predio] = {
              Id_Predio: venta.Id_Predio,
              Placa: venta.Carro?.Placa || carrosById.get(venta.Id_Predio)?.Placa || "Sin placa",
              TotalComprado: toNumber(venta.Carro?.Precio_Compra || carrosById.get(venta.Id_Predio)?.Precio_Compra),
              TotalVendido: 0,
              Gastos: 0,
              Comisiones: 0,
              Ganancia: 0,
            };
          }

          acc[venta.Id_Predio].TotalVendido += toNumber(venta.PrecioVenta);
          acc[venta.Id_Predio].Comisiones += toNumber(venta.Comision);
          return acc;
        }, {});

        const ganancias = Object.values(ventasPorCarro).map((item) => {
          const gastosCarro = gastosPorCarro[item.Id_Predio] || 0;
          const ganancia =
            item.TotalVendido -
            item.TotalComprado -
            gastosCarro -
            item.Comisiones;

          return {
            ...item,
            Gastos: gastosCarro,
            Ganancia: ganancia,
          };
        });

        setGananciasCarro(ganancias);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };

    cargarEstadisticas();
  }, []);

  const ventasMesReporte = useMemo(() => {
    const carrosById = new Map(carrosReporte.map((carro) => [carro.Id_Predio, carro]));

    return ventasReporte
      .filter((venta) => {
        const fecha = toDate(venta.Fecha);
        return fecha ? toMonthValue(fecha) === mesReporte : false;
      })
      .map((venta) => {
        const carro = venta.Carro || carrosById.get(venta.Id_Predio) || {};
        const gastosCarro = gastosReporte
          .filter((gasto) => gasto.Id_Predio === venta.Id_Predio)
          .reduce((acc, gasto) => acc + toNumber(gasto.Monto), 0);
        const precioCompra = toNumber(carro.Precio_Compra);
        const precioVenta = toNumber(venta.PrecioVenta);
        const comision = toNumber(venta.Comision);

        return {
          idVenta: venta.Id_Venta,
          fecha: venta.Fecha,
          placa: carro.Placa || "Sin placa",
          marca: carro.Marca || "",
          modelo: carro.Modelo || "",
          comprador: venta.Comprador?.Nombre || venta.NombreComprador || "",
          precioCompra,
          precioVenta,
          gastos: gastosCarro,
          comision,
          ganancia: precioVenta - precioCompra - gastosCarro - comision,
        };
      });
  }, [ventasReporte, gastosReporte, carrosReporte, mesReporte]);

  const descargarReporteMensual = () => {
    if (!mesReporte) return alert("Seleccione un mes para generar el reporte.");
    if (ventasMesReporte.length === 0) return alert("No hay carros vendidos en el mes seleccionado.");

    const pdf = crearPdfReporteMensual({
      mes: mesReporte,
      ventas: ventasMesReporte,
    });

    descargarArchivo(pdf, `reporte-carros-vendidos-${mesReporte}.pdf`, "application/pdf");
  };

  const carrosPerdida = gananciasCarro.filter((carro) => carro.Ganancia < 0);
  const carrosConComision = gananciasCarro.filter((carro) => carro.Comisiones > 0);
  const gananciasVisibles = mostrarGanancias ? gananciasCarro : gananciasCarro.slice(0, 8);
  const perdidasVisibles = mostrarPerdidas ? carrosPerdida : carrosPerdida.slice(0, 5);
  const mejorGanancia = gananciasCarro.reduce(
    (mayor, carro) => (carro.Ganancia > mayor.Ganancia ? carro : mayor),
    { Placa: "Sin datos", Ganancia: 0 }
  );
  const totalComisiones = gananciasCarro.reduce((sum, carro) => sum + carro.Comisiones, 0);
  const totalGanancia = gananciasCarro.reduce((sum, carro) => sum + carro.Ganancia, 0);
  const porcentajeGanancia =
    resumenAnio.vendido > 0 ? Math.max(0, Math.min(100, (totalGanancia / resumenAnio.vendido) * 100)) : 0;
  const chartMeses = [
    { label: "Hoy", value: resumenHoy.resultado },
    { label: "Mes", value: resumenMes.resultado },
    { label: "Año", value: resumenAnio.resultado },
  ];
  const maxChartValue = Math.max(...chartMeses.map((item) => Math.abs(item.value)), 1);

  return (
    <div className="page-container estadisticas-page">
      <h1>Estadisticas</h1>

      <section className="stats-dashboard">
        <div className="stats-summary-grid">
          <MetricCard title="Ganancia anual" value={`Q ${resumenAnio.resultado.toFixed(2)}`} tone={resumenAnio.resultado < 0 ? "danger" : "success"} />
          <MetricCard title="Ventas del año" value={`Q ${resumenAnio.vendido.toFixed(2)}`} tone="primary" />
          <MetricCard title="Comisiones" value={`Q ${totalComisiones.toFixed(2)}`} tone="warning" />
          <MetricCard title="Mejor carro" value={mejorGanancia.Placa} detail={`Q ${mejorGanancia.Ganancia.toFixed(2)}`} tone="accent" />
        </div>

        <div className="stats-visual-grid">
          <div className="stats-chart-card">
            <div className="stats-card-header">
              <div>
                <h3>Rendimiento</h3>
                <span>Comparacion de ganancia por periodo</span>
              </div>
            </div>

            <div className="bar-chart">
              {chartMeses.map((item) => {
                const height = Math.max(12, (Math.abs(item.value) / maxChartValue) * 100);
                return (
                  <div className="bar-chart-item" key={item.label}>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${item.value < 0 ? "negative" : ""}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <strong>{item.label}</strong>
                    <span>Q {item.value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="stats-side-card">
            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(#3ab0ff ${porcentajeGanancia * 3.6}deg, rgba(255,255,255,0.16) 0deg)`,
              }}
            >
              <span>{porcentajeGanancia.toFixed(0)}%</span>
            </div>
            <h3>Margen visual</h3>
            <p>Ganancia calculada contra ventas anuales.</p>
            <div className="mini-stat-list">
              <span>Carros vendidos <strong>{gananciasCarro.length}</strong></span>
              <span>Con perdida <strong>{carrosPerdida.length}</strong></span>
              <span>Con comision <strong>{carrosConComision.length}</strong></span>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-period-grid">
        <Card title="Hoy" resumen={resumenHoy} />
        <Card title="Este mes" resumen={resumenMes} />
        <Card title="Este año" resumen={resumenAnio} />
      </div>

      <section className="collapsible-panel monthly-report-panel">
        <div className="panel-heading">
          <div>
            <h3>Reporte mensual de ventas</h3>
            <span>{ventasMesReporte.length} carros vendidos en el mes seleccionado</span>
          </div>
        </div>

        <div className="report-controls">
          <label>
            Mes del reporte
            <input
              type="month"
              value={mesReporte}
              onChange={(e) => setMesReporte(e.target.value)}
            />
          </label>

          <button className="btn-primary" onClick={descargarReporteMensual}>
            Descargar PDF
          </button>
        </div>
      </section>

      <section className="collapsible-panel">
        <div className="panel-heading">
          <div>
            <h3>Ganancia por carro</h3>
            <span>{gananciasCarro.length} registros</span>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate("/comisiones?tab=carros")}
          >
            Ver comisiones
          </button>
        </div>

        <div className="table-container">
          <table className="table-modern" border="1" cellPadding="6" width="100%">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Compra</th>
                <th>Venta</th>
                <th>Gastos</th>
                <th>Comision</th>
                <th>Ganancia / Perdida</th>
              </tr>
            </thead>
            <tbody>
              {gananciasVisibles.map((carro) => (
                <tr key={carro.Id_Predio}>
                  <td>{carro.Placa}</td>
                  <td>Q {carro.TotalComprado.toFixed(2)}</td>
                  <td>Q {carro.TotalVendido.toFixed(2)}</td>
                  <td>Q {carro.Gastos.toFixed(2)}</td>
                  <td>Q {carro.Comisiones.toFixed(2)}</td>
                  <td style={{ color: carro.Ganancia < 0 ? "red" : "green" }}>
                    Q {carro.Ganancia.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gananciasCarro.length > 8 && (
          <button className="btn-secondary list-toggle" onClick={() => setMostrarGanancias((prev) => !prev)}>
            {mostrarGanancias ? "Ocultar" : `Desplegar todos (${gananciasCarro.length})`}
          </button>
        )}
      </section>

      <section className="collapsible-panel">
        <div className="panel-heading">
          <div>
            <h3 style={{ color: "#ff6b6b" }}>Carros con perdida</h3>
            <span>{carrosPerdida.length} registros</span>
          </div>
        </div>

        <div className="table-container">
          <table className="table-modern" border="1" cellPadding="6" width="100%">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {perdidasVisibles.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    No hay carros con perdida
                  </td>
                </tr>
              ) : (
                perdidasVisibles.map((carro) => (
                  <tr key={carro.Id_Predio} style={{ color: "red" }}>
                    <td>{carro.Placa}</td>
                    <td>Q {carro.Ganancia.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {carrosPerdida.length > 5 && (
          <button className="btn-secondary list-toggle" onClick={() => setMostrarPerdidas((prev) => !prev)}>
            {mostrarPerdidas ? "Ocultar" : `Desplegar perdidas (${carrosPerdida.length})`}
          </button>
        )}
      </section>

    </div>
  );
}

function Card({ title, resumen }) {
  const colorResultado = resumen.resultado < 0 ? "red" : "green";

  return (
    <div className="period-card">
      <h4>{title}</h4>
      <p>Vendido: Q {resumen.vendido.toFixed(2)}</p>
      <p>Compra: Q {resumen.comprado.toFixed(2)}</p>
      <p>Gastos: Q {resumen.gastos.toFixed(2)}</p>
      <p>Comisiones: Q {resumen.comisiones.toFixed(2)}</p>
      <strong style={{ color: colorResultado }}>
        {resumen.resultado < 0 ? "Perdida" : "Ganancia"}: Q {resumen.resultado.toFixed(2)}
      </strong>
    </div>
  );
}

function MetricCard({ title, value, detail, tone }) {
  return (
    <div className={`metric-card ${tone || ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export default EstadisticasPage;
