import React, { useState } from "react";
import { useAuth } from "../components/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { setTenant, getTenant } from "../hooks/useTenant";
import {
  RAMOS_NEGOCIO,
  PRODUTOS_PADRAO,
  CATEGORIAS_PADRAO,
} from "../services/supabaseClient";

export default function Login() {
  const [username, setUsername] = useState("");
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
      // Simula validação de login
      await new Promise((resolve) => setTimeout(resolve, 500));

      const success = login(username, password);
      if (success) {
        // Verifica se já existe um tenant para este usuário
        const tenantExistente = getTenant();

        if (!tenantExistente) {
          // Se não existe, cria um tenant genérico para demonstração
          const novoTenant = {
            id: `demo_${Date.now()}`,
            uid: `demo_user`,
            nome: username || "Usuário Demo",
            nomeEstabelecimento: "Meu Estabelecimento",
            email: username,
            ramo: "mercado",
            ramoInfo: RAMOS_NEGOCIO.find((r) => r.id === "mercado"),
            criadoEm: new Date().toISOString(),
          };
          setTenant(novoTenant);

          // Inicializa produtos padrão se não existirem
          if (!localStorage.getItem(`pdv_produtos_${novoTenant.id}`)) {
            localStorage.setItem(
              `pdv_produtos_${novoTenant.id}`,
              JSON.stringify(PRODUTOS_PADRAO.mercado),
            );
            localStorage.setItem(
              `pdv_categorias_${novoTenant.id}`,
              JSON.stringify(CATEGORIAS_PADRAO.mercado),
            );
            localStorage.setItem(
              `pdv_vendas_${novoTenant.id}`,
              JSON.stringify([]),
            );
          }
        }

        navigate("/dashboard");
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Botão Voltar */}
      <button
        type="button"
        onClick={() => navigate("/caixa")}
        className="absolute top-6 right-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Voltar ao Caixa
      </button>

      {/* Card de Login */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <i className="fas fa-user-circle text-3xl text-blue-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Acesso Gerencial
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Entre com suas credenciais
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Usuário / E-mail
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              placeholder="Seu usuário ou email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              placeholder="Sua senha"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {carregando ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Entrando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Entrar
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-center text-slate-500">
          Não tem uma conta?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}