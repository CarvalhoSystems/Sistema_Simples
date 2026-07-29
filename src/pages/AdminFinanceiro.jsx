import React, { useState, useEffect } from "react";
import { gerarRelatorioAdmin, PLANOS } from "../services/planoManager";

export default function AdminFinanceiro() {
  const [clientes, setClientes] = useState([]);
  const [periodo, setPeriodo] = useState("todos");

  useEffect(() => {
    async function carregarDadosFinanceiros() {
      const dados = await gerarRelatorioAdmin();
      setClientes(dados);
    }
    carregarDadosFinanceiros();
  }, []);

  // O faturamento agora é simulado com base nos planos ativos, já que os dados de venda não são agregados no tenant principal
  const totalFaturamentoEstimado = clientes.reduce((acc, c) => {
    if (c.assinatura?.status === "ativa" && PLANOS[c.assinatura.planoId]) {
      return acc + PLANOS[c.assinatura.planoId].preco;
    }
    return acc;
  }, 0);
  const qtdPagantes = clientes.filter(
    (c) => c.assinatura?.status === "ativa",
  ).length;
  const receitaPotencial = qtdPagantes * 49.9; // média do plano básico

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fas fa-chart-line text-green-600"></i>
          Financeiro
        </h1>
        <p className="text-sm text-gray-500">Visão financeira do sistema</p>
      </div>

      {/* Cards Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Faturamento Total</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {" "}
            {/* Este é um faturamento estimado mensal */}
            R$ {totalFaturamentoEstimado.toFixed(2)}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            Faturamento mensal estimado com base nos planos ativos
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total de Vendas</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">N/A</p>{" "}
          {/* Removido, pois não é mais facilmente acessível */}
          <div className="mt-2 text-xs text-gray-400">
            {clientes.length > 0
              ? `Não disponível diretamente no dashboard admin`
              : "N/A"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Clientes Pagantes</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {qtdPagantes}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            {clientes.length > 0
              ? `${((qtdPagantes / clientes.length) * 100).toFixed(1)}% dos clientes`
              : "0% dos clientes"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">
            Receita Potencial/mês
          </p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            R$ {receitaPotencial.toFixed(2)}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            Baseado em {qtdPagantes} assinante(s) ativo(s)
          </div>
        </div>
      </div>

      {/* Tabela de Faturamento por Cliente */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">
            Faturamento por Cliente
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-600">
                  Cliente
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  Plano
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  {" "}
                  {/* Removido */}
                  Total Vendas
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  {" "}
                  {/* Removido */}
                  Valor Total
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  Ticket Médio
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes
                .sort(
                  (a, b) =>
                    (b.valorTotalVendas || 0) - (a.valorTotalVendas || 0),
                )
                .map((cliente, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {cliente.nome}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        {cliente.assinatura?.plano
                          ? PLANOS[cliente.assinatura.plano]?.nome ||
                            cliente.assinatura.plano
                          : "Free"}
                      </span>
                    </td>
                    <td className="p-3 text-center font-medium">N/A</td>{" "}
                    {/* Removido */}
                    <td className="p-3 text-right font-medium text-green-600">
                      N/A
                    </td>{" "}
                    {/* Removido */}
                    <td className="p-3 text-right font-medium">
                      R${" "}
                      {cliente.assinatura?.planoId !== "free" &&
                      PLANOS[cliente.assinatura?.planoId]
                        ? PLANOS[cliente.assinatura.planoId].preco.toFixed(2)
                        : "0,00"}{" "}
                      {/* Exibe o preço do plano como ticket médio simulado */}
                    </td>
                  </tr>
                ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400">
                    <i className="fas fa-inbox text-3xl mb-2 block"></i>
                    Nenhum dado financeiro disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
