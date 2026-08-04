import { MercadoPagoConfig, Preference } from "mercadopago";

// Esta função é o seu "backend" que roda na Vercel
export default async function handler(request, response) {
  // Impede que a função seja chamada por outros métodos que não sejam POST
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  // Pega os dados enviados pelo seu frontend (CheckoutMercadoPago.jsx)
  const { tenantId, planoId, valor, descricao } = request.body;

  // **IMPORTANTE**: Em um sistema real, você buscaria o Access Token do lojista
  // no seu banco de dados (Firebase) usando o tenantId.
  // Por enquanto, vamos usar a variável de ambiente principal.
  const accessToken =
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env.VITE_MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return response
      .status(500)
      .json({
        success: false,
        error: "Access Token do Mercado Pago não configurado no servidor.",
      });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: planoId,
            title: descricao,
            quantity: 1,
            unit_price: Number(valor),
          },
        ],
        // Libera explicitamente os métodos e tipos de pagamento
        payment_methods: {
          installments: 6,
        },
        // Dados genéricos iniciais do pagador para destravar o Pix no Checkout Pro
        payer: {
          name: "Cliente",
          surname: "Sistema",
          email: "cliente@atendimento.com",
        },
        back_urls: {
          success: `${request.headers.origin}/planos?status=success`,
          failure: `${request.headers.origin}/planos?status=failure`,
          pending: `${request.headers.origin}/planos?status=pending`,
        },
        auto_return: "approved",
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
      { tenantId, planoId, valor, descricao },
    );
    return response.status(500).json({
      success: false,
      error: "Falha ao comunicar com o Mercado Pago.",
    });
  }
}
