import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { verificarStatusAssinatura, PLANOS } from "../services/planoManager";

const PLANOS_ORDEM = ["free", "basico", "profissional", "premium"];

export default function PlanBlock({ feature, children, mensagem }) {
  const navigate = useNavigate();
  const { isAuthenticated, carregando: authCarregando } = useAuth();
  const [status, setStatus] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (authCarregando) {
      return; // Aguarda a autenticação ser resolvida
    }
    if (!isAuthenticated) {
      setCarregando(false);
      return;
    }
    const checkStatus = async () => {
      // O `true` força a busca dos dados mais recentes do Firebase
      setStatus(await verificarStatusAssinatura(true));
      setCarregando(false);
    };
    checkStatus();
  }, [isAuthenticated, authCarregando]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-gray-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-6">
            Faça login para acessar esta funcionalidade.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
          <p className="text-gray-500 mt-2">Verificando sua assinatura...</p>
        </div>
      </div>
    );
  }

  if (!status) return null; // Não deve acontecer, mas é uma guarda de segurança

  const planoAtual = status.plano;

  // Se o plano atual já tem a feature, renderiza os filhos
  if (planoAtual.features[feature]) {
    return <>{children}</>;
  }

  // Descobre qual plano tem essa feature
  const planoNecessario = Object.entries(PLANOS).find(
    ([, p]) => p.features[feature],
  );
  const nomePlano = planoNecessario ? planoNecessario[1].nome : "Premium";
  const precoPlano = planoNecessario ? planoNecessario[1].preco : "99,90";

  // Features que o plano atual tem
  const featuresAtuais = Object.entries(planoAtual.features)
    .filter(([, v]) => v === true)
    .map(([key]) => {
      const nomes = {
        pdv: "PDV Completo",
        dashboard: "Dashboard",
        relatorios: "Relatórios",
        nfp: "Nota Fiscal Paulista",
        backup: "Backup Automático",
        api: "API Integração",
        multiplosEstabelecimentos: "Múltiplos Estabelecimentos",
      };
      return nomes[key] || key;
    });

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-crown text-yellow-500 text-4xl"></i>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {mensagem || "Funcionalidade Bloqueada"}
        </h2>

        <p className="text-gray-500 mb-6">
          Esta funcionalidade está disponível apenas no plano{" "}
          <strong className="text-yellow-600">{nomePlano}</strong>. Seu plano
          atual é <strong>{planoAtual.nome}</strong>.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500"></i>
            Seu plano ({planoAtual.nome}) inclui:
          </h3>
          <ul className="space-y-2">
            {featuresAtuais.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <i className="fas fa-check text-green-500 text-xs"></i>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            <i className="fas fa-crown mr-2"></i>
            Plano {nomePlano}
          </h3>
          <p className="text-3xl font-bold text-yellow-600 mb-1">
            R$ {precoPlano}
            <span className="text-sm font-normal text-gray-500">/mês</span>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Desbloqueie todas as funcionalidades
          </p>
          <button
            onClick={() => navigate("/planos")}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-semibold shadow-lg"
          >
            <i className="fas fa-arrow-up mr-2"></i>
            Fazer Upgrade Agora
          </button>
        </div>
      </div>
    </div>
  );
}
