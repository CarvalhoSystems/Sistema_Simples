import React, { useReducer, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BarraSuperior from "./components/PDV/BarraSuperior";
import TabelaCupom from "./components/PDV/TabelaCupom";
import PainelLateral from "./components/PDV/PainelLateral";
import RodapeAtalhos from "./components/PDV/RodapeAtalhos";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { BANCO_PRODUTOS } from "./mockData";
import { formatCurrency } from "./utils/formatters";

const estadoInicial = {
  carrinho: [],
  codigoInput: "",
  quantidade: 1,
  itemSelecionado: null,
  subtotal: 0,
  desconto: 0,
  total: 0,
  pagamentoRecebido: 0,
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
      return { ...estadoInicial };

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
      return { ...estado, desconto: acao.payload };

    case "DEFINIR_PAGAMENTO":
      return {
        ...estado,
        pagamentoRecebido: acao.payload,
      };

    case "FINALIZAR_VENDA":
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
  const [termoBuscaF10, setTermoBuscaF10] = useState("");
  const [estado, dispatch] = useReducer(reducer, estadoInicial);
  const { carrinho, codigoInput, quantidade, subtotal, desconto, total } =
    estado;
  const navigate = useNavigate();
  const inputBuscaF10Ref = useRef(null);

  // Efeito para focar o input de busca quando o modal F10 é aberto
  useEffect(() => {
    if (mostrarF10 && inputBuscaF10Ref.current) {
      setTimeout(() => inputBuscaF10Ref.current.focus(), 100);
    }
  }, [mostrarF10]);

  // Filtra os produtos para o modal F10
  const produtosFiltradosF10 = BANCO_PRODUTOS.filter(
    (p) =>
      p.descricao.toLowerCase().includes(termoBuscaF10.toLowerCase()) ||
      p.codigo.toLowerCase().includes(termoBuscaF10.toLowerCase()),
  );

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

  // CORREÇÃO 1: Efeito do foco do código de barras ignorando quando F10 está aberto
  useEffect(() => {
    const inputCodigoBarras = document.getElementById("codigo-barras-input");

    const manterFoco = () => {
      // Se a busca F10 estiver aberta, não rouba o foco de volta!
      if (mostrarF10) return;

      const isSwalOpen = document.body.classList.contains("swal2-shown");
      const activeElement = document.activeElement;
      const isInsideSwal = activeElement?.closest(".swal2-container");

      if (
        !isSwalOpen &&
        !isInsideSwal &&
        document.activeElement !== inputCodigoBarras
      ) {
        inputCodigoBarras?.focus();
      }
    };

    manterFoco();

    const observer = new MutationObserver(() => {
      manterFoco();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [mostrarF10]); // Dependência adicionada aqui

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
        didOpen: () => {
          const inputSwal = Swal.getInput();
          if (inputSwal) {
            inputSwal.focus();
            inputSwal.select();
          }
        },
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
      return;
    }

    dispatch({
      type: "ADICIONAR_PRODUTO",
      payload: { produto: produtoEncontrado, quantidade: qtdFinal },
    });
  };

  const finalizarVenda = async (metodo) => {
    const { value: querCpf } = await Swal.fire({
      title: "CPF na nota?",
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "Sim",
      denyButtonText: "Não",
    });

    let cpfCliente = null;
    if (querCpf) {
      const { value: cpfInput } = await Swal.fire({
        title: "Digite o CPF",
        input: "text",
        inputPlaceholder: "000.000.000-00",
        showCancelButton: true,
      });
      if (cpfInput) {
        cpfCliente = cpfInput;
      } else {
        return;
      }
    }

    if (metodo === "Dinheiro") {
      const { value: valorRecebido } = await Swal.fire({
        title: "Pagamento em Dinheiro",
        input: "number",
        inputLabel: `Total: ${formatCurrency(total)}. Valor recebido:`,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value || parseFloat(value) < total) {
            return "Valor insuficiente ou inválido!";
          }
        },
      });

      if (!valorRecebido) return;

      const troco = parseFloat(valorRecebido) - total;
      await Swal.fire("Troco", `O troco é de ${formatCurrency(troco)}`, "info");
    } else if (metodo === "PIX") {
      const { isConfirmed } = await Swal.fire({
        title: "Pagamento via PIX",
        text: `Total da venda: ${formatCurrency(total)}. Gerar QR Code?`,
        icon: "question",
        showCancelButton: true,
      });
      if (!isConfirmed) return;
    } else if (metodo === "Cartão") {
      const { isConfirmed } = await Swal.fire({
        title: "Pagamento com Cartão",
        text: `Total: ${formatCurrency(
          total,
        )}. Confirmar pagamento na maquininha?`,
        icon: "question",
        showCancelButton: true,
      });
      if (!isConfirmed) return;
    }

    await Swal.fire({
      icon: "success",
      title: "Venda Finalizada!",
      text: `Pagamento via ${metodo} confirmed.`,
      timer: 1500,
      showConfirmButton: false,
    });

    const areaImpressao = document.getElementById("cupom-impressao");
    if (areaImpressao) {
      window.print();
    }
    dispatch({ type: "FINALIZAR_VENDA" });
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
        inputLabel: `Valor do desconto em reais (Total: ${formatCurrency(
          total,
        )})`,
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
          finalizarVenda("PIX");
        }
      });
    },
    F8: () => {
      if (carrinho.length === 0) {
        Swal.fire("Atenção", "O cupom está vazio!", "warning");
        return;
      }
      finalizarVenda("Dinheiro");
    },

    F9: () => {
      if (carrinho.length === 0) {
        Swal.fire("Atenção", "O cupom está vazio!", "warning");
        return;
      }
      Swal.fire({
        title: "Pagamento com Cartão",
        text: `Total: ${formatCurrency(
          total,
        )}. Confirmar pagamento na maquininha?`,
        icon: "question",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          finalizarVenda("Cartão");
        }
      });
    },

    F10: () => {
      setTermoBuscaF10("");
      setMostrarF10((prev) => !prev);
    },

    F11: () => navigate("/dashboard"),

    F12: () => window.print(),

    Escape: () => {
      if (mostrarF10) {
        setMostrarF10(false);
        return;
      }
    },
  };

  useKeyboardShortcuts(acoesTeclado, mostrarF10);

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

      {/* CORREÇÃO 2: Adicionada a classe `select-text` no wrapper do modal */}
      {mostrarF10 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 f10-modal-container select-text">
          <div className="bg-white w-full max-w-2xl rounded shadow-2xl border-2 border-[#1e3a8a] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-[#1e3a8a] text-white p-3 font-mono font-bold flex justify-between items-center">
              <span>[F10] CONSULTA DE PRODUTOS CADASTRADOS</span>
              <button
                onClick={() => setMostrarF10(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs transition-colors"
              >
                ESC / FECHAR
              </button>
            </div>

            {/* Input de Busca */}
            <div className="p-2 bg-slate-100 border-b border-slate-300">
              <input
                ref={inputBuscaF10Ref}
                type="text"
                placeholder="Digite para buscar por código ou descrição..."
                value={termoBuscaF10}
                onChange={(e) => setTermoBuscaF10(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="p-2 overflow-y-auto flex-1 bg-slate-50 font-mono text-sm min-h-[300px]">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-200 text-[#1e3a8a] border-b-2 border-slate-300">
                    <th className="p-2 text-left w-1/4">CÓDIGO</th>
                    <th className="p-2 text-left w-1/2">DESCRIÇÃO</th>
                    <th className="p-2 text-right w-1/4">PREÇO (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltradosF10.map((produto, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-200 hover:bg-blue-50 text-slate-700 transition-colors"
                    >
                      <td className="p-2 font-bold">{produto.codigo}</td>
                      <td className="p-2 truncate">{produto.descricao}</td>
                      <td className="p-2 text-right font-bold text-blue-900 whitespace-nowrap">
                        {produto.preco.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-100 p-2 text-center text-xs text-slate-500 font-mono border-t border-slate-200">
              Pressione <strong className="text-[#1e3a8a]">F10</strong> ou{" "}
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
