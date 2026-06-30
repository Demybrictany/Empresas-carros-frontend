export const LOGIN_THEME = {
  Color_Principal: "#594646",
  Color_Secundario: "#3D3030",
  Color_Boton: "#8B6F5E",
};

const EMPRESA_DEFAULT = {
  Nombre_Empresa: "",
  Nombre_Comercial: "",
  Logo_Empresa: "",
  ...LOGIN_THEME,
};

export const normalizeUsuario = (usuario = {}) => {
  const empresa = usuario.empresa || usuario.Empresa || {};

  return {
    Id_Usuario: usuario.Id_Usuario ?? usuario.id ?? "",
    Id_Empresa: usuario.Id_Empresa ?? "",
    Nombre: usuario.Nombre ?? usuario.nombre ?? "",
    Correo: usuario.Correo ?? usuario.correo ?? "",
    Rol: usuario.Rol ?? usuario.rol ?? "",
    Estado: usuario.Estado ?? "Activo",
    empresa: {
      ...EMPRESA_DEFAULT,
      ...empresa,
    },
  };
};

export const getUsuario = () => {
  try {
    const data = localStorage.getItem("usuario");
    return data ? normalizeUsuario(JSON.parse(data)) : null;
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem("token") || "";

export const saveSession = ({ token, usuario }) => {
  const normalized = normalizeUsuario(usuario);

  if (token) localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(normalized));
  localStorage.setItem("Id_Usuario", normalized.Id_Usuario);
  localStorage.setItem("Id_Empresa", normalized.Id_Empresa);
  localStorage.setItem("Nombre", normalized.Nombre);
  localStorage.setItem("Correo", normalized.Correo);
  localStorage.setItem("Rol", normalized.Rol);
  localStorage.setItem("Estado", normalized.Estado);
  localStorage.setItem("empresa", JSON.stringify(normalized.empresa));

  window.dispatchEvent(new Event("usuarioActualizado"));
  window.dispatchEvent(new Event("empresaActualizada"));

  return normalized;
};

export const clearSession = () => {
  localStorage.clear();
  window.dispatchEvent(new Event("usuarioActualizado"));
  window.dispatchEvent(new Event("empresaActualizada"));
};

export const getRol = () => getUsuario()?.Rol || "";

export const hasRole = (roles = []) => {
  const rol = getRol();
  return roles.includes(rol);
};

export const getEmpresa = () => getUsuario()?.empresa || EMPRESA_DEFAULT;

export const applyEmpresaTheme = (empresa = getEmpresa()) => {
  const hexToRgb = (hex) => {
    const normalized = String(hex || "").replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
    return [
      parseInt(normalized.slice(0, 2), 16),
      parseInt(normalized.slice(2, 4), 16),
      parseInt(normalized.slice(4, 6), 16),
    ].join(", ");
  };

  const principal = empresa.Color_Principal || EMPRESA_DEFAULT.Color_Principal;
  const secundario = empresa.Color_Secundario || EMPRESA_DEFAULT.Color_Secundario;
  const boton = empresa.Color_Boton || EMPRESA_DEFAULT.Color_Boton;
  const principalRgb = hexToRgb(principal) || "13, 110, 253";
  const secundarioRgb = hexToRgb(secundario) || "13, 27, 42";
  const botonRgb = hexToRgb(boton) || "25, 135, 84";

  const root = document.documentElement;
  root.style.setProperty("--color-principal", principal);
  root.style.setProperty("--color-principal-rgb", principalRgb);
  root.style.setProperty("--color-secundario", secundario);
  root.style.setProperty("--color-secundario-rgb", secundarioRgb);
  root.style.setProperty("--color-boton", boton);
  root.style.setProperty("--color-boton-rgb", botonRgb);
};
