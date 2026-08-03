import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../components/AuthContext";
import Chart from "chart.js/auto";
import { getVendas } from "../services/tenantData";
import { imprimirRelatorioVendas } from "../services/impressaoService";
import PlanBlock from "../components/PlanBlock";

const SummaryCard = ({ icon, title, value, subtitle, cor }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center`}
        style={{ backgroundColor: (cor || "#3B82F6") + "20" }}
      >
        <i
          className={`fas ${icon} text-xl`}
          style={{ color: cor || "#3B82F6" }}
        ></i>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default function Relatorios() {
  const { user } = useAuth();
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [vendas, setVendas] = useState([]);
  const [stats, setStats] = useState({
    faturamento: 0,
    totalVendas: 0,
    ticketMedio: 0,
    descontos: 0,
    porPagamento: {},
    topProdutos: [],
  });

  const faturamentoChartRef = useRef(null);
  const pagamentoChartRef = useRef(null);
  const produtosChartRef = useRef(null);
  const comparativoChartRef = useRef(null);
  const chartInstances = useRef({});

  const calcularEstatisticas = React.useCallback(() => {
    // Filtra vendas do mês/ano selecionado
    const vendasFiltradas = vendas.filter((v) => {
      const data = new Date(v.data);
      return data.getMonth() === mes && data.getFullYear() === ano;
    });

    const totalFaturamento = vendasFiltradas.reduce(
      (acc, v) => acc + (v.total || 0),
      0,
    );
    const totalDescontos = vendasFiltradas.reduce(
      (acc, v) => acc + (v.desconto || 0),
      0,
    );
    const ticketMedio =
      vendasFiltradas.length > 0
        ? totalFaturamento / vendasFiltradas.length
        : 0;

    // Agrupa por forma de pagamento
    const porPagamento = {};
    vendasFiltradas.forEach((v) => {
      const metodo = v.metodo || "Outros";
      if (!porPagamento[metodo]) {
        porPagamento[metodo] = { qtd: 0, valor: 0 };
      }
      porPagamento[metodo].qtd++;
      porPagamento[metodo].valor += v.total || 0;
    });

    // Calcula top produtos
    const produtosMap = {};
    vendasFiltradas.forEach((v) => {
      (v.carrinho || []).forEach((item) => {
        const nome = item.descricao || "Produto";
        if (!produtosMap[nome]) {
          produtosMap[nome] = { qtd: 0, valor: 0 };
        }
        produtosMap[nome].qtd += item.qtd || 1;
        produtosMap[nome].valor += (item.qtd || 1) * (item.vUnit || 0);
      });
    });

    const topProdutos = Object.entries(produtosMap)
      .map(([nome, dados]) => ({ nome, ...dados }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    setStats({
      faturamento: totalFaturamento,
      totalVendas: vendasFiltradas.length,
      ticketMedio,
      descontos: totalDescontos,
      porPagamento,
      topProdutos,
    });
  }, [mes, ano, vendas]);

  // Carrega vendas do tenant
  useEffect(() => {
    const todasVendas = getVendas();
    setVendas(todasVendas);
  }, []);

  // Calcula estatísticas quando vendas, mês ou ano mudam
  useEffect(() => {
    calcularEstatisticas();
  }, [calcularEstatisticas]);

  // Renderiza gráficos
  useEffect(() => {
    Object.values(chartInstances.current).forEach((chart) => chart.destroy());

    // Faturamento por semana
    if (faturamentoChartRef.current) {
      const vendasMes = vendas.filter((v) => {
        const data = new Date(v.data);
        return data.getMonth() === mes && data.getFullYear() === ano;
      });

      const semanas = [0, 0, 0, 0, 0];
      vendasMes.forEach((v) => {
        const data = new Date(v.data);
        const dia = data.getDate();
        const semana = Math.floor((dia - 1) / 7);
        if (semana < 5) semanas[semana] += v.total || 0;
      });

      chartInstances.current.faturamento = new Chart(
        faturamentoChartRef.current,
        {
          type: "bar",
          data: {
            labels: [
              "Semana 1",
              "Semana 2",
              "Semana 3",
              "Semana 4",
              "Semana 5",
            ],
            datasets: [
              {
                label: "Faturamento",
                data: semanas,
                backgroundColor: "rgba(30, 58, 138, 0.7)",
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
            },
          },
        },
      );
    }

    // Pagamentos
    if (pagamentoChartRef.current) {
      const labels = Object.keys(stats.porPagamento);
      const data = Object.values(stats.porPagamento).map((p) => p.valor);
      const cores = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

      chartInstances.current.pagamento = new Chart(pagamentoChartRef.current, {
        type: "doughnut",
        data: {
          labels: labels.length ? labels : ["Sem dados"],
          datasets: [
            {
              data: labels.length ? data : [1],
              backgroundColor: cores.slice(0, labels.length || 1),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        },
      });
    }

    // Top produtos
    if (produtosChartRef.current) {
      const labels = stats.topProdutos.map((p) => p.nome.substring(0, 15));
      const data = stats.topProdutos.map((p) => p.valor);
      const cores = ["#EF4444", "#84CC16", "#3B82F6", "#F97316", "#6366F1"];

      chartInstances.current.produtos = new Chart(produtosChartRef.current, {
        type: "pie",
        data: {
          labels: labels.length ? labels : ["Sem dados"],
          datasets: [
            {
              data: labels.length ? data : [1],
              backgroundColor: cores.slice(0, labels.length || 1),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        },
      });
    }

    // Comparativo mensal
    if (comparativoChartRef.current) {
      const meses = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      const dadosMes = meses.map((_, i) => {
        return vendas
          .filter((v) => {
            const data = new Date(v.data);
            return data.getMonth() === i && data.getFullYear() === ano;
          })
          .reduce((acc, v) => acc + (v.total || 0), 0);
      });

      chartInstances.current.comparativo = new Chart(
        comparativoChartRef.current,
        {
          type: "line",
          data: {
            labels: meses,
            datasets: [
              {
                label: `${ano}`,
                data: dadosMes,
                borderColor: "rgba(30, 58, 138, 1)",
                backgroundColor: "rgba(30, 58, 138, 0.1)",
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "top" },
            },
          },
        },
      );
    }

    return () => {
      Object.values(chartInstances.current).forEach((chart) => chart.destroy());
    };
  }, [vendas, mes, ano, stats]);

  function handleImprimirRelatorio() {
    imprimirRelatorioVendas({
      vendas: vendas.filter((v) => {
        const data = new Date(v.data);
        return data.getMonth() === mes && data.getFullYear() === ano;
      }),
      totalFaturamento: stats.faturamento,
      totalVendas: stats.totalVendas,
      ticketMedio: stats.ticketMedio,
      periodo: `${mes + 1}/${ano}`,
    });
  }

  function formatarMoeda(valor) {
    return `R$ ${(valor || 0).toFixed(2)}`;
  }

  return (
    <PlanBlock
      feature="relatorios"
      mensagem="Relatórios completos com gráficos e análises"
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
            <p className="text-sm text-gray-500">
              {stats.totalVendas} vendas no período | {vendas.length} vendas no
              total
            </p>
          </div>
          <button
            onClick={handleImprimirRelatorio}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <i className="fas fa-print"></i>
            Imprimir Relatório
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mês
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ano
            </label>
            <select
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027, 2028].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            icon="fa-dollar-sign"
            title="Faturamento"
            value={formatarMoeda(stats.faturamento)}
            subtitle="Mês selecionado"
            cor="#10B981"
          />
          <SummaryCard
            icon="fa-shopping-cart"
            title="Vendas"
            value={stats.totalVendas}
            subtitle="Transações"
            cor="#3B82F6"
          />
          <SummaryCard
            icon="fa-percentage"
            title="Ticket Médio"
            value={formatarMoeda(stats.ticketMedio)}
            subtitle="Por venda"
            cor="#F59E0B"
          />
          <SummaryCard
            icon="fa-tags"
            title="Descontos"
            value={formatarMoeda(stats.descontos)}
            subtitle="Valor total"
            cor="#EF4444"
          />
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              Faturamento Semanal
            </h3>
            <canvas ref={faturamentoChartRef}></canvas>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              Pagamentos
            </h3>
            <canvas ref={pagamentoChartRef}></canvas>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              Top Produtos
            </h3>
            <canvas ref={produtosChartRef}></canvas>
          </div>
        </div>

        {/* Tabelas */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">
                Top 5 Produtos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">
                      #
                    </th>
                    <th className="text-left p-3 font-medium text-gray-600">
                      Produto
                    </th>
                    <th className="text-right p-3 font-medium text-gray-600">
                      Qtd
                    </th>
                    <th className="text-right p-3 font-medium text-gray-600">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProdutos.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-6 text-gray-400">
                        Nenhuma venda no período
                      </td>
                    </tr>
                  ) : (
                    stats.topProdutos.map((p, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3">{p.nome}</td>
                        <td className="p-3 text-right">{p.qtd}</td>
                        <td className="p-3 text-right font-medium">
                          {formatarMoeda(p.valor)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">
                Formas de Pagamento
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">
                      Forma
                    </th>
                    <th className="text-right p-3 font-medium text-gray-600">
                      Qtd
                    </th>
                    <th className="text-right p-3 font-medium text-gray-600">
                      Valor
                    </th>
                    <th className="text-right p-3 font-medium text-gray-600">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(stats.porPagamento).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-6 text-gray-400">
                        Nenhuma venda no período
                      </td>
                    </tr>
                  ) : (
                    Object.entries(stats.porPagamento).map(
                      ([metodo, dados], i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="p-3">{metodo}</td>
                          <td className="p-3 text-right">{dados.qtd}</td>
                          <td className="p-3 text-right font-medium">
                            {formatarMoeda(dados.valor)}
                          </td>
                          <td className="p-3 text-right">
                            {stats.faturamento > 0
                              ? (
                                  (dados.valor / stats.faturamento) *
                                  100
                                ).toFixed(1) + "%"
                              : "0%"}
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Comparativo anual */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">
            Comparativo Mensal - {ano}
          </h3>
          <canvas ref={comparativoChartRef}></canvas>
        </div>
      </div>
    </PlanBlock>
  );
}
