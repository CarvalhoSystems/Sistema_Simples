import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import PDV from "./PDV";
import Dashboard from "./components/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Inventario from "./pages/inventario.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Planos from "./pages/Planos.jsx";
import MeusEstabelecimentos from "./pages/MeusEstabelecimentos.jsx";
import Suporte from "./pages/Suporte.jsx";
import NotaFiscalPaulista from "./pages/NotaFiscalPaulista.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import PdvLayout from "./components/Layout.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminSetup from "./pages/AdminSetup.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminClientes from "./pages/AdminClientes.jsx";
import AdminFinanceiro from "./pages/AdminFinanceiro.jsx";
import AdminPlanos from "./pages/AdminPlanos.jsx";
import Contato from "./pages/contato.jsx";
import FechamentoDeCaixa from "./components/fechamentoDeCaixa.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* LANDING PAGE - Rota principal (raiz) */}
      <Route path="/" element={<LandingPage />} />

      {/* Autenticação do Cliente */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* PDV (Caixa) - Rota separada e protegida */}
      <Route path="/caixa" element={<PdvLayout />}>
        <Route index element={<PDV />} />
      </Route>

      {/* Dashboard do Cliente (protegido - apenas clientes) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/estabelecimentos" element={<MeusEstabelecimentos />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/nfp" element={<NotaFiscalPaulista />} />
        </Route>
      </Route>

      {/* ADMIN - Setup (criar admin pela primeira vez) */}
      <Route path="/admin/setup" element={<AdminSetup />} />

      {/* ADMIN - Painel exclusivo (acesso apenas com email admin) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clientes" element={<AdminClientes />} />
          <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
          <Route path="/admin/planos" element={<AdminPlanos />} />
        </Route>
      </Route>

      {/* Contato */}
      <Route path="/contato" element={<Contato />} />

      {/*ROTAS 404*/}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
