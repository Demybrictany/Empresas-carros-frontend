function InfoModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Información</h2>

        <p><strong>Nombre:</strong> {data.Nombre}</p>

        {data.Apellido && <p><strong>Apellido:</strong> {data.Apellido}</p>}
        {data.Telefono && <p><strong>Teléfono:</strong> {data.Telefono}</p>}
        {data.Dpi && <p><strong>DPI:</strong> {data.Dpi}</p>}
        {data.PrecioVenta && <p><strong>Precio Venta:</strong> Q{data.PrecioVenta}</p>}

        <button className="btn-primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default InfoModal;
