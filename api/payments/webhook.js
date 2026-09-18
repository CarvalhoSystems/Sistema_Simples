export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const payload = req.body || {};
    console.log("Webhook recebido:", payload);

    return res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Erro no webhook" });
  }
}
