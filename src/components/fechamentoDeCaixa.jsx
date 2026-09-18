import Swal from "sweetalert2";
import { getTenant } from "../hooks/useTenant";
import { formatCurrency } from "../utils/formatters";
import { signInWithEmailAndPassword } from "firebase/auth"; // Exemplo usando Firebase Auth direto
import { auth } from "../services/firebaseClient.js"; // Ajuste o caminho do seu firebase

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
      // Passa para a etapa de credenciais DEPOIS que o usuário confirmou
      solicitarCredenciaisParaFechar(todaySales, onConfirmClose);
    }
  });
}

/**
 * 2. Passo de Credenciais (VALIDAÇÃO REAL NO FIREBASE)
 */
async function solicitarCredenciaisParaFechar(todaySales, onConfirmClose) {
  Swal.fire({
    title: "Autorização do Operador",
    html: `
      <div style="text-align: left; margin-bottom: 10px; font-size: 13px; color: #666;">
        Insira o e-mail e a senha cadastrados no Firebase para autorizar o fechamento:
      </div>
      <input id="swal-usuario" type="email" class="swal2-input" placeholder="E-mail do operador" style="margin-bottom: 8px;">
      <input id="swal-senha" type="password" class="swal2-input" placeholder="Senha">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Confirmar e Fechar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    preConfirm: async () => {
      const usuario = document.getElementById("swal-usuario").value.trim();
      const senha = document.getElementById("swal-senha").value;

      if (!usuario || !senha) {
        Swal.showValidationMessage("Preencha o e-mail e a senha!");
        return false;
      }

      try {
        // VALIDAÇÃO SEGURA DIRETAMENTE NO FIREBASE AUTH
        // (Se você tiver uma função customizada de login, substitua aqui,
        // mas certifique-se de que ela só retorna true se o Firebase autenticar com sucesso)
        const userCredential = await signInWithEmailAndPassword(
          auth,
          usuario,
          senha,
        );
        return { usuario: userCredential.user.email };
      } catch (error) {
        console.error("Erro de autenticação:", error);
        Swal.showValidationMessage("E-mail ou senha inválidos no Firebase!");
        return false;
      }
    },
  }).then((result) => {
    if (result.value) {
      // Sucesso na senha! Agora sim processa o fechamento
      processarFechamento(todaySales, onConfirmClose, result.value.usuario);
    }
  });
}

/**
 * 3. Processa o fechamento e gera o relatório
 */
function processarFechamento(todaySales, onConfirmClose, operadorEmail) {
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
    operador: operadorEmail,
    quantVendas: todaySales.length,
    totalGeral,
    totaisPorMetodo,
    vendas: todaySales,
  };

  Swal.fire({
    title: "✅ Caixa Fechado com Sucesso!",
    html: `<p>O caixa foi encerrado pelo operador <b>${operadorEmail}</b>.</p>`,
    icon: "success",
    confirmButtonText: "📄 Imprimir Relatório",
    confirmButtonColor: "#1e3a8a",
    showCancelButton: true,
    cancelButtonText: "Concluir",
  }).then((result) => {
    if (result.isConfirmed) {
      imprimirRelatorioFechamento(dadosFechamento);
    }
    // Dispara a função de callback para alterar o estado do sistema para "Caixa Fechado"
    if (onConfirmClose) {
      onConfirmClose(dadosFechamento);
    }
  });
}


// Imprime o relatório completo de fechamento
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

  <!-- Lista de vendas do dia -->
  <div class="destaque" style="text-align: center; margin-bottom: 5px;">VENDAS REALIZADAS</div>
  ${dados.vendas
    .map(
      (venda, i) => `
    <div class="info" style="font-size: 9px;">
      <div class="flex">
        <span>#${i + 1} ${new Date(venda.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
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

// Mantém o componente para compatibilidade
export default function FechamentoDeCaixa() {
  return null;
}
