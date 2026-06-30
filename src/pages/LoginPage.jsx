import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { applyEmpresaTheme, saveSession } from "../utils/session";
import { error, success, warning } from "../utils/alerts";

function LoginPage() {
  const navigate = useNavigate();

  const [Correo, setCorreo] = useState("");
  const [Contrasena, setContrasena] = useState("");

  const API = `${BASE_URL}/usuarios/login`;

  const iniciarSesion = async () => {
    const correo = Correo.trim();

    if (!correo || !Contrasena) {
      warning("Ingrese correo electronico y contrasena para continuar.");
      return;
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Correo: correo,
          Contrasena,
          usuario: correo,
          contrasena: Contrasena,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error(data.error || "Revise sus credenciales e intente nuevamente.");
        return;
      }

      const usuarioSesion = saveSession({
        token: data.token,
        usuario: data.usuario,
      });

      applyEmpresaTheme(usuarioSesion.empresa);

      await success(`Bienvenido, ${usuarioSesion.Nombre || usuarioSesion.Correo}.`, { timer: 1000 });

      if (usuarioSesion.Rol === "Vendedor") {
        navigate("/carros-predio");
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("ERROR LOGIN:", err);
      error("No se pudo conectar con el servidor. Verifique que el backend este activo.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesion</h2>

        <input
          type="email"
          placeholder="Correo electronico"
          value={Correo}
          autoComplete="off"
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contrasena"
          value={Contrasena}
          autoComplete="new-password"
          onChange={(e) => setContrasena(e.target.value)}
        />

        <button className="btn-primary" onClick={iniciarSesion}>
          Ingresar
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
