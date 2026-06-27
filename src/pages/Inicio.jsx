import React, { useMemo } from "react";

function Inicio() {
  const nombreUsuario = useMemo(() => {
    const data = localStorage.getItem("usuario");

    if (!data) return "Usuario";

    try {
      const usuario = JSON.parse(data);
      const nombre =
        usuario.Nombre ||
        usuario.nombre ||
        usuario.name ||
        usuario.usuario ||
        usuario.username ||
        usuario.Correo ||
        usuario.correo;

      return nombre || "Usuario";
    } catch {
      return "Usuario";
    }
  }, []);

  return (
    <div className="inicio-container">
      <section className="inicio-welcome" aria-label="Bienvenida">
        <span>Bienvenido</span>
        <h1>{nombreUsuario}</h1>
        <p>Que tengas una excelente jornada gestionando el predio.</p>
      </section>
    </div>
  );
}

export default Inicio;
