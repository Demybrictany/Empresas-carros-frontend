import React, { useState } from "react";
import { apiJson } from "../../utils/api";
import { backendErrorMessage, error, success, warning } from "../../utils/alerts";

export default function VentaForm({ carros, compradores, refrescarVentas, refrescarCarros }) {

  const [form, setForm] = useState({
    Id_Predio: "",
    Id_Compra: "",
    Fecha: "",
    PrecioVenta: "",
    // Colaboradores handled in ventas page
  });

  const [carroInfo, setCarroInfo] = useState(null);

  const hoy = new Date().toISOString().slice(0, 10);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nuevo = { ...form, [name]: value };

    // porcentaje/comision removed; commissions managed via colaboradores

    if (name === "Id_Predio") {
      const info = carros.find((c) => c.Id_Predio === value);
      setCarroInfo(info || null);
    }

    setForm(nuevo);
  };

  const registrar = async () => {

    if (!form.Id_Predio || !form.Id_Compra)
      return warning("Complete todos los campos obligatorios.");

    if (form.Fecha > hoy)
      return warning("La fecha no puede ser futura.");

    // no longer required: commissions come from colaboradores

    try {

      await apiJson("/ventas", {
        method: "POST",
        body: JSON.stringify(form),
      });

      success("Venta registrada.");

      refrescarVentas();
      refrescarCarros();

      setForm({
        Id_Predio: "",
        Id_Compra: "",
        Fecha: "",
        PrecioVenta: "",
      });

      setCarroInfo(null);

    } catch (err) {
      console.error(err);
      error(backendErrorMessage(err));
    }
  };

  return (
    <div className="card p-3 mt-3 shadow">
      <div className="row">

        <div className="col-md-6">

          <label>Carro</label>
          <select
            className="form-control"
            name="Id_Predio"
            value={form.Id_Predio}
            onChange={handleChange}
          >
            <option value="">Seleccione</option>

            {carros.map((c) => (
              <option key={c.Id_Predio} value={c.Id_Predio}>
                {c.Modelo} - {c.Placa}
              </option>
            ))}

          </select>

          <label className="mt-3">Comprador</label>
          <select
            className="form-control"
            name="Id_Compra"
            value={form.Id_Compra}
            onChange={handleChange}
          >
            <option value="">Seleccione</option>

            {compradores.map((c) => (
              <option key={c.Id_Compra} value={c.Id_Compra}>
                {c.Nombre}
              </option>
            ))}

          </select>

          <label className="mt-3">Fecha</label>
          <input
            type="date"
            className="form-control"
            name="Fecha"
            max={hoy}
            value={form.Fecha}
            onChange={handleChange}
          />

          <label className="mt-3">Precio Venta</label>
          <input
            type="number"
            name="PrecioVenta"
            className="form-control"
            value={form.PrecioVenta}
            onChange={handleChange}
          />
          

          <button className="btn btn-primary mt-3" onClick={registrar}>
            Registrar
          </button>

        </div>

        <div className="col-md-6">

          {carroInfo ? (
            <div className="alert alert-info">
              <h5>Información del carro</h5>

              <p><strong>Modelo:</strong> {carroInfo.Modelo}</p>
              <p><strong>Placa:</strong> {carroInfo.Placa}</p>
              <p><strong>Año:</strong> {carroInfo.Anio}</p>
              <p><strong>Color:</strong> {carroInfo.Color}</p>
              <p><strong>Precio Compra:</strong> Q{carroInfo.Precio_Compra}</p>

            </div>
          ) : (
            <div className="alert alert-secondary">
              Seleccione un carro para ver detalles
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
