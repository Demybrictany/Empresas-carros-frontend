import { useEffect, useState } from "react";
import { apiJson } from "../utils/api";
import { backendErrorMessage, confirm, error, success, warning } from "../utils/alerts";
import { applyEmpresaTheme, getUsuario, LOGIN_THEME, saveSession } from "../utils/session";

const emptyEmpresa = {
  Nombre_Empresa: "",
  Nombre_Comercial: "",
  Telefono: "",
  Correo: "",
  Direccion: "",
  Logo_Empresa: "",
  ...LOGIN_THEME,
  Nombre_Gerente: "",
  DPI_Gerente: "",
  Telefono_Gerente: "",
  Texto_Contrato: "",
  Estado: "Activa",
};

const emptyUsuarioEmpresa = {
  Nombre: "",
  Correo: "",
  Contrasena: "",
  Rol: "Gerente",
  Estado: "Activo",
};

function EmpresasPage({ vista = "crear" }) {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(emptyEmpresa);
  const [usuarioEmpresa, setUsuarioEmpresa] = useState(emptyUsuarioEmpresa);
  const [usuariosEmpresa, setUsuariosEmpresa] = useState([]);
  const [usuarioEditId, setUsuarioEditId] = useState(null);
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [editId, setEditId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [estadoEmpresaId, setEstadoEmpresaId] = useState(null);
  const esCrear = vista === "crear";
  const esAdministrar = vista === "administrar";
  const usuarioActual = getUsuario();

  const cargarEmpresas = async () => {
    try {
      const data = await apiJson("/empresa");
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const handleChange = (e) => {
    const nuevaEmpresa = { ...form, [e.target.name]: e.target.value };
    setForm(nuevaEmpresa);

    if (
      e.target.name.startsWith("Color_") &&
      Number(editId) === Number(usuarioActual?.Id_Empresa)
    ) {
      applyEmpresaTheme(nuevaEmpresa);
    }
  };

  const handleUsuarioChange = (e) => {
    setUsuarioEmpresa({ ...usuarioEmpresa, [e.target.name]: e.target.value });
  };

  const cargarLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setForm((prev) => ({ ...prev, Logo_Empresa: reader.result }));
    reader.readAsDataURL(file);
  };

  const limpiar = () => {
    setEditId(null);
    setForm(emptyEmpresa);
    setUsuarioEmpresa(emptyUsuarioEmpresa);
    setUsuariosEmpresa([]);
    setUsuarioEditId(null);
  };

  const cargarUsuariosEmpresa = async (idEmpresa) => {
    try {
      setCargandoUsuarios(true);
      const data = await apiJson("/usuarios");
      const lista = Array.isArray(data) ? data : data?.usuarios || [];
      const usuarios = lista.filter((usuario) => Number(usuario.Id_Empresa) === Number(idEmpresa));
      setUsuariosEmpresa(usuarios);
      return usuarios;
    } catch (err) {
      setUsuariosEmpresa([]);
      error(backendErrorMessage(err));
      return [];
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const seleccionarUsuario = (usuario) => {
    setUsuarioEditId(usuario.Id_Usuario);
    setUsuarioEmpresa({
      Nombre: usuario.Nombre || "",
      Correo: usuario.Correo || "",
      Contrasena: "",
      Rol: usuario.Rol || "Gerente",
      Estado: usuario.Estado || "Activo",
    });
  };

  const seleccionar = async (empresa) => {
    setEditId(empresa.Id_Empresa);
    setForm({ ...emptyEmpresa, ...empresa });
    setUsuarioEmpresa(emptyUsuarioEmpresa);
    setUsuarioEditId(null);

    if (Number(empresa.Id_Empresa) === Number(usuarioActual?.Id_Empresa)) {
      applyEmpresaTheme({ ...emptyEmpresa, ...empresa });
    }

    const usuarios = await cargarUsuariosEmpresa(empresa.Id_Empresa);
    if (usuarios.length === 1) {
      seleccionarUsuario(usuarios[0]);
    }
  };

  const empresaCreadaId = async (respuesta, nombreEmpresa) => {
    if (respuesta?.Id_Empresa) return respuesta.Id_Empresa;
    if (respuesta?.empresa?.Id_Empresa) return respuesta.empresa.Id_Empresa;
    if (respuesta?.id) return respuesta.id;

    const data = await apiJson("/empresa");
    const lista = Array.isArray(data) ? data : [];
    setEmpresas(lista);

    const encontradas = lista.filter(
      (empresa) =>
        empresa.Nombre_Empresa === nombreEmpresa ||
        empresa.Nombre_Comercial === form.Nombre_Comercial
    );

    const encontrada = encontradas.sort((a, b) => (b.Id_Empresa || 0) - (a.Id_Empresa || 0))[0];

    return encontrada?.Id_Empresa || null;
  };

  const guardar = async () => {
    if (guardando) return;

    if (esAdministrar && !editId) {
      warning("Seleccione una empresa para editar.");
      return;
    }

    if (!form.Nombre_Empresa.trim()) {
      warning("El nombre de la empresa es obligatorio.");
      return;
    }

    if (esCrear) {
      if (!usuarioEmpresa.Nombre.trim()) {
        warning("Ingrese el nombre del usuario de la empresa.");
        return;
      }

      if (!usuarioEmpresa.Correo.trim()) {
        warning("Ingrese el correo del usuario de la empresa.");
        return;
      }

      if (!usuarioEmpresa.Correo.includes("@") || !usuarioEmpresa.Correo.includes(".")) {
        warning("Correo invalido.");
        return;
      }

      if (!usuarioEmpresa.Contrasena.trim()) {
        warning("Ingrese la contrasena del usuario de la empresa.");
        return;
      }
    }

    try {
      setGuardando(true);
      const respuestaEmpresa = await apiJson(editId ? `/empresa/${editId}` : "/empresa", {
        method: editId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });

      if (esCrear) {
        const idEmpresa = await empresaCreadaId(respuestaEmpresa, form.Nombre_Empresa);

        if (!idEmpresa) {
          throw new Error("No se pudo obtener la empresa creada para asociar el usuario.");
        }

        await apiJson("/usuarios", {
          method: "POST",
          body: JSON.stringify({
            ...usuarioEmpresa,
            Id_Empresa: idEmpresa,
          }),
        });
      }

      if (editId && Number(editId) === Number(usuarioActual?.Id_Empresa)) {
        const nuevaEmpresa = { ...usuarioActual.empresa, ...form };
        saveSession({
          token: localStorage.getItem("token"),
          usuario: { ...usuarioActual, empresa: nuevaEmpresa },
        });
        applyEmpresaTheme(nuevaEmpresa);
      }

      limpiar();
      success(esCrear ? "Empresa y usuario creados correctamente." : "Empresa actualizada.");
      await cargarEmpresas();
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (empresa, Estado) => {
    if (estadoEmpresaId) return;

    if (Estado !== "Activa") {
      const confirmar = await confirm(
        Estado === "Eliminada" ? "Eliminar empresa" : "Suspender empresa",
        `La empresa "${empresa.Nombre_Comercial || empresa.Nombre_Empresa}" cambiara su estado a ${Estado}.`,
        { variant: Estado === "Eliminada" ? "delete" : "disable" }
      );

      if (!confirmar) return;
    }

    try {
      setEstadoEmpresaId(empresa.Id_Empresa);
      await apiJson(`/empresa/${empresa.Id_Empresa}`, {
        method: "PUT",
        body: JSON.stringify({ Estado }),
      });
      success("Registro actualizado correctamente.");
      await cargarEmpresas();
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setEstadoEmpresaId(null);
    }
  };

  const guardarUsuario = async () => {
    if (guardandoUsuario) return;

    if (!usuarioEditId) {
      warning("Seleccione un usuario para editar.");
      return;
    }

    if (!usuarioEmpresa.Nombre.trim()) {
      warning("Ingrese el nombre del usuario.");
      return;
    }

    if (!usuarioEmpresa.Correo.trim()) {
      warning("Ingrese el correo del usuario.");
      return;
    }

    if (!usuarioEmpresa.Correo.includes("@") || !usuarioEmpresa.Correo.includes(".")) {
      warning("Correo invalido.");
      return;
    }

    try {
      setGuardandoUsuario(true);

      const payload = {
        Nombre: usuarioEmpresa.Nombre,
        Correo: usuarioEmpresa.Correo,
        Rol: usuarioEmpresa.Rol,
        Estado: usuarioEmpresa.Estado,
        Id_Empresa: editId,
      };

      if (usuarioEmpresa.Contrasena.trim()) {
        payload.Contrasena = usuarioEmpresa.Contrasena;
      }

      await apiJson(`/usuarios/${usuarioEditId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      success("Usuario actualizado correctamente.");
      setUsuarioEmpresa(emptyUsuarioEmpresa);
      setUsuarioEditId(null);
      await cargarUsuariosEmpresa(editId);
    } catch (err) {
      error(backendErrorMessage(err));
    } finally {
      setGuardandoUsuario(false);
    }
  };

  return (
    <div className="page-container">
      <h1>{esCrear ? "Crear Empresa" : "Administrar Empresas"}</h1>

      {(esCrear || editId) && (
        <div className="form-box">
          <h3>{esCrear ? "Nueva Empresa" : "Editar Empresa"}</h3>

          <input name="Nombre_Empresa" placeholder="Nombre_Empresa" value={form.Nombre_Empresa} onChange={handleChange} />
          <input name="Nombre_Comercial" placeholder="Nombre_Comercial" value={form.Nombre_Comercial || ""} onChange={handleChange} />
          <input name="Telefono" placeholder="Telefono" value={form.Telefono || ""} onChange={handleChange} />
          <input name="Correo" placeholder="Correo" value={form.Correo || ""} onChange={handleChange} />
          <input name="Direccion" placeholder="Direccion" value={form.Direccion || ""} onChange={handleChange} />

          <label>Logo_Empresa</label>
          <input type="file" accept="image/*" onChange={cargarLogo} />
          {form.Logo_Empresa && <img src={form.Logo_Empresa} alt="Logo empresa" style={{ width: 90, height: 70, objectFit: "contain" }} />}

          <label>Color_Principal</label>
          <input type="color" name="Color_Principal" value={form.Color_Principal || LOGIN_THEME.Color_Principal} onChange={handleChange} />
          <label>Color_Secundario</label>
          <input type="color" name="Color_Secundario" value={form.Color_Secundario || LOGIN_THEME.Color_Secundario} onChange={handleChange} />
          <label>Color_Boton</label>
          <input type="color" name="Color_Boton" value={form.Color_Boton || LOGIN_THEME.Color_Boton} onChange={handleChange} />

          <input name="Nombre_Gerente" placeholder="Nombre_Gerente" value={form.Nombre_Gerente || ""} onChange={handleChange} />
          <input name="DPI_Gerente" placeholder="DPI_Gerente" value={form.DPI_Gerente || ""} onChange={handleChange} />
          <input name="Telefono_Gerente" placeholder="Telefono_Gerente" value={form.Telefono_Gerente || ""} onChange={handleChange} />
          <textarea name="Texto_Contrato" placeholder="Texto_Contrato" value={form.Texto_Contrato || ""} onChange={handleChange} />

          {esCrear && (
            <>
              <h3>Usuario de la empresa</h3>
              <input
                name="Nombre"
                placeholder="Nombre del usuario"
                value={usuarioEmpresa.Nombre}
                onChange={handleUsuarioChange}
              />
              <input
                name="Correo"
                placeholder="Correo del usuario"
                value={usuarioEmpresa.Correo}
                onChange={handleUsuarioChange}
              />
              <input
                name="Contrasena"
                type="password"
                placeholder="Contrasena del usuario"
                value={usuarioEmpresa.Contrasena}
                onChange={handleUsuarioChange}
              />
              <select
                name="Rol"
                value={usuarioEmpresa.Rol}
                onChange={handleUsuarioChange}
              >
                <option value="Gerente">Gerente</option>
                <option value="Vendedor">Vendedor</option>
              </select>
            </>
          )}

          <button className="btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : esCrear ? "Crear empresa y usuario" : "Actualizar"}
          </button>
          {esAdministrar && <button className="btn-secondary" onClick={limpiar} disabled={guardando}>Cancelar</button>}
        </div>
      )}

      {esAdministrar && editId && (
        <div className="form-box">
          <h3>Usuarios de la empresa</h3>

          {cargandoUsuarios ? (
            <p>Cargando usuarios...</p>
          ) : usuariosEmpresa.length === 0 ? (
            <p>No hay usuarios asociados a esta empresa.</p>
          ) : (
            <select
              value={usuarioEditId || ""}
              onChange={(e) => {
                const usuario = usuariosEmpresa.find((item) => Number(item.Id_Usuario) === Number(e.target.value));
                if (usuario) seleccionarUsuario(usuario);
              }}
            >
              <option value="">Seleccione usuario</option>
              {usuariosEmpresa.map((usuario) => (
                <option key={usuario.Id_Usuario} value={usuario.Id_Usuario}>
                  {usuario.Nombre} - {usuario.Correo} - {usuario.Rol}
                </option>
              ))}
            </select>
          )}

          {usuarioEditId && (
            <>
              <input
                name="Nombre"
                placeholder="Nombre del usuario"
                value={usuarioEmpresa.Nombre}
                onChange={handleUsuarioChange}
              />
              <input
                name="Correo"
                placeholder="Correo del usuario"
                value={usuarioEmpresa.Correo}
                onChange={handleUsuarioChange}
              />
              <input
                name="Contrasena"
                type="password"
                placeholder="Nueva contrasena (opcional)"
                value={usuarioEmpresa.Contrasena}
                onChange={handleUsuarioChange}
              />
              <select name="Rol" value={usuarioEmpresa.Rol} onChange={handleUsuarioChange}>
                <option value="Gerente">Gerente</option>
                <option value="Vendedor">Vendedor</option>
              </select>
              <select name="Estado" value={usuarioEmpresa.Estado} onChange={handleUsuarioChange}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>

              <button className="btn-primary" onClick={guardarUsuario} disabled={guardandoUsuario}>
                {guardandoUsuario ? "Guardando..." : "Actualizar usuario"}
              </button>
            </>
          )}
        </div>
      )}

      {esAdministrar && (
        <div className="table-container">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Comercial</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.Id_Empresa}>
                  <td>{empresa.Nombre_Empresa}</td>
                  <td>{empresa.Nombre_Comercial}</td>
                  <td>{empresa.Estado}</td>
                  <td>
                    <button className="btn-edit" onClick={() => seleccionar(empresa)} disabled={estadoEmpresaId === empresa.Id_Empresa}>Editar</button>
                    <button className="btn-primary" onClick={() => cambiarEstado(empresa, "Activa")} disabled={estadoEmpresaId === empresa.Id_Empresa}>
                      {estadoEmpresaId === empresa.Id_Empresa ? "Guardando..." : "Activar"}
                    </button>
                    <button className="btn-secondary" onClick={() => cambiarEstado(empresa, "Suspendida")} disabled={estadoEmpresaId === empresa.Id_Empresa}>Suspender</button>
                    <button className="btn-delete" onClick={() => cambiarEstado(empresa, "Eliminada")} disabled={estadoEmpresaId === empresa.Id_Empresa}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmpresasPage;
