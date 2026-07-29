import React from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { formatCurrency } from "../utils/formatters";

// Inicializa a SDK com a sua chave pública (fora do componente para carregar uma única vez)
initMercadoPago("TEST-fb1430d0-9a04-4264-ac9f-38329a5f2b20", {
  locale: "pt-BR",
});

export default function CheckoutMercadoPago({
  amount,
  planName,
  onPaymentSuccess,
  onCancel,
}) {
  const initialization = {
    amount: amount, // Valor total do produto/carrinho
  };

  const customization = {
    paymentMethods: {
      creditCard: "all",
      bankTransfer: ["pix"], // Apenas Pix
      ticket: "all", // Inclui todos os boletos disponíveis
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    // Callback executado quando o usuário clica em pagar
    return new Promise((resolve, reject) => {
      // Em um cenário de produção, você enviaria o formData para seu backend
      // para processar o pagamento de forma segura.
      // Para este exemplo, vamos simular o sucesso e chamar o callback.
      console.log("Dados do pagamento a serem enviados para o backend:", {
        selectedPaymentMethod,
        ...formData,
      });

      // Chama a função de sucesso passada pelo componente pai
      if (onPaymentSuccess) {
        onPaymentSuccess({ selectedPaymentMethod, ...formData });
      }

      // Resolve a promessa para o SDK do Mercado Pago
      resolve(); // Use reject(error) em caso de falha no backend
    });
  };

  const onError = async (error) => {
    // Tratamento de erros de carregamento do componente
    console.error("Erro no Payment Brick:", error);
    alert("Ocorreu um erro ao carregar as opções de pagamento.");
  };

  const onReady = () => {
    // O formulário terminou de carregar na tela
    console.log("✅ Payment Brick está pronto!");
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl mx-auto my-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Finalizar Pagamento
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Você está contratando o plano{" "}
          <span className="font-semibold text-blue-600">{planName}</span> no
          valor de{" "}
          <span className="font-semibold text-blue-600">
            {formatCurrency(amount)}
          </span>
          .
        </p>
      </div>

      <div className="p-6">
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onReady={onReady}
          onError={onError}
        />
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar e Voltar
        </button>
      </div>
    </div>
  );
}
