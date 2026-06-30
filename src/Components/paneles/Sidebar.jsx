import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSession, getEmpresa, getUsuario } from "../../utils/session";
import { confirm } from "../../utils/alerts";

const icons = {
  home: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.4 12 5l8 6.4" />
      <path d="M6.5 10.5V19h11v-8.5" />
      <path d="M10 19v-5h4v5" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19V5h14v14z" />
      <path d="M8 16v-4" />
      <path d="M12 16V8" />
      <path d="M16 16v-6" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 15h14l-1.2-4.2A2.5 2.5 0 0 0 15.4 9H8.6a2.5 2.5 0 0 0-2.4 1.8z" />
      <path d="M4 15v3h3" />
      <path d="M20 15v3h-3" />
      <path d="M7.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      <path d="M16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  ),
  userSell: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
      <path d="M14 8h6" />
      <path d="M17 5l3 3-3 3" />
    </svg>
  ),
  userBuy: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
      <path d="M20 8h-6" />
      <path d="M17 5l-3 3 3 3" />
    </svg>
  ),
  money: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v10H4z" />
      <path d="M8 7a4 4 0 0 1-4 4" />
      <path d="M20 13a4 4 0 0 0-4 4" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  ),
  commission: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19 19 5" />
      <path d="M7.5 9a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" />
      <path d="M16.5 18.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v16l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2z" />
      <path d="M10 8h4" />
      <path d="M10 12h4" />
      <path d="M10 16h2" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M15.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M14.5 14.5a4.7 4.7 0 0 1 6 4.5" />
    </svg>
  ),
  addUser: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M18 8v8" />
      <path d="M14 12h8" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" />
      <path d="m16 16 4 4" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5H5v14h4" />
      <path d="M13 8l4 4-4 4" />
      <path d="M17 12H8" />
    </svg>
  ),
  login: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5h4v14h-4" />
      <path d="M11 8l4 4-4 4" />
      <path d="M15 12H4" />
    </svg>
  ),
};

const sections = [
  {
    title: "General",
    items: [
      { label: "Inicio", to: "/", icon: "home", end: true, roles: ["gerente", "colaborador", "programador"] },
    ],
  },
  {
    title: "Inventario",
    items: [
      { label: "Carros en\nPredio", to: "/carros-predio", icon: "car", roles: ["gerente", "colaborador", "programador"] },
      { label: "Me lo\nVendio", to: "/vendedores", icon: "userSell", roles: ["gerente", "colaborador", "programador"] },
      { label: "Dueños del\nCarro", to: "/duenos-carro", icon: "people", roles: ["gerente", "colaborador", "programador"] },
      { label: "Me lo\nCompro", to: "/compradores", icon: "userBuy", roles: ["gerente", "colaborador", "programador"] },
    ],
  },
  {
    title: "Negocio",
    items: [
      { label: "Ventas", to: "/ventas", icon: "money", roles: ["gerente", "colaborador", "programador"] },
      { label: "Comisiones", to: "/comisiones", icon: "commission", roles: ["gerente", "programador"] },
      { label: "Gastos", to: "/gastos", icon: "expense", roles: ["gerente", "programador"] },
    ],
  },
  {
    title: "Personal",
    items: [
      { label: "Colaboradores", to: "/colaboradores", icon: "people", roles: ["gerente", "programador"] },
      { label: "Usuarios", to: "/usuarios", icon: "people", roles: ["gerente", "programador"] },
      { label: "Crear Usuario", to: "/crear-usuario", icon: "addUser", roles: ["gerente", "programador"] },
      { label: "Empresas", to: "/empresas", icon: "dashboard", roles: ["programador"] },
      { label: "Config.\nEmpresa", to: "/configuracion-empresa", icon: "dashboard", roles: ["gerente", "programador"] },
    ],
  },
  {
    title: "Reportes",
    items: [
      { label: "Busquedas", to: "/buscar", icon: "search", roles: ["gerente", "colaborador", "programador"] },
      { label: "Estadisticas", to: "/estadisticas", icon: "dashboard", roles: ["gerente", "programador"] },
    ],
  },
];

function Sidebar({ menuOpen, toggleMenu }) {
  const [usuario, setUsuario] = useState(null);
  const [empresa, setEmpresa] = useState(getEmpresa());

  useEffect(() => {
    const cargarUsuario = () => {
      setUsuario(getUsuario());
      setEmpresa(getEmpresa());
    };

    cargarUsuario();
    window.addEventListener("usuarioActualizado", cargarUsuario);
    window.addEventListener("empresaActualizada", cargarUsuario);

    return () => {
      window.removeEventListener("usuarioActualizado", cargarUsuario);
      window.removeEventListener("empresaActualizada", cargarUsuario);
    };
  }, []);

  const closeOnMobile = () => {
    if (menuOpen && window.innerWidth <= 900) {
      toggleMenu();
    }
  };

  const canSee = (item) => {
    const rol = (usuario?.Rol || "").toLowerCase();
    const roles = item.roles.filter((r) => r !== "colaborador");
    if (rol === "vendedor") {
      return item.roles.includes("colaborador") || roles.includes("vendedor");
    }
    return usuario && roles.includes(rol);
  };

  const logout = async () => {
    const confirmed = await confirm(
      "Cerrar sesion",
      "Confirme que desea salir del sistema.",
      { variant: "disable" }
    );
    if (!confirmed) return;

    clearSession();
    window.location.href = "/login";
  };

  const nombreEmpresa = empresa.Nombre_Comercial || empresa.Nombre_Empresa || "Multiempresa";

  return (
    <div className={`sidebar ${menuOpen ? "open" : ""}`}>
      <button className="close-sidebar" onClick={toggleMenu} aria-label="Cerrar menu">
        <span></span>
        <span></span>
      </button>

      {usuario && (
        <div className="sidebar-brand">
          {empresa.Logo_Empresa && (
            <img src={empresa.Logo_Empresa} alt={nombreEmpresa} className="sidebar-brand-logo" />
          )}
          <strong>{nombreEmpresa}</strong>
          <small>{usuario.Nombre} · {usuario.Rol}</small>
        </div>
      )}

      <ul className="sidebar-menu">
        {!usuario && (
          <li>
            <NavLink to="/login" onClick={closeOnMobile}>
              <span className="sidebar-icon">{icons.login}</span>
              <span>Login</span>
            </NavLink>
          </li>
        )}

        {sections.map((section) => {
          const visibleItems = section.items.filter(canSee);

          if (!visibleItems.length) return null;

          return (
            <li className="sidebar-section" key={section.title}>
              <span className="sidebar-section-title">{section.title}</span>
              <ul>
                {visibleItems.map((item) => (
                  <li key={`${section.title}-${item.label}`}>
                    <NavLink to={item.to} end={item.end} onClick={closeOnMobile}>
                      <span className="sidebar-icon">{icons[item.icon]}</span>
                      <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}

        {usuario && (
          <li className="sidebar-section">
            <span className="sidebar-section-title">Sistema</span>
            <button className="sidebar-logout" onClick={logout}>
              <span className="sidebar-icon">{icons.logout}</span>
              <span>Cerrar Sesion</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;
