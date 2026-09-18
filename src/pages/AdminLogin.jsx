import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

// Email do admin vem do .env - NÃO exposto no código fonte!
const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "carvalho_borges@icloud.com";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCarregando(true);

    try {
      // Verifica se é o email do admin
      if (email !== ADMIN_EMAIL) {
        setError("Acesso restrito. Este login é apenas para administradores.");
        setCarregando(false);
        return;
      }

      const success = await login(email, password);

      if (success) {
        navigate("/admin");
      } else {
        setError("Credenciais inválidas.");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Admin */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
            <i className="fas fa-crown text-gray-900 text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Painel Administrativo
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Acesso exclusivo para administradores
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Administrativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                placeholder="admin@sistema.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full px-4 py-3 font-semibold text-gray-900 bg-yellow-500 rounded-lg hover:bg-yellow-400 shadow-lg shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Entrando...
                </>
              ) : (
                <>
                  <i className="fas fa-crown"></i>
                  Acessar Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-400">
              <p className="font-medium text-gray-300 mb-2 flex items-center gap-1">
                <i className="fas fa-shield-alt text-yellow-500"></i>
                Área restrita
              </p>
              <p>
                Apenas administradores autorizados podem acessar este painel. Se
                você não é um administrador, utilize o{" "}
                <a href="/login" className="text-yellow-500 hover:underline">
                  login do sistema
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <i className="fas fa-arrow-left mr-1"></i>
            Voltar para o sistema
          </a>
        </div>
      </div>
    </div>
  );
}
