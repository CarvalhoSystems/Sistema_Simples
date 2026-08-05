import { MercadoPagoConfig, PreApproval } from "mercadopago";

// Esta função é o seu "backend" que roda na Vercel
export default async function handler(request, response) {
  // Impede que a função seja chamada por outros métodos que não sejam POST
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  // Pega os dados enviados pelo seu frontend (CheckoutMercadoPago.jsx)
  const { tenantId, emailUsuario, planoNome, valorMensal } = request.body;

  // **IMPORTANTE**: Em um sistema real, você buscaria o Access Token do lojista
  // no seu banco de dados (Firebase) usando o tenantId.
  // Por enquanto, vamos usar a variável de ambiente principal.
  const accessToken =
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env.VITE_MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return response.status(500).json({
      success: false,
      error: "Access Token do Mercado Pago não configurado no servidor.",
    });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const preApproval = new PreApproval(client);

  try {
    const result = await preApproval.create({
      body: {
        reason: planoNome || "Plano de Assinatura",
        auto_recurring: {
          transaction_amount: Number(valorMensal),
          frequency: 1,
          frequency_type: "months",
          billing_day: 5,
        },
        payer_email: emailUsuario || "cliente@atendimento.com",
        back_url: `${request.headers.origin}/planos`,
        external_reference: tenantId,
      },
    });

    // Retorna a URL de pagamento para o frontend
    return response.status(200).json({
      success: true,
      paymentUrl: result.init_point,
      preferenceId: result.id,
    });
  } catch (error) {
    console.error(
      "Erro ao criar preferência no Mercado Pago:",
      error.message,
      error.cause,
      { tenantId, planoNome, valorMensal, emailUsuario },
    );
    return response.status(500).json({
      success: false,
      error: "Falha ao comunicar com o Mercado Pago.",
    });
  }
}
