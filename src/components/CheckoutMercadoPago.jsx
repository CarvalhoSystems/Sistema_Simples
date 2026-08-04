import React, { useState } from "react";
import { formatCurrency } from "../utils/formatters";
import { criarPagamentoAssinatura } from "../services/pagamentoService";
import { getTenant } from "../hooks/useTenant";

export default function CheckoutMercadoPago({
  amount,
  planName,
  planoId,
  onPaymentSuccess,
  onCancel,
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const iniciarPagamento = async () => {
    setLoading(true);
    setMessage("");

    try {
      const tenant = getTenant();
      const result = await criarPagamentoAssinatura({
        tenant,
        planoId,
        valor: amount,
        descricao: `Plano ${planName}`,
      });

      if (!result?.success) {
        // Exibe a mensagem de erro específica vinda do backend
        setMessage(
          `Erro: ${result?.error || "Não foi possível iniciar o pagamento."}`,
        );
        setLoading(false);
        return;
      }

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      if (onPaymentSuccess) {
        onPaymentSuccess({
          paymentReference:
            result.paymentReference || `${planoId}_${Date.now()}`,
          amount,
          planoId,
          gateway: result.gateway || "mercado_pago",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage("Erro ao iniciar o pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
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

      <div className="p-6 space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          O pagamento será iniciado por um endpoint seguro do backend. Após a
          confirmação, o sistema atualiza a assinatura automaticamente.
        </div>

        {message && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <button
          onClick={iniciarPagamento}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Iniciando pagamento..." : "Prosseguir para o pagamento"}
        </button>
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
