import { useEffect, useState } from "react";
import { apiJson } from "../utils/api";
import { backendErrorMessage, confirm, error, success, warning } from "../utils/alerts";
import { LOGIN_THEME } from "../utils/session";

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
};

function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(emptyEmpresa);
  const [usuarioEmpresa, setUsuarioEmpresa] = useState(emptyUsuarioEmpresa);
  const [editId, setEditId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [estadoEmpresaId, setEstadoEmpresaId] = useState(null);

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
    setForm({ ...form, [e.target.name]: e.target.value });
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
  };

  const seleccionar = (empresa) => {
    setEditId(empresa.Id_Empresa);
    setForm({ ...emptyEmpresa, ...empresa });
    setUsuarioEmpresa(emptyUsuarioEmpresa);
  };

  const empresaCreadaId = async (respuesta, nombreEmpresa) => {
    if (respuesta?.Id_Empresa) return respuesta.Id_Empresa;
    if (respuesta?.empresa?.Id_Empresa) return respuesta.empresa.Id_Empresa;
    if (respuesta?.id) return respuesta.id;

    const data = await apiJson("/empresa");
    const lista = Array.isArray(data) ? data : [];
    setEmpresas(lista);

    const encontrada = lista.find(
      (empresa) =>
        empresa.Nombre_Empresa === nombreEmpresa ||
        empresa.Nombre_Comercial === form.Nombre_Comercial
    );

    return encontrada?.Id_Empresa || null;
  };

  const guardar = async () => {
    if (guardando) return;

    if (!form.Nombre_Empresa.trim()) {
      warning("El nombre de la empresa es obligatorio.");
      return;
    }

    if (!editId) {
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

      if (!editId) {
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

      limpiar();
      success(editId ? "Empresa actualizada." : "Empresa y usuario creados correctamente.");
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

  return (
    <div className="page-container">
      <h1>Gestion de Empresas</h1>

      <div className="form-box">
        <h3>{editId ? "Editar Empresa" : "Nueva Empresa"}</h3>

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

        {!editId && (
          <>
            <h3>Usuario de la empresa</h3>
            <input
              placeholder="Nombre del usuario"
              value={usuarioEmpresa.Nombre}
              onChange={(e) => setUsuarioEmpresa({ ...usuarioEmpresa, Nombre: e.target.value })}
            />
            <input
              placeholder="Correo del usuario"
              value={usuarioEmpresa.Correo}
              onChange={(e) => setUsuarioEmpresa({ ...usuarioEmpresa, Correo: e.target.value })}
            />
            <input
              type="password"
              placeholder="Contrasena del usuario"
              value={usuarioEmpresa.Contrasena}
              onChange={(e) => setUsuarioEmpresa({ ...usuarioEmpresa, Contrasena: e.target.value })}
            />
            <select
              value={usuarioEmpresa.Rol}
              onChange={(e) => setUsuarioEmpresa({ ...usuarioEmpresa, Rol: e.target.value })}
            >
              <option value="Gerente">Gerente</option>
              <option value="Vendedor">Vendedor</option>
            </select>
          </>
        )}

        <button className="btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : editId ? "Actualizar" : "Crear empresa y usuario"}
        </button>
        {editId && <button className="btn-secondary" onClick={limpiar} disabled={guardando}>Cancelar</button>}
      </div>

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
    </div>
  );
}

export default EmpresasPage;
