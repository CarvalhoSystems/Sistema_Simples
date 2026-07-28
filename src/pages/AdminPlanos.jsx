import React, { useState, useEffect } from "react";
import { gerarRelatorioAdmin, PLANOS } from "../services/planoManager";

export default function AdminPlanos() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const dados = gerarRelatorioAdmin();
    setClientes(dados);
  }, []);

  // Distribuição por plano
  const planosCount = {};
  clientes.forEach((c) => {
    const plano = c.assinatura?.plano || "free";
    planosCount[plano] = (planosCount[plano] || 0) + 1;
  });

  const planosInfo = [
    {
      id: "free",
      nome: "Free",
      preco: "Grátis",
      cor: "bg-blue-500",
      corBg: "bg-blue-50",
      corTexto: "text-blue-700",
      corBorda: "border-blue-200",
      features: [
        "PDV Completo",
        "Dashboard",
        "1 Estabelecimento",
        "50 Produtos",
      ],
    },
    {
      id: "basico",
      nome: "Básico",
      preco: "R$ 49,90",
      cor: "bg-green-500",
      corBg: "bg-green-50",
      corTexto: "text-green-700",
      corBorda: "border-green-200",
      features: [
        "Tudo do Free +",
        "Relatórios",
        "Backup Automático",
        "Produtos Ilimitados",
      ],
    },
    {
      id: "profissional",
      nome: "Profissional",
      preco: "R$ 74,90",
      cor: "bg-purple-500",
      corBg: "bg-purple-50",
      corTexto: "text-purple-700",
      corBorda: "border-purple-200",
      features: [
        "Tudo do Básico +",
        "Nota Fiscal Paulista",
        "3 Estabelecimentos",
        "Suporte VIP",
      ],
    },
    {
      id: "premium",
      nome: "Premium",
      preco: "R$ 99,90",
      cor: "bg-yellow-500",
      corBg: "bg-yellow-50",
      corTexto: "text-yellow-700",
      corBorda: "border-yellow-200",
      features: [
        "Tudo do Profissional +",
        "API Integração",
        "Estabelecimentos Ilimitados",
        "Usuários Ilimitados",
      ],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fas fa-crown text-yellow-500"></i>
          Gerenciar Planos
        </h1>
        <p className="text-sm text-gray-500">
          Visão geral dos planos e assinantes
        </p>
      </div>

      {/* Cards dos Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {planosInfo.map((plano) => {
          const qtd = planosCount[plano.id] || 0;
          return (
            <div
              key={plano.id}
              className={`bg-white rounded-xl border-2 ${plano.corBorda} shadow-sm overflow-hidden`}
            >
              <div className={`${plano.corBg} p-4 text-center`}>
                <div
                  className={`w-12 h-12 ${plano.cor} rounded-full flex items-center justify-center mx-auto mb-2`}
                >
                  <i className="fas fa-crown text-white"></i>
                </div>
                <h3 className={`font-bold text-lg ${plano.corTexto}`}>
                  {plano.nome}
                </h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {plano.preco}
                </p>
              </div>
              <div className="p-4">
                <div className="text-center mb-3">
                  <p className="text-3xl font-bold text-gray-800">{qtd}</p>
                  <p className="text-sm text-gray-500">assinante(s)</p>
                </div>
                <div className="space-y-1.5">
                  {plano.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <i
                        className={`fas fa-check-circle ${plano.corTexto}`}
                      ></i>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clientes por Plano */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Clientes por Plano</h3>
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
                  Plano Atual
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  Cadastro
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  Expira
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente, i) => {
                const planoId = cliente.assinatura?.plano || "free";
                const planoInfo = planosInfo.find((p) => p.id === planoId);
                const statusMap = {
                  trial: {
                    cor: "bg-blue-100 text-blue-800",
                    texto: "Teste Grátis",
                  },
                  ativa: { cor: "bg-green-100 text-green-800", texto: "Ativa" },
                  vencida: { cor: "bg-red-100 text-red-800", texto: "Vencida" },
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
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planoInfo?.corBg} ${planoInfo?.corTexto}`}
                      >
                        {planoInfo?.nome || "Free"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${info.cor}`}
                      >
                        {info.texto}
                      </span>
                    </td>
                    <td className="p-3 text-center text-xs text-gray-500">
                      {cliente.criadoEm
                        ? new Date(cliente.criadoEm).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="p-3 text-center text-xs text-gray-500">
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
                  <td colSpan="6" className="text-center p-8 text-gray-400">
                    <i className="fas fa-inbox text-3xl mb-2 block"></i>
                    Nenhum cliente encontrado
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
