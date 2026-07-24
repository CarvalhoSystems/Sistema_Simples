import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { VENDAS_REALIZADAS, BANCO_PRODUTOS } from "../mockData.js";
import { formatCurrency } from "../utils/formatters.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState("");

  // Cálculos para os cards
  const totalRevenue = VENDAS_REALIZADAS.reduce(
    (acc, venda) => acc + venda.total,
    0,
  );
  const totalProducts = BANCO_PRODUTOS.length;
  const todaySales = VENDAS_REALIZADAS.filter((venda) =>
    venda.data.startsWith(new Date().toISOString().split("T")[0]),
  ).length;

  useEffect(() => {
    const date = new Date();
    setCurrentDate(
      date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <main className="main-content">
      <header className="header">
        <div className="header-left">
          <h2>Dashboard</h2>
        </div>
        <div className="header-right">
          <div className="user-info" id="userInfo">
            <i className="fas fa-user-circle"></i>
            <span>{user?.name || "Administrador"}</span>
          </div>
          <div className="date-info">
            <i className="fas fa-calendar"></i>
            <span id="currentDate">{currentDate}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <h1>Bem-vindo ao seu Gerenciamento </h1>
              <p>Seu sistema completo de gestão para Empresas</p>
              <div className="welcome-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-box"></i>
                  </div>
                  <div className="stat-info">
                    <h3 id="totalProducts">{totalProducts}</h3>
                    <p>Produtos no Estoque</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <div className="stat-info">
                    <h3 id="todaySales">{todaySales}</h3>
                    <p>Vendas Hoje</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                  <div className="stat-info">
                    <h3 id="totalRevenue">{formatCurrency(totalRevenue)}</h3>
                    <p>Receita Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h3>Ações Rápidas</h3>
          <div className="action-grid">
            <div
              className="action-card"
              onClick={() => navigate("/inventario")}
            >
              <div className="action-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <div className="action-content">
                <h4>Gerenciar Estoque</h4>
                <p>Adicionar, editar e visualizar produtos</p>
              </div>
            </div>
            <div className="action-card" onClick={() => navigate("/")}>
              <div className="action-icon">
                <i className="fas fa-cash-register"></i>
              </div>
              <div className="action-content">
                <h4>Abrir Caixa</h4>
                <p>Iniciar vendas e gerenciar caixa</p>
              </div>
            </div>
            <div
              className="action-card"
              onClick={() => navigate("/relatorios")}
            >
              <div className="action-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="action-content">
                <h4>Ver Relatórios</h4>
                <p>Analisar desempenho e vendas</p>
              </div>
            </div>
            <div
              className="action-card warning"
              onClick={() =>
                alert(
                  "Função para mostrar produtos em falta ainda não implementada.",
                )
              }
            >
              <div className="action-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="action-content">
                <h4>Produtos em Falta</h4>
                <p>Verificar estoque baixo</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
