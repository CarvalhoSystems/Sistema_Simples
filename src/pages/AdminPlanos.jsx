import React, { useState, useEffect } from "react";
import { gerarRelatorioAdmin, PLANOS } from "../services/planoManager";

export default function AdminPlanos() {
  const [clientes, setClientes] = useState([]);
  const [modalPlanoDetalhes, setModalPlanoDetalhes] = useState(null); // Modal de ver assinantes

  // Estados para o Modal de Edição
  const [modalEditarPlano, setModalEditarPlano] = useState(false);
  const [planoEmEdicao, setPlanoEmEdicao] = useState(null);
  const [novoPreco, setNovoPreco] = useState("");

  useEffect(() => {
    async function carregarDadosPlanos() {
      const dados = await gerarRelatorioAdmin();
      setClientes(dados);
    }
    carregarDadosPlanos();
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
      preco: "0",
      periodo: "grátis por 7 dias",
      destaque: false,
      corBorda: "border-gray-200",
      corBg: "bg-gray-50",
      cor: "bg-gray-500",
      corTexto: "text-gray-600",
      features: [
        "🏪 1 estabelecimento",
        "📦 Até 50 produtos cadastrados",
        "💻 PDV completo e ágil",
        "📊 Dashboard básico de vendas",
        "✉️ Suporte por email",
      ],
      tag: "TESTE GRÁTIS",
    },
    {
      id: "basico",
      nome: "Básico",
      preco: "89,90",
      periodo: "/mês",
      destaque: false,
      corBorda: "border-blue-200",
      corBg: "bg-blue-50",
      cor: "bg-blue-500",
      corTexto: "text-blue-600",
      features: [
        "🏪 1 estabelecimento",
        "📦 Produtos ilimitados",
        "⚡ PDV + Dashboard em tempo real",
        "📈 Relatórios semanais e mensais",
        "☁️ Backup seguro em nuvem",
        "⭐ Suporte prioritário",
      ],
      tag: "MAIS ACESSÍVEL",
    },
    {
      id: "profissional",
      nome: "Profissional",
      preco: "129,90",
      periodo: "/mês",
      destaque: true,
      corBorda: "border-purple-200",
      corBg: "bg-purple-50",
      cor: "bg-purple-500",
      corTexto: "text-purple-600",
      features: [
        "🏢 Até 3 estabelecimentos",
        "📦 Produtos ilimitados",
        "🧾 Nota Fiscal Paulista",
        "📄 NF-e sem burocracia",
        "📊 Faturamento diário interativo",
        "🔍 Auditoria total de produtos por dia",
        "💎 Suporte VIP dedicado",
        "🛡️ Backup automático diário",
      ],
      tag: "MAIS VENDIDO 🔥",
    },
    {
      id: "premium",
      nome: "Premium",
      preco: "179,90",
      periodo: "/mês",
      destaque: false,
      corBorda: "border-yellow-200",
      corBg: "bg-yellow-50",
      cor: "bg-yellow-500",
      corTexto: "text-yellow-600",
      features: [
        "🚀 Estabelecimentos ilimitados",
        "📦 Produtos ilimitados",
        "🧾 Nota Fiscal Paulista",
        "👥 Múltiplos usuários com permissões",
        "🎯 Relatórios 100% customizados",
        "🔌 API de integração completa",
        "👑 Suporte 24h prioritário",
        "✨ Acesso antecipado a novas features",
      ],
      tag: "COMPLETO",
    },
  ];

  // Funções de Ação da Edição
  const handleAbrirEdicao = (plano) => {
    setPlanoEmEdicao(plano);
    setNovoPreco(plano.preco);
    setModalEditarPlano(true);
  };

  const handleSalvarEdicao = () => {
    alert(
      `Preço do plano ${planoEmEdicao.nome} atualizado para R$ ${novoPreco}!`,
    );
    setModalEditarPlano(false);
    setPlanoEmEdicao(null);
  };

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
              className={`bg-white rounded-xl border-2 ${plano.corBorda} shadow-sm overflow-hidden relative flex flex-col justify-between`}
            >
              {/* Botão de Ação/Edição Rápida no Topo do Card */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => handleAbrirEdicao(plano)}
                  className="w-8 h-8 bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center shadow-sm transition-colors border border-gray-200"
                  title="Editar Plano / Promoção"
                >
                  <i className="fas fa-cog text-xs"></i>
                </button>
              </div>

              <div>
                <div className={`${plano.corBg} p-4 text-center relative`}>
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

              {/* Rodapé do Card com Ação Rápida */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => setModalPlanoDetalhes(plano)}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-users text-gray-400 text-xs"></i>
                  Ver Assinantes ({qtd})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Lista de Assinantes do Plano */}
      {modalPlanoDetalhes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Cabeçalho do Modal */}
            <div
              className={`p-6 ${modalPlanoDetalhes.corBg} border-b border-gray-100 flex justify-between items-center`}
            >
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assinantes do plano
                </span>
                <h3
                  className={`text-xl font-bold ${modalPlanoDetalhes.corTexto}`}
                >
                  {modalPlanoDetalhes.nome} (
                  {planosCount[modalPlanoDetalhes.id] || 0})
                </h3>
              </div>
              <button
                onClick={() => setModalPlanoDetalhes(null)}
                className="w-9 h-9 bg-white/80 hover:bg-white text-gray-600 rounded-full flex items-center justify-center shadow-sm transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Corpo com a Tabela de Clientes filtrada */}
            <div className="p-6 overflow-y-auto flex-1">
              {clientes.filter(
                (c) => c.assinatura?.plano === modalPlanoDetalhes.id,
              ).length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nenhum cliente ativo neste plano no momento.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                        <th className="pb-3 font-medium">Cliente</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Expira</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {clientes
                        .filter(
                          (c) => c.assinatura?.plano === modalPlanoDetalhes.id,
                        )
                        .map((cliente) => (
                          <tr key={cliente.id} className="hover:bg-gray-50/50">
                            <td className="py-3 font-medium text-gray-800">
                              {cliente.nome}
                            </td>
                            <td className="py-3 text-gray-500 text-xs">
                              {cliente.email}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                  cliente.assinatura?.status === "ativa"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {cliente.assinatura?.status || "Indefinido"}
                              </span>
                            </td>
                            <td className="py-3 text-gray-500 text-xs">
                              {cliente.assinatura?.proximoVencimento || "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalPlanoDetalhes(null)}
                className="px-5 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Editar Plano / Preço */}
      {modalEditarPlano && planoEmEdicao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            {/* Cabeçalho */}
            <div
              className={`p-6 ${planoEmEdicao.corBg} border-b border-gray-100 flex justify-between items-center`}
            >
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Configurações
                </span>
                <h3 className={`text-xl font-bold ${planoEmEdicao.corTexto}`}>
                  Editar Plano: {planoEmEdicao.nome}
                </h3>
              </div>
              <button
                onClick={() => setModalEditarPlano(false)}
                className="w-9 h-9 bg-white/80 hover:bg-white text-gray-600 rounded-full flex items-center justify-center shadow-sm transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  disabled
                  value={planoEmEdicao.nome}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Preço Mensal (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">
                    R$
                  </span>
                  <input
                    type="text"
                    value={novoPreco}
                    onChange={(e) => setNovoPreco(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 99,90"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Essa alteração refletirá para novas assinaturas.
                </p>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setModalEditarPlano(false)}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
