import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import PDV from "./PDV";
import Dashboard from "./components/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Inventario from "./pages/inventario.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Suporte from "./pages/Suporte.jsx";
import NotaFiscalPaulista from "./pages/NotaFiscalPaulista.jsx";
import AdminClientes from "./pages/AdminClientes.jsx";
import Signup from "./pages/Signup.jsx";
import PdvLayout from "./components/Layout.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* LANDING PAGE - Rota principal (raiz) */}
      <Route path="/" element={<LandingPage />} />

      {/* Autenticação */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* PDV (Caixa) - Rota separada e protegida */}
      <Route path="/caixa" element={<PdvLayout />}>
        <Route index element={<PDV />} />
      </Route>

      {/* Dashboard Gerencial (protegido) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/nfp" element={<NotaFiscalPaulista />} />
          <Route path="/admin" element={<AdminClientes />} />
        </Route>
      </Route>
    </Routes>
  );
}
