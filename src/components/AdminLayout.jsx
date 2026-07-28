import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/admin",
      icon: "fa-tachometer-alt",
      text: "Dashboard Admin",
      end: true,
    },
    { to: "/admin/clientes", icon: "fa-users", text: "Clientes" },
    { to: "/admin/financeiro", icon: "fa-dollar-sign", text: "Financeiro" },
    { to: "/admin/planos", icon: "fa-crown", text: "Planos" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-crown text-gray-900 text-lg"></i>
            </div>
            <div>
              <h1 className="font-bold text-sm">Admin Panel</h1>
              <p className="text-xs text-gray-400">Sistema PDV</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-yellow-500 text-gray-900 font-medium"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span>{item.text}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-700">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <i className="fas fa-store w-5 text-center"></i>
              <span>Ir para o PDV</span>
            </NavLink>
            <a
              href="#"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors mt-1"
            >
              <i className="fas fa-sign-out-alt w-5 text-center"></i>
              <span>Sair</span>
            </a>
          </div>
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
