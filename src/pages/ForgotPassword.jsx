import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firebaseDisponivel, auth } from "../services/firebaseClient";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);

    if (!firebaseDisponivel || !auth) {
      setErro(
        "Firebase não está configurado. Para usar a recuperação de senha, configure as variáveis de ambiente do Firebase no arquivo .env",
      );
      setCarregando(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem(
        `Um link de redefinição de senha foi enviado para ${email}. Verifique sua caixa de entrada e spam.`,
      );
      setEnviado(true);
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error.code);

      switch (error.code) {
        case "auth/user-not-found":
          setErro("Nenhuma conta encontrada com este email.");
          break;
        case "auth/invalid-email":
          setErro("Email inválido. Digite um email válido.");
          break;
        case "auth/too-many-requests":
          setErro(
            "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
          );
          break;
        default:
          setErro(
            "Erro ao enviar email de recuperação. Tente novamente mais tarde.",
          );
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <button
        type="button"
        onClick={() => navigate("/login")}
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Recuperar Senha</h1>
          <p className="text-sm text-slate-500 mt-1">
            {enviado
              ? "Verifique seu email"
              : "Digite seu email para receber um link de redefinição"}
          </p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                E-mail cadastrado
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

            {erro && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Enviar Link
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
              <p className="font-medium mb-1 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Email enviado com sucesso!
              </p>
              <p className="mt-2">{mensagem}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-medium mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 inline mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Não recebeu o email?
              </p>
              <p>Verifique sua caixa de spam ou lixo eletrônico.</p>
              <p>
                O link expira em 1 hora. Se necessário,{" "}
                <button
                  onClick={() => {
                    setEnviado(false);
                    setMensagem("");
                  }}
                  className="text-blue-800 underline font-medium"
                >
                  tente novamente
                </button>
                .
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
            >
              Voltar para o Login
            </button>
          </div>
        )}

        <p className="text-sm text-center text-slate-500">
          Lembrou da senha?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
