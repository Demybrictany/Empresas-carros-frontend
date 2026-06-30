import { useState, useEffect, useCallback } from "react";
import TablaDesplegable from "../Components/tablas/TablaDesplegable";
import { apiJson } from "../utils/api";
import { backendErrorMessage, confirm, error, success, warning } from "../utils/alerts";
import { getUsuario } from "../utils/session";

function UsuariosPage() {

const [usuarios, setUsuarios] = useState([]);
const [empresas, setEmpresas] = useState([]);
const [Nombre, setNombre] = useState("");
const [Correo, setCorreo] = useState("");
const [Contrasena, setContrasena] = useState("");
const [Rol, setRol] = useState("");
const [Id_Empresa, setIdEmpresa] = useState("");
const [guardando, setGuardando] = useState(false);
const [accionUsuarioId, setAccionUsuarioId] = useState(null);
const usuarioActual = getUsuario();
const esProgramador = usuarioActual?.Rol === "Programador";

const usuariosMostrados = usuarios.filter((u) => u.Rol !== "Programador");

// ============================
// CARGAR USUARIOS
// ============================

const cargarUsuarios = useCallback(async () => {

  try {

    const data = await apiJson("/usuarios");

    if (Array.isArray(data)) {
      setUsuarios(data);
    } 
    else if (Array.isArray(data.usuarios)) {
      setUsuarios(data.usuarios);
    } 
    else {
      console.error("Formato inesperado:", data);
      setUsuarios([]);
    }

  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }

}, []);

const cargarEmpresas = useCallback(async () => {
  if (!esProgramador) return;

  try {
    const data = await apiJson("/empresa");
    setEmpresas(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error cargando empresas:", error);
    setEmpresas([]);
  }
}, [esProgramador]);

// ============================
// USE EFFECT
// ============================

useEffect(() => {
  cargarUsuarios();
  cargarEmpresas();
}, [cargarUsuarios, cargarEmpresas]);

// ============================
// VALIDACIONES
// ============================

const validar = () => {

  if (!Nombre.trim()) return "Debe ingresar un nombre.";
  if (!Correo.trim()) return "Debe ingresar un correo.";
  if (!Correo.includes("@") || !Correo.includes(".")) return "Correo inválido.";
  if (!Contrasena.trim()) return "Debe ingresar una contraseña.";
  if (!Rol) return "Debe seleccionar un rol.";
  if (esProgramador && !Id_Empresa) return "Debe seleccionar la empresa del usuario.";

  return null;

};

// ============================
// CREAR USUARIO
// ============================

const crearUsuario = async () => {
  if (guardando) return;

  const validationError = validar();

  if (validationError) {
    warning(validationError);
    return;
  }

  try {
    setGuardando(true);

    await apiJson("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        Nombre,
        Correo,
        Contrasena,
        Rol,
        ...(esProgramador ? { Id_Empresa: parseInt(Id_Empresa, 10) } : {})
      })
    });

    success("Usuario creado.");

    setNombre("");
    setCorreo("");
    setContrasena("");
    setRol("");
    setIdEmpresa("");

    cargarUsuarios();

  } catch (err) {

    console.error("Error creando usuario:", err);
    error(backendErrorMessage(err));

  } finally {
    setGuardando(false);
  }

};

// ============================
// ELIMINAR USUARIO
// ============================

const eliminarUsuario = async (id) => {
  if (accionUsuarioId) return;

  const confirmar = await confirm(
    "Eliminar usuario",
    "Esta accion eliminara el usuario seleccionado. Confirme solo si esta seguro.",
    { variant: "delete" }
  );

  if (!confirmar) return;

  try {
    setAccionUsuarioId(id);

    await apiJson(`/usuarios/${id}`, {
      method: "DELETE",
    });

    success("Registro eliminado correctamente.");

    cargarUsuarios();

  } catch (err) {

    console.error("Error eliminando usuario:", err);
    error(backendErrorMessage(err));

  } finally {
    setAccionUsuarioId(null);
  }

};

const cambiarEstadoUsuario = async (id, Estado) => {
  if (accionUsuarioId) return;

  if (Estado !== "Activo") {
    const confirmar = await confirm(
      Estado === "Bloqueado" ? "Bloquear usuario" : "Inactivar usuario",
      `El usuario no podra trabajar normalmente mientras su estado sea ${Estado}.`,
      { variant: "disable" }
    );

    if (!confirmar) return;
  }

  try {
    setAccionUsuarioId(id);
    await apiJson(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ Estado }),
    });

    success("Registro actualizado correctamente.");
    cargarUsuarios();
  } catch (err) {
    error(backendErrorMessage(err));
  } finally {
    setAccionUsuarioId(null);
  }
};

return (

<div className="page-container">

  <h1>Gestión de Usuarios</h1>

  <div className="form-box">

    <input
      placeholder="Nombre"
      value={Nombre}
      onChange={(e) => setNombre(e.target.value)}
    />

    <input
      placeholder="Correo"
      value={Correo}
      onChange={(e) => setCorreo(e.target.value)}
    />

    <input
      type="password"
      placeholder="Contraseña"
      value={Contrasena}
      onChange={(e) => setContrasena(e.target.value)}
    />

    <select
      value={Rol}
      onChange={(e) => setRol(e.target.value)}
    >
      <option value="">Seleccione Rol</option>
      <option value="Gerente">Gerente</option>
      <option value="Vendedor">Vendedor</option>
    </select>

    {esProgramador && (
      <select
        value={Id_Empresa}
        onChange={(e) => setIdEmpresa(e.target.value)}
      >
        <option value="">Seleccione Empresa</option>
        {empresas.map((empresa) => (
          <option key={empresa.Id_Empresa} value={empresa.Id_Empresa}>
            {empresa.Nombre_Comercial || empresa.Nombre_Empresa}
          </option>
        ))}
      </select>
    )}

    <button
      className="btn-primary"
      onClick={crearUsuario}
      disabled={guardando}
    >
      {guardando ? "Creando..." : "Crear Usuario"}
    </button>

  </div>

  <TablaDesplegable total={usuariosMostrados.length}>
    {(limite) => (
  <table className="table-modern">

    <thead>
      <tr>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Rol</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>

    <tbody>

      {usuariosMostrados.length === 0 ? (

        <tr>
          <td colSpan="5" style={{ textAlign: "center" }}>
            No hay usuarios registrados
          </td>
        </tr>

      ) : (

        usuariosMostrados.slice(0, limite).map((u) => (

            <tr key={u.Id_Usuario}>

              <td>{u.Nombre}</td>
              <td>{u.Correo}</td>
              <td>{u.Rol}</td>
              <td>{u.Estado}</td>

              <td>
                <button
                  className="btn-primary"
                  onClick={() => cambiarEstadoUsuario(u.Id_Usuario, "Activo")}
                  disabled={accionUsuarioId === u.Id_Usuario}
                >
                  {accionUsuarioId === u.Id_Usuario ? "Guardando..." : "Activar"}
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => cambiarEstadoUsuario(u.Id_Usuario, "Inactivo")}
                  disabled={accionUsuarioId === u.Id_Usuario}
                >
                  Inactivar
                </button>

                <button
                  className="btn-delete"
                  onClick={() => cambiarEstadoUsuario(u.Id_Usuario, "Bloqueado")}
                  disabled={accionUsuarioId === u.Id_Usuario}
                >
                  Bloquear
                </button>

                <button
                  className="btn-eliminar-usuario"
                  onClick={() => eliminarUsuario(u.Id_Usuario)}
                  disabled={accionUsuarioId === u.Id_Usuario}
                >
                  Eliminar
                </button>
              </td>

            </tr>

          ))

      )}

    </tbody>

  </table>
    )}
  </TablaDesplegable>

</div>

);

}

export default UsuariosPage;
