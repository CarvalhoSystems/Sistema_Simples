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
  valor,
  descricao,
  planoId,
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/create-preapproval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Envia os dados conforme recebidos do frontend
      body: JSON.stringify({ tenant, valor, descricao, planoId }),
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
  accessToken,
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/process-pos-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        amount,
        description,
        deviceId,
        accessToken,
      }),
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("Resposta não-JSON do servidor:", text);
      return {
        success: false,
        error: "Erro no servidor de pagamento. Tente novamente.",
      };
    }

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

/**
 * Processa um pagamento com cartão considerando o provedor da maquininha.
 *
 * - provedor === 'mercadopago': Envia via API do Mercado Pago para a maquininha Smart/Pro integrar.
 * - provedor === 'manual_pos' || provedor === 'outros': Apenas registra a venda
 *   manualmente (o pagamento foi efetuado externamente na maquininha física),
 *   sem disparar erros de token inválido.
 * - Caso contrário: Lança erro de maquininha não cadastrada.
 */
export async function processarPagamento({ venda, formaPagamento }) {
  const provedor = formaPagamento?.provedor;

  if (provedor === "mercadopago") {
    // Envia via API do Mercado Pago para a maquininha Smart/Pro integrar
    if (!formaPagamento?.token && !formaPagamento?.accessToken) {
      return {
        success: false,
        error:
          "Mercado Pago não configurado. Configure seu Access Token nas Configurações da Loja.",
      };
    }

    if (!formaPagamento?.deviceId) {
      return {
        success: false,
        error:
          "Device ID da maquininha não configurado. Verifique as Configurações da Loja.",
      };
    }

    return processarPagamentoCartaoPDV({
      tenantId: venda?.tenantId,
      amount: venda?.amount,
      description: venda?.description || "Venda PDV",
      deviceId: formaPagamento.deviceId,
      accessToken: formaPagamento.token || formaPagamento.accessToken,
    });
  }

  if (provedor === "manual_pos" || provedor === "outros") {
    // Apenas valida que a venda foi efetuada externamente na maquininha física.
    // Sem disparar erros de token inválido.
    return {
      success: true,
      manual: true,
      provedor,
      message:
        "Pagamento registrado manualmente. A venda foi efetuada na maquininha física.",
    };
  }

  // Cartão/Maquininha não cadastrada ou provedor não suportado
  return {
    success: false,
    error: "Cartão/Maquininha não cadastrada ou provedor não suportado.",
  };
}
