import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  listarEstabelecimentos,
  criarEstabelecimento,
  alternarEstabelecimento,
  removerEstabelecimento,
  renomearEstabelecimento,
  contarEstabelecimentos,
  getEstabelecimentoAtivoId,
} from "../services/estabelecimentoManager";
import { RAMOS_NEGOCIO } from "../services/supabaseClient";
import { verificarStatusAssinatura } from "../services/planoManager";

export default function MeusEstabelecimentos() {
  const navigate = useNavigate();
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [estabelecimentoAtivoId, setEstabelecimentoAtivoId] = useState(null);
  const [statusAssinatura, setStatusAssinatura] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoRamo, setNovoRamo] = useState("mercado");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNome, setEditandoNome] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  function carregarDados() {
    setEstabelecimentos(listarEstabelecimentos());
    setEstabelecimentoAtivoId(getEstabelecimentoAtivoId());
    verificarStatusAssinatura().then(setStatusAssinatura);
  }

  const handleCriar = async () => {
    if (!novoNome.trim()) {
      Swal.fire("Atenção", "Digite um nome para o estabelecimento.", "warning");
      return;
    }

    const result = criarEstabelecimento(novoNome.trim(), novoRamo);
    if (result.success) {
      Swal.fire("Criado!", `Estabelecimento "${novoNome}" criado com sucesso.`, "success");
      setShowModal(false);
      setNovoNome("");
      setNovoRamo("mercado");
      carregarDados();
    } else {
      Swal.fire("Erro", result.error, "error");
    }
  };

  const handleAlternar = async (estabId) => {
    const result = alternarEstabelecimento(estabId);
    if (result.success) {
      Swal.fire(
        "Alternado!",
        `Agora você está em "${result.estabelecimento.nome}".`,
        "success",
      ).then(() => {
        navigate("/dashboard");
      });
      carregarDados();
    } else {
      Swal.fire("Erro", result.error, "error");
    }
  };

  const handleRemover = async (estabId, nome) => {
    const confirm = await Swal.fire({
      title: "Remover Estabelecimento?",
      text: `Tem certeza que deseja remover "${nome}"? Todos os dados serão perdidos.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const result = removerEstabelecimento(estabId);
      if (result.success) {
        Swal.fire("Removido!", "Estabelecimento removido com sucesso.", "success");
        carregarDados();
      } else {
        Swal.fire("Erro", result.error, "error");
      }
    }
  };

  const handleRenomear = async (estabId) => {
    if (!editandoNome.trim()) {
      Swal.fire("Atenção", "Digite um nome válido.", "warning");
      return;
    }
    const result = renomearEstabelecimento(estabId, editandoNome.trim());
    if (result.success) {
      setEditandoId(null);
      carregarDados();
    } else {
      Swal.fire("Erro", result.error, "error");
    }
  };

  const limite = statusAssinatura?.plano?.maxEstabelecimentos || 1;
  const total = estabelecimentos.length;
  const podeAdicionar = total < limite;

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-store text-indigo-600"></i>
            Meus Estabelecimentos
          </h1>
          <p className="text-sm text-gray-500">
            {total} de {limite === Infinity ? "ilimitados" : limite} estabelecimentos usados
          </p>
        </div>
        {podeAdicionar && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Novo Estabelecimento
          </button>
        )}
      </div>

      {/* Barra de progresso do limite */}
      {limite !== Infinity && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Limite do seu plano</span>
            <span className="font-medium">
              {total}/{limite}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                total >= limite ? "bg-red-500" : "bg-indigo-500"
              }`}
              style={{ width: `${(total / limite) * 100}%` }}
            ></div>
          </div>
          {!podeAdicionar && (
            <p className="text-xs text-red-500 mt-2">
              Limite atingido.{" "}
              <button
                onClick={() => navigate("/planos")}
                className="underline font-medium"
              >
                Faça upgrade do plano
              </button>{" "}
              para adicionar mais.
            </p>
          )}
        </div>
      )}

      {/* Lista de estabelecimentos */}
      <div className="grid gap-4">
        {estabelecimentos.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <i className="fas fa-store text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum estabelecimento ainda
            </h3>
            <p className="text-gray-500 mb-4">
              Crie seu primeiro estabelecimento para começar.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Criar Estabelecimento
            </button>
          </div>
        ) : (
          estabelecimentos.map((estab) => {
            const isAtivo = estab.id === estabelecimentoAtivoId;
            return (
              <div
                key={estab.id}
                className={`bg-white rounded-xl border-2 p-5 flex items-center justify-between transition-all ${
                  isAtivo
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isAtivo ? "bg-indigo-200" : "bg-gray-100"
                    }`}
                  >
                    <i
                      className={`fas fa-store text-xl ${
                        isAtivo ? "text-indigo-700" : "text-gray-500"
                      }`}
                    ></i>
                  </div>
                  <div className="flex-1">
                    {editandoId === estab.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editandoNome}
                          onChange={(e) => setEditandoNome(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenomear(estab.id);
                            if (e.key === "Escape") setEditandoId(null);
                          }}
                        />
                        <button
                          onClick={() => handleRenomear(estab.id)}
                          className="px-2 py-1.5 text-green-600 hover:bg-green-50 rounded"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-800">
                          {estab.nome}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {RAMOS_NEGOCIO.find((r) => r.id === estab.ramo)
                            ?.nome || estab.ramo}{" "}
                          • Criado em{" "}
                          {new Date(estab.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAtivo ? (
                    <span className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                      Ativo
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAlternar(estab.id)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                    >
                      Alternar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditandoId(estab.id);
                      setEditandoNome(estab.nome);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Renomear"
                  >
                    <i className="fas fa-pen"></i>
                  </button>
                  {estabelecimentos.length > 1 && (
                    <button
                      onClick={() => handleRemover(estab.id, estab.nome)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Novo Estabelecimento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Novo Estabelecimento
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Filial Centro, Loja 2..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCriar()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ramo de Negócio
                </label>
                <select
                  value={novoRamo}
                  onChange={(e) => setNovoRamo(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {RAMOS_NEGOCIO.map((ramo) => (
                    <option key={ramo.id} value={ramo.id}>
                      {ramo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriar}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}