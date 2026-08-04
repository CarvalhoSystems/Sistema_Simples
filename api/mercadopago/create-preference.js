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
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

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
            unit_price: valor,
          },
        ],
        // URLs para onde o cliente é redirecionado após o pagamento
        back_urls: {
          success: `${request.headers.origin}/planos?status=success`,
          failure: `${request.headers.origin}/planos?status=failure`,
          pending: `${request.headers.origin}/planos?status=pending`,
        },
        auto_return: "approved", // Retorna automaticamente para a URL de sucesso
        external_reference: tenantId, // Salva o ID do seu cliente na transação
      },
    });

    // Retorna a URL de pagamento para o frontend
    return response
      .status(200)
      .json({ success: true, paymentUrl: result.init_point });
  } catch (error) {
    console.error("Erro ao criar preferência no Mercado Pago:", error);
    return response
      .status(500)
      .json({
        success: false,
        error: "Falha ao comunicar com o Mercado Pago.",
      });
  }
}
