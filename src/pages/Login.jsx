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
      const success = await login(email, password);

      if (success) {
        const tenantExistente = getTenant();

        if (!tenantExistente) {
          // Cria tenant padrão para login demo
          const novoTenant = {
            id: `demo_${Date.now()}`,
            uid: `demo_user`,
            nome: email || "Usuário Demo",
            nomeEstabelecimento: "Meu Estabelecimento",
            email: email,
            ramo: "mercado",
            ramoInfo: RAMOS_NEGOCIO.find((r) => r.id === "mercado"),
            criadoEm: new Date().toISOString(),
          };
          setTenant(novoTenant);

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
      <button
        type="button"
        onClick={() => navigate("/")}
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
        Voltar
      </button>

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <i className="fas fa-user-circle text-3xl text-blue-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Acessar Sistema</h1>
          <p className="text-sm text-slate-500 mt-1">
            Entre com seu email e senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              placeholder="seu@email.com"
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-medium mb-1">
              <i className="fas fa-info-circle mr-1"></i>
              Modo demonstração:
            </p>
            <p>
              Use qualquer email com senha <strong>1234</strong> ou cadastre-se
              abaixo.
            </p>
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
            Cadastre-se grátis
          </Link>
        </p>
        <p className="text-sm text-center text-slate-500">
          <Link
            to="/forgot-password"
            className="font-medium text-blue-600 hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </p>
      </div>
    </div>
  );
}