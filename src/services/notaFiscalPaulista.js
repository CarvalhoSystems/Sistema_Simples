/**
 * Serviço de integração com a Nota Fiscal Paulista (SEFAZ-SP)
 *
 * Documentação oficial: https://www.nfpaulista.fazenda.sp.gov.br/
 *
 * ATENÇÃO: A emissão oficial de NFC-e ainda não está implementada.
 * Para produção, é necessário:
 * - Integração segura no servidor com a SEFAZ-SP
 * - Certificado digital e CSC/ID do CSC do contribuinte
 * - Dados tributários corretos para cada produto
 */

import { getTenant, getTenantId } from "../hooks/useTenant.js";
import {
  carregarConfiguracaoNFPFirebase,
  salvarConfiguracaoNFPFirebase,
} from "./firebaseData.js";
import { salvarConfiguracaoFiscalSegura } from "./fiscalApi.js";

// Configurações da empresa (devem ser preenchidas pelo usuário)
let configEmpresa = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  ie: "", // Inscrição Estadual
  im: "", // Inscrição Municipal
  cnae: "",
  crt: "1", // 1=Simples Nacional, 2=Simples Nacional excesso, 3=Regime Normal
  cMun: "",
  serie: "1",
  proximaNota: "1",
  endereco: {
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "SAO PAULO",
    uf: "SP",
    cep: "",
    pais: "Brasil",
  },
  certificadoDigital: {
    tipo: "", // "A1" ou "A3"
    senha: "",
    caminho: "",
  },
  ambiente: "homologacao", // "homologacao" ou "producao"
};

const CONFIG_EMPRESA_PADRAO = JSON.parse(JSON.stringify(configEmpresa));

function normalizarConfiguracao(config) {
  return {
    ...CONFIG_EMPRESA_PADRAO,
    ...config,
    endereco: {
      ...CONFIG_EMPRESA_PADRAO.endereco,
      ...config?.endereco,
    },
    certificadoDigital: {
      ...CONFIG_EMPRESA_PADRAO.certificadoDigital,
      ...config?.certificadoDigital,
      senha: "",
    },
  };
}

function configuracaoSemCredenciais(config) {
  const camposSensiveis = new Set([
    "certificadoDigital",
    "senha",
    "password",
    "csc",
    "CSC",
    "cscToken",
    "tokenCSC",
    "cscHomologacao",
    "cscProducao",
  ]);
  return Object.fromEntries(
    Object.entries(config).filter(([chave]) => !camposSensiveis.has(chave)),
  );
}

function carregarValorTenant(tipo, chaveLegada) {
  const tenantId = getTenantId();
  const chaveTenant = tenantId ? `pdv_nfp_${tipo}_${tenantId}` : null;
  let valor = chaveTenant ? localStorage.getItem(chaveTenant) : null;

  if (valor === null) {
    valor = localStorage.getItem(chaveLegada);
    if (valor !== null && chaveTenant) {
      const tenantPrincipalId = getTenant()?.uid || tenantId;
      localStorage.setItem(`pdv_nfp_${tipo}_${tenantPrincipalId}`, valor);
      localStorage.removeItem(chaveLegada);
      if (tenantPrincipalId !== tenantId) valor = null;
    }
  }

  return { chaveTenant, valor };
}

// Cache de notas emitidas na sessão
let notasEmitidas = [];

/**
 * Carrega as configurações salvas no localStorage
 */
export function carregarConfiguracoes() {
  try {
    const { valor: salvo } = carregarValorTenant("config", "nfp_config");
    configEmpresa = normalizarConfiguracao();
    if (salvo) {
      configEmpresa = normalizarConfiguracao(JSON.parse(salvo));
    }
  } catch (e) {
    console.warn("Erro ao carregar configurações NFP:", e);
  }
  return configEmpresa;
}

export async function sincronizarConfiguracoes() {
  carregarConfiguracoes();
  const configNuvem = await carregarConfiguracaoNFPFirebase();
  let sincronizado = Boolean(configNuvem);
  if (configNuvem) {
    configEmpresa = normalizarConfiguracao(configNuvem);
    const { chaveTenant } = carregarValorTenant("config", "nfp_config");
    localStorage.setItem(
      chaveTenant || "nfp_config",
      JSON.stringify(configuracaoSemCredenciais(configEmpresa)),
    );
  } else if (configEmpresa.razaoSocial || configEmpresa.cnpj || configEmpresa.ie) {
    sincronizado = await salvarConfiguracaoNFPFirebase(
      configuracaoSemCredenciais(configEmpresa),
    );
  }

  return {
    config: configEmpresa,
    sincronizado,
  };
}

/**
 * Salva as configurações no localStorage
 */
export async function salvarConfiguracoes(novaConfig) {
  configEmpresa = normalizarConfiguracao({
    ...configEmpresa,
    ...novaConfig,
  });
  const configParaPersistir = configuracaoSemCredenciais(configEmpresa);
  const { chaveTenant } = carregarValorTenant("config", "nfp_config");
  localStorage.setItem(
    chaveTenant || "nfp_config",
    JSON.stringify(configParaPersistir),
  );
  const resultadoServidor = await salvarConfiguracaoFiscalSegura(
    getTenantId(),
    configParaPersistir,
  );
  const sincronizado = resultadoServidor.sincronizado
    || await salvarConfiguracaoNFPFirebase(configParaPersistir);
  return { config: configEmpresa, sincronizado };
}

/**
 * Formata CPF/CNPJ para envio à API
 */
function formatarDocumento(documento) {
  return documento.replace(/\D/g, "");
}

export function montarPayloadNFCe(dadosVenda, cpfCliente = null) {
  const config = getConfiguracoes();
  const tenantId = getTenantId();
  if (!tenantId) throw new Error("Estabelecimento não identificado.");
  if (!Array.isArray(dadosVenda?.carrinho) || dadosVenda.carrinho.length === 0) {
    throw new Error("A venda precisa conter pelo menos um item.");
  }
  if (!config.cnpj || !config.ie || !config.cMun || !config.endereco.uf) {
    throw new Error(
      "Complete os dados fiscais do estabelecimento antes de montar a NFC-e.",
    );
  }
  if (
    formatarDocumento(config.cnpj).length !== 14 ||
    !/^\d{7}$/.test(String(config.cMun).replace(/\D/g, "")) ||
    !/^[A-Z]{2}$/.test(config.endereco.uf.toUpperCase())
  ) {
    throw new Error("CNPJ, código IBGE do município ou UF inválidos.");
  }
  if (cpfCliente && !validarCPF(cpfCliente)) {
    throw new Error("CPF do consumidor inválido.");
  }

  const itens = dadosVenda.carrinho.map((item, indice) => {
    const camposObrigatorios = [
      ["NCM", item.ncm],
      ["CFOP", item.cfop],
      ["origem", item.origem],
      ["CST PIS", item.cstPis],
      ["CST COFINS", item.cstCofins],
    ];
    const campoTributarioFaltante = camposObrigatorios.find(
      ([, valor]) => valor === "" || valor === null || valor === undefined,
    );
    if (campoTributarioFaltante) {
      throw new Error(
        `Informe ${campoTributarioFaltante[0]} no item ${indice + 1}.`,
      );
    }
    if (
      !/^\d{8}$/.test(String(item.ncm).replace(/\D/g, "")) ||
      !/^\d{4}$/.test(String(item.cfop).replace(/\D/g, "")) ||
      !/^[0-8]$/.test(String(item.origem)) ||
      !/^\d{2}$/.test(String(item.cstPis)) ||
      !/^\d{2}$/.test(String(item.cstCofins))
    ) {
      throw new Error(`Revise os códigos fiscais do item ${indice + 1}.`);
    }
    if (
      config.crt === "1" || config.crt === "2"
        ? !item.csosn
        : !item.cstIcms
    ) {
      throw new Error(
        `Informe CSOSN ou CST ICMS do item ${indice + 1}, conforme o CRT.`,
      );
    }
    const quantidade = Number(item.qtd);
    const valorUnitario = Number(item.vUnit);
    if (
      !Number.isFinite(quantidade) ||
      quantidade <= 0 ||
      !Number.isFinite(valorUnitario) ||
      valorUnitario < 0
    ) {
      throw new Error(`Quantidade ou preço inválido no item ${indice + 1}.`);
    }

    return {
      codigo: String(item.codigo),
      descricao: String(item.descricao),
      quantidade,
      valorUnitario,
      gtin: item.gtin || null,
      unidade: item.unidadeComercial || "UN",
      ncm: String(item.ncm),
      cfop: String(item.cfop),
      origem: String(item.origem),
      icms: {
        csosn: item.csosn || null,
        cst: item.cstIcms || null,
        aliquota: item.aliquotaIcms === "" ? null : Number(item.aliquotaIcms),
      },
      pis: {
        cst: String(item.cstPis),
        aliquota: item.aliquotaPis === "" ? null : Number(item.aliquotaPis),
      },
      cofins: {
        cst: String(item.cstCofins),
        aliquota:
          item.aliquotaCofins === "" ? null : Number(item.aliquotaCofins),
      },
    };
  });

  return {
    tenantId,
    modelo: 65,
    ambiente: config.ambiente,
    emitente: {
      cnpj: formatarDocumento(config.cnpj),
      razaoSocial: config.razaoSocial,
      inscricaoEstadual: config.ie,
      crt: config.crt,
      municipioIbge: config.cMun,
      uf: config.endereco.uf,
    },
    destinatario: cpfCliente
      ? { cpf: formatarDocumento(cpfCliente) }
      : null,
    itens,
    totais: {
      subtotal: Number(dadosVenda.subtotal),
      desconto: Number(dadosVenda.desconto),
      valorTotal: Number(dadosVenda.total),
    },
    pagamento: { metodo: String(dadosVenda.metodo || "") },
  };
}

/**
 * Valida CPF
 */
export function validarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpfLimpo[9])) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpfLimpo[10])) return false;

  return true;
}

/**
 * Formata CPF para exibição
 */
export function formatarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11) return cpf;
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Bloqueia a emissão até existir integração oficial e autorização confirmada pela SEFAZ.
 */
export async function emitirNotaFiscal(_dadosVenda, _cpfCliente) {
  await sincronizarConfiguracoes();
  throw new Error(
    "A emissão oficial de NFC-e modelo 65 ainda não está integrada à SEFAZ. Nenhuma nota foi emitida; não use as chaves antigas como comprovante fiscal.",
  );
}

/**
 * Carrega as notas emitidas do localStorage
 */
export function carregarNotasEmitidas() {
  try {
    const { valor: salvo } = carregarValorTenant("notas", "nfp_notas");
    if (salvo) {
      notasEmitidas = JSON.parse(salvo).map((nota) =>
        nota.status === "autorizada" ? { ...nota, status: "simulada" } : nota,
      );
    } else {
      notasEmitidas = [];
    }
  } catch (e) {
    console.warn("Erro ao carregar notas emitidas:", e);
  }
  return notasEmitidas;
}

/**
 * Consulta uma nota fiscal pelo CPF na API da Nota Fiscal Paulista
 *
 * A Nota Fiscal Paulista permite ao consumidor consultar suas notas
 * e acumular créditos. Esta função simula essa consulta.
 */
export async function consultarNotasPorCPF(cpf) {
  const cpfLimpo = formatarDocumento(cpf);

  if (cpfLimpo.length !== 11) {
    throw new Error("CPF inválido para consulta.");
  }

  throw new Error(
    "A consulta oficial de notas por CPF ainda não está integrada à SEFAZ/NFP.",
  );
}

/**
 * Cancela uma nota fiscal (dentro do prazo legal)
 */
export async function cancelarNotaFiscal(_chaveAcesso, _justificativa) {
  throw new Error(
    "O cancelamento oficial de NFC-e ainda não está integrado à SEFAZ.",
  );
}

/**
 * Gera o DANFE (Documento Auxiliar da Nota Fiscal Eletrônica) em formato HTML
 */
export function gerarDANFE(nota) {
  if (nota.status === "simulada") {
    throw new Error(
      "Este registro foi criado pela simulação antiga e não representa uma NFC-e autorizada.",
    );
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DANFE - Nota Fiscal ${nota.numeroNota}</title>
  <style>
    body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .header h1 { font-size: 16px; margin: 5px 0; }
    .info { margin: 10px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 2px 0; }
    .chave-acesso { text-align: center; font-weight: bold; margin: 10px 0; padding: 5px; border: 1px dashed #000; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #000; padding: 4px; text-align: left; }
    th { background: #eee; }
    .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 10px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px solid #000; padding-top: 10px; }
    .status { color: #006600; font-weight: bold; }
    .qrcode { text-align: center; margin: 10px 0; }
    .qrcode-box { display: inline-block; border: 1px solid #000; padding: 10px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <h1>DANFE</h1>
    <p>Documento Auxiliar da Nota Fiscal Eletrônica</p>
    <p><strong>${configEmpresa.razaoSocial}</strong></p>
    <p>${configEmpresa.cnpj}</p>
    <p>${configEmpresa.endereco.logradouro}, ${configEmpresa.endereco.numero} - ${configEmpresa.endereco.bairro}</p>
    <p>${configEmpresa.endereco.cidade}/${configEmpresa.endereco.uf} - CEP: ${configEmpresa.endereco.cep}</p>
  </div>

  <div class="chave-acesso">
    CHAVE DE ACESSO: ${nota.chaveAcesso}
  </div>

  <div class="info">
    <div class="info-row"><span>Número:</span><span>${nota.numeroNota}</span></div>
    <div class="info-row"><span>Série:</span><span>${nota.serie}</span></div>
    <div class="info-row"><span>Data de Emissão:</span><span>${new Date(nota.dataEmissao).toLocaleString("pt-BR")}</span></div>
    <div class="info-row"><span>CPF do Consumidor:</span><span>${nota.cpfCliente}</span></div>
    <div class="info-row"><span>Status:</span><span class="status">${nota.status.toUpperCase()}</span></div>
    <div class="info-row"><span>Protocolo:</span><span>${nota.protocolo}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Descrição</th>
        <th>Qtd</th>
        <th>Valor Unit.</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${nota.dadosVenda.carrinho
        .map(
          (item) => `
        <tr>
          <td>${item.codigo}</td>
          <td>${item.descricao}</td>
          <td>${item.qtd}</td>
          <td>R$ ${item.vUnit.toFixed(2)}</td>
          <td>R$ ${(item.qtd * item.vUnit).toFixed(2)}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="total">
    Valor Total: R$ ${nota.valorTotal.toFixed(2)}
  </div>

  <div class="qrcode">
    <div class="qrcode-box">
      [QR CODE DA NFP]
      <br/>
      Consulte na Nota Fiscal Paulista
      <br/>
      www.nfpaulista.fazenda.sp.gov.br
    </div>
  </div>

  <div class="footer">
    <p>NOTA FISCAL ELETRÔNICA - EMITIDA NOS TERMOS DA LEGISLAÇÃO</p>
    <p>Consulte pela chave de acesso em www.nfpaulista.fazenda.sp.gov.br</p>
    <p>PDV React - Sistema de Gestão</p>
  </div>
</body>
</html>`;
}

/**
 * Verifica se a empresa está configurada para emitir NFP
 */
export async function isConfigurado() {
  const { config } = await sincronizarConfiguracoes();
  return !!(
    config.cnpj &&
    config.ie &&
    config.razaoSocial
  );
}

/**
 * Obtém as configurações atuais
 */
export function getConfiguracoes() {
  return { ...configEmpresa };
}

// Carrega configurações ao iniciar o módulo
carregarConfiguracoes();
carregarNotasEmitidas();
