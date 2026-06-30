import { Navigate } from "react-router-dom";
import { getToken, getUsuario } from "./utils/session";

function ProtectedRoute({ children, roles }) {
  const token = getToken();
  const usuario = getUsuario();
  const rol = usuario?.Rol;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(rol)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
