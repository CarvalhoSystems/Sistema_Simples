/**
 * Serviço de Impressão
 *
 * Suporta:
 * 1. Cupom Fiscal (venda normal)
 * 2. DANFE (Nota Fiscal Paulista)
 * 3. Relatório de vendas
 */

import { getTenant } from "../hooks/useTenant";
import { formatCurrency } from "../utils/formatters";

/**
 * Obtém dados do estabelecimento para o cabeçalho
 */
function getDadosEstabelecimento() {
  const tenant = getTenant();
  return {
    nome: tenant?.nomeEstabelecimento || "System PDV",
    endereco: "Seu endereço aqui",
    cnpj: "00.000.000/0001-00",
    telefone: "(11) 0000-0000",
  };
}

/**
 * Formata data para exibição
 */
function formatarData(data) {
  if (!data) return new Date().toLocaleString("pt-BR");
  return new Date(data).toLocaleString("pt-BR");
}

/**
 * 1. IMPRESSÃO DO CUPOM FISCAL (venda normal)
 */
export function imprimirCupom(dadosVenda) {
  const estabelecimento = getDadosEstabelecimento();
  const dataHora = formatarData(dadosVenda.data);

  const conteudo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cupom Fiscal</title>
  <style>
    @page { margin: 0; size: 80mm auto; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 80mm;
      margin: 0 auto;
      padding: 5px;
    }
    .header { text-align: center; margin-bottom: 10px; }
    .header h2 { font-size: 14px; margin: 2px 0; }
    .header p { font-size: 10px; margin: 1px 0; color: #333; }
    .divisoria { border-top: 1px dashed #000; margin: 5px 0; }
    .info { font-size: 10px; margin: 3px 0; }
    table { width: 100%; font-size: 11px; border-collapse: collapse; }
    th { text-align: left; border-bottom: 1px dashed #000; padding: 2px 0; }
    td { padding: 2px 0; }
    .qtd { text-align: center; }
    .valor { text-align: right; }
    .total { font-weight: bold; font-size: 13px; text-align: right; margin: 5px 0; }
    .footer { text-align: center; font-size: 10px; margin-top: 10px; }
    .cpf { font-size: 10px; margin: 3px 0; }
    @media print {
      body { margin: 0; padding: 5px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>${estabelecimento.nome}</h2>
    <p>${estabelecimento.endereco}</p>
    <p>CNPJ: ${estabelecimento.cnpj}</p>
    <p>Tel: ${estabelecimento.telefone}</p>
  </div>
  <div class="divisoria"></div>
  <div class="info">
    <p>Data: ${dataHora}</p>
    <p>Caixa: PDV Principal</p>
    <p>Operador: ${dadosVenda.operador || "Sistema"}</p>
    ${dadosVenda.cpfCliente ? `<p class="cpf">CPF: ${dadosVenda.cpfCliente}</p>` : ""}
  </div>
  <div class="divisoria"></div>
  <table>
    <thead>
      <tr>
        <th>ITEM</th>
        <th class="qtd">QTD</th>
        <th class="valor">VL.UN</th>
        <th class="valor">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${(dadosVenda.carrinho || [])
        .map(
          (item) => `
        <tr>
          <td>${item.descricao?.substring(0, 20) || "Item"}</td>
          <td class="qtd">${item.qtd || 1}</td>
          <td class="valor">R$ ${(item.vUnit || 0).toFixed(2)}</td>
          <td class="valor">R$ ${((item.qtd || 1) * (item.vUnit || 0)).toFixed(2)}</td>
        </tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <div class="divisoria"></div>
  <div class="info">
    <p>Subtotal: R$ ${(dadosVenda.subtotal || 0).toFixed(2)}</p>
    ${dadosVenda.desconto ? `<p>Desconto: R$ ${(dadosVenda.desconto || 0).toFixed(2)}</p>` : ""}
  </div>
  <div class="total">
    <p>VALOR TOTAL: R$ ${(dadosVenda.total || 0).toFixed(2)}</p>
  </div>
  <div class="divisoria"></div>
  <div class="info">
    <p>Forma de Pagamento: ${dadosVenda.metodo || "N/A"}</p>
  </div>
  ${dadosVenda.notaFiscal ? `
  <div class="divisoria"></div>
  <div class="info" style="font-size: 9px;">
    <p>NF-e: ${dadosVenda.notaFiscal.numeroNota}</p>
    <p>Chave: ${dadosVenda.notaFiscal.chaveAcesso}</p>
    <p>Protocolo: ${dadosVenda.notaFiscal.protocolo}</p>
  </div>
  ` : ""}
  <div class="divisoria"></div>
  <div class="footer">
    <p>Obrigado pela preferência!</p>
    <p>System PDV - Gestão Comercial</p>
  </div>
  <script>window.print();</script>
</body>
</html>`;

  abrirJanelaImpressao(conteudo);
}

/**
 * 2. IMPRESSÃO DO DANFE (Nota Fiscal Paulista)
 */
export function imprimirDANFE(nota) {
  if (!nota) {
    alert("Nenhuma nota fiscal selecionada para impressão.");
    return;
  }

  const estabelecimento = getDadosEstabelecimento();

  const conteudo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DANFE - NF-e ${nota.numeroNota}</title>
  <style>
    @page { margin: 10mm; }
    body { font-family: 'Courier New', monospace; font-size: 12px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .header h1 { font-size: 18px; margin: 5px 0; }
    .chave { text-align: center; font-weight: bold; margin: 10px 0; padding: 8px; border: 1px dashed #000; font-size: 14px; letter-spacing: 1px; }
    .info { margin: 10px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #000; padding: 5px; text-align: left; font-size: 11px; }
    th { background: #eee; }
    .total { text-align: right; font-weight: bold; font-size: 16px; margin-top: 10px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px solid #000; padding-top: 10px; }
    .status { color: #006600; font-weight: bold; }
    .qrcode { text-align: center; margin: 15px 0; padding: 10px; border: 1px solid #000; }
  </style>
</head>
<body>
  <div class="header">
    <h1>DANFE</h1>
    <p>Documento Auxiliar da Nota Fiscal Eletrônica</p>
    <p><strong>${estabelecimento.nome}</strong></p>
    <p>${estabelecimento.cnpj}</p>
    <p>${estabelecimento.endereco}</p>
  </div>

  <div class="chave">
    CHAVE DE ACESSO<br/>
    ${nota.chaveAcesso || "N/A"}
  </div>

  <div class="info">
    <div class="info-row"><span>Número:</span><span>${nota.numeroNota || "N/A"}</span></div>
    <div class="info-row"><span>Série:</span><span>${nota.serie || "1"}</span></div>
    <div class="info-row"><span>Data de Emissão:</span><span>${formatarData(nota.dataEmissao)}</span></div>
    <div class="info-row"><span>CPF do Consumidor:</span><span>${nota.cpfCliente || "N/A"}</span></div>
    <div class="info-row"><span>Status:</span><span class="status">${(nota.status || "autorizada").toUpperCase()}</span></div>
    <div class="info-row"><span>Protocolo:</span><span>${nota.protocolo || "N/A"}</span></div>
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
      ${(nota.dadosVenda?.carrinho || [])
        .map(
          (item) => `
        <tr>
          <td>${item.codigo || "000"}</td>
          <td>${item.descricao || "Item"}</td>
          <td>${item.qtd || 1}</td>
          <td>R$ ${(item.vUnit || 0).toFixed(2)}</td>
          <td>R$ ${((item.qtd || 1) * (item.vUnit || 0)).toFixed(2)}</td>
        </tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <div class="total">
    Valor Total: R$ ${(nota.valorTotal || 0).toFixed(2)}
  </div>

  <div class="qrcode">
    <strong>QR CODE DA NFP</strong><br/>
    Consulte em: www.nfpaulista.fazenda.sp.gov.br
  </div>

  <div class="footer">
    <p>NOTA FISCAL ELETRÔNICA - EMITIDA NOS TERMOS DA LEGISLAÇÃO</p>
    <p>Consulte pela chave de acesso em www.nfpaulista.fazenda.sp.gov.br</p>
  </div>
  <script>window.print();</script>
</body>
</html>`;

  abrirJanelaImpressao(conteudo);
}

/**
 * 3. IMPRESSÃO DO RELATÓRIO DE VENDAS
 */
export function imprimirRelatorioVendas(dados) {
  const estabelecimento = getDadosEstabelecimento();
  const dataGeracao = formatarData();

  const conteudo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Vendas</title>
  <style>
    @page { margin: 10mm; }
    body { font-family: 'Courier New', monospace; font-size: 12px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
    .header h1 { font-size: 16px; margin: 5px 0; }
    .resumo { display: flex; justify-content: space-around; margin: 15px 0; }
    .resumo-item { text-align: center; }
    .resumo-item .valor { font-size: 18px; font-weight: bold; }
    .resumo-item .label { font-size: 10px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #000; padding: 4px; text-align: left; font-size: 10px; }
    th { background: #eee; }
    .valor { text-align: right; }
    .total-geral { text-align: right; font-weight: bold; font-size: 14px; margin-top: 10px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px solid #000; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RELATÓRIO DE VENDAS</h1>
    <p><strong>${estabelecimento.nome}</strong></p>
    <p>CNPJ: ${estabelecimento.cnpj}</p>
    <p>Gerado em: ${dataGeracao}</p>
    ${dados.periodo ? `<p>Período: ${dados.periodo}</p>` : ""}
  </div>

  <div class="resumo">
    <div class="resumo-item">
      <div class="valor">R$ ${(dados.totalFaturamento || 0).toFixed(2)}</div>
      <div class="label">Faturamento Total</div>
    </div>
    <div class="resumo-item">
      <div class="valor">${dados.totalVendas || 0}</div>
      <div class="label">Vendas Realizadas</div>
    </div>
    <div class="resumo-item">
      <div class="valor">R$ ${(dados.ticketMedio || 0).toFixed(2)}</div>
      <div class="label">Ticket Médio</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Data</th>
        <th>Itens</th>
        <th>Pagamento</th>
        <th class="valor">Valor</th>
      </tr>
    </thead>
    <tbody>
      ${(dados.vendas || [])
        .map(
          (venda, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${formatarData(venda.data)}</td>
          <td>${venda.carrinho?.length || 0} itens</td>
          <td>${venda.metodo || "N/A"}</td>
          <td class="valor">R$ ${(venda.total || 0).toFixed(2)}</td>
        </tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <div class="total-geral">
    Total Geral: R$ ${(dados.totalFaturamento || 0).toFixed(2)}
  </div>

  <div class="footer">
    <p>System PDV - Gestão Comercial</p>
  </div>
  <script>window.print();</script>
</body>
</html>`;

  abrirJanelaImpressao(conteudo);
}

/**
 * Abre uma janela para impressão
 */
function abrirJanelaImpressao(conteudoHtml) {
  const janela = window.open("", "_blank", "width=400,height=600");
  if (!janela) {
    alert(
      "Pop-up bloqueado! Permita pop-ups para imprimir ou use Ctrl+P manualmente.",
    );
    return;
  }
  janela.document.write(conteudoHtml);
  janela.document.close();
}