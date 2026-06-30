import { useState, useEffect } from "react";
import { apiJson } from "../../utils/api";

function BuscadorGlobal() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim() !== "") {
        buscar(query);
      } else {
        setResultados(null);
      }
    }, 300); // ⏳ Espera antes de buscar en tiempo real

    return () => clearTimeout(delay);
  }, [query]);

  const buscar = async (texto) => {
    const data = await apiJson(`/buscar?tipo=todos&query=${encodeURIComponent(texto)}`);
    setResultados(Array.isArray(data) ? { carros: data, compradores: [], vendedores: [], ventas: [] } : data);
  };

  return (
    <div className="search-box">
      <input
        className="search-input"
        placeholder="Buscar carro, comprador, vendedor..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {resultados && (
        <div className="search-results">
          {/* Carros */}
          {resultados.carros.length > 0 && (
            <>
              <h4>Carros</h4>
              {resultados.carros.map((c) => (
                <div key={c.Id_Predio}>
                  🚗 {c.Placa} — {c.Modelo}
                </div>
              ))}
            </>
          )}

          {/* Compradores */}
          {resultados.compradores.length > 0 && (
            <>
              <h4>Compradores</h4>
              {resultados.compradores.map((co) => (
                <div key={co.Id_Compra}>
                  👤 {co.Nombre} — DPI: {co.DPI}
                </div>
              ))}
            </>
          )}

          {/* Vendedores */}
          {resultados.vendedores.length > 0 && (
            <>
              <h4>Vendedores</h4>
              {resultados.vendedores.map((v) => (
                <div key={v.Id_Vendedor}>
                  🧑‍💼 {v.Nombre} — DPI: {v.Dpi}
                </div>
              ))}
            </>
          )}

          {/* Ventas */}
          {resultados.ventas.length > 0 && (
            <>
              <h4>Ventas</h4>
              {resultados.ventas.map((ve) => (
                <div key={ve.Id_Venta}>
                  🧾 Venta #{ve.Id_Venta}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BuscadorGlobal;
