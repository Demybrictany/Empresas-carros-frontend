import { useState } from "react";
import { registrarUsuario } from "../services/usuarioApi";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";

function CrearUsuarioPage() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    Nombre: "",
    Correo: "",
    Contrasena: "",
    Rol: "Vendedor",
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (guardando) return;

    if (!token) {
      warning("No autorizado.");
      return;
    }

    try {
      setGuardando(true);
      const data = await registrarUsuario(form);

      if (data.error) {
        error(data.error);
        return;
      }

      await success("Usuario creado.");
      window.location.href = "/usuarios";
    } catch (err) {
      console.error(err);
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Crear Usuario</h2>

        <form onSubmit={submit}>
          <input name="Nombre" placeholder="Nombre" onChange={handleChange} required />
          <input name="Correo" placeholder="Correo" onChange={handleChange} required />
          <input
            name="Contrasena"
            type="password"
            placeholder="Contrasena"
            onChange={handleChange}
            required
          />

          <select name="Rol" onChange={handleChange}>
            <option value="Vendedor">Vendedor</option>
            <option value="Gerente">Gerente</option>
          </select>

          <button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CrearUsuarioPage;
