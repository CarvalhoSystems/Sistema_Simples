import React, { useState } from "react";
import { useAuth } from "../components/AuthContext";

export default function AdminConfig() {
  const { changePassword, user } = useAuth();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem(null);

    if (novaSenha !== confirmarSenha) {
      setMensagem({ success: false, error: "As novas senhas não coincidem." });
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem({
        success: false,
        error: "A nova senha precisa ter no mínimo 6 caracteres.",
      });
      return;
    }

    setCarregando(true);
    const resultado = await changePassword(senhaAtual, novaSenha);
    setMensagem(resultado);

    if (resultado.success) {
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    }
    setCarregando(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-100">
      {/* Cabeçalho da Página */}
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <i className="fas fa-cog text-amber-400"></i>
          Configurações da Conta
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gerencie as credenciais e segurança do painel administrativo
        </p>
      </div>

      {/* Card de Informações do Admin */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-6 shadow-md">
        <h2 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <i className="fas fa-user-shield text-amber-400"></i>
          Dados do Administrador
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="block text-xs text-gray-400">
              E-mail de Acesso
            </span>
            <span className="font-medium text-white">
              {user?.email || "Não identificado"}
            </span>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="block text-xs text-gray-400">Nome / Perfil</span>
            <span className="font-medium text-white">
              {user?.name || "Administrador"}
            </span>
          </div>
        </div>
      </div>

      {/* Card de Alteração de Senha */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-md">
        <h2 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <i className="fas fa-lock text-amber-400"></i>
          Segurança - Alterar Senha
        </h2>

        {mensagem && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
              mensagem.success
                ? "bg-green-900/30 text-green-400 border border-green-800"
                : "bg-red-900/30 text-red-400 border border-red-800"
            }`}
          >
            <i
              className={`fas ${mensagem.success ? "fa-check-circle" : "fa-exclamation-circle"}`}
            ></i>
            {mensagem.mensagem || mensagem.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Senha Atual
            </label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Digite sua senha atual"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Nova Senha
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Repita a nova senha"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={carregando}
              className="px-6 py-3 bg-amber-500 text-gray-950 font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {carregando ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-save"></i>
              )}
              Atualizar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
