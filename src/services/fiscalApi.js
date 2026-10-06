import { auth } from "./firebaseClient";

const LIMITE_CERTIFICADO_BYTES = 450 * 1024;

async function chamarApiFiscal(path, options = {}) {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error(
      "Faça login com uma conta Firebase para configurar o certificado fiscal.",
    );
  }

  const token = await user.getIdToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || "Falha ao comunicar com o servidor fiscal.");
  }
  return result;
}

function arrayBufferParaBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const tamanhoBloco = 0x8000;
  let binario = "";
  for (let inicio = 0; inicio < bytes.length; inicio += tamanhoBloco) {
    const bloco = bytes.subarray(inicio, inicio + tamanhoBloco);
    binario += String.fromCharCode(...bloco);
  }
  return btoa(binario);
}

export function carregarStatusCertificado(tenantId) {
  return chamarApiFiscal(
    `/api/fiscal/certificado?tenantId=${encodeURIComponent(tenantId)}`,
  );
}

export async function salvarCredenciaisFiscais({
  tenantId,
  file,
  password,
  cscHomologacao,
  cscIdHomologacao,
  cscProducao,
  cscIdProducao,
}) {
  if (!file || !/\.p(?:fx|12)$/i.test(file.name)) {
    throw new Error("Selecione um certificado A1 .pfx ou .p12.");
  }
  if (file.size > LIMITE_CERTIFICADO_BYTES) {
    throw new Error("O certificado deve ter no máximo 450 KiB.");
  }

  return chamarApiFiscal("/api/fiscal/certificado", {
    method: "POST",
    body: JSON.stringify({
      tenantId,
      fileName: file.name,
      certificateBase64: arrayBufferParaBase64(await file.arrayBuffer()),
      password,
      cscHomologacao,
      cscIdHomologacao,
      cscProducao,
      cscIdProducao,
    }),
  });
}

export function removerCredenciaisFiscais(tenantId) {
  return chamarApiFiscal("/api/fiscal/certificado", {
    method: "DELETE",
    body: JSON.stringify({ tenantId }),
  });
}

export function salvarConfiguracaoFiscalSegura(tenantId, config) {
  if (!auth?.currentUser) {
    return Promise.resolve({ sincronizado: false });
  }
  return chamarApiFiscal("/api/fiscal/configuracao", {
    method: "PUT",
    body: JSON.stringify({ tenantId, config }),
  }).then((result) => ({ ...result, sincronizado: true }));
}
