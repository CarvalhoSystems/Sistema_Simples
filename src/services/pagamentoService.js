// src/services/pagamentoService.js

/**
 * Serviço para interagir com o backend para processamento de pagamentos do Mercado Pago.
 * Em um ambiente real, estas funções fariam requisições HTTP para um servidor backend
 * que, por sua vez, se comunicaria com a API do Mercado Pago.
 */

// Com as Serverless Functions da Vercel, não precisamos de um backend URL.
// Usamos caminhos relativos que a Vercel irá rotear para as funções na pasta /api.
const API_BASE_URL = "/api/mercadopago";

export async function criarPagamentoAssinatura({
  tenant,
  planoId,
  valor,
  descricao,
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/create-preference`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenantId: tenant.id, planoId, valor, descricao }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar pagamento de assinatura:", error);
    return {
      success: false,
      error: "Erro de comunicação com o servidor de pagamentos.",
    };
  }
}

export async function processarPagamentoCartaoPDV({
  tenantId,
  amount,
  description,
  deviceId,
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/process-pos-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, amount, description, deviceId }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao processar pagamento de cartão no PDV:", error);
    return {
      success: false,
      error: "Erro de comunicação com o servidor de pagamentos.",
    };
  }
}
