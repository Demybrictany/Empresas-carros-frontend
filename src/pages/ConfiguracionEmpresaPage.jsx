import { useEffect, useState } from "react";
import { apiJson } from "../utils/api";
import { applyEmpresaTheme, getUsuario, saveSession } from "../utils/session";
import { backendErrorMessage, error, success } from "../utils/alerts";

const emptyContrato = {
  Titulo_Contrato: "DOCUMENTO DE COMPRAVENTA",
  Texto_Inicial: "",
  Clausula_Estado_Vehiculo: "",
  Clausula_Devolucion: "",
  Texto_Final: "",
};

function ConfiguracionEmpresaPage() {
  const usuario = getUsuario();
  const [empresa, setEmpresa] = useState(usuario?.empresa || {});
  const [contrato, setContrato] = useState(emptyContrato);
  const [contratoId, setContratoId] = useState(null);

  const cargar = async () => {
    try {
      const empresaData = await apiJson(`/empresa/${usuario.Id_Empresa}`);
      setEmpresa(empresaData);

      const configs = await apiJson("/contrato-configuracion");
      const config = Array.isArray(configs) ? configs[0] : null;
      if (config) {
        setContratoId(config.Id_Contrato_Config);
        setContrato({ ...emptyContrato, ...config });
      }
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmpresa = (e) => {
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };

  const handleContrato = (e) => {
    setContrato({ ...contrato, [e.target.name]: e.target.value });
  };

  const cargarLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setEmpresa((prev) => ({ ...prev, Logo_Empresa: reader.result }));
    reader.readAsDataURL(file);
  };

  const guardarEmpresa = async () => {
    try {
      const { Id_Empresa, Fecha_Registro, ...payload } = empresa;
      await apiJson(`/empresa/${usuario.Id_Empresa}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const nuevaEmpresa = { ...usuario.empresa, ...payload };
      saveSession({ token: localStorage.getItem("token"), usuario: { ...usuario, empresa: nuevaEmpresa } });
      applyEmpresaTheme(nuevaEmpresa);
      success("Empresa actualizada.");
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  const guardarContrato = async () => {
    try {
      await apiJson(contratoId ? `/contrato-configuracion/${contratoId}` : "/contrato-configuracion", {
        method: contratoId ? "PUT" : "POST",
        body: JSON.stringify(contrato),
      });
      success("Registro actualizado correctamente.");
      cargar();
    } catch (err) {
      error(backendErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <h1>Configuracion de Empresa</h1>

      <div className="form-box">
        <h3>Datos de empresa</h3>
        <input name="Nombre_Empresa" placeholder="Nombre_Empresa" value={empresa.Nombre_Empresa || ""} onChange={handleEmpresa} />
        <input name="Nombre_Comercial" placeholder="Nombre_Comercial" value={empresa.Nombre_Comercial || ""} onChange={handleEmpresa} />
        <input name="Telefono" placeholder="Telefono" value={empresa.Telefono || ""} onChange={handleEmpresa} />
        <input name="Correo" placeholder="Correo" value={empresa.Correo || ""} onChange={handleEmpresa} />
        <input name="Direccion" placeholder="Direccion" value={empresa.Direccion || ""} onChange={handleEmpresa} />

        <label>Logo_Empresa</label>
        <input type="file" accept="image/*" onChange={cargarLogo} />
        {empresa.Logo_Empresa && <img src={empresa.Logo_Empresa} alt="Logo empresa" style={{ width: 90, height: 70, objectFit: "contain" }} />}

        <label>Color_Principal</label>
        <input type="color" name="Color_Principal" value={empresa.Color_Principal || "#0D6EFD"} onChange={handleEmpresa} />
        <label>Color_Secundario</label>
        <input type="color" name="Color_Secundario" value={empresa.Color_Secundario || "#0D1B2A"} onChange={handleEmpresa} />
        <label>Color_Boton</label>
        <input type="color" name="Color_Boton" value={empresa.Color_Boton || "#198754"} onChange={handleEmpresa} />

        <input name="Nombre_Gerente" placeholder="Nombre_Gerente" value={empresa.Nombre_Gerente || ""} onChange={handleEmpresa} />
        <input name="DPI_Gerente" placeholder="DPI_Gerente" value={empresa.DPI_Gerente || ""} onChange={handleEmpresa} />
        <input name="Telefono_Gerente" placeholder="Telefono_Gerente" value={empresa.Telefono_Gerente || ""} onChange={handleEmpresa} />
        <textarea name="Texto_Contrato" placeholder="Texto_Contrato" value={empresa.Texto_Contrato || ""} onChange={handleEmpresa} />

        <button className="btn-primary" onClick={guardarEmpresa}>Guardar empresa</button>
      </div>

      <div className="form-box">
        <h3>Contrato_configuracion</h3>
        <input name="Titulo_Contrato" placeholder="Titulo_Contrato" value={contrato.Titulo_Contrato || ""} onChange={handleContrato} />
        <textarea name="Texto_Inicial" placeholder="Texto_Inicial" value={contrato.Texto_Inicial || ""} onChange={handleContrato} />
        <textarea name="Clausula_Estado_Vehiculo" placeholder="Clausula_Estado_Vehiculo" value={contrato.Clausula_Estado_Vehiculo || ""} onChange={handleContrato} />
        <textarea name="Clausula_Devolucion" placeholder="Clausula_Devolucion" value={contrato.Clausula_Devolucion || ""} onChange={handleContrato} />
        <textarea name="Texto_Final" placeholder="Texto_Final" value={contrato.Texto_Final || ""} onChange={handleContrato} />
        <button className="btn-primary" onClick={guardarContrato}>Guardar contrato</button>
      </div>
    </div>
  );
}

export default ConfiguracionEmpresaPage;
