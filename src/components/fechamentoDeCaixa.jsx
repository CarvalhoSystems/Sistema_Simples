import Swal from "sweetalert2";
import { getTenantId } from "../hooks/useTenant";

/**
 * Abre o fluxo de fechamento de caixa
 * @param {Array} todaySales - Vendas do dia
 * @param {Function} onConfirmClose - Callback quando o caixa for fechado
 */
export function abrirFechamentoCaixa(todaySales = [], onConfirmClose) {
  Swal.fire({
    title: "Deseja Fechar o Caixa?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sim",
    cancelButtonText: "Não",
  }).then((result) => {
    if (result.isConfirmed) {
      solicitarCredenciaisEImprimir(todaySales, onConfirmClose);
    }
  });
}

// Passo 1: Pedir Login e Senha do Supervisor/Operador
function solicitarCredenciaisEImprimir(todaySales, onConfirmClose) {
  Swal.fire({
    title: "Autorização Necessária",
    html: `
      <input id="swal-usuario" class="swal2-input" placeholder="Usuário / Matrícula">
      <input id="swal-senha" type="password" class="swal2-input" placeholder="Senha">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const usuario = document.getElementById("swal-usuario").value;
      const senha = document.getElementById("swal-senha").value;
      if (!usuario || !senha) {
        Swal.showValidationMessage("Por favor, preencha o usuário e a senha!");
      }
      return { usuario, senha };
    },
  }).then((result) => {
    if (result.value) {
      validarLoginNoBackend(result.value, todaySales, onConfirmClose);
    }
  });
}

// Passo 2: Validar credenciais e prosseguir com o fechamento
function validarLoginNoBackend(credentials, todaySales, onConfirmClose) {
  Swal.fire({
    title: "Validando...",
    text: "Verificando credenciais...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  // Simulação de requisição para validar usuário e senha
  setTimeout(() => {
    // Exemplo fictício de validação bem-sucedida:
    const loginValido = true;

    if (loginValido) {
      processarFechamentoDeCaixa(todaySales, onConfirmClose);
    } else {
      Swal.fire("Erro", "Usuário ou senha inválidos!", "error");
    }
  }, 1000);
}

// Passo 3: Calcular o total, fechar e disparar a impressão
function processarFechamentoDeCaixa(todaySales, onConfirmClose) {
  const totalCaixa = todaySales.reduce(
    (acc, venda) => acc + (venda.total || 0),
    0,
  );

  Swal.fire({
    title: "Caixa Fechado com Sucesso!",
    html: `Total de vendas do dia: <b>R$ ${totalCaixa.toFixed(2)}</b>`,
    icon: "success",
    confirmButtonText: "Imprimir Relatório",
  }).then(() => {
    imprimirRelatorio(totalCaixa, todaySales.length);
    if (onConfirmClose) onConfirmClose(totalCaixa);
  });
}

// Passo 4: Função para gerar o layout de impressão do fechamento
function imprimirRelatorio(total, qtdVendas) {
  const janelaImpressao = window.open("", "_blank", "width=600,height=600");
  const tenantId = getTenantId();

  const conteudoHTML = `
  <html>
  <head>
    <title>Fechamento de Caixa</title>
    <style>
      /* Configuração essencial para bobinas térmicas */
      @page {
        margin: 0; /* Remove margens padrão da folha A4 */
      }
      body {
        font-family: 'Courier New', Courier, monospace;
        width: 280px; /* Largura padrão ideal para bobina de 58mm (cerca de 48 a 52 caracteres por linha) */
        margin: 0 auto;
        padding: 5px;
        font-size: 11px; /* Letra menor, típica de cupom fiscal */
        color: #000;
        background-color: #fff;
      }
      
      h2 {
        text-align: center;
        font-size: 13px;
        margin: 5px 0;
      }

      p {
        margin: 4px 0;
        line-height: 1.2;
      }

      .center {
        text-align: center;
      }

      .linha {
        border-bottom: 1px dashed #000;
        margin: 6px 0;
      }

      .flex {
        display: flex;
        justify-content: space-between;
      }

      /* Estilo para alinhamento tipo coluna (Item / Valor) */
      .linha-item {
        display: flex;
        justify-content: space-between;
      }

      .destaque {
        font-size: 12px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="center">
      <strong>NOME DA SUA LOJA</strong><br>
      CNPJ: 00.000.000/0001-00<br>
      Rua Exemplo, 123 - Centro
    </div>

    <div class="linha"></div>
    
    <h2>FECHAMENTO DE CAIXA</h2>
    <p class="center">Data/Hora: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    
    <div class="linha"></div>
    
    <p><strong>Operador:</strong> Caixa 01</p>
    <p><strong>Qtd Vendas:</strong> ${qtdVendas}</p>
    <p><strong>Tenant:</strong> ${tenantId || "N/A"}</p>
    
    <div class="linha"></div>
    
    <p class="destaque">RESUMO DE PAGAMENTOS:</p>
    <!-- Exemplo estruturado para bobina -->
    <p>Dinheiro: ................. R$ 150,00</p>
    <p>Cartão Débito: ............ R$ 200,00</p>
    <p>Cartão Crédito: .......... R$ 145,50</p>
    
    <div class="linha"></div>
    
    <p class="destaque" style="font-size: 13px;">VALOR TOTAL: R$ ${total.toFixed(2)}</p>
    
    <div class="linha"></div>
    
    <br>
    <div class="center">
      _________________________________<br>
      Assinatura do Operador
    </div>
    
    <br>
    <p class="center" style="font-size: 9px;">Fim do Relatório</p>
  </body>
</html>
  `;

  janelaImpressao.document.write(conteudoHTML);
  janelaImpressao.document.close();
  janelaImpressao.focus();
  janelaImpressao.print();
  janelaImpressao.close();
}

// Mantém o componente para compatibilidade (mas não é mais usado diretamente)
export default function FechamentoDeCaixa() {
  return null;
}
