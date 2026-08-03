import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getTenant } from "../hooks/useTenant.js";

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: "fa-tachometer-alt", text: "Dashboard" },
    { to: "/inventario", icon: "fa-boxes", text: "Inventário" },
    { to: "/caixa", icon: "fa-cash-register", text: "CAIXA" },
    { to: "/relatorios", icon: "fa-chart-bar", text: "Relatórios" },
    { to: "/planos", icon: "fa-crown", text: "Planos" },
    { to: "/estabelecimentos", icon: "fa-store-alt", text: "Estabelecimentos" },
    { to: "/configuracoes", icon: "fa-cog", text: "Configurações" },
    { to: "/suporte", icon: "fa-life-ring", text: "Suporte" },
    { to: "/nfp", icon: "fa-file-invoice", text: "N. Fiscal Paulista" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>
          <i className="fas fa-store"></i> Facil Sistemas
        </h1>
        <p>Sistema de Gestão</p>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink to={item.to} end>
                <i className={`fas ${item.icon}`}></i>
                <span>{item.text}</span>
              </NavLink>
            </li>
          ))}
          <li className="nav-item">
            <a href="#" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Sair</span>
            </a>
          </li>
        </ul>
      </nav>
      <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all cursor-pointer">
        {/* Ícone com avatar simulado ou foto */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">
            <i className="fas fa-user text-lg"></i>
          </div>
          {/* Bolinha verde de status online */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        {/* Informações do usuário */}
        <div className="flex flex-col text-left">
          <i className="text-sm font-semibold text-slate-800 leading-tight">
            Administrador
          </i>
          <span className="text-xs text-slate-500 font-medium">
            {user?.name || "Administrador"}
          </span>
        </div>
      </div>
    </aside>
  );
}
