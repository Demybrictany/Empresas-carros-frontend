import logo from "../Imagenes/logo.png";

function Header({ toggleMenu, menuOpen }) {
  return (
    <div className="top-header">
      <img src={logo} alt="Logo" className="header-logo" />

      <h2 className="header-title">
        Sistema de Gestion de Autos
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
