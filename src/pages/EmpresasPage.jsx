import { useEffect, useState } from "react";
import { apiJson } from "../utils/api";
import { backendErrorMessage, confirm, error, success, warning } from "../utils/alerts";

const emptyEmpresa = {
  Nombre_Empresa: "",
  Nombre_Comercial: "",
  Telefono: "",
  Correo: "",
  Direccion: "",
  Logo_Empresa: "",
  Color_Principal: "#0D6EFD",
  Color_Secundario: "#0D1B2A",
  Color_Boton: "#198754",
  Nombre_Gerente: "",
  DPI_Gerente: "",
  Telefono_Gerente: "",
  Texto_Contrato: "",
  Estado: "Activa",
};

function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(emptyEmpresa);
  const [editId, setEditId] = useState(null);

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
  };

  const seleccionar = (empresa) => {
    setEditId(empresa.Id_Empresa);
    setForm({ ...emptyEmpresa, ...empresa });
  };

  const guardar = async () => {
    if (!form.Nombre_Empresa.trim()) {
      warning("El nombre de la empresa es obligatorio.");
      return;
    }

    try {
      await apiJson(editId ? `/empresa/${editId}` : "/empresa", {
        method: editId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });

      limpiar();
      success(editId ? "Empresa actualizada." : "Registro creado correctamente.");
      cargarEmpresas();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  const cambiarEstado = async (empresa, Estado) => {
    if (Estado !== "Activa") {
      const confirmar = await confirm(
        Estado === "Eliminada" ? "Eliminar empresa" : "Suspender empresa",
        `La empresa "${empresa.Nombre_Comercial || empresa.Nombre_Empresa}" cambiara su estado a ${Estado}.`,
        { variant: Estado === "Eliminada" ? "delete" : "disable" }
      );

      if (!confirmar) return;
    }

    try {
      await apiJson(`/empresa/${empresa.Id_Empresa}`, {
        method: "PUT",
        body: JSON.stringify({ Estado }),
      });
      success("Registro actualizado correctamente.");
      cargarEmpresas();
    } catch (err) {
      error(backendErrorMessage(err));
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
        <input type="color" name="Color_Principal" value={form.Color_Principal || "#0D6EFD"} onChange={handleChange} />
        <label>Color_Secundario</label>
        <input type="color" name="Color_Secundario" value={form.Color_Secundario || "#0D1B2A"} onChange={handleChange} />
        <label>Color_Boton</label>
        <input type="color" name="Color_Boton" value={form.Color_Boton || "#198754"} onChange={handleChange} />

        <input name="Nombre_Gerente" placeholder="Nombre_Gerente" value={form.Nombre_Gerente || ""} onChange={handleChange} />
        <input name="DPI_Gerente" placeholder="DPI_Gerente" value={form.DPI_Gerente || ""} onChange={handleChange} />
        <input name="Telefono_Gerente" placeholder="Telefono_Gerente" value={form.Telefono_Gerente || ""} onChange={handleChange} />
        <textarea name="Texto_Contrato" placeholder="Texto_Contrato" value={form.Texto_Contrato || ""} onChange={handleChange} />

        <button className="btn-primary" onClick={guardar}>{editId ? "Actualizar" : "Crear"}</button>
        {editId && <button className="btn-secondary" onClick={limpiar}>Cancelar</button>}
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
                  <button className="btn-edit" onClick={() => seleccionar(empresa)}>Editar</button>
                  <button className="btn-primary" onClick={() => cambiarEstado(empresa, "Activa")}>Activar</button>
                  <button className="btn-secondary" onClick={() => cambiarEstado(empresa, "Suspendida")}>Suspender</button>
                  <button className="btn-delete" onClick={() => cambiarEstado(empresa, "Eliminada")}>Eliminar</button>
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
