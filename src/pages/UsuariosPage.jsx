import { useState, useEffect, useCallback } from "react";
import TablaDesplegable from "../Components/tablas/TablaDesplegable";
import { apiJson } from "../utils/api";
import { backendErrorMessage, confirm, error, success, warning } from "../utils/alerts";

function UsuariosPage() {

const [usuarios, setUsuarios] = useState([]);
const [Nombre, setNombre] = useState("");
const [Correo, setCorreo] = useState("");
const [Contrasena, setContrasena] = useState("");
const [Rol, setRol] = useState("");

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

// ============================
// USE EFFECT
// ============================

useEffect(() => {
  cargarUsuarios();
}, [cargarUsuarios]);

// ============================
// VALIDACIONES
// ============================

const validar = () => {

  if (!Nombre.trim()) return "Debe ingresar un nombre.";
  if (!Correo.trim()) return "Debe ingresar un correo.";
  if (!Correo.includes("@") || !Correo.includes(".")) return "Correo inválido.";
  if (!Contrasena.trim()) return "Debe ingresar una contraseña.";
  if (!Rol) return "Debe seleccionar un rol.";

  return null;

};

// ============================
// CREAR USUARIO
// ============================

const crearUsuario = async () => {

  const validationError = validar();

  if (validationError) {
    warning(validationError);
    return;
  }

  try {

    await apiJson("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        Nombre,
        Correo,
        Contrasena,
        Rol
      })
    });

    success("Usuario creado.");

    setNombre("");
    setCorreo("");
    setContrasena("");
    setRol("");

    cargarUsuarios();

  } catch (err) {

    console.error("Error creando usuario:", err);
    error(backendErrorMessage(err));

  }

};

// ============================
// ELIMINAR USUARIO
// ============================

const eliminarUsuario = async (id) => {

  const confirmar = await confirm(
    "Eliminar usuario",
    "Esta accion eliminara el usuario seleccionado. Confirme solo si esta seguro.",
    { variant: "delete" }
  );

  if (!confirmar) return;

  try {

    await apiJson(`/usuarios/${id}`, {
      method: "DELETE",
    });

    success("Registro eliminado correctamente.");

    cargarUsuarios();

  } catch (err) {

    console.error("Error eliminando usuario:", err);
    error(backendErrorMessage(err));

  }

};

const cambiarEstadoUsuario = async (id, Estado) => {
  if (Estado !== "Activo") {
    const confirmar = await confirm(
      Estado === "Bloqueado" ? "Bloquear usuario" : "Inactivar usuario",
      `El usuario no podra trabajar normalmente mientras su estado sea ${Estado}.`,
      { variant: "disable" }
    );

    if (!confirmar) return;
  }

  try {
    await apiJson(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ Estado }),
    });

    success("Registro actualizado correctamente.");
    cargarUsuarios();
  } catch (err) {
    error(backendErrorMessage(err));
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

    <button
      className="btn-primary"
      onClick={crearUsuario}
    >
      Crear Usuario
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
                >
                  Activar
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => cambiarEstadoUsuario(u.Id_Usuario, "Inactivo")}
                >
                  Inactivar
                </button>

                <button
                  className="btn-delete"
                  onClick={() => cambiarEstadoUsuario(u.Id_Usuario, "Bloqueado")}
                >
                  Bloquear
                </button>

                <button
                  className="btn-eliminar-usuario"
                  onClick={() => eliminarUsuario(u.Id_Usuario)}
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
