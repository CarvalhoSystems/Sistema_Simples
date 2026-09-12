import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { getProdutos, getVendas } from "../services/tenantData.js";
import { getTenant } from "../hooks/useTenant.js";
import { getOperadorAtual } from "../services/operadorSession.js";
import { formatCurrency } from "../utils/formatters.js";
import ProdutosEmFalta from "./ProdutosEmFalta.jsx";
import Swal from "sweetalert2";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    todaySales: 0,
  });
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");

  // Proteção de Rota Definitiva baseada no Operador (PIN)
  useEffect(() => {
    // 1. Verifica se tem um operador logado via PIN no caixa
    const operador = getOperadorAtual();

    if (operador && operador.cargo) {
      const cargoLower = operador.cargo.toLowerCase();

      // Se o cargo for de caixa ou atendente, BARRA na hora, não importa quem esteja no Firebase
      if (cargoLower.includes("caixa") || cargoLower.includes("atendente")) {
        Swal.fire({
          icon: "warning",
          title: "Acesso Negado",
          text: "Operadores de caixa não têm permissão para acessar o Dashboard gerencial.",
          confirmButtonText: "Voltar ao Caixa",
        });
        navigate("/caixa");
        return;
      }
    }

    // 2. Se NÃO TEM operador por PIN, aí sim exigimos o login do Administrador (Firebase)
    if (!user && !operador) {
      Swal.fire({
        icon: "warning",
        title: "Acesso Restrito",
        text: "Faça login para acessar o Dashboard.",
        confirmButtonText: "Voltar",
      });
      navigate("/selecao-objetivo");
      return;
    }

    // 3. Carrega os dados normais do estabelecimento
    const tenant = getTenant();
    if (tenant) {
      setNomeEstabelecimento(
        tenant.nomeEstabelecimento || tenant.nome || "seu negócio",
      );
    }

    const carregarEstatisticas = async () => {
      try {
        const vendas = await getVendas();
        const produtos = await getProdutos();

        const totalRevenue = vendas.reduce(
          (acc, venda) => acc + venda.total,
          0,
        );
        const totalProducts = produtos.length;
        const todaySales = vendas.filter((venda) =>
          venda.data.startsWith(new Date().toISOString().split("T")[0]),
        ).length;

        setStats({ totalRevenue, totalProducts, todaySales });
      } catch (error) {
        console.error("Erro ao carregar estatísticas do dashboard:", error);
      }
    };

    carregarEstatisticas();
  }, [user, navigate]);

  // 2. FORMATAÇÃO DA DATA ATUAL
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
              <h1>
                Olá! É um prazer cuidar do{" "}
                <span className="text-blue-700">{nomeEstabelecimento}</span>
              </h1>
              <p>Seu sistema completo de gestão para seu Negocio !</p>
              <div className="welcome-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-box"></i>
                  </div>
                  <div className="stat-info">
                    <h3 id="totalProducts">{stats.totalProducts}</h3>
                    <p>Produtos no Estoque</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <div className="stat-info">
                    <h3 id="todaySales">{stats.todaySales}</h3>
                    <p>Vendas Hoje</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                  <div className="stat-info">
                    <h3 id="totalRevenue">
                      {formatCurrency(stats.totalRevenue)}
                    </h3>
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
            <div className="action-card" onClick={() => navigate("/caixa")}>
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
              onClick={() => navigate("/ProdutosEmFalta")}
            >
              <ProdutosEmFalta />
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
