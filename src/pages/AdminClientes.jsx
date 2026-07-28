import React, { useState, useEffect } from "react";
import {
  gerarRelatorioAdmin,
  PLANOS,
  alterarPlanoManual,
  renovarTrialManual,
  alterarStatusManual,
} from "../services/planoManager";
import { RAMOS_NEGOCIO } from "../services/supabaseClient";

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [modalAberto, setModalAberto] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  function carregarClientes() {
    const dados = gerarRelatorioAdmin();
    setClientes(dados);
  }

  function getStatusInfo(status) {
    const map = {
      trial: { cor: "bg-blue-100 text-blue-800", texto: "Teste Grátis" },
      ativa: { cor: "bg-green-100 text-green-800", texto: "Ativa" },
      vencida: { cor: "bg-red-100 text-red-800", texto: "Vencida" },
      cancelada: { cor: "bg-gray-100 text-gray-800", texto: "Cancelada" },
      trial_expirado: {
        cor: "bg-yellow-100 text-yellow-800",
        texto: "Trial Expirado",
      },
    };
    return map[status] || { cor: "bg-gray-100 text-gray-800", texto: status };
  }

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function getRamoNome(ramoId) {
    const ramo = RAMOS_NEGOCIO.find((r) => r.id === ramoId);
    return ramo?.nome || ramoId || "N/A";
  }

  async function handleAlterarPlano(cliente, novoPlano) {
    setCarregando(true);
    const result = alterarPlanoManual(cliente.id, cliente, novoPlano);
    setMensagem(result);
    setModalAberto(null);
    carregarClientes();
    setCarregando(false);
  }

  async function handleRenovarTrial(cliente, dias = 7) {
    setCarregando(true);
    const result = renovarTrialManual(cliente.id, dias);
    setMensagem(result);
    setModalAberto(null);
    carregarClientes();
    setCarregando(false);
  }

  async function handleAlterarStatus(cliente, novoStatus) {
    setCarregando(true);
    const result = alterarStatusManual(cliente.id, novoStatus);
    setMensagem(result);
    setModalAberto(null);
    carregarClientes();
    setCarregando(false);
  }

  const clientesFiltrados =
    filtro === "todos"
      ? clientes
      : clientes.filter((c) => c.assinatura?.status === filtro);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Mensagem de feedback */}
      {mensagem && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            mensagem.success
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          <i
            className={`fas ${mensagem.success ? "fa-check-circle" : "fa-exclamation-circle"} mr-2`}
          ></i>
          {mensagem.mensagem || mensagem.error}
          <button
            onClick={() => setMensagem(null)}
            className="ml-3 hover:opacity-70"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-users-cog text-blue-600"></i>
            Gerenciar Clientes
          </h1>
          <p className="text-sm text-gray-500">
            {clientes.length} cliente(s) cadastrado(s)
          </p>
        </div>
        <button
          onClick={carregarClientes}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
        >
          <i className="fas fa-sync-alt"></i>
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 flex flex-wrap gap-2">
        {[
          { id: "todos", label: "Todos", icon: "fa-list" },
          { id: "trial", label: "Teste Grátis", icon: "fa-clock" },
          { id: "ativa", label: "Ativos", icon: "fa-check-circle" },
          { id: "vencida", label: "Vencidos", icon: "fa-exclamation-triangle" },
          {
            id: "trial_expirado",
            label: "Trial Expirado",
            icon: "fa-hourglass-end",
          },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              filtro === f.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className={`fas ${f.icon}`}></i>
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 font-medium text-gray-600">
                  Cliente
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Ramo
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
                <th className="text-center p-3 font-medium text-gray-600">
                  Expira
                </th>
                <th className="text-center p-3 font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-8 text-gray-400">
                    <i className="fas fa-inbox text-3xl mb-2 block"></i>
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente, i) => {
                  const statusInfo = getStatusInfo(cliente.assinatura?.status);
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-store text-blue-600 text-xs"></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {cliente.nome}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">
                        {cliente.email || "-"}
                      </td>
                      <td className="p-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {cliente.ramo || "N/A"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-medium">
                          {cliente.assinatura?.plano
                            ? PLANOS[cliente.assinatura.plano]?.nome ||
                              cliente.assinatura.plano
                            : "Free"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.cor}`}
                        >
                          {statusInfo.texto}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {cliente.totalVendas || 0}
                      </td>
                      <td className="p-3 text-right font-medium">
                        R$ {(cliente.valorTotalVendas || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-center text-xs text-gray-500">
                        {formatarData(cliente.assinatura?.proximoVencimento)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() =>
                              setModalAberto({ tipo: "plano", cliente })
                            }
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="Alterar Plano"
                          >
                            <i className="fas fa-crown"></i>
                          </button>
                          <button
                            onClick={() =>
                              setModalAberto({ tipo: "trial", cliente })
                            }
                            className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
                            title="Renovar Trial"
                          >
                            <i className="fas fa-clock"></i>
                          </button>
                          <button
                            onClick={() =>
                              setModalAberto({ tipo: "status", cliente })
                            }
                            className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                            title="Alterar Status"
                          >
                            <i className="fas fa-toggle-on"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Alterar Plano */}
      {modalAberto?.tipo === "plano" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Alterar Plano
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Cliente: <strong>{modalAberto.cliente.nome}</strong>
            </p>
            <div className="space-y-2">
              {Object.entries(PLANOS).map(([id, plano]) => (
                <button
                  key={id}
                  onClick={() => handleAlterarPlano(modalAberto.cliente, id)}
                  disabled={carregando}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    modalAberto.cliente.assinatura?.plano === id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{plano.nome}</p>
                      <p className="text-xs text-gray-500">
                        {id === "free"
                          ? "Grátis"
                          : `R$ ${plano.preco.toFixed(2)}/mês`}
                      </p>
                    </div>
                    {modalAberto.cliente.assinatura?.plano === id && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Atual
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalAberto(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Renovar Trial */}
      {modalAberto?.tipo === "trial" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Renovar Trial
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Cliente: <strong>{modalAberto.cliente.nome}</strong>
            </p>
            <div className="space-y-2">
              {[3, 7, 15, 30].map((dias) => (
                <button
                  key={dias}
                  onClick={() => handleRenovarTrial(modalAberto.cliente, dias)}
                  disabled={carregando}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-clock text-yellow-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{dias} dias</p>
                      <p className="text-xs text-gray-500">
                        {dias === 7
                          ? "Padrão"
                          : dias === 30
                            ? "1 mês"
                            : `${dias} dias extras`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalAberto(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Alterar Status */}
      {modalAberto?.tipo === "status" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Alterar Status
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Cliente: <strong>{modalAberto.cliente.nome}</strong>
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "ativa",
                  label: "Ativar",
                  cor: "bg-green-100 text-green-800",
                  icon: "fa-check-circle",
                },
                {
                  id: "trial",
                  label: "Colocar em Trial",
                  cor: "bg-blue-100 text-blue-800",
                  icon: "fa-clock",
                },
                {
                  id: "vencida",
                  label: "Marcar como Vencida",
                  cor: "bg-red-100 text-red-800",
                  icon: "fa-exclamation-triangle",
                },
                {
                  id: "cancelada",
                  label: "Cancelar",
                  cor: "bg-gray-100 text-gray-800",
                  icon: "fa-times-circle",
                },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() =>
                    handleAlterarStatus(modalAberto.cliente, status.id)
                  }
                  disabled={carregando}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    modalAberto.cliente.assinatura?.status === status.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.cor}`}
                    >
                      <i className={`fas ${status.icon} mr-1`}></i>
                      {status.label}
                    </span>
                    {modalAberto.cliente.assinatura?.status === status.id && (
                      <span className="text-xs text-blue-600">(Atual)</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalAberto(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-blue-600">{clientes.length}</p>
          <p className="text-xs text-gray-500">Total Clientes</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">
            {
              clientes.filter(
                (c) =>
                  c.assinatura?.status === "ativa" ||
                  c.assinatura?.status === "trial",
              ).length
            }
          </p>
          <p className="text-xs text-gray-500">Ativos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-red-600">
            {
              clientes.filter(
                (c) =>
                  c.assinatura?.status === "vencida" ||
                  c.assinatura?.status === "trial_expirado",
              ).length
            }
          </p>
          <p className="text-xs text-gray-500">Vencidos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-purple-600">
            R${" "}
            {clientes
              .reduce((acc, c) => acc + (c.valorTotalVendas || 0), 0)
              .toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">Faturamento Total</p>
        </div>
      </div>
    </div>
  );
}
