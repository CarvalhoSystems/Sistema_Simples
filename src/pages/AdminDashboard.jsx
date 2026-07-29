import React, { useState, useEffect } from "react";
import { gerarRelatorioAdmin, PLANOS } from "../services/planoManager";

export default function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados(); // A função carregarDados agora é assíncrona
  }, []);

  async function carregarDados() {
    setCarregando(true);
    const dados = await gerarRelatorioAdmin();
    setClientes(dados || []); // Garante que seja sempre um array
    setCarregando(false);
  }

  const totalClientes = clientes.length; // Já é um array
  const emTrial = clientes.filter(
    (c) => c.assinatura?.status === "trial",
  ).length; // Filtra pelo status correto
  const ativos = clientes.filter(
    (c) => c.assinatura?.status === "ativa",
  ).length;
  const vencidos = clientes.filter(
    (c) =>
      c.assinatura?.status === "vencida" ||
      c.assinatura?.status === "trial_expirado",
  ).length; // Filtra pelo status correto
  const faturamentoTotal = clientes.reduce(
    // Estes campos não estarão mais disponíveis diretamente
    (acc, c) =>
      acc +
      (c.assinatura?.plano !== "free"
        ? PLANOS[c.assinatura?.plano]?.preco || 0
        : 0), // Simula faturamento mensal dos planos ativos
    0,
  );
  const totalVendas = clientes.reduce(
    (acc, c) => acc + (c.totalVendas || 0),
    0,
  );

  // Contagem por plano
  const planosCount = {};
  clientes.forEach((c) => {
    const plano = c.assinatura?.plano || "free"; // Usa plano (que contém o planoId)
    planosCount[plano] = (planosCount[plano] || 0) + 1;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-crown text-yellow-500"></i>
            Painel Administrativo
          </h1>
          <p className="text-sm text-gray-500">
            Visão geral do sistema - {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
        <button
          onClick={carregarDados}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
        >
          <i className="fas fa-sync-alt"></i>
          Atualizar
        </button>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center h-64">
          <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
        </div>
      ) : (
        <>
          {/* Cards Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Clientes
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {totalClientes}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                {totalClientes > 0
                  ? `${totalClientes} cliente(s) cadastrado(s)`
                  : "Nenhum cliente ainda"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Teste Grátis
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {emTrial}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                {emTrial > 0
                  ? `${emTrial} cliente(s) em período de teste`
                  : "Nenhum em teste"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Assinantes Ativos
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {ativos}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                {ativos > 0
                  ? `${ativos} cliente(s) com plano pago`
                  : "Nenhum assinante"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Vencidos</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {vencidos}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                {vencidos > 0
                  ? `${vencidos} cliente(s) com acesso bloqueado`
                  : "Nenhum vencido"}
              </div>
            </div>
          </div>

          {/* Segunda linha de cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">
                  Distribuição por Plano
                </h3>
                <i className="fas fa-chart-pie text-gray-400"></i>
              </div>
              <div className="space-y-3">
                {Object.entries(PLANOS).map(([id, plano]) => {
                  const count = planosCount[id] || 0;
                  const percent =
                    totalClientes > 0 ? (count / totalClientes) * 100 : 0;
                  const cores = {
                    free: "bg-blue-500",
                    basico: "bg-green-500",
                    profissional: "bg-purple-500",
                    premium: "bg-yellow-500",
                  };
                  return (
                    <div key={id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{plano.nome}</span>
                        <span className="font-medium">{count} cliente(s)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${cores[id] || "bg-gray-400"}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">
                  Resumo Financeiro
                </h3>
                <i className="fas fa-dollar-sign text-gray-400"></i>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shopping-cart text-blue-500"></i>
                    <span className="text-sm text-gray-600">
                      Total de Vendas
                    </span>
                  </div>
                  <span className="font-bold text-gray-800">{totalVendas}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-money-bill-wave text-green-500"></i>
                    <span className="text-sm text-gray-600">
                      Faturamento Total
                    </span>
                  </div>
                  <span className="font-bold text-green-600">
                    R$ {faturamentoTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-store text-purple-500"></i>
                    <span className="text-sm text-gray-600">
                      Média por Cliente
                    </span>
                  </div>
                  <span className="font-bold text-purple-600">
                    R${" "}
                    {(totalClientes > 0
                      ? faturamentoTotal / totalClientes
                      : 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Novas Assinaturas/Upgrades Recentes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-bell text-blue-500"></i>
                Assinaturas/Upgrades Recentes
              </h3>
              <p className="text-xs text-gray-500">
                Últimas 5 ativações ou upgrades de planos pagos.
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
                      Ativado Em
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientes
                    .filter((c) => c.assinatura?.dataAtivacaoPlano)
                    .sort(
                      (a, b) =>
                        new Date(b.assinatura.dataAtivacaoPlano) -
                        new Date(a.assinatura.dataAtivacaoPlano),
                    )
                    .slice(0, 5)
                    .map((cliente, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium text-gray-800">
                          {cliente.nome}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-medium">
                            {PLANOS[cliente.assinatura.plano]?.nome || "N/A"}
                          </span>
                        </td>
                        <td className="p-3 text-center text-xs text-gray-500">
                          {new Date(
                            cliente.assinatura.dataAtivacaoPlano,
                          ).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Últimos Clientes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">
                Últimos Clientes Cadastrados
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">
                      Cliente
                    </th>
                    <th className="text-left p-3 font-medium text-gray-600">
                      Email
                    </th>
                    <th className="text-center p-3 font-medium text-gray-600">
                      Plano
                    </th>
                    <th className="text-center p-3 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-center p-3 font-medium text-gray-600">
                      Vendas
                    </th>
                    <th className="text-right p-3 font-medium text-gray-600">
                      Faturamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.slice(0, 10).map((cliente, i) => {
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
                        <td className="p-3 text-gray-500">
                          {cliente.email || "-"}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-medium text-gray-700">
                            {cliente.assinatura?.plano
                              ? PLANOS[cliente.assinatura.plano]?.nome ||
                                cliente.assinatura.plano
                              : "Free"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${info.cor}`}
                          >
                            {info.texto}
                          </span>
                        </td>
                        <td className="p-3 text-center font-medium">
                          {cliente.totalVendas || 0}
                        </td>
                        <td className="p-3 text-right font-medium">
                          R$ {(cliente.valorTotalVendas || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  {clientes.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-gray-400">
                        <i className="fas fa-inbox text-3xl mb-2 block"></i>
                        Nenhum cliente cadastrado ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
