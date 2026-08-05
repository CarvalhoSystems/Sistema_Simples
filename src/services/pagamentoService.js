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
  tenantId,
  emailUsuario,
  planoNome,
  valorMensal,
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/create-preapproval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Corrigido para enviar os dados corretos para a API de assinatura
      body: JSON.stringify({ tenantId, emailUsuario, planoNome, valorMensal }),
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("Resposta não-JSON do servidor:", text);
      return {
        success: false,
        error: "Erro no servidor. Tente novamente.",
      };
    }
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
