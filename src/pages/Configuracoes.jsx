import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getDadosTenant,
  PLANOS,
  verificarStatusAssinatura,
  registrarPagamento,
} from "../services/planoManager";
import CheckoutMercadoPago from "../components/CheckoutMercadoPago";

const statusInfo = {
  trial: {
    icon: "fa-hourglass-half",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  ativa: {
    icon: "fa-check-circle",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  vencida: {
    icon: "fa-exclamation-triangle",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  trial_expirado: {
    icon: "fa-hourglass-end",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  cancelada: {
    icon: "fa-times-circle",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
  },
};

export default function Configuracoes() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null); // Novo estado para controlar o checkout

  useEffect(() => {
    const carregarDados = async () => {
      setDados(await getDadosTenant());
    };
    // Este efeito agora depende de `checkoutData`.
    // Ele só vai carregar os dados se não estivermos no meio de um checkout.
    if (!checkoutData) carregarDados();
  }, [checkoutData]);

  const handleSelectPlan = async (planoId) => {
    const planoSelecionado = PLANOS[planoId];
    if (!planoSelecionado) return;

    // Define os dados para o checkout, o que fará o componente de pagamento ser renderizado
    setCheckoutData({
      amount: planoSelecionado.preco,
      planName: planoSelecionado.nome,
      planoId: planoSelecionado.id,
    });
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log(
      "Pagamento recebido com sucesso no componente pai:",
      paymentData,
    );
    const { planoId, amount } = checkoutData;

    // Registra o pagamento e atualiza a assinatura no sistema
    await registrarPagamento(planoId, amount);

    Swal.fire(
      "Pagamento Confirmado!",
      `Seu plano foi atualizado para ${checkoutData.planName}.`,
      "success",
    ).then(() => {
      // Força a verificação do status para limpar caches antigos antes de navegar
      verificarStatusAssinatura(true);
      setCheckoutData(null); // Limpa os dados de checkout
      navigate("/dashboard"); // Redireciona para o dashboard
    });
  };

  // Se checkoutData tiver valor, renderiza o componente de pagamento
  if (checkoutData) {
    return (
      <main className="flex-1 p-6 bg-gray-50">
        <CheckoutMercadoPago
          {...checkoutData}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setCheckoutData(null)}
        />
      </main>
    );
  }

  if (!dados) {
    return <div>Carregando...</div>;
  }

  const { status, plano } = dados;
  const info = statusInfo[status.status] || statusInfo.cancelada;

  const planosDisponiveis = Object.values(PLANOS).filter(
    (p) => p.id !== "free",
  );

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Planos e Assinatura
      </h1>

      {/* Status Atual */}
      <div
        className={`p-6 rounded-lg border-2 ${info.borderColor} ${info.bgColor} mb-8`}
      >
        <div className="flex items-center gap-4">
          <i className={`fas ${info.icon} text-3xl ${info.color}`}></i>
          <div>
            <p className="text-sm text-gray-500">Seu plano atual</p>
            <h2 className="text-2xl font-bold text-gray-800">{plano.nome}</h2>
            <p className={`font-semibold ${info.color}`}>{status.mensagem}</p>
          </div>
        </div>
      </div>

      {/* Planos para Upgrade */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700">
          Escolha um plano para contratar ou fazer upgrade
        </h3>
        <p className="text-gray-500">
          Desbloqueie mais funcionalidades e cresça seu negócio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planosDisponiveis.map((p) => {
          const isCurrentPlan = p.id === plano.id;
          return (
            <div
              key={p.id}
              className={`rounded-xl border-2 p-6 flex flex-col ${
                isCurrentPlan
                  ? "border-indigo-500 bg-indigo-50"
                  : "bg-white hover:border-indigo-300"
              }`}
            >
              <h4 className="text-lg font-bold text-indigo-700">{p.nome}</h4>
              <p className="text-3xl font-extrabold text-gray-800 my-3">
                R$ {p.preco.toFixed(2)}
                <span className="text-sm font-normal text-gray-500">/mês</span>
              </p>

              <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
                {Object.entries(p.features)
                  .filter(([, enabled]) => enabled)
                  .map(([featureKey]) => {
                    const featureNames = {
                      pdv: "PDV Completo",
                      dashboard: "Dashboard",
                      relatorios: "Relatórios Avançados",
                      nfp: "Nota Fiscal Paulista",
                      backup: "Backup na Nuvem",
                      api: "Acesso à API",
                      multiplosEstabelecimentos: "Múltiplos Estabelecimentos",
                    };
                    return (
                      <li key={featureKey} className="flex items-start gap-2">
                        <i className="fas fa-check-circle text-indigo-500 mt-1"></i>
                        <span>{featureNames[featureKey] || featureKey}</span>
                      </li>
                    );
                  })}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full mt-auto px-4 py-2.5 font-semibold text-white bg-indigo-400 rounded-lg cursor-not-allowed"
                >
                  Plano Atual
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPlan(p.id)}
                  className="w-full mt-auto px-4 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                >
                  {plano.preco > p.preco ? "Fazer Downgrade" : "Fazer Upgrade"}
                </button> // O texto do botão será "Fazer Upgrade" ou "Fazer Downgrade"
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}