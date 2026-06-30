import { BASE_URL } from "../config";
import { apiJson } from "../utils/api";

const API = `${BASE_URL}/usuarios`;

// login de usuario
export async function login(usuario, contrasena) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usuario, contrasena }),
  });

  return res.json();
}

// registrar usuario
export async function registrarUsuario(data) {
  return apiJson("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
