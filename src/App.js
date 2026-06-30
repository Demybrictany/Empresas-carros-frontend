import React, { useLayoutEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import VendedoresPage from "./pages/Vendedorespage";
import DuenosCarroPage from "./pages/DuenosCarroPage";
import Inicio from "./pages/Inicio";
import CompradoresPage from "./pages/CompradoresPage";
import ColaboradoresPage from "./pages/ColaboradoresPage";
import CarroPredioPage from "./pages/CarrosPredioPage";
import GastosPage from "./pages/GastosPage";
import VentasPage from "./pages/VentasPage";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";
import CrearUsuarioPage from "./pages/CrearUsuarioPage";
import EstadisticasPage from "./pages/EstadisticasPage";
import BuscadorPage from "./pages/BuscadorPage";
import ComisionesPage from "./pages/ComisionesPage";
import EmpresasPage from "./pages/EmpresasPage";
import ConfiguracionEmpresaPage from "./pages/ConfiguracionEmpresaPage";
import CambiarContrasenaPage from "./pages/CambiarContrasenaPage";

import ProtectedRoute from "./Protected";
import Unauthorized from "./pages/Unauthorized";

import "./global.css";
import "./Login.css";

import Header from "./Components/paneles/Header";
import Sidebar from "./Components/paneles/Sidebar";
import { applyEmpresaTheme, LOGIN_THEME } from "./utils/session";

const TODOS = ["Programador", "Gerente", "Vendedor"];
const ADMIN = ["Programador", "Gerente"];

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useLayoutEffect(() => {
    const aplicarTema = () => {
      if (location.pathname === "/login") {
        applyEmpresaTheme(LOGIN_THEME);
        return;
      }

      applyEmpresaTheme();
    };

    aplicarTema();
    const actualizarTema = () => aplicarTema();
    window.addEventListener("empresaActualizada", actualizarTema);
    return () => window.removeEventListener("empresaActualizada", actualizarTema);
  }, [location.pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <Header toggleMenu={toggleMenu} menuOpen={menuOpen} />

      <div className="layout">
        <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />

        <div className="content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/"
              element={
                <ProtectedRoute roles={TODOS}>
                  <Inicio />
                </ProtectedRoute>
              }
            />

            <Route
              path="/empresas"
              element={
                <ProtectedRoute roles={["Programador"]}>
                  <EmpresasPage vista="administrar" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/crear-empresa"
              element={
                <ProtectedRoute roles={["Programador"]}>
                  <EmpresasPage vista="crear" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/administrar-empresas"
              element={
                <ProtectedRoute roles={["Programador"]}>
                  <EmpresasPage vista="administrar" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracion-empresa"
              element={
                <ProtectedRoute roles={ADMIN}>
                  <ConfiguracionEmpresaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/crear-usuario"
              element={
                <ProtectedRoute roles={ADMIN}>
                  <CrearUsuarioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cambiar-contrasena"
              element={
                <ProtectedRoute roles={TODOS}>
                  <CambiarContrasenaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendedores"
              element={
                <ProtectedRoute roles={TODOS}>
                  <VendedoresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/duenos-carro"
              element={
                <ProtectedRoute roles={TODOS}>
                  <DuenosCarroPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/compradores"
              element={
                <ProtectedRoute roles={TODOS}>
                  <CompradoresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/colaboradores"
              element={
                <ProtectedRoute roles={ADMIN}>
                  <ColaboradoresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/carros-predio"
              element={
                <ProtectedRoute roles={TODOS}>
                  <CarroPredioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/gastos"
              element={
                <ProtectedRoute roles={ADMIN}>
                  <GastosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ventas"
              element={
                <ProtectedRoute roles={TODOS}>
                  <VentasPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/comisiones"
              element={
                <ProtectedRoute roles={ADMIN}>
                  <ComisionesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/buscar"
              element={
                <ProtectedRoute roles={TODOS}>
                  <BuscadorPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute roles={ADMIN}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/estadisticas"
              element={
                <ProtectedRoute roles={ADMIN}>
                  <EstadisticasPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
