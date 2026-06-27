import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import ProtectedRoute from "./Protected";
import Unauthorized from "./pages/Unauthorized";

import "./global.css";
import "./Login.css";

import Sidebar from "./Components/paneles/Sidebar";
import Header from "./Components/paneles/Header";

function App() {

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <BrowserRouter>

      {/* HEADER */}
      <Header
        toggleMenu={toggleMenu}
        menuOpen={menuOpen}
      />

      <div className="layout">

        {/* SIDEBAR */}
        <Sidebar
          menuOpen={menuOpen}
          toggleMenu={toggleMenu}
        />

        <div className="content">

          <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/"
              element={
                <ProtectedRoute roles={["gerente","colaborador","programador"]}>
                  <Inicio />
                </ProtectedRoute>
              }
            />

            <Route
              path="/crear-usuario"
              element={
                <ProtectedRoute roles={["gerente","programador"]}>
                  <CrearUsuarioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendedores"
              element={
                <ProtectedRoute roles={["gerente","programador","colaborador"]}>
                  <VendedoresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/duenos-carro"
              element={
                <ProtectedRoute roles={["gerente","programador","colaborador"]}>
                  <DuenosCarroPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/compradores"
              element={
                <ProtectedRoute roles={["gerente","programador","colaborador"]}>
                  <CompradoresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/colaboradores"
              element={
                <ProtectedRoute roles={["gerente","programador"]}>
                  <ColaboradoresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/carros-predio"
              element={
                <ProtectedRoute roles={["gerente","programador","colaborador"]}>
                  <CarroPredioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/gastos"
              element={
                <ProtectedRoute roles={["gerente","programador","colaborador"]}>
                  <GastosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ventas"
              element={
                <ProtectedRoute roles={["gerente","programador","colaborador"]}>
                  <VentasPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/comisiones"
              element={
                <ProtectedRoute roles={["gerente","programador"]}>
                  <ComisionesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/buscar"
              element={
                <ProtectedRoute roles={["gerente","programador","colaborador"]}>
                  <BuscadorPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute roles={["gerente","programador"]}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/estadisticas"
              element={
                <ProtectedRoute roles={["gerente","programador"]}>
                  <EstadisticasPage />
                </ProtectedRoute>
              }
            />

          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
