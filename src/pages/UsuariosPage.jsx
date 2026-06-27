import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../config";
import TablaDesplegable from "../Components/tablas/TablaDesplegable";

function UsuariosPage() {

const [usuarios, setUsuarios] = useState([]);
const [Nombre, setNombre] = useState("");
const [Correo, setCorreo] = useState("");
const [Contrasena, setContrasena] = useState("");
const [Rol, setRol] = useState("");

const API = BASE_URL + "/usuarios";
const usuariosMostrados = usuarios.filter((u) => u.Rol !== "programador");

// ============================
// CARGAR USUARIOS
// ============================

const cargarUsuarios = useCallback(async () => {

  try {

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No hay token guardado");
      return;
    }

    const res = await fetch(API, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    console.log("Respuesta backend:", data);

    if (!res.ok) {
      console.error(data.error || "Error al cargar usuarios");
      return;
    }

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

}, [API]);

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

  const error = validar();

  if (error) {
    alert(error);
    return;
  }

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(API, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },

      body: JSON.stringify({
        Nombre,
        Correo,
        Contrasena,
        Rol
      })

    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al crear usuario");
      return;
    }

    alert("Usuario creado correctamente");

    setNombre("");
    setCorreo("");
    setContrasena("");
    setRol("");

    cargarUsuarios();

  } catch (error) {

    console.error("Error creando usuario:", error);

  }

};

// ============================
// ELIMINAR USUARIO
// ============================

const eliminarUsuario = async (id) => {

  const confirmar = window.confirm("¿Seguro que deseas eliminar este usuario?");

  if (!confirmar) return;

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(API + "/" + id, {

      method: "DELETE",

      headers: {
        Authorization: "Bearer " + token
      }

    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el usuario");
      return;
    }

    alert("Usuario eliminado");

    cargarUsuarios();

  } catch (error) {

    console.error("Error eliminando usuario:", error);

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
      <option value="gerente">Gerente</option>
      <option value="colaborador">Colaborador</option>
      <option value="cliente">Cliente</option>
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
        <th>ID</th>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Rol</th>
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

              <td>{u.Id_Usuario}</td>
              <td>{u.Nombre}</td>
              <td>{u.Correo}</td>
              <td>{u.Rol}</td>

              <td>
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
