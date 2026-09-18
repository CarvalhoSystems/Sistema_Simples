import React from "react";
import { Routes, Route } from "react-router-dom";

// Importação das Páginas
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
import Contato from "./pages/contato.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import SelecaoObjetivo from "./pages/SelecaoObjetivo.jsx";

// Importação de Layouts e Rotas Protegidas
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
import AdminConfig from "./pages/AdminConfig.jsx";


export default function App() {
  return (
    <Routes>
      {/* LANDING PAGE - Rota principal (raiz) */}
      <Route path="/" element={<LandingPage />} />

      {/* Autenticação do Cliente */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/contato" element={<Contato />} />

      {/* ÁREA PROTEGIDA DO CLIENTE (Requer Login) */}
      <Route element={<ProtectedRoute />}>
        {/* Tela de Seleção de Objetivo (Caixa ou Dashboard) */}
        <Route path="/escolha" element={<SelecaoObjetivo />} />

        {/* Páginas do Dashboard com o Layout Padrão */}
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

        {/* PDV (Caixa) - Protegido também */}
        <Route path="/caixa" element={<PdvLayout />}>
          <Route index element={<PDV />} />
        </Route>
      </Route>

      {/* ADMIN - Setup e Painel Exclusivo */}
      <Route path="/admin/setup" element={<AdminSetup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clientes" element={<AdminClientes />} />
          <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
          <Route path="/admin/planos" element={<AdminPlanos />} />
          <Route path="/admin/configuracoes" element={<AdminConfig />} />
        </Route>
      </Route>

      {/* ROTAS 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
