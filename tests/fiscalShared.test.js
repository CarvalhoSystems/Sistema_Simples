import assert from "node:assert/strict";
import { after, test } from "node:test";
import {
  decryptFiscalCredentials,
  encryptFiscalCredentials,
  validateCertificatePayload,
} from "../server/fiscalShared.js";

const previousKey = process.env.FISCAL_ENCRYPTION_KEY;
process.env.FISCAL_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

after(() => {
  if (previousKey === undefined) {
    delete process.env.FISCAL_ENCRYPTION_KEY;
  } else {
    process.env.FISCAL_ENCRYPTION_KEY = previousKey;
  }
});

test("fiscal credentials are encrypted and can be decrypted only on the server", () => {
  const credentials = {
    certificateBase64: "MAA=",
    password: "senha-exemplo",
    csc: {
      homologacao: { token: "token-h", id: "1" },
      producao: { token: "token-p", id: "2" },
    },
  };

  const encrypted = encryptFiscalCredentials(credentials);
  assert.equal(encrypted.algorithm, "aes-256-gcm");
  assert.equal(JSON.stringify(encrypted).includes("senha-exemplo"), false);
  assert.deepEqual(decryptFiscalCredentials(encrypted), credentials);
});

test("authenticated encryption rejects modified ciphertext", () => {
  const encrypted = encryptFiscalCredentials({ password: "secret" });
  encrypted.ciphertext = `${encrypted.ciphertext.slice(0, -4)}AAAA`;
  assert.throws(() => decryptFiscalCredentials(encrypted));
});

test("certificate upload validation requires A1 file, password and both environment CSCs", () => {
  const validPayload = {
    fileName: "cliente.pfx",
    certificateBase64: Buffer.from("test-pfx").toString("base64"),
    password: "senha",
    cscHomologacao: "token-h",
    cscIdHomologacao: "1",
    cscProducao: "token-p",
    cscIdProducao: "2",
  };

  assert.equal(
    validateCertificatePayload(validPayload).csc.producao.token,
    "token-p",
  );
  assert.throws(
    () => validateCertificatePayload({ ...validPayload, cscProducao: "" }),
    /CSC/,
  );
});
