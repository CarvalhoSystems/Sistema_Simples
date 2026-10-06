import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const MAX_CERTIFICATE_BYTES = 450 * 1024;

export function getFiscalAdmin() {
  let app = getApps()[0];
  if (!app) {
    const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountValue) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não está configurada.");
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountValue);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não contém JSON válido.");
    }

    app = initializeApp({
      credential: cert({
        ...serviceAccount,
        private_key: serviceAccount.private_key?.replace(/\\n/g, "\n"),
      }),
    });
  }

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export async function authenticateRequest(request) {
  const authorization = request.headers.authorization || "";
  const match = authorization.match(/^Bearer (.+)$/i);
  if (!match) {
    const error = new Error("Autenticação obrigatória.");
    error.statusCode = 401;
    throw error;
  }

  const { auth, db } = getFiscalAdmin();
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(match[1]);
  } catch {
    const error = new Error("Sessão inválida ou expirada. Entre novamente.");
    error.statusCode = 401;
    throw error;
  }

  return { uid: decodedToken.uid, db };
}

export async function authorizeTenant(db, uid, tenantId) {
  if (
    typeof tenantId !== "string" ||
    !tenantId.trim() ||
    tenantId.length > 128 ||
    tenantId.includes("/")
  ) {
    const error = new Error("Estabelecimento inválido.");
    error.statusCode = 400;
    throw error;
  }

  if (tenantId === uid) return;

  const ownerSnapshot = await db.doc(`tenants/${uid}`).get();
  const establishments = ownerSnapshot.data()?.estabelecimentos;
  const isOwned = Array.isArray(establishments)
    && establishments.some((establishment) => establishment?.id === tenantId);

  if (!isOwned) {
    const error = new Error("Você não tem acesso a este estabelecimento.");
    error.statusCode = 403;
    throw error;
  }
}

export function getCredentialDocument(db, tenantId) {
  return db.doc(`tenants/${tenantId}/fiscal/credentials`);
}

export function encryptFiscalCredentials(credentials) {
  const keyValue = process.env.FISCAL_ENCRYPTION_KEY;
  if (!keyValue) {
    throw new Error("FISCAL_ENCRYPTION_KEY não está configurada no servidor.");
  }

  const key = Buffer.from(keyValue, "base64");
  if (key.length !== 32) {
    throw new Error("FISCAL_ENCRYPTION_KEY deve conter 32 bytes em Base64.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(credentials), "utf8"),
    cipher.final(),
  ]);

  return {
    version: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: encrypted.toString("base64"),
    updatedAt: Timestamp.now(),
  };
}

export function decryptFiscalCredentials(encrypted) {
  if (
    encrypted?.version !== 1 ||
    encrypted?.algorithm !== "aes-256-gcm" ||
    typeof encrypted.iv !== "string" ||
    typeof encrypted.authTag !== "string" ||
    typeof encrypted.ciphertext !== "string"
  ) {
    throw new Error("Credenciais fiscais criptografadas inválidas.");
  }

  const key = Buffer.from(process.env.FISCAL_ENCRYPTION_KEY || "", "base64");
  if (key.length !== 32) {
    throw new Error("FISCAL_ENCRYPTION_KEY deve conter 32 bytes em Base64.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(encrypted.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(plaintext);
}

export function validateCertificatePayload(body) {
  const {
    certificateBase64,
    password,
    cscHomologacao,
    cscIdHomologacao,
    cscProducao,
    cscIdProducao,
    fileName,
  } = body || {};
  if (
    typeof fileName !== "string" ||
    !/\.p(?:fx|12)$/i.test(fileName) ||
    typeof certificateBase64 !== "string" ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(certificateBase64) ||
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 256 ||
    typeof cscHomologacao !== "string" ||
    cscHomologacao.length < 1 ||
    cscHomologacao.length > 128 ||
    typeof cscIdHomologacao !== "string" ||
    !/^\d{1,10}$/.test(cscIdHomologacao) ||
    typeof cscProducao !== "string" ||
    cscProducao.length < 1 ||
    cscProducao.length > 128 ||
    typeof cscIdProducao !== "string" ||
    !/^\d{1,10}$/.test(cscIdProducao)
  ) {
    const error = new Error(
      "Informe um arquivo A1 .pfx/.p12, senha, CSC e ID do CSC válidos.",
    );
    error.statusCode = 400;
    throw error;
  }

  const certificate = Buffer.from(certificateBase64, "base64");
  if (
    certificate.length === 0 ||
    certificate.length > MAX_CERTIFICATE_BYTES ||
    certificate.toString("base64") !== certificateBase64
  ) {
    const error = new Error("O certificado deve ter no máximo 450 KiB.");
    error.statusCode = 413;
    throw error;
  }

  return {
    certificateBase64,
    password,
    csc: {
      homologacao: {
        token: cscHomologacao,
        id: cscIdHomologacao,
      },
      producao: {
        token: cscProducao,
        id: cscIdProducao,
      },
    },
  };
}

export function respondWithError(response, error) {
  const statusCode = Number.isInteger(error?.statusCode)
    ? error.statusCode
    : 500;
  if (statusCode >= 500) {
    console.error("Erro na API fiscal:", error);
  }
  return response.status(statusCode).json({
    success: false,
    error: statusCode === 500
      ? "Não foi possível concluir a operação fiscal."
      : error.message,
  });
}
