import Swal from "sweetalert2";
import { getTenant } from "../hooks/useTenant";
import { formatCurrency } from "../utils/formatters";
import {
  getOperadorAtual,
  setOperadorAtual,
} from "../services/operadorSession"; // Gestão da sessão
import { autenticarFuncionarioPorCodigo } from "../services/tenantData.js";
import InputSenha from "../components/InputSenha.jsx"; // Ajuste o caminho se necessário

/**
 * 1. Confirmação inicial para fechar o caixa
 */
export function abrirFechamentoCaixa(todaySales = [], onConfirmClose) {
  const totalDia = todaySales.reduce((acc, v) => acc + (v.total || 0), 0);

  Swal.fire({
    title: "Deseja Fechar o Caixa?",
    html: `
      <div style="text-align: left; font-size: 14px;">
        <p><strong>Vendas do dia:</strong> ${todaySales.length}</p>
        <p><strong>Total:</strong> ${formatCurrency(totalDia)}</p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sim, Fechar Caixa",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      solicitarCredenciaisParaFechar(todaySales, onConfirmClose);
    }
  });
}

/**
 * 2. Validação por PIN + Limpeza de Sessão do Operador
 */
async function solicitarCredenciaisParaFechar(todaySales, onConfirmClose) {
  const operadorAtual = getOperadorAtual();

  Swal.fire({
    title: "Autorização do Operador",
    html: `
      <div style="text-align: left; margin-bottom: 10px; font-size: 13px; color: #666;">
        Insira o PIN e a senha do operador para confirmar o fechamento:
      </div>
      <input id="swal-pin" type="password" class="swal2-input" placeholder="PIN do operador" style="margin-bottom: 8px;" maxlength="6" value="${operadorAtual?.codigo || ""}">
      <input id="swal-senha" type="password" class="swal2-input" placeholder="Senha do operador">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Confirmar e Fechar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      const pinInput = document.getElementById("swal-pin");
      const senhaInput = document.getElementById("swal-senha");

      const pin = pinInput ? pinInput.value.trim() : "";
      const senha = senhaInput ? senhaInput.value : "";

      if (!pin || !senha) {
        Swal.showValidationMessage("Preencha o PIN e a Senha!");
        return false;
      }

      try {
        const funcionario = await autenticarFuncionarioPorCodigo(pin, senha);
        return { funcionario };
      } catch (error) {
        console.error("Erro ao validar credenciais:", error);
        Swal.showValidationMessage(error.message || "PIN ou senha inválidos!");
        return false;
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed && result.value?.funcionario) {
      const { funcionario } = result.value;

      setOperadorAtual(null);

      processarFechamento(
        todaySales,
        onConfirmClose,
        funcionario.nome || `Operador (${funcionario.codigo})`,
      );
    }
  });
}

/**
 * 3. Processa o fechamento e gera o relatório
 */
function processarFechamento(todaySales, onConfirmClose, operadorNome) {
  const tenant = getTenant();

  const totaisPorMetodo = {};
  let totalGeral = 0;

  todaySales.forEach((venda) => {
    const metodo = venda.metodo || "Outros";
    totaisPorMetodo[metodo] =
      (totaisPorMetodo[metodo] || 0) + (venda.total || 0);
    totalGeral += venda.total || 0;
  });

  const dadosFechamento = {
    data: new Date().toISOString(),
    loja: {
      nome: tenant?.nomeEstabelecimento || tenant?.nomeFantasia || "Minha Loja",
      cnpj: tenant?.cnpj || "00.000.000/0001-00",
      endereco: tenant?.endereco || "Endereço não cadastrado",
      telefone: tenant?.telefone || "(00) 0000-0000",
    },
    operador: operadorNome,
    quantVendas: todaySales.length,
    totalGeral,
    totaisPorMetodo,
    vendas: todaySales,
  };

  Swal.fire({
    title: "✅ Caixa Fechado com Sucesso!",
    html: `<p>O caixa foi encerrado pelo operador <b>${operadorNome}</b>.</p>`,
    icon: "success",
    confirmButtonText: "📄 Imprimir Relatório",
    confirmButtonColor: "#1e3a8a",
    showCancelButton: true,
    cancelButtonText: "Concluir",
  }).then((result) => {
    if (result.isConfirmed) {
      imprimirRelatorioFechamento(dadosFechamento);
    }
    if (onConfirmClose) {
      onConfirmClose(dadosFechamento);
    }
  });
}

function imprimirRelatorioFechamento(dados) {
  const metodosLinhas = Object.entries(dados.totaisPorMetodo)
    .map(([metodo, valor]) => {
      const metodoPadded = metodo.padEnd(20, ".");
      const valorStr = `R$ ${valor.toFixed(2)}`.padStart(12);
      return `<div class="flex"><span>${metodoPadded}</span><span>${valorStr}</span></div>`;
    })
    .join("");

  const conteudo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fechamento de Caixa</title>
  <style>
    @page { margin: 0; size: 80mm auto; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      width: 80mm;
      margin: 0 auto;
      padding: 5px;
      color: #000;
    }
    .center { text-align: center; }
    .header { text-align: center; margin-bottom: 8px; }
    .header h2 { font-size: 13px; margin: 3px 0; }
    .header p { font-size: 10px; margin: 1px 0; }
    .linha { border-top: 1px dashed #000; margin: 5px 0; }
    .flex { display: flex; justify-content: space-between; }
    .info { font-size: 10px; margin: 2px 0; }
    .destaque { font-size: 12px; font-weight: bold; }
    .total { font-size: 14px; font-weight: bold; text-align: right; margin: 5px 0; }
    .footer { text-align: center; font-size: 9px; margin-top: 10px; }
    .assinatura { text-align: center; margin-top: 15px; font-size: 10px; }
    @media print { body { margin: 0; padding: 5px; } }
  </style>
</head>
<body>
  <div class="header">
    <h2>${dados.loja.nome}</h2>
    <p>CNPJ: ${dados.loja.cnpj}</p>
    <p>${dados.loja.endereco}</p>
    <p>Tel: ${dados.loja.telefone}</p>
    ${dados.loja.email ? `<p>E-mail: ${dados.loja.email}</p>` : ""}
  </div>
  <div class="linha"></div>
  <div class="center"><strong style="font-size: 12px;">FECHAMENTO DE CAIXA</strong></div>
  <div class="linha"></div>
  <div class="info">
    <div class="flex"><span>Data:</span><span>${new Date(dados.data).toLocaleDateString("pt-BR")}</span></div>
    <div class="flex"><span>Horário:</span><span>${new Date(dados.data).toLocaleTimeString("pt-BR")}</span></div>
    <div class="flex"><span>Operador:</span><span>${dados.operador}</span></div>
    <div class="flex"><span>Qtd. Vendas:</span><span>${dados.quantVendas}</span></div>
  </div>
  <div class="linha"></div>
  <div class="destaque" style="text-align: center; margin-bottom: 5px;">RESUMO POR PAGAMENTO</div>
  ${metodosLinhas}
  <div class="linha"></div>
  <div class="total">
    VALOR TOTAL: R$ ${dados.totalGeral.toFixed(2)}
  </div>
  <div class="linha"></div>

  <div class="destaque" style="text-align: center; margin-bottom: 5px;">VENDAS REALIZADAS</div>
  ${dados.vendas
    .map(
      (venda, i) => `
    <div class="info" style="font-size: 9px;">
      <div class="flex">
        <span>#${i + 1}${new Date(venda.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        <span>${venda.metodo || "N/A"}</span>
        <span>R$ ${(venda.total || 0).toFixed(2)}</span>
      </div>
    </div>`,
    )
    .join("")}

  <div class="linha"></div>
  <div class="footer">
    <p>Obrigado pela preferência!</p>
    <p>System PDV - Gestão Comercial</p>
  </div>
  <div class="assinatura">
    _________________________________<br/>
    Assinatura do Operador
  </div>
  <script>window.print();</script>
</body>
</html>`;

  const janela = window.open("", "_blank", "width=400,height=600");
  if (janela) {
    janela.document.write(conteudo);
    janela.document.close();
  }
}

export default function FechamentoDeCaixa() {
  return null;
}
