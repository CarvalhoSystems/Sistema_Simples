import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.jsx"; // Importa o hook de autenticação
import { useNavigate, Link } from "react-router-dom";
import { setTenant } from "../hooks/useTenant"; // Importa a função para definir o tenant ativo
import { carregarTenantFirebase } from "../services/firebaseData.js"; // Importa a nova função
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
      // A função login agora retorna o objeto do usuário se for bem-sucedida
      const user = await login(email, password);

      if (user && user.uid) {
        // Se o login deu certo, limpa as penalidades de erro
        localStorage.removeItem("login_tentativas");
        localStorage.removeItem("login_bloqueado_ate");
        setBloqueadoAte(null);

        // **LÓGICA CORRIGIDA**: Busca os dados mais recentes do tenant no Firebase
        const tenantDataFromFirebase = await carregarTenantFirebase(user.uid);

        if (tenantDataFromFirebase && tenantDataFromFirebase.info) {
          // Salva os dados frescos do Firebase como o tenant ativo
          setTenant(tenantDataFromFirebase.info);
          navigate("/dashboard");
        } else {
          // Se não encontrar dados do tenant, é um erro inesperado.
          setError(
            "Login bem-sucedido, mas não foi possível carregar os dados do seu estabelecimento.",
          );
        }
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 overflow-hidden shadow-inner">
            <img
              src="/logo.png" // Agora é a tag certa para imagem
              alt="Logo do Sistema"
              className="w-full h-full object-contain" // Garante que o logo caiba no círculo
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Acessar Sistema</h1>
          <p className="text-sm text-slate-500 mt-1">Entre com sua conta</p>
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
