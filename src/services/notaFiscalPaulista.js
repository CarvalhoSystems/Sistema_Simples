/**
 * Serviço de integração com a Nota Fiscal Paulista (SEFAZ-SP)
 *
 * Documentação oficial: https://www.nfpaulista.fazenda.sp.gov.br/
 *
 * ATENÇÃO: Este é um serviço de simulação/estruturação.
 * Para produção, é necessário:
 * - Certificado digital A1 ou A3
 * - Cadastro no ambiente da SEFAZ-SP
 * - Credenciais de acesso à API
 */

const API_BASE_URL =
  import.meta.env.VITE_NFP_API_URL ||
  "https://homologacao.nfpaulista.fazenda.sp.gov.br/api";
const API_TOKEN = import.meta.env.VITE_NFP_API_TOKEN || "";

// Configurações da empresa (devem ser preenchidas pelo usuário)
let configEmpresa = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  ie: "", // Inscrição Estadual
  im: "", // Inscrição Municipal
  cnae: "",
  crt: "1", // 1=Simples Nacional, 2=Simples Nacional excesso, 3=Regime Normal
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

// Cache de notas emitidas na sessão
let notasEmitidas = [];

/**
 * Carrega as configurações salvas no localStorage
 */
export function carregarConfiguracoes() {
  try {
    const salvo = localStorage.getItem("nfp_config");
    if (salvo) {
      configEmpresa = { ...configEmpresa, ...JSON.parse(salvo) };
    }
  } catch (e) {
    console.warn("Erro ao carregar configurações NFP:", e);
  }
  return configEmpresa;
}

/**
 * Salva as configurações no localStorage
 */
export function salvarConfiguracoes(novaConfig) {
  configEmpresa = { ...configEmpresa, ...novaConfig };
  localStorage.setItem("nfp_config", JSON.stringify(configEmpresa));
  return configEmpresa;
}

/**
 * Gera um número de lote único para a nota fiscal
 */
function gerarNumeroLote() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${timestamp}${random}`;
}

/**
 * Gera uma chave de acesso para a NF-e (44 dígitos)
 * Formato: UF + AAMM + CNPJ + modelo + serie + numero + tpEmis + codigoNumerico + dv
 */
function gerarChaveAcesso(numeroNota) {
  const uf = "35"; // SP
  const data = new Date();
  const aamm = `${data.getFullYear().toString().slice(-2)}${String(data.getMonth() + 1).padStart(2, "0")}`;
  const cnpj = configEmpresa.cnpj.replace(/\D/g, "").padStart(14, "0");
  const modelo = "55"; // NF-e modelo 55
  const serie = "1";
  const numero = String(numeroNota).padStart(9, "0");
  const tpEmis = "1"; // 1=Normal
  const codigoNumerico = String(Math.floor(Math.random() * 100000000)).padStart(
    8,
    "0",
  );

  const chaveSemDV = `${uf}${aamm}${cnpj}${modelo}${serie}${numero}${tpEmis}${codigoNumerico}`;

  // Cálculo do dígito verificador (módulo 11)
  let peso = 2;
  let soma = 0;
  for (let i = chaveSemDV.length - 1; i >= 0; i--) {
    soma += parseInt(chaveSemDV[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;

  return chaveSemDV + dv;
}

/**
 * Formata CPF/CNPJ para envio à API
 */
function formatarDocumento(documento) {
  return documento.replace(/\D/g, "");
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
 * Gera o XML da Nota Fiscal (simplificado para demonstração)
 * Em produção, usar biblioteca específica como node-xml ou xmlbuilder
 */
function gerarXMLNotaFiscal(dadosVenda, cpfCliente) {
  const numeroNota = Math.floor(Math.random() * 1000000) + 1;
  const chaveAcesso = gerarChaveAcesso(numeroNota);
  const dataAtual = new Date();
  const dataEmissao = dataAtual.toISOString().split("T")[0];
  const horaEmissao = dataAtual.toTimeString().split(" ")[0];

  // Calcular totais
  const baseCalculoICMS = dadosVenda.total;
  const valorICMS = baseCalculoICMS * 0.18; // 18% para SP (simplificado)
  const valorPIS = baseCalculoICMS * 0.0165;
  const valorCOFINS = baseCalculoICMS * 0.076;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <idLote>${gerarNumeroLote()}</idLote>
  <indSinc>0</indSinc>
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe versao="4.00" Id="NFe${chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <cNF>${chaveAcesso.slice(35, 43)}</cNF>
        <natOp>VENDA</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>${numeroNota}</nNF>
        <dhEmi>${dataEmissao}T${horaEmissao}-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${chaveAcesso[43]}</cDV>
        <tpAmb>${configEmpresa.ambiente === "producao" ? 1 : 2}</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>PDV React 1.0</verProc>
      </ide>
      <emit>
        <CNPJ>${formatarDocumento(configEmpresa.cnpj)}</CNPJ>
        <xNome>${configEmpresa.razaoSocial}</xNome>
        <xFant>${configEmpresa.nomeFantasia}</xFant>
        <enderEmit>
          <xLgr>${configEmpresa.endereco.logradouro}</xLgr>
          <nro>${configEmpresa.endereco.numero}</nro>
          <xBairro>${configEmpresa.endereco.bairro}</xBairro>
          <cMun>3550308</cMun>
          <xMun>${configEmpresa.endereco.cidade}</xMun>
          <UF>${configEmpresa.endereco.uf}</UF>
          <CEP>${configEmpresa.endereco.cep.replace(/\D/g, "")}</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderEmit>
        <IE>${configEmpresa.ie}</IE>
        <CRT>${configEmpresa.crt}</CRT>
      </emit>
      <dest>
        <CPF>${formatarDocumento(cpfCliente)}</CPF>
        <xNome>CONSUMIDOR NAO INFORMADO</xNome>
        <indIEDest>9</indIEDest>
        <enderDest>
          <xLgr>NAO INFORMADO</xLgr>
          <nro>S/N</nro>
          <xBairro>NAO INFORMADO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>00000000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>${dadosVenda.carrinho[0]?.codigo || "0001"}</cProd>
          <xProd>${dadosVenda.carrinho
            .map((i) => i.descricao)
            .join(" + ")
            .substring(0, 120)}</xProd>
          <NCM>21069090</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>1.0000</qCom>
          <vUnCom>${dadosVenda.total.toFixed(2)}</vUnCom>
          <vProd>${dadosVenda.total.toFixed(2)}</vProd>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>${baseCalculoICMS.toFixed(2)}</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>${valorICMS.toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISOutr>
              <CST>99</CST>
              <vBC>${baseCalculoICMS.toFixed(2)}</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>${valorPIS.toFixed(2)}</vPIS>
            </PISOutr>
          </PIS>
          <COFINS>
            <COFINSOutr>
              <CST>99</CST>
              <vBC>${baseCalculoICMS.toFixed(2)}</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>${valorCOFINS.toFixed(2)}</vCOFINS>
            </COFINSOutr>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>${baseCalculoICMS.toFixed(2)}</vBC>
          <vICMS>${valorICMS.toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>${dadosVenda.total.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>${dadosVenda.desconto.toFixed(2)}</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>${valorPIS.toFixed(2)}</vPIS>
          <vCOFINS>${valorCOFINS.toFixed(2)}</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${dadosVenda.total.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</enviNFe>`;

  return { xml, chaveAcesso, numeroNota };
}

/**
 * Envia a nota fiscal para a SEFAZ-SP
 *
 * EM PRODUÇÃO: Esta função deve fazer uma requisição HTTP real para a API da SEFAZ
 * usando o certificado digital para autenticação.
 *
 * Para testes/homologação, use o ambiente de homologação da SEFAZ:
 * https://homologacao.nfpaulista.fazenda.sp.gov.br/
 */
export async function emitirNotaFiscal(dadosVenda, cpfCliente) {
  // Validações
  if (!configEmpresa.cnpj) {
    throw new Error(
      "CNPJ da empresa não configurado. Acesse Configurações > Nota Fiscal Paulista.",
    );
  }
  if (!configEmpresa.ie) {
    throw new Error("Inscrição Estadual não configurada.");
  }
  if (!cpfCliente || !validarCPF(cpfCliente)) {
    throw new Error("CPF do cliente inválido.");
  }
  if (!dadosVenda.carrinho || dadosVenda.carrinho.length === 0) {
    throw new Error("Carrinho vazio. Adicione itens antes de emitir a nota.");
  }

  // Gera o XML da nota
  const { xml, chaveAcesso, numeroNota } = gerarXMLNotaFiscal(
    dadosVenda,
    cpfCliente,
  );

  // Simula o envio para a SEFAZ
  // EM PRODUÇÃO: Substituir por chamada real à API
  console.log("=== NOTA FISCAL PAULISTA - ENVIO ===");
  console.log("XML Gerado:", xml.substring(0, 200) + "...");
  console.log("Chave de Acesso:", chaveAcesso);
  console.log("Número da Nota:", numeroNota);

  // Simula processamento (em produção, isso seria uma chamada assíncrona real)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simula resposta da SEFAZ
  const notaEmitida = {
    id: Date.now(),
    chaveAcesso,
    numeroNota,
    serie: "1",
    dataEmissao: new Date().toISOString(),
    cpfCliente: formatarCPF(cpfCliente),
    valorTotal: dadosVenda.total,
    status: "autorizada",
    protocolo: `SP${Date.now()}`,
    xml,
    dadosVenda: { ...dadosVenda },
  };

  // Salva no cache
  notasEmitidas.unshift(notaEmitida);
  salvarNotasEmitidas();

  return notaEmitida;
}

/**
 * Salva as notas emitidas no localStorage
 */
function salvarNotasEmitidas() {
  try {
    localStorage.setItem(
      "nfp_notas",
      JSON.stringify(notasEmitidas.slice(0, 100)),
    );
  } catch (e) {
    console.warn("Erro ao salvar notas emitidas:", e);
  }
}

/**
 * Carrega as notas emitidas do localStorage
 */
export function carregarNotasEmitidas() {
  try {
    const salvo = localStorage.getItem("nfp_notas");
    if (salvo) {
      notasEmitidas = JSON.parse(salvo);
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

  // Simula consulta à API da NFP
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Retorna notas locais + simulação de consulta externa
  const notasLocais = notasEmitidas.filter(
    (n) => n.cpfCliente === formatarCPF(cpf),
  );

  return {
    cpf: formatarCPF(cpf),
    nome: "CONSUMIDOR",
    totalNotas: notasLocais.length,
    valorTotalAcumulado: notasLocais.reduce((acc, n) => acc + n.valorTotal, 0),
    creditosAcumulados: notasLocais.reduce(
      (acc, n) => acc + n.valorTotal * 0.003,
      0,
    ), // 0.3% de crédito
    notas: notasLocais,
  };
}

/**
 * Cancela uma nota fiscal (dentro do prazo legal)
 */
export async function cancelarNotaFiscal(chaveAcesso, justificativa) {
  // Simula cancelamento
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const notaIndex = notasEmitidas.findIndex(
    (n) => n.chaveAcesso === chaveAcesso,
  );
  if (notaIndex === -1) {
    throw new Error("Nota fiscal não encontrada.");
  }

  notasEmitidas[notaIndex].status = "cancelada";
  notasEmitidas[notaIndex].justificativaCancelamento = justificativa;
  notasEmitidas[notaIndex].dataCancelamento = new Date().toISOString();

  salvarNotasEmitidas();

  return notasEmitidas[notaIndex];
}

/**
 * Gera o DANFE (Documento Auxiliar da Nota Fiscal Eletrônica) em formato HTML
 */
export function gerarDANFE(nota) {
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
export function isConfigurado() {
  return !!(
    configEmpresa.cnpj &&
    configEmpresa.ie &&
    configEmpresa.razaoSocial
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
