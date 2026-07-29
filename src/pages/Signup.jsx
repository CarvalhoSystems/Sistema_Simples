import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { RAMOS_NEGOCIO } from "../services/supabaseClient";
import { getInitialDataForRamo } from "../hooks/useTenant";
import { inicializarDadosTenant } from "../services/firebaseData";
import { criarAssinatura } from "../services/planoManager";
import {
  criarEstabelecimento,
  alternarEstabelecimento,
} from "../services/estabelecimentoManager";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!businessType) {
      setError("Selecione um ramo de negócio.");
      return;
    }

    setCarregando(true);

    try {
      const result = await signup(
        email,
        password,
        fullName,
        nomeEstabelecimento ||
          RAMOS_NEGOCIO.find((r) => r.id === businessType)?.nome,
        businessType,
      );

      if (result.success) {
        // Após criar o usuário, inicializa seus dados no Firebase
        const tenantId = result.user.uid;
        const tenantInfo = {
          nome: fullName,
          nomeEstabelecimento:
            nomeEstabelecimento ||
            RAMOS_NEGOCIO.find((r) => r.id === businessType)?.nome,
          email: email,
          ramo: businessType,
          criadoEm: new Date().toISOString(),
        };
        await inicializarDadosTenant(tenantId, businessType, tenantInfo);

        // Inicializa a assinatura com trial grátis de 7 dias
        criarAssinatura("free", true);

        // Cria o primeiro estabelecimento automaticamente
        const nomeEstab =
          nomeEstabelecimento ||
          RAMOS_NEGOCIO.find((r) => r.id === businessType)?.nome;
        const resultEstab = criarEstabelecimento(nomeEstab, businessType);
        if (resultEstab.success) {
          alternarEstabelecimento(resultEstab.estabelecimento.id);
        }

        alert(
          `✅ Conta criada com sucesso!\n\nBem-vindo, ${fullName}!\nSeus produtos já foram carregados automaticamente.`,
        );
        navigate("/dashboard");
      } else {
        setError(result.error || "Erro ao criar conta.");
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
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

      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <i className="fas fa-store text-2xl text-blue-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Criar Nova Conta
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Escolha seu ramo e comece a vender!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nome do Estabelecimento
            </label>
            <input
              type="text"
              value={nomeEstabelecimento}
              onChange={(e) => setNomeEstabelecimento(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              placeholder="Ex: Padaria do João, Pet Shop Amigo"
            />
          </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Selecione o Ramo do seu Negócio
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
              {RAMOS_NEGOCIO.map((ramo) => (
                <button
                  key={ramo.id}
                  type="button"
                  onClick={() => setBusinessType(ramo.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    businessType === ramo.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <i
                    className={`fas ${ramo.icone} text-2xl mb-1`}
                    style={{ color: ramo.cor }}
                  ></i>
                  <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                    {ramo.nome}
                  </span>
                </button>
              ))}
            </div>
            {businessType && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <i className="fas fa-check-circle"></i>
                {RAMOS_NEGOCIO.find((r) => r.id === businessType)?.descricao}
              </p>
            )}
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
              placeholder="Mínimo 6 caracteres"
              minLength={6}
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
                Criando conta...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Criar Conta
              </>
            )}
          </button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">
            <i className="fas fa-info-circle mr-1"></i>
            Ao criar sua conta:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Seus produtos serão carregados automaticamente</li>
            <li>Você pode editar, adicionar ou remover produtos depois</li>
            <li>Seus dados ficam salvos na nuvem (Firebase)</li>
          </ul>
        </div>

        <p className="text-sm text-center text-slate-500">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Faça o login
          </Link>
        </p>
      </div>
    </div>
  );
}