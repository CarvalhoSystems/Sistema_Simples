import React from "react";
import { Routes, Route } from "react-router-dom";
import PDV from "./PDV";
import Dashboard from "./components/Dashboard.jsx";
import Login from "./pages/Login.jsx"; // Corrigido o caminho da importação
import Inventario from "./pages/inventario.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Suporte from "./pages/Suporte.jsx";
import Signup from "./pages/Signup.jsx";
import PdvLayout from "./components/Layout.jsx"; // Renomeado para clareza
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Rotas do PDV e Protegidas */}
      <Route path="/" element={<PdvLayout />}>
        <Route index element={<PDV />} />
      </Route>

      {/* Novas rotas do Dashboard Gerencial */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rota de inventário adicionada aqui */}
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/suporte" element={<Suporte />} />
        </Route>
      </Route>
    </Routes>
  );
}
