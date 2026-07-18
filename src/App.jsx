import React, { useReducer, useEffect, useState } from "react";
import BarraSuperior from "./components/PDV/BarraSuperior";
import TabelaCupom from "./components/PDV/TabelaCupom";
import PainelLateral from "./components/PDV/PainelLateral";
import RodapeAtalhos from "./components/PDV/RodapeAtalhos";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";

// 📦 Banco de Dados Atualizado com a regra de quantidade automática
const BANCO_PRODUTOS = [
  {
    codigo: "1",
    descricao: "PÃO FRANCÊS (UN)",
    preco: 0.8,
    solicitarQuantidade: true,
  },
  {
    codigo: "2",
    descricao: "LEITE INTEGRAL PIRACANJUBA 1L",
    preco: 4.8,
    solicitarQuantidade: false,
  },
  {
    codigo: "3",
    descricao: "QUEIJO MUSSARELA FATIADO (KG)",
    preco: 4.2,
    solicitarQuantidade: true,
  },
  {
    codigo: "4",
    descricao: "REFRIGERANTE COCA-COLA 2L",
    preco: 8.5,
    solicitarQuantidade: false,
  },
  {
    codigo: "5",
    descricao: "PRESUNTO FATIADO (KG)",
    preco: 5.99,
    solicitarQuantidade: true,
  },
];

const estadoInicial = {
  carrinho: [],
  codigoInput: "",
  quantidade: 1,
  itemSelecionado: null,
};

// 🧠 Reducer Totalmente Corrigido (Adicionado os cases que faltavam para destravar a digitação)
function reducer(estado, acao) {
  switch (acao.type) {
    case "DIGITAR_CODIGO":
      return {
        ...estado,
        codigoInput: acao.payload,
      };

    case "DEFINIR_QUANTIDADE":
      return {
        ...estado,
        quantidade: acao.payload,
      };

    case "LIMPAR_INPUT":
      return {
        ...estado,
        codigoInput: "",
        quantidade: 1,
      };

    case "LIMPAR_CARRINHO":
      return {
        ...estado,
        carrinho: [],
        codigoInput: "",
        quantidade: 1,
      };

    case "REMOVER_ITEM":
      const itemNumero = acao.payload;
      const carrinhoAtualizado = estado.carrinho.filter(
        (_, index) => index !== itemNumero - 1,
      );
      return {
        ...estado,
        carrinho: carrinhoAtualizado,
      };

    case "ADICIONAR_PRODUTO":
      const { produto, quantidade } = acao.payload;
      const itemExistenteIndex = estado.carrinho.findIndex(
        (item) => item.codigo === produto.codigo,
      );

      let novoCarrinho = [...estado.carrinho];

      if (itemExistenteIndex > -1) {
        novoCarrinho[itemExistenteIndex].qtd += quantidade;
      } else {
        novoCarrinho.push({
          codigo: produto.codigo,
          descricao: produto.descricao,
          qtd: quantidade,
          vUnit: produto.preco,
        });
      }

      return {
        ...estado,
        carrinho: novoCarrinho,
        codigoInput: "",
        quantidade: 1,
      };

    case "APLICAR_DESCONTO":
      const { desconto } = acao.payload; // Pega o 0.10 enviado pelo dispatch

      const novoCarrinhoComDesconto = estado.carrinho.map((item) => ({
        ...item,
        vUnit: item.vUnit * (1 - desconto), // Reduz o valor unitário
      }));

      return {
        ...estado,
        carrinho: novoCarrinhoComDesconto,
      };

    case "FINALIZAR_VENDA":
      // Limpa tudo e prepara o caixa para o próximo cliente
      return {
        ...estado,
        carrinho: [],
        codigoInput: "",
        quantidade: 1,
      };

    default:
      return estado;
  }
}

export default function App() {
  const [mostrarF10, setMostrarF10] = useState(false);
  const [estado, dispatch] = useReducer(reducer, estadoInicial);
  const { carrinho, codigoInput, quantidade } = estado;

  const lidarComBipe = (codigoBipado) => {
    const produtoEncontrado = BANCO_PRODUTOS.find(
      (p) => p.codigo === codigoBipado,
    );

    if (!produtoEncontrado) {
      alert(`⚠️ Produto com código [${codigoBipado}] não cadastrado!`);
      dispatch({ type: "LIMPAR_INPUT" });
      return;
    }

    let qtdFinal = quantidade;
    if (produtoEncontrado.solicitarQuantidade) {
      const novaQtd = prompt(
        `Quantos(as) [${produtoEncontrado.descricao}]?`,
        "1",
      );
      const qtdFormatada = parseFloat(novaQtd);

      if (isNaN(qtdFormatada) || qtdFormatada <= 0) {
        dispatch({ type: "LIMPAR_INPUT" });
        return;
      }
      qtdFinal = qtdFormatada;
    }

    dispatch({
      type: "ADICIONAR_PRODUTO",
      payload: { produto: produtoEncontrado, quantidade: qtdFinal },
    });
  };

  // 🛠️ Mapeamento de Atalhos Atualizado para usar o Reducer (Sem travar o teclado!)
  const acoesTeclado = {
    // Cancelar Itens
    F2: () => {
      if (carrinho.length === 0) {
        alert("⚠️ O cupom está vazio! Nenhum item para cancelar.");
        return;
      }

      const numeroDigitado = prompt(
        "Digite o número do item (da lista) que deseja CANCELAR:",
      );
      const numeroItem = parseInt(numeroDigitado, 10);

      // Valida se o que foi digitado é um número válido e existe no carrinho
      if (
        !isNaN(numeroItem) &&
        numeroItem > 0 &&
        numeroItem <= carrinho.length
      ) {
        if (confirm(`Deseja realmente cancelar o item ${numeroItem}?`)) {
          dispatch({ type: "REMOVER_ITEM", payload: numeroItem });
        }
      } else if (numeroDigitado !== null) {
        // Se não clicou em cancelar
        alert("⚠️ Número de item inválido!");
      }
    },

    // Cancelar Cupom
    F3: () => {
      if (confirm("Deseja realmente cancelar este cupom?")) {
        dispatch({ type: "LIMPAR_CARRINHO" });
      }
    },
    F5: () => {
      const novaQtd = prompt("Digite a quantidade do item:", "1");
      const qtdFormatada = parseFloat(novaQtd);
      if (!isNaN(qtdFormatada) && qtdFormatada > 0) {
        dispatch({ type: "DEFINIR_QUANTIDADE", payload: qtdFormatada });
      }
    },
    // 🛠️ ATALHO F6 CORRIGIDO:
    F6: () => {
      if (carrinho.length === 0) {
        alert("⚠️ O cupom está vazio! Não há itens para aplicar desconto.");
        return;
      }

      const valorDigitado = prompt(
        "Digite a porcentagem de desconto (Ex: 10 para 10%):",
      );
      const porcentagem = parseFloat(valorDigitado);

      // Valida se digitou um número correto entre 0 e 100
      if (!isNaN(porcentagem) && porcentagem > 0 && porcentagem <= 100) {
        if (
          confirm(
            `Deseja aplicar ${porcentagem}% de desconto em todos os itens?`,
          )
        ) {
          const fatorDesconto = porcentagem / 100; // Converte 10 em 0.10

          dispatch({
            type: "APLICAR_DESCONTO",
            payload: { desconto: fatorDesconto }, // Envia o valor certinho
          });
        }
      } else if (valorDigitado !== null) {
        alert("⚠️ Porcentagem inválida!");
      }
    },

    // 📱 F7: FECHAMENTO VIA PIX
    F7: () => {
      if (carrinho.length === 0) {
        alert("⚠️ O cupom está vazio! Não há o que pagar.");
        return;
      }

      if (
        confirm(
          `TOTAL DA VENDA: R$ ${totalGeral.toFixed(2)}\n\n` +
            `Deseja gerar o QR Code PIX e confirmar o pagamento?`,
        )
      ) {
        alert(`✅ PAGAMENTO RECEBIDO VIA PIX!\n\nImprimindo cupom fiscal...`);

        // Executa a impressão do navegador de forma assíncrona para dar tempo do alert fechar
        setTimeout(() => {
          window.print();
          dispatch({ type: "FINALIZAR_VENDA" });
        }, 500);
      }
    },
    // 💵 F8: FECHAMENTO EM DINHEIRO (Com cálculo de troco)
    F8: () => {
      if (carrinho.length === 0) {
        alert("⚠️ O cupom está vazio! Não há o que pagar.");
        return;
      }

      const valorEntregueDigitado = prompt(
        `TOTAL DA VENDA: R$ ${totalGeral.toFixed(2)}\n\nDigite o valor pago pelo cliente em DINHEIRO:`,
      );

      if (valorEntregueDigitado === null) return; // Operador cancelou a operação

      const valorEntregue = parseFloat(valorEntregueDigitado);

      if (!isNaN(valorEntregue) && valorEntregue >= totalGeral) {
        const troco = valorEntregue - totalGeral;

        // Substitua o dispatch direto de finalizar dentro do F11 e F12 por isso:
        alert(`✅ VENDA FINALIZADA COM SUCESSO!\n\nImprimindo cupom...`);
        setTimeout(() => {
          window.print();
          dispatch({ type: "FINALIZAR_VENDA" });
        }, 500);
      } else {
        alert("⚠️ Valor insuficiente ou inválido! A venda não foi finalizada.");
      }
    },

    // 💳 F9: FECHAMENTO EM CARTÃO
    F9: () => {
      if (carrinho.length === 0) {
        alert("⚠️ O cupom está vazio! Não há o que pagar.");
        return;
      }

      if (
        confirm(
          `TOTAL DA VENDA: R$ ${totalGeral.toFixed(2)}\n\n` +
            `Confirmar o recebimento no CARTÃO (Débito/Crédito)?`,
        )
      ) {
        // Substitua o dispatch direto de finalizar dentro do F11 e F12 por isso:
        alert(`✅ VENDA FINALIZADA COM SUCESSO!\n\nImprimindo cupom...`);
        setTimeout(() => {
          window.print();
          dispatch({ type: "FINALIZAR_VENDA" });
        }, 500);
      }
    },

    F10: () => {
      setMostrarF10((prev) => !prev);
    },

    // Print da nota nfc
    F12: () => {},

    Escape: () => {
      setMostrarF10((aberto) => {
        if (aberto) {
          return false;
        } else {
          if (confirm("Deseja limpar o cupom atual?")) {
            dispatch({ type: "LIMPAR_CARRINHO" });
          }
          return false;
        }
      });
    },
  };

  useKeyboardShortcuts(acoesTeclado);

  const totalGeral = carrinho.reduce(
    (acc, item) => acc + item.vUnit * item.qtd,
    0,
  );

  return (
    <div className="h-screen w-screen bg-[#e2e8f0] flex flex-col justify-between p-2 select-none overflow-hidden">
      <BarraSuperior />

      <div className="flex-1 flex gap-3 my-2 overflow-hidden items-stretch">
        <TabelaCupom carrinho={carrinho} />
        <PainelLateral
          codigo={codigoInput}
          setCodigo={(valor) =>
            dispatch({ type: "DIGITAR_CODIGO", payload: valor })
          }
          carrinho={carrinho}
          total={totalGeral}
          aoBipar={lidarComBipe}
          quantidadeAtual={quantidade}
        />
      </div>

      <RodapeAtalhos />

      {/* 🔍 JANELA MODAL DO F10 (CONSULTA DE PRODUTOS) */}
      {mostrarF10 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded shadow-2xl border-2 border-[#1e3a8a] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-[#1e3a8a] text-white p-3 font-mono font-bold flex justify-between items-center">
              <span>[F10] CONSULTA DE PRODUTOS CADASTRADOS</span>
              <button
                onClick={() => setMostrarF10(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs"
              >
                ESC / FECHAR
              </button>
            </div>

            <div className="p-2 overflow-y-auto flex-1 bg-slate-50 font-mono text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-[#1e3a8a] border-b-2 border-slate-300">
                    <th className="p-2 text-left w-1/4">CÓDIGO</th>
                    <th className="p-2 text-left w-1/2">DESCRIÇÃO</th>
                    <th className="p-2 text-right w-1/4">PREÇO (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {BANCO_PRODUTOS.map((produto, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-200 hover:bg-blue-50 text-slate-700 transition-colors"
                    >
                      <td className="p-2 font-bold">{produto.codigo}</td>
                      <td className="p-2">{produto.descricao}</td>
                      <td className="p-2 text-right font-bold text-blue-900">
                        {produto.preco.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-100 p-2 text-center text-xs text-slate-500 font-mono border-t border-slate-200">
              Pressione <strong className="text-[#1e3a8a]">F10</strong> ou
              clique em Fechar para voltar ao caixa.
            </div>

            {/* 🧾 CÓDIGO DO CUPOM FISCAL (Invisível na tela, visível apenas na impressora) */}
            <div
              id="cupom-impressao"
              className="hidden print:block p-4 font-mono"
            >
              <div className="text-center font-bold text-base">
                FÁCIL SISTEMAS S.A.
              </div>
              <div className="text-center text-xs">
                AV. PRINCIPAL, 1000 - SÃO PAULO/SP
              </div>
              <div className="text-center text-xs">
                CNPJ: 00.000.000/0001-00
              </div>
              <div className="border-b border-dashed my-2"></div>
              <div className="text-center font-bold text-sm">
                CUPOM FISCAL NÃO ELETRÔNICO
              </div>
              <div className="border-b border-dashed my-2"></div>

              {/* Itens do carrinho */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-dashed">
                    <th className="text-left">ITEM</th>
                    <th className="text-left">QTD</th>
                    <th className="text-right">VL.UN</th>
                    <th className="text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {carrinho.map((item, index) => (
                    <tr key={index}>
                      <td className="py-1">
                        {item.descricao.substring(0, 15)}
                      </td>
                      <td>{item.qtd}</td>
                      <td className="text-right">{item.vUnit.toFixed(2)}</td>
                      <td className="text-right">
                        {(item.qtd * item.vUnit).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b border-dashed my-2"></div>
              <div className="flex justify-between font-bold">
                <span>VALOR TOTAL R$:</span>
                <span>{totalGeral.toFixed(2)}</span>
              </div>
              <div className="border-b border-dashed my-2"></div>
              <div className="text-center text-xs mt-4">
                Obrigado pela preferência!
              </div>
              <div className="text-center text-[10px] text-gray-500">
                PDV React V1.0
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
