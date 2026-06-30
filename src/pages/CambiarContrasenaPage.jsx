import { useState } from "react";
import { BASE_URL } from "../config";
import { apiJson } from "../utils/api";
import { backendErrorMessage, error, success, warning } from "../utils/alerts";
import { getUsuario } from "../utils/session";

function CambiarContrasenaPage() {
  const usuario = getUsuario();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const limpiar = () => {
    setActual("");
    setNueva("");
    setConfirmacion("");
  };

  const validar = () => {
    if (!actual.trim()) return "Ingrese su contrasena actual.";
    if (!nueva.trim()) return "Ingrese la nueva contrasena.";
    if (nueva.length < 6) return "La nueva contrasena debe tener al menos 6 caracteres.";
    if (nueva !== confirmacion) return "La nueva contrasena y la confirmacion no coinciden.";
    if (actual === nueva) return "La nueva contrasena debe ser diferente a la actual.";
    return null;
  };

  const verificarContrasenaActual = async () => {
    const res = await fetch(`${BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Correo: usuario.Correo,
        Contrasena: actual,
        usuario: usuario.Correo,
        contrasena: actual,
      }),
    });

    return res.ok;
  };

  const guardar = async () => {
    if (guardando) return;

    const validationError = validar();
    if (validationError) {
      warning(validationError);
      return;
    }

    try {
      setGuardando(true);

      const contrasenaValida = await verificarContrasenaActual();
      if (!contrasenaValida) {
        error("No se pudo cambiar la contrasena. Revise los datos e intente nuevamente.");
        return;
      }

      await apiJson(`/usuarios/${usuario.Id_Usuario}`, {
        method: "PUT",
        body: JSON.stringify({ Contrasena: nueva }),
      });

      limpiar();
      success("Contrasena actualizada correctamente.");
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Cambiar Contrasena</h1>

      <div className="form-box">
        <input
          type="password"
          placeholder="Contrasena actual"
          value={actual}
          autoComplete="current-password"
          onChange={(e) => setActual(e.target.value)}
        />

        <input
          type="password"
          placeholder="Nueva contrasena"
          value={nueva}
          autoComplete="new-password"
          onChange={(e) => setNueva(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar nueva contrasena"
          value={confirmacion}
          autoComplete="new-password"
          onChange={(e) => setConfirmacion(e.target.value)}
        />

        <button className="btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : "Cambiar contrasena"}
        </button>
      </div>
    </div>
  );
}

export default CambiarContrasenaPage;
