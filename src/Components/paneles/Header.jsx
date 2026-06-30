import { useEffect, useState } from "react";
import logo from "../Imagenes/logo.png";
import { getEmpresa } from "../../utils/session";

function Header({ toggleMenu, menuOpen }) {
  const [empresa, setEmpresa] = useState(getEmpresa());
  const nombre = empresa.Nombre_Comercial || empresa.Nombre_Empresa || "Sistema de Gestion de Autos";
  const logoEmpresa = empresa.Logo_Empresa || logo;

  useEffect(() => {
    const actualizar = () => setEmpresa(getEmpresa());
    window.addEventListener("empresaActualizada", actualizar);
    window.addEventListener("usuarioActualizado", actualizar);
    return () => {
      window.removeEventListener("empresaActualizada", actualizar);
      window.removeEventListener("usuarioActualizado", actualizar);
    };
  }, []);

  return (
    <div className="top-header">
      <img src={logoEmpresa} alt={nombre} className="header-logo" />

      <h2 className="header-title">
        {nombre}
      </h2>

      {!menuOpen && (
        <button className="menu-btn" onClick={toggleMenu} aria-label="Abrir menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
    </div>
  );
}

export default Header;
