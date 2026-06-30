import { BASE_URL } from "../config";
import { getToken } from "./session";

export const authHeaders = (extra = {}) => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

export const apiFetch = async (path, options = {}) => {
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    if (!window.location.pathname.includes("/login")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
};

export const apiJson = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Error de comunicacion con el servidor");
  }

  return data;
};

export const apiBlob = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "No se pudo descargar el archivo");
  }
  return response.blob();
};
