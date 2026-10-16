import React, { useState } from "react";
import { useAuth } from "../components/AuthContext";


export default function AdminConfig() {
  const { changePassword, user } = useAuth();
  const [mostrarSenha, setMostrarSenha] = useState(false);
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

  // Adicione este estado ao seu componente:
  // const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-gray-100 min-h-screen">
      {/* Cabeçalho da Página */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shadow-sm">
              <i className="fas fa-cog text-xl"></i>
            </div>
            Configurações da Conta
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Gerencie suas credenciais de acesso, perfil e segurança do painel
            administrativo
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Sessão Ativa
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de Informações do Admin (Coluna Lateral em Telas Grandes) */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/60">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-gray-950 font-bold flex items-center justify-center text-lg shadow-md">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Perfil do Administrador
                </h2>
                <span className="text-xs text-gray-400">Acesso Total</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800/80">
                <span className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                  <i className="fas fa-envelope text-amber-400/80 text-xs"></i>
                  E-mail de Acesso
                </span>
                <span className="font-medium text-white break-all">
                  {user?.email || "Não identificado"}
                </span>
              </div>

              <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800/80">
                <span className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                  <i className="fas fa-user text-amber-400/80 text-xs"></i>
                  Nome / Identificação
                </span>
                <span className="font-medium text-white">
                  {user?.name || "Administrador"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Alteração de Senha (Coluna Principal) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                <i className="fas fa-shield-alt text-base"></i>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Segurança e Senha
                </h2>
                <p className="text-xs text-gray-400">
                  Atualize sua senha periodicamente para manter a conta segura
                </p>
              </div>
            </div>

            {mensagem && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
                  mensagem.success
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 shadow-lg shadow-emerald-950/20"
                    : "bg-rose-950/40 text-rose-300 border border-rose-800/60 shadow-lg shadow-rose-950/20"
                }`}
              >
                <i
                  className={`fas ${
                    mensagem.success
                      ? "fa-check-circle text-emerald-400"
                      : "fa-exclamation-triangle text-rose-400"
                  } text-base`}
                ></i>
                <span>{mensagem.mensagem || mensagem.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-3 bg-gray-950/70 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <i
                      className={`fas ${mostrarSenha ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-950/70 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="Mínimo de 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-950/70 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-gray-950 font-bold rounded-xl text-sm hover:from-amber-400 hover:to-amber-300 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.98]"
                >
                  {carregando ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-check"></i>
                  )}
                  {carregando ? "Atualizando..." : "Salvar Nova Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
