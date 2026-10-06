import {
  authenticateRequest,
  authorizeTenant,
  respondWithError,
} from "../../server/fiscalShared.js";

const REGIMES_TRIBUTARIOS = new Set(["1", "2", "3"]);

function validateFiscalConfiguration(config) {
  const uf = typeof config?.endereco?.uf === "string"
    ? config.endereco.uf.trim().toUpperCase()
    : "";
  const crt = String(config?.crt || "");
  const ambiente = config?.ambiente;

  if (
    !config ||
    typeof config.razaoSocial !== "string" ||
    typeof config.cnpj !== "string" ||
    typeof config.ie !== "string" ||
    !REGIMES_TRIBUTARIOS.has(crt) ||
    !/^[A-Z]{2}$/.test(uf) ||
    !["homologacao", "producao"].includes(ambiente) ||
    (config.cMun && !/^\d{7}$/.test(String(config.cMun).replace(/\D/g, "")))
  ) {
    const error = new Error(
      "Preencha razão social, CNPJ, IE, UF, regime tributário e ambiente válidos.",
    );
    error.statusCode = 400;
    throw error;
  }

  const safeConfig = {
    razaoSocial: config.razaoSocial.trim(),
    nomeFantasia: String(config.nomeFantasia || "").trim(),
    cnpj: config.cnpj.trim(),
    ie: config.ie.trim(),
    im: String(config.im || "").trim(),
    cnae: String(config.cnae || "").trim(),
    crt,
    ambiente,
    cMun: String(config.cMun || "").replace(/\D/g, ""),
    serie: String(config.serie || "1"),
    proximaNota: String(config.proximaNota || "1"),
  };
  return {
    ...safeConfig,
    endereco: {
      logradouro: String(config.endereco.logradouro || "").trim(),
      numero: String(config.endereco.numero || "").trim(),
      bairro: String(config.endereco.bairro || "").trim(),
      cidade: String(config.endereco.cidade || "").trim(),
      uf,
      cep: String(config.endereco.cep || "").replace(/\D/g, ""),
      pais: "Brasil",
    },
  };
}

function sanitizeFiscalConfiguration(config = {}) {
  const endereco = config.endereco || {};
  return {
    razaoSocial: String(config.razaoSocial || ""),
    nomeFantasia: String(config.nomeFantasia || ""),
    cnpj: String(config.cnpj || ""),
    ie: String(config.ie || ""),
    im: String(config.im || ""),
    cnae: String(config.cnae || ""),
    crt: String(config.crt || "1"),
    ambiente: config.ambiente === "producao" ? "producao" : "homologacao",
    cMun: String(config.cMun || ""),
    serie: String(config.serie || "1"),
    proximaNota: String(config.proximaNota || "1"),
    endereco: {
      logradouro: String(endereco.logradouro || ""),
      numero: String(endereco.numero || ""),
      bairro: String(endereco.bairro || ""),
      cidade: String(endereco.cidade || ""),
      uf: String(endereco.uf || "SP"),
      cep: String(endereco.cep || ""),
      pais: "Brasil",
    },
  };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  try {
    if (!["GET", "PUT"].includes(request.method)) {
      response.setHeader("Allow", ["GET", "PUT"]);
      return response.status(405).json({
        success: false,
        error: "Método não permitido.",
      });
    }

    const { uid, db } = await authenticateRequest(request);
    const tenantId = request.method === "GET"
      ? request.query.tenantId
      : request.body?.tenantId;
    await authorizeTenant(db, uid, tenantId);

    const tenantRef = db.doc(`tenants/${tenantId}`);
    if (request.method === "GET") {
      const snapshot = await tenantRef.get();
      return response.status(200).json({
        success: true,
        config: snapshot.exists
          ? sanitizeFiscalConfiguration(snapshot.data()?.configNFP)
          : null,
      });
    }

    const config = validateFiscalConfiguration(request.body?.config);
    await tenantRef.set({ configNFP: config }, { merge: true });
    return response.status(200).json({ success: true, config });
  } catch (error) {
    return respondWithError(response, error);
  }
}
