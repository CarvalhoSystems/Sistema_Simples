// Esta função é o seu "backend" que roda na Vercel
export default async function handler(request, response) {
  // Impede que a função seja chamada por outros métodos que não sejam POST
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Parse do body da requisição
    let body;
    try {
      body = await new Promise((resolve, reject) => {
        let data = "";
        request.on("data", (chunk) => {
          data += chunk;
        });
        request.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Invalid JSON"));
          }
        });
        request.on("error", reject);
      });
    } catch (parseError) {
      console.error("Erro ao parsear body:", parseError);
      return response.status(400).json({
        success: false,
        error: "Formato de dados inválido.",
      });
    }

    // Pega os dados enviados pelo seu frontend (CheckoutMercadoPago.jsx)
    const { tenantId, emailUsuario, planoNome, valorMensal } = body;

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

    const mpBody = {
      items: [
        {
          id: planoNome || "plano",
          title: planoNome || "Plano de Assinatura",
          quantity: 1,
          unit_price: Number(valorMensal),
        },
      ],
      payment_methods: {
        installments: 6,
      },
      payer: {
        email: emailUsuario || "cliente@atendimento.com",
      },
      back_urls: {
        success: `${request.headers.origin}/planos?status=success`,
        failure: `${request.headers.origin}/planos?status=failure`,
        pending: `${request.headers.origin}/planos?status=pending`,
      },
      auto_return: "approved",
      external_reference: tenantId,
    };

    console.log("Criando preference com body:", JSON.stringify(mpBody));

    // Usar fetch direto para evitar problemas com o SDK
    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(mpBody),
      },
    );

    const result = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Erro do MercadoPago:", result);
      return response.status(mpResponse.status).json({
        success: false,
        error: result.message || "Falha ao criar preferência no Mercado Pago.",
      });
    }

    // Retorna a URL de pagamento para o frontend
    return response.status(200).json({
      success: true,
      paymentUrl: result.init_point,
      preferenceId: result.id,
    });
  } catch (error) {
    console.error("Erro completo:", error);
    const errorMessage =
      error.message || "Falha ao comunicar com o Mercado Pago.";
    return response.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
