import {
  authenticateRequest,
  authorizeTenant,
  encryptFiscalCredentials,
  getCredentialDocument,
  respondWithError,
  validateCertificatePayload,
} from "../../server/fiscalShared.js";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  try {
    const { uid, db } = await authenticateRequest(request);
    const tenantId = request.method === "GET"
      ? request.query.tenantId
      : request.body?.tenantId;
    await authorizeTenant(db, uid, tenantId);
    const credentialRef = getCredentialDocument(db, tenantId);

    if (request.method === "GET") {
      const snapshot = await credentialRef.get();
      const credentials = snapshot.exists ? snapshot.data() : null;
      return response.status(200).json({
        success: true,
        configured: Boolean(credentials?.ciphertext),
        updatedAt: credentials?.updatedAt?.toDate?.().toISOString() || null,
      });
    }

    if (request.method === "DELETE") {
      await credentialRef.delete();
      return response.status(200).json({ success: true, configured: false });
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return response.status(405).json({
        success: false,
        error: "Método não permitido.",
      });
    }

    const credentials = validateCertificatePayload(request.body);
    const encryptedCredentials = encryptFiscalCredentials(credentials);
    await credentialRef.set(encryptedCredentials);

    return response.status(200).json({
      success: true,
      configured: true,
      updatedAt: encryptedCredentials.updatedAt.toDate().toISOString(),
    });
  } catch (error) {
    return respondWithError(response, error);
  }
}
