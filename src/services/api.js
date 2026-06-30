import axios from "axios";
import { BASE_URL } from "../config";
import { getToken } from "../utils/session";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===============================
// VENDEDORES
// ===============================

// Obtener vendedores
export const getVendedores = async () => {
  const res = await api.get("/vendedores");
  return res.data;
};

// Crear vendedor
export const createVendedor = async (data) => {
  const res = await api.post("/vendedores", data);
  return res.data;
};

// Actualizar vendedor
export const updateVendedor = async (id, data) => {
  const res = await api.put(`/vendedores/${id}`, data);
  return res.data;
};
// actualizar venta 
export const updateVenta = async (id, data) => {
  const res = await api.put(`/ventas/${id}`, data);
  return res.data;
};

// Eliminar vendedor
export const deleteVendedor = async (id) => {
  const res = await api.delete(`/vendedores/${id}`);
  return res.data;
};

export default api;
