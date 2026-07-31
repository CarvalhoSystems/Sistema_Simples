/**
 * Serviço de Geração de PIX QR Code
 *
 * Gera o payload PIX (BR Code) no formato oficial do Banco Central
 * para gerar QR Code de pagamento.
 *
 * Formato: https://www.bcb.gov.br/estabilidadefinanceira/legislacao_pix
 */

import { getTenant } from "../hooks/useTenant";

/**
 * Gera o CRC16 (checksum) para o payload PIX
 */
function gerarCRC16(payload) {
  const polinomio = 0x1021;
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polinomio;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Cria um campo no formato TAMANHO + VALOR
 */
function criarCampo(id, valor) {
  const tamanho = String(valor.length).padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

/**
 * Gera o payload PIX completo (BR Code) para pagamento
 *
 * @param {Object} params
 * @param {string} params.pixKey - Chave PIX (CPF, email, celular, ou aleatória)
 * @param {number} params.amount - Valor da transação
 * @param {string} params.merchantName - Nome do recebedor (até 25 caracteres)
 * @param {string} params.merchantCity - Cidade do recebedor
 * @param {string} params.description - Descrição da transação (opcional, até 20 caracteres)
 * @param {string} params.txId - Identificador da transação (opcional, até 25 caracteres)
 * @returns {string} Payload PIX formatado
 */
export function gerarPayloadPix({
  pixKey,
  amount,
  merchantName = "MEU ESTABELECIMENTO",
  merchantCity = "SAO PAULO",
  description = "",
  txId = "***",
}) {
  if (!pixKey) {
    throw new Error(
      "Chave PIX não configurada. Configure nas Configurações da Loja.",
    );
  }

  if (!amount || amount <= 0) {
    throw new Error("Valor inválido para gerar o QR Code PIX.");
  }

  // Formata o nome (máx 25 caracteres, maiúsculo)
  const nomeFormatado = merchantName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .substring(0, 25);

  // Formata a cidade (máx 15 caracteres, maiúsculo)
  const cidadeFormatada = merchantCity
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .substring(0, 15);

  // Monta o Merchant Account Information (campo 26)
  const merchantAccountInfo =
    criarCampo("00", "BR.GOV.BCB.PIX") + // GUI
    criarCampo("01", pixKey); // Chave PIX

  // Adiciona descrição se fornecida (campo 02 dentro do MAI)
  let merchantAccountInfoCompleto = merchantAccountInfo;
  if (description) {
    const descricaoFormatada = description.substring(0, 20);
    merchantAccountInfoCompleto += criarCampo("02", descricaoFormatada);
  }

  // Monta o payload sem o CRC
  const payloadSemCRC =
    criarCampo("00", "01") + // Payload Format Indicator
    criarCampo("26", merchantAccountInfoCompleto) + // Merchant Account Information
    criarCampo("52", "0000") + // Merchant Category Code
    criarCampo("53", "986") + // Transaction Currency (BRL)
    criarCampo("54", amount.toFixed(2)) + // Transaction Amount
    criarCampo("58", "BR") + // Country Code
    criarCampo("59", nomeFormatado) + // Merchant Name
    criarCampo("60", cidadeFormatada) + // Merchant City
    criarCampo("62", criarCampo("05", txId)); // Additional Data Field (TXID)

  // Calcula o CRC16
  const crc = gerarCRC16(payloadSemCRC + "6304");

  // Retorna o payload completo
  return payloadSemCRC + "6304" + crc;
}

/**
 * Obtém a chave PIX configurada do tenant
 */
export function getPixKeyFromTenant() {
  const tenant = getTenant();
  return tenant?.pixKey || "";
}

/**
 * Obtém o nome do titular da chave PIX
 */
export function getPixHolderFromTenant() {
  const tenant = getTenant();
  return (
    tenant?.pixHolder || tenant?.nomeEstabelecimento || "MEU ESTABELECIMENTO"
  );
}

/**
 * Obtém a cidade do tenant
 */
export function getMerchantCityFromTenant() {
  const tenant = getTenant();
  const endereco = tenant?.endereco || "";
  // Tenta extrair a cidade do endereço (última parte antes do CEP)
  const partes = endereco.split(",").map((p) => p.trim());
  if (partes.length >= 2) {
    // Pega a penúltima parte que geralmente é "Cidade - UF"
    const cidadeUf = partes[partes.length - 2] || "SAO PAULO";
    return cidadeUf.split("-")[0]?.trim() || "SAO PAULO";
  }
  return "SAO PAULO";
}
