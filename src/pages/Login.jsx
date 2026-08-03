import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import {
  setTenant,
  getTenant,
  clearTenant,
  getTenantByEmail,
  setTenantByEmail,
} from "../hooks/useTenant";
import { validateLoginInput } from "../utils/operacoesSeguras";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Estados de controle de tentativas e bloqueio (Brute Force)
  const [bloqueadoAte, setBloqueadoAte] = useState(null);
  const [tempoRestante, setTempoRestante] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Verifica se já existe um bloqueio ativo no localStorage ao carregar a página
  useEffect(() => {
    const bloqueioSalvo = localStorage.getItem("login_bloqueado_ate");
    if (bloqueioSalvo) {
      const tempoRestanteMs = parseInt(bloqueioSalvo, 10) - Date.now();
      if (tempoRestanteMs > 0) {
        setBloqueadoAte(parseInt(bloqueioSalvo, 10));
        setTempoRestante(Math.ceil(tempoRestanteMs / 1000));
      } else {
        localStorage.removeItem("login_bloqueado_ate");
        localStorage.removeItem("login_tentativas");
      }
    }
  }, []);

  // Timer decrescente para atualizar o bloqueio na tela
  useEffect(() => {
    if (!bloqueadoAte) return;

    const intervalo = setInterval(() => {
      const restanteMs = bloqueadoAte - Date.now();
      if (restanteMs <= 0) {
        setBloqueadoAte(null);
        setTempoRestante(0);
        localStorage.removeItem("login_bloqueado_ate");
        localStorage.removeItem("login_tentativas");
        clearInterval(intervalo);
      } else {
        setTempoRestante(Math.ceil(restanteMs / 1000));
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [bloqueadoAte]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (bloqueadoAte && Date.now() < bloqueadoAte) {
      return;
    }

    const loginValidation = validateLoginInput(email, password);
    if (!loginValidation.valid) {
      setError(
        loginValidation.reason === "empty_fields"
          ? "Informe e-mail e senha para continuar."
          : "Informe um e-mail válido.",
      );
      return;
    }

    setCarregando(true);

    try {
      // Chama a função de login do seu AuthContext (que valida no Firebase)
      const success = await login(email, password);

      if (success) {
        // Se o login deu certo, limpa as penalidades de erro
        localStorage.removeItem("login_tentativas");
        localStorage.removeItem("login_bloqueado_ate");
        setBloqueadoAte(null);

        clearTenant();

        const tenantPorEmail = getTenantByEmail(email);

        if (tenantPorEmail) {
          setTenant(tenantPorEmail);
        } else {
          const tenantExistente = getTenant();

          if (tenantExistente && tenantExistente.email === email) {
            setTenantByEmail(email, tenantExistente);
          } else {
            const novoTenant = {
              id: `demo_${Date.now()}`,
              uid: `demo_user`,
              nome: email || "Usuário",
              nomeEstabelecimento: "Meu Estabelecimento",
              email: email,
              ramo: "mercado",
              criadoEm: new Date().toISOString(),
            };

            setTenantByEmail(email, novoTenant);
          }
        }

        navigate("/dashboard");
      } else {
        // Se o login falhou, incrementa as tentativas
        const tentativasAtuais =
          parseInt(localStorage.getItem("login_tentativas") || "0", 10) + 1;
        localStorage.setItem("login_tentativas", tentativasAtuais);

        if (tentativasAtuais >= 5) {
          const tempoBloqueio = Date.now() + 60 * 1000; // Bloqueia por 1 minuto
          localStorage.setItem("login_bloqueado_ate", tempoBloqueio);
          setBloqueadoAte(tempoBloqueio);
          setTempoRestante(60);
          setError("Muitas tentativas falhas. Acesso bloqueado por 1 minuto.");
        } else {
          setError(
            `E-mail ou senha incorretos. Tentativa ${tentativasAtuais} de 5.`,
          );
        }
      }
    } catch (err) {
      setError("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setCarregando(false);
    }
  };

  const estaBloqueado = bloqueadoAte && Date.now() < bloqueadoAte;

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
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
            Entre com sua conta do Firebase
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
              disabled={estaBloqueado}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
              disabled={estaBloqueado}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Sua senha"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {error} {estaBloqueado && `(${tempoRestante}s)`}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando || estaBloqueado}
            className="w-full px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {carregando ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Entrando...
              </>
            ) : estaBloqueado ? (
              <>
                <i className="fas fa-lock"></i>
                Bloqueado ({tempoRestante}s)
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
