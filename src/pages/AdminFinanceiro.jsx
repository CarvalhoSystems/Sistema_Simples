import React, { useState, useEffect } from "react";
import { gerarRelatorioAdmin, PLANOS } from "../services/planoManager";

export default function AdminFinanceiro() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    async function carregarDadosFinanceiros() {
      const dados = await gerarRelatorioAdmin();
      setClientes(dados);
    }
    carregarDadosFinanceiros();
  }, []);

  // Receita mensal do SISTEMA com base nas assinaturas ativas dos clientes
  const totalFaturamentoEstimado = clientes.reduce((acc, c) => {
    const planoId = c.assinatura?.planoId || c.assinatura?.plano;
    if (
      c.assinatura?.status === "ativa" &&
      planoId &&
      planoId !== "free" &&
      PLANOS[planoId]
    ) {
      return acc + PLANOS[planoId].preco;
    }
    return acc;
  }, 0);
  const qtdPagantes = clientes.filter(
    (c) => c.assinatura?.status === "ativa",
  ).length;
  const receitaPotencial = qtdPagantes * 49.9; // média do plano básico
  const qtdTrial = clientes.filter(
    (c) => c.assinatura?.status === "trial",
  ).length;
  const qtdVencidos = clientes.filter(
    (c) =>
      c.assinatura?.status === "vencida" ||
      c.assinatura?.status === "trial_expirado",
  ).length;
  // Desglose por plano
  const receitaPorPlano = {};
  clientes.forEach((c) => {
    const planoId = c.assinatura?.planoId || c.assinatura?.plano;
    if (c.assinatura?.status === "ativa" && planoId && PLANOS[planoId]) {
      receitaPorPlano[planoId] = (receitaPorPlano[planoId] || 0) + 1;
    }
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
          <p className="text-sm text-gray-500 font-medium">Em Teste</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{qtdTrial}</p>
          <div className="mt-2 text-xs text-gray-400">
            {qtdTrial > 0
              ? `${qtdTrial} cliente(s) em período de teste`
              : "Nenhum em teste"}
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

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Vencidos</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{qtdVencidos}</p>
          <div className="mt-2 text-xs text-gray-400">
            {qtdVencidos > 0
              ? `${qtdVencidos} cliente(s) com acesso bloqueado`
              : "Nenhum vencido"}
          </div>
        </div>
      </div>

      {/* Tabela de Assinaturas por Cliente */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">
            Assinaturas por Cliente
          </h3>
          <p className="text-xs text-gray-500">
            Apenas dados de assinatura. Os dados de vendas dos clientes são
            privados.
          </p>
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
                  Status
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  Valor Mensal
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  Vencimento
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes
                .sort((a, b) => {
                  const aPlano = a.assinatura?.planoId || a.assinatura?.plano;
                  const bPlano = b.assinatura?.planoId || b.assinatura?.plano;
                  return (
                    (PLANOS[bPlano]?.preco || 0) - (PLANOS[aPlano]?.preco || 0)
                  );
                })
                .map((cliente, i) => {
                  const planoId =
                    cliente.assinatura?.planoId || cliente.assinatura?.plano;
                  const plano = PLANOS[planoId];
                  const statusMap = {
                    trial: {
                      cor: "bg-blue-100 text-blue-800",
                      texto: "Teste Grátis",
                    },
                    ativa: {
                      cor: "bg-green-100 text-green-800",
                      texto: "Ativa",
                    },
                    vencida: {
                      cor: "bg-red-100 text-red-800",
                      texto: "Vencida",
                    },
                    trial_expirado: {
                      cor: "bg-yellow-100 text-yellow-800",
                      texto: "Trial Expirado",
                    },
                  };
                  const info = statusMap[cliente.assinatura?.status] || {
                    cor: "bg-gray-100 text-gray-800",
                    texto: cliente.assinatura?.status || "N/A",
                  };
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {cliente.nome}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                          {plano?.nome || "Free"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${info.cor}`}
                        >
                          {info.texto}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium text-green-600">
                        {plano && planoId !== "free"
                          ? `R$ ${plano.preco.toFixed(2)}`
                          : "R$ 0,00"}
                      </td>
                      <td className="p-3 text-right text-xs text-gray-500">
                        {cliente.assinatura?.proximoVencimento
                          ? new Date(
                              cliente.assinatura.proximoVencimento,
                            ).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Resumo de Receita por Plano */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">
            Receita Mensal por Plano
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-600">
                  Plano
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  Assinantes
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  Valor Unitário
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  Receita Mensal
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PLANOS)
                .filter(([id]) => id !== "free")
                .map(([id, plano]) => {
                  const qtd = receitaPorPlano[id] || 0;
                  return (
                    <tr
                      key={id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {plano.nome}
                      </td>
                      <td className="p-3 text-center font-medium">{qtd}</td>
                      <td className="p-3 text-right">
                        R$ {plano.preco.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-medium text-green-600">
                        R$ {(qtd * plano.preco).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              <tr className="bg-gray-50">
                <td className="p-3 font-bold text-gray-800">TOTAL</td>
                <td className="p-3 text-center font-bold">{qtdPagantes}</td>
                <td className="p-3 text-right"></td>
                <td className="p-3 text-right font-bold text-green-600">
                  R$ {totalFaturamentoEstimado.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
