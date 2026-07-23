import React, { useReducer, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BarraSuperior from "./components/PDV/BarraSuperior";
import TabelaCupom from "./components/PDV/TabelaCupom";
import PainelLateral from "./components/PDV/PainelLateral";
import RodapeAtalhos from "./components/PDV/RodapeAtalhos";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { BANCO_PRODUTOS } from "./mockData";
import { formatCurrency } from "./utils/formatters"; // Assumindo que você criará este utilitário

const estadoInicial = {
  carrinho: [],
  codigoInput: "",
  quantidade: 1,
  itemSelecionado: null,
  subtotal: 0,
  desconto: 0,
  total: 0,
};

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

    case "ATUALIZAR_TOTAIS":
      const { subtotal, desconto, total } = acao.payload;
      return { ...estado, subtotal, desconto, total };

    case "LIMPAR_INPUT":
      return {
        ...estado,
        codigoInput: "",
        quantidade: 1,
      };

    case "LIMPAR_CARRINHO":
      return { ...estadoInicial }; // Reseta para o estado inicial completo

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
      // O desconto agora é um valor monetário, não aplicado aos itens
      return { ...estado, desconto: acao.payload };

    case "DEFINIR_PAGAMENTO":
      return {
        ...estado,
        pagamentoRecebido: acao.payload,
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

export default function PDV() {
  const [mostrarF10, setMostrarF10] = useState(false);
  const [estado, dispatch] = useReducer(reducer, estadoInicial);
  const { carrinho, codigoInput, quantidade, subtotal, desconto, total } =
    estado;
  const navigate = useNavigate();

  // Efeito para recalcular os totais sempre que o carrinho ou o desconto mudar
  useEffect(() => {
    const novoSubtotal = carrinho.reduce(
      (acc, item) => acc + item.vUnit * item.qtd,
      0,
    );
    const novoTotal = novoSubtotal - estado.desconto;

    dispatch({
      type: "ATUALIZAR_TOTAIS",
      payload: {
        subtotal: novoSubtotal,
        desconto: estado.desconto,
        total: novoTotal,
      },
    });
  }, [carrinho, estado.desconto]);

  const lidarComBipe = (codigoBipado) => {
    const produtoEncontrado = BANCO_PRODUTOS.find(
      (p) => p.codigo === codigoBipado,
    );

    if (!produtoEncontrado) {
      Swal.fire({
        icon: "error",
        title: "Produto não encontrado",
        text: `O produto com código [${codigoBipado}] não está cadastrado.`,
      });
      dispatch({ type: "LIMPAR_INPUT" });
      return;
    }

    let qtdFinal = quantidade;
    if (produtoEncontrado.solicitarQuantidade) {
      Swal.fire({
        title: `Quantidade para ${produtoEncontrado.descricao}`,
        input: "number",
        inputValue: 1,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value || value <= 0) {
            return "Por favor, insira uma quantidade válida!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          qtdFinal = parseFloat(result.value);
          dispatch({
            type: "ADICIONAR_PRODUTO",
            payload: { produto: produtoEncontrado, quantidade: qtdFinal },
          });
        }
      });
      return; // A adição será feita no callback do Swal
    }

    dispatch({
      type: "ADICIONAR_PRODUTO",
      payload: { produto: produtoEncontrado, quantidade: qtdFinal },
    });
  };

  const finalizarVenda = (metodo) => {
    Swal.fire({
      icon: "success",
      title: "Venda Finalizada!",
      text: `Pagamento recebido via ${metodo}. Imprimindo cupom...`,
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      // Simula a impressão
      const areaImpressao = document.getElementById("cupom-impressao");
      if (areaImpressao) {
        // Preenche os dados da impressão antes de chamar o print
        // (Esta parte pode ser melhorada para passar os dados via props/estado)
        window.print();
      }
      dispatch({ type: "FINALIZAR_VENDA" });
    });
  };

  const acoesTeclado = {
    F2: () => {
      if (carrinho.length === 0) {
        Swal.fire(
          "Atenção",
          "O cupom está vazio! Nenhum item para cancelar.",
          "warning",
        );
        return;
      }

      Swal.fire({
        title: "Cancelar Item",
        input: "number",
        inputLabel: "Digite o número do item que deseja cancelar",
        inputPlaceholder: "Ex: 1",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const numeroItem = parseInt(result.value, 10);
          if (numeroItem > 0 && numeroItem <= carrinho.length) {
            dispatch({ type: "REMOVER_ITEM", payload: numeroItem });
            Swal.fire("Cancelado!", "O item foi removido do cupom.", "success");
          } else {
            Swal.fire("Erro", "Número de item inválido!", "error");
          }
        }
      });
    },

    F3: () => {
      Swal.fire({
        title: "Cancelar Cupom?",
        text: "Todos os itens serão removidos. Deseja continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Sim, cancelar!",
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch({ type: "LIMPAR_CARRINHO" });
        }
      });
    },
    F5: () => {
      Swal.fire({
        title: "Definir Quantidade",
        input: "number",
        inputValue: 1,
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const qtdFormatada = parseFloat(result.value);
          if (qtdFormatada > 0) {
            dispatch({ type: "DEFINIR_QUANTIDADE", payload: qtdFormatada });
          }
        }
      });
    },
    F6: () => {
      if (carrinho.length === 0) {
        Swal.fire(
          "Atenção",
          "Adicione itens ao cupom antes de aplicar um desconto.",
          "warning",
        );
        return;
      }

      Swal.fire({
        title: "Aplicar Desconto (R$)",
        input: "number",
        inputLabel: `Valor do desconto em reais (Total: ${formatCurrency(total)})`,
        inputValue: 0,
        showCancelButton: true,
        inputValidator: (value) => {
          if (value < 0 || value > subtotal) {
            return "Valor de desconto inválido!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch({
            type: "APLICAR_DESCONTO",
            payload: parseFloat(result.value),
          });
        }
      });
    },

    F7: () => {
      if (carrinho.length === 0) {
        Swal.fire("Atenção", "O cupom está vazio!", "warning");
        return;
      }
      Swal.fire({
        title: "Pagamento via PIX",
        text: `Total da venda: ${formatCurrency(total)}. Gerar QR Code?`,
        icon: "question",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // Aqui iria a lógica para gerar e mostrar o QR Code real
          finalizarVenda("PIX");
        }
      });
    },
    F8: () => {
      if (carrinho.length === 0) {
        Swal.fire("Atenção", "O cupom está vazio!", "warning");
        return;
      }
      Swal.fire({
        title: "Pagamento em Dinheiro",
        input: "number",
        inputLabel: `Total: ${formatCurrency(total)}. Valor recebido:`,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value || parseFloat(value) < total) {
            return "Valor insuficiente ou inválido!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const troco = parseFloat(result.value) - total;
          Swal.fire(
            "Troco",
            `O troco é de ${formatCurrency(troco)}`,
            "info",
          ).then(() => {
            finalizarVenda("Dinheiro");
          });
        }
      });
    },

    F9: () => {
      if (carrinho.length === 0) {
        Swal.fire("Atenção", "O cupom está vazio!", "warning");
        return;
      }
      Swal.fire({
        title: "Pagamento com Cartão",
        text: `Total: ${formatCurrency(total)}. Confirmar pagamento na maquininha?`,
        icon: "question",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          finalizarVenda("Cartão");
        }
      });
    },

    F10: () => {
      setMostrarF10((prev) => !prev);
    },

    F11: () => navigate("/dashboard"),

    F12: () => window.print(),

    Escape: () => {
      setMostrarF10((aberto) => {
        if (aberto) {
          return false;
        } else {
          Swal.fire({
            title: "Limpar o cupom?",
            text: "Isso irá remover todos os itens.",
            icon: "question",
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) dispatch({ type: "LIMPAR_CARRINHO" });
          });
          return false;
        }
      });
    },
  };

  useKeyboardShortcuts(acoesTeclado);

  return (
    <div className="h-full w-full bg-[#e2e8f0] flex flex-col justify-between p-2 select-none overflow-hidden">
      <BarraSuperior />

      <div className="flex-1 flex gap-3 my-2 overflow-hidden items-stretch">
        <TabelaCupom carrinho={carrinho} />
        <PainelLateral
          codigo={codigoInput}
          setCodigo={(valor) =>
            dispatch({ type: "DIGITAR_CODIGO", payload: valor })
          }
          carrinho={carrinho}
          subtotal={subtotal}
          desconto={desconto}
          total={total}
          aoBipar={lidarComBipe}
          quantidadeAtual={quantidade}
        />
      </div>

      <RodapeAtalhos />

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
                <span>{total.toFixed(2)}</span>
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
