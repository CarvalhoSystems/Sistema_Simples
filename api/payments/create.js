import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const {
      gateway = "mercado_pago",
      planoId,
      valor,
      descricao,
      tenantId,
    } = req.body || {};
    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

    if (gateway !== "mercado_pago") {
      return res.status(200).json({
        success: true,
        gateway,
        paymentUrl: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173"}/planos?status=approved&planoId=${encodeURIComponent(planoId || "")}&amount=${encodeURIComponent(valor || 0)}`,
        message: "Pagamento iniciado via gateway configurado.",
      });
    }

    if (!accessToken) {
      return res.status(200).json({
        success: true,
        gateway: "mercado_pago",
        demoMode: true,
        paymentUrl: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173"}/planos?status=approved&planoId=${encodeURIComponent(planoId || "")}&amount=${encodeURIComponent(valor || 0)}`,
        message:
          "Configure MERCADOPAGO_ACCESS_TOKEN para habilitar pagamentos reais.",
      });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const preferenceResponse = await preference.create({
      body: {
        items: [
          {
            title: descricao || `Plano ${planoId || "assinatura"}`,
            quantity: 1,
            unit_price: Number(valor || 0),
            currency_id: "BRL",
          },
        ],
        payment_methods: {
          excluded_payment_types: [{ id: "atm" }],
          installments: 12,
        },
        back_urls: {
          success: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173"}/planos?status=approved&planoId=${encodeURIComponent(planoId || "")}&amount=${encodeURIComponent(valor || 0)}`,
          failure: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173"}/planos?status=failure`,
          pending: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173"}/planos?status=pending`,
        },
        auto_return: "approved",
        metadata: {
          tenantId: tenantId || "",
          planoId: planoId || "",
        },
      },
    });

    const initPoint =
      preferenceResponse?.init_point ||
      preferenceResponse?.sandbox_init_point ||
      null;

    return res.status(200).json({
      success: true,
      gateway: "mercado_pago",
      initPoint,
      paymentReference: preferenceResponse?.id || null,
      paymentUrl:
        initPoint ||
        `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173"}/planos?status=approved&planoId=${encodeURIComponent(planoId || "")}&amount=${encodeURIComponent(valor || 0)}`,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Erro ao criar pagamento.",
      });
  }
}
