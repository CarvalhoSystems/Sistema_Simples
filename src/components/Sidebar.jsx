import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [colapsado, setColapsado] = useState(false);

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
    <aside
      className={`h-screen bg-slate-900 text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xl relative z-20 ${
        colapsado ? "w-20" : "w-64"
      }`}
    >
      {/* Topo do Sidebar com Logo e Botão de Retrair */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        {!colapsado && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <i className="fas fa-store text-base"></i>
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-white text-sm tracking-wide truncate">
                Facil Sistemas
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                Sistema de Gestão
              </span>
            </div>
          </div>
        )}

        {colapsado && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <i className="fas fa-store text-base"></i>
            </div>
          </div>
        )}

        <button
          onClick={() => setColapsado(!colapsado)}
          className={`p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ${
            colapsado
              ? "absolute -right-3 top-6 rounded-full shadow-md border border-slate-700"
              : ""
          }`}
          title={colapsado ? "Expandir Menu" : "Recolher Menu"}
        >
          <i
            className={`fas fa-chevron-${colapsado ? "right" : "left"} text-xs`}
          ></i>
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group relative ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`
            }
          >
            <div className="w-6 flex justify-center shrink-0 text-base">
              <i className={`fas ${item.icon}`}></i>
            </div>
            {!colapsado && <span className="truncate">{item.text}</span>}

            {/* Tooltip moderno quando colapsado */}
            {colapsado && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
                {item.text}
              </div>
            )}
          </NavLink>
        ))}

        {/* Botão de Sair */}
        <a
          href="#"
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group relative mt-4"
        >
          <div className="w-6 flex justify-center shrink-0 text-base">
            <i className="fas fa-sign-out-alt"></i>
          </div>
          {!colapsado && <span className="truncate">Sair</span>}

          {colapsado && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
              Sair
            </div>
          )}
        </a>
      </nav>

      {/* Perfil do Usuário na Base */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div
          className={`flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all cursor-pointer relative group ${
            colapsado ? "justify-center" : ""
          }`}
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
              <i className="fas fa-user text-sm"></i>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          {!colapsado && (
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-white leading-tight truncate">
                Administrador
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user?.name || "Administrador"}
              </span>
            </div>
          )}

          {colapsado && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
              {user?.name || "Administrador"}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
