import { MercadoPagoConfig, Point } from "mercadopago";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../src/services/firebaseClient"; // Importa a instância do DB

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  const { tenantId, amount, description, deviceId } = request.body;

  // 1. Busca o Access Token específico do lojista no Firebase
  let accessToken;
  try {
    const tenantDocRef = doc(db, "tenants", tenantId);
    const tenantDoc = await getDoc(tenantDocRef);
    if (tenantDoc.exists() && tenantDoc.data().info?.mercadoPagoAccessToken) {
      accessToken = tenantDoc.data().info.mercadoPagoAccessToken;
    } else {
      // Fallback para a variável de ambiente principal se o lojista não configurou
      accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    }
  } catch (dbError) {
    console.error("Erro ao buscar token do tenant no Firebase:", dbError);
    return response
      .status(500)
      .json({
        success: false,
        error: "Falha ao carregar configuração do lojista.",
      });
  }

  if (!accessToken) {
    return response
      .status(500)
      .json({
        success: false,
        error: "Access Token do Mercado Pago não configurado.",
      });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const point = new Point(client);

  try {
    const result = await point.paymentIntent.create({
      body: {
        amount,
        description,
        payment: {
          installments: 1, // Pagamento à vista
          type: "credit_card",
        },
        device_id: deviceId,
      },
    });

    // A API Point é assíncrona. O frontend precisará consultar o status.
    // Por enquanto, retornamos sucesso se a intenção foi criada.
    // Em uma implementação futura, você pode usar Webhooks para confirmar.
    return response.status(200).json({
      success: true,
      paymentIntentId: result.id,
    });
  } catch (error) {
    console.error("Erro ao criar intenção de pagamento no Point:", error);
    return response
      .status(500)
      .json({
        success: false,
        error: "Falha ao iniciar pagamento na maquininha.",
      });
  }
}
