import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../components/AuthContext";
import Chart from "chart.js/auto"; // Usando a importação do Chart.js

// Componente para os cards de resumo
const SummaryCard = ({ icon, title, value, subtitle }) => (
  <div className="summary-card">
    <div className="summary-icon">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="summary-content">
      <h3>{title}</h3>
      <div className="summary-value">{value}</div>
      <div className="summary-subtitle">{subtitle}</div>
    </div>
  </div>
);

export default function Relatorios() {
  const { user } = useAuth();
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());

  // Refs para os elementos canvas dos gráficos
  const faturamentoChartRef = useRef(null);
  const pagamentoChartRef = useRef(null);
  const produtosChartRef = useRef(null);
  const comparativoChartRef = useRef(null);

  // Refs para as instâncias dos gráficos para poder destruí-las antes de recriar
  const chartInstances = useRef({});

  const gerarRelatorio = () => {
    console.log(`Gerando relatório para ${mes + 1}/${ano}`);
    // Aqui você colocaria a lógica para buscar os dados e atualizar os gráficos/tabelas
    alert("Lógica para gerar relatório ainda não implementada.");
  };

  const exportarPDF = () => {
    // Lógica para exportar para PDF
    alert("Lógica para exportar PDF ainda não implementada.");
  };

  // Efeito para inicializar e atualizar os gráficos
  useEffect(() => {
    const renderCharts = () => {
      // Destruir gráficos antigos antes de renderizar novos
      Object.values(chartInstances.current).forEach((chart) => chart.destroy());

      // Gráfico de Faturamento Mensal (Exemplo)
      if (faturamentoChartRef.current) {
        chartInstances.current.faturamento = new Chart(
          faturamentoChartRef.current,
          {
            type: "bar",
            data: {
              labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
              datasets: [
                {
                  label: "Faturamento",
                  data: [1200, 1900, 3000, 5000],
                  backgroundColor: "rgba(30, 58, 138, 0.7)",
                },
              ],
            },
          },
        );
      }

      // Gráfico de Pagamentos (Exemplo)
      if (pagamentoChartRef.current) {
        chartInstances.current.pagamento = new Chart(
          pagamentoChartRef.current,
          {
            type: "doughnut",
            data: {
              labels: ["Dinheiro", "PIX", "Cartão"],
              datasets: [
                {
                  data: [30, 45, 25],
                  backgroundColor: ["#10B981", "#3B82F6", "#F59E0B"],
                },
              ],
            },
          },
        );
      }

      // Gráfico de Top Produtos (Exemplo)
      if (produtosChartRef.current) {
        chartInstances.current.produtos = new Chart(produtosChartRef.current, {
          type: "pie",
          data: {
            labels: [
              "Produto A",
              "Produto B",
              "Produto C",
              "Produto D",
              "Produto E",
            ],
            datasets: [
              {
                data: [15, 25, 20, 10, 30],
                backgroundColor: [
                  "#EF4444",
                  "#84CC16",
                  "#3B82F6",
                  "#F97316",
                  "#6366F1",
                ],
              },
            ],
          },
        });
      }

      // Gráfico Comparativo (Exemplo)
      if (comparativoChartRef.current) {
        chartInstances.current.comparativo = new Chart(
          comparativoChartRef.current,
          {
            type: "line",
            data: {
              labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
              datasets: [
                {
                  label: "Ano Atual",
                  data: [65, 59, 80, 81, 56, 55],
                  borderColor: "rgba(30, 58, 138, 1)",
                  fill: false,
                },
                {
                  label: "Ano Anterior",
                  data: [28, 48, 40, 19, 86, 27],
                  borderColor: "rgba(156, 163, 175, 1)",
                  fill: false,
                },
              ],
            },
          },
        );
      }
    };

    renderCharts();

    // Função de limpeza para destruir os gráficos ao desmontar o componente
    return () => {
      Object.values(chartInstances.current).forEach((chart) => chart.destroy());
    };
  }, [mes, ano]); // Recria os gráficos se o mês ou ano mudar

  return (
    <main className="main-content">
      <header className="header">
        <div className="header-left">
          <h2>Relatórios Mensais</h2>
        </div>
        <div className="header-right">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>{user?.name || "Gerente"}</span>
          </div>
        </div>
      </header>

      <div className="relatorio-content">
        {/* Filtros */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="mesSelect">Mês:</label>
            <select
              id="mesSelect"
              className="filter-select"
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
            >
              {[
                "Janeiro",
                "Fevereiro",
                "Março",
                "Abril",
                "Maio",
                "Junho",
                "Julho",
                "Agosto",
                "Setembro",
                "Outubro",
                "Novembro",
                "Dezembro",
              ].map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="anoSelect">Ano:</label>
            <select
              id="anoSelect"
              className="filter-select"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026, 2027, 2028].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group buttons-group">
            <button className="btn btn-primary" onClick={gerarRelatorio}>
              <i className="fas fa-chart-bar"></i> Gerar Relatório
            </button>
            <button className="btn btn-secondary" onClick={exportarPDF}>
              <i className="fas fa-download"></i> Exportar PDF
            </button>
          </div>
        </div>

        {/* Resumo Geral */}
        <div className="summary-grid">
          <SummaryCard
            icon="fa-dollar-sign"
            title="Faturamento Total"
            value="R$ 0,00"
            subtitle="Mês Selecionado"
          />
          <SummaryCard
            icon="fa-shopping-cart"
            title="Vendas Realizadas"
            value="0"
            subtitle="Transações"
          />
          <SummaryCard
            icon="fa-percentage"
            title="Média de Ticket"
            value="R$ 0,00"
            subtitle="Por Venda"
          />
          <SummaryCard
            icon="fa-tags"
            title="Descontos Aplicados"
            value="R$ 0,00"
            subtitle="Valor Total"
          />
        </div>

        {/* Gráficos */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Faturamento Mensal</h3>
            <canvas ref={faturamentoChartRef}></canvas>
          </div>
          <div className="chart-card">
            <h3>Distribuição de Pagamentos</h3>
            <canvas ref={pagamentoChartRef}></canvas>
          </div>
          <div className="chart-card">
            <h3>Top 5 Produtos</h3>
            <canvas ref={produtosChartRef}></canvas>
          </div>
        </div>

        {/* Tabelas Detalhadas */}
        <div className="tables-grid">
          <div className="table-card">
            <h3>Top 5 Produtos Mais Vendidos</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                    <th>Participação</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Dados de exemplo, idealmente viriam do estado */}
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      Nenhum dado para exibir.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-card">
            <h3>Distribuição de Formas de Pagamento</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Forma de Pagamento</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                    <th>Participação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      Nenhum dado para exibir.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Comparativo Mensal */}
        <div className="comparative-section">
          <h3>Comparativo Mensal</h3>
          <div className="comparative-chart">
            <canvas ref={comparativoChartRef} width="800" height="400"></canvas>
          </div>
        </div>
      </div>
    </main>
  );
}
