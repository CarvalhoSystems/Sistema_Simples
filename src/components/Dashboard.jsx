import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { getProdutos, getVendas } from "../services/tenantData.js";
import { getTenant } from "../hooks/useTenant.js";
import { getOperadorAtual } from "../services/operadorSession.js";
import { formatCurrency } from "../utils/formatters.js";
import ProdutosEmFalta from "./ProdutosEmFalta.jsx";
import Swal from "sweetalert2";
import { driver } from "driver.js"; // Importa o tour guiado
import "driver.js/dist/driver.css";
import { HelpCircle } from "lucide-react"; // Ícone de ajuda para reabrir o tour

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
    const operador = getOperadorAtual();

    if (operador && operador.cargo) {
      const cargoLower = operador.cargo.toLowerCase();
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

  // Dispara o Tour Guiado automaticamente apenas no primeiro acesso
  useEffect(() => {
    const tourDashboardFeito = localStorage.getItem("tour_dashboard_concluido");
    if (!tourDashboardFeito) {
      const timer = setTimeout(() => {
        iniciarTourDashboard();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const iniciarTourDashboard = () => {
    const driverObj = driver({
      showProgress: true,
      doneBtnText: "Entendi",
      nextBtnText: "Próximo",
      prevBtnText: "Anterior",
      steps: [
        {
          element: "#welcome-stats-box",
          popover: {
            title: "Visão Geral",
            description:
              "Acompanhe aqui o estoque atual, vendas do dia e receita total em tempo real.",
          },
        },
        {
          element: "#quick-actions-grid",
          popover: {
            title: "Ações Rápidas",
            description:
              "Gerencie o estoque, abra o caixa, veja relatórios ou monitore produtos em falta rapidamente.",
          },
        },
      ],
      onDestroyStarted: () => {
        localStorage.setItem("tour_dashboard_concluido", "true");
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  // Formatação da data atual
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
    <main className="main-content p-6">
      <header className="header flex justify-between items-center mb-6">
        <div className="header-left">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        </div>
        <div className="header-right flex items-center gap-4">
          {/* Botão de Ajuda para reabrir o Tour se o cliente quiser */}
          <button
            onClick={iniciarTourDashboard}
            title="Como usar o Dashboard?"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Ajuda
          </button>
          <div className="date-info flex items-center gap-2 text-gray-500 text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <i className="fas fa-calendar text-blue-600"></i>
            <span id="currentDate">{currentDate}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content space-y-6">
        <section className="welcome-section">
          <div className="welcome-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="welcome-content">
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                Olá! É um prazer cuidar do{" "}
                <span className="text-blue-700">{nomeEstabelecimento}</span>
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Seu sistema completo de gestão para seu negócio!
              </p>

              <div
                id="welcome-stats-box"
                className="welcome-stats grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="stat-card flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="stat-icon p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <i className="fas fa-box text-xl"></i>
                  </div>
                  <div className="stat-info">
                    <h3
                      className="text-xl font-bold text-gray-800"
                      id="totalProducts"
                    >
                      {stats.totalProducts}
                    </h3>
                    <p className="text-xs text-gray-500">Produtos no Estoque</p>
                  </div>
                </div>
                <div className="stat-card flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="stat-icon p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    <i className="fas fa-shopping-cart text-xl"></i>
                  </div>
                  <div className="stat-info">
                    <h3
                      className="text-xl font-bold text-gray-800"
                      id="todaySales"
                    >
                      {stats.todaySales}
                    </h3>
                    <p className="text-xs text-gray-500">Vendas Hoje</p>
                  </div>
                </div>
                <div className="stat-card flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="stat-icon p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <i className="fas fa-dollar-sign text-xl"></i>
                  </div>
                  <div className="stat-info">
                    <h3
                      className="text-xl font-bold text-gray-800"
                      id="totalRevenue"
                    >
                      {formatCurrency(stats.totalRevenue)}
                    </h3>
                    <p className="text-xs text-gray-500">Receita Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Ações Rápidas Ocupando a Largura Completa */}
        <section className="quick-actions space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Ações Rápidas</h3>
          <div
            id="quick-actions-grid"
            className="action-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div
              className="action-card bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 cursor-pointer transition-all flex items-center gap-4"
              onClick={() => navigate("/inventario")}
            >
              <div className="action-icon p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <i className="fas fa-plus-circle text-xl"></i>
              </div>
              <div className="action-content">
                <h4 className="font-semibold text-gray-800">
                  Gerenciar Estoque
                </h4>
                <p className="text-xs text-gray-500">
                  Adicionar, editar e visualizar produtos
                </p>
              </div>
            </div>

            <div
              className="action-card bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 cursor-pointer transition-all flex items-center gap-4"
              onClick={() => navigate("/caixa")}
            >
              <div className="action-icon p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <i className="fas fa-cash-register text-xl"></i>
              </div>
              <div className="action-content">
                <h4 className="font-semibold text-gray-800">Abrir Caixa</h4>
                <p className="text-xs text-gray-500">
                  Iniciar vendas e gerenciar caixa
                </p>
              </div>
            </div>

            <div
              className="action-card bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 cursor-pointer transition-all flex items-center gap-4"
              onClick={() => navigate("/relatorios")}
            >
              <div className="action-icon p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <div className="action-content">
                <h4 className="font-semibold text-gray-800">Ver Relatórios</h4>
                <p className="text-xs text-gray-500">
                  Analisar desempenho e vendas
                </p>
              </div>
            </div>

            <div
              className="action-card warning bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-amber-500 cursor-pointer transition-all flex items-center gap-4 relative"
              onClick={() => navigate("/ProdutosEmFalta")}
            >
              <div className="action-icon p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <i className="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <div className="action-content">
                <h4 className="font-semibold text-gray-800">
                  Produtos em Falta
                </h4>
                <p className="text-xs text-gray-500">Verificar estoque baixo</p>
              </div>
              <div className="hidden">
                <ProdutosEmFalta />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
