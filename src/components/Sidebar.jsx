import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Sidebar() {
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
    { to: "/", icon: "fa-cash-register", text: "CAIXA" },
    { to: "/relatorios", icon: "fa-chart-bar", text: "Relatórios" },
    { to: "/configuracoes", icon: "fa-cog", text: "Configurações" },
    { to: "/suporte", icon: "fa-life-ring", text: "Suporte" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>
          <i className="fas fa-store"></i> System PDV
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
    </aside>
  );
}
