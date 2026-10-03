import React, { useReducer, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BarraSuperior from "./components/PDV/BarraSuperior";
import TabelaCupom from "./components/PDV/TabelaCupom";
import PainelLateral from "./components/PDV/PainelLateral";
import RodapeAtalhos from "./components/PDV/RodapeAtalhos";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import {
  getProdutos,
  buscarProdutos,
  addVenda,
  setProdutos,
  getVendas,
  verificarPinAdmin,
} from "./services/tenantData";
import { formatCurrency } from "./utils/formatters";
import {
  canAddProductToCart,
  calculateUpdatedStock,
} from "./utils/operacoesSeguras";
import {
  emitirNotaFiscal,
  isConfigurado,
  validarCPF,
} from "./services/notaFiscalPaulista";
import { abrirFechamentoCaixa } from "./components/fechamentoDeCaixa";
import { imprimirCupom } from "./services/impressaoService";
import {
  getOperadorAtual,
  setOperadorAtual,
} from "./services/operadorSession";
import { useAuth } from "./components/AuthContext";
import PixQrCodeModal from "./components/PixQrCodeModal";
import {
  gerarPayloadPix,
  getPixKeyFromTenant,
  getPixHolderFromTenant,
  getMerchantCityFromTenant,
} from "./services/pixService";
import { getTenant, getTenantId } from "./hooks/useTenant";
import logoFechado from "./assets/logo.png";
import { autenticarFuncionarioPorCodigo } from "./services/tenantData"; // Ajuste o caminho se necessário

function lerEstadoCaixa(tenantId, chave) {
  const chaveTenant = `pdv_${chave}_${tenantId}`;
  const valorTenant = localStorage.getItem(chaveTenant);
  if (valorTenant !== null) return valorTenant;

  const valorLegado = localStorage.getItem(chave);
  if (valorLegado !== null) {
    const tenantPrincipalId = getTenant()?.uid || tenantId;
    localStorage.setItem(`pdv_${chave}_${tenantPrincipalId}`, valorLegado);
    localStorage.removeItem(chave);
    return tenantPrincipalId === tenantId ? valorLegado : null;
  }

  return null;
}

const estadoInicial = {
  carrinho: [],
  codigoInput: "",
  quantidade: 1,
  itemSelecionado: null,
  subtotal: 0,
  desconto: 0,
  percentualDesconto: 0,
  total: 0,
  pagamentoRecebido: 0,
};

function calcularTotais(carrinho, percentualDesconto = 0) {
  const subtotal = carrinho.reduce(
    (acc, item) => acc + item.vUnit * item.qtd,
    0,
  );
  const desconto = (subtotal * percentualDesconto) / 100;
  const total = subtotal - desconto;
  return { subtotal, desconto, total };
}

function reducer(estado, acao) {
  switch (acao.type) {
    case "DIGITAR_CODIGO":
      return { ...estado, codigoInput: acao.payload };

    case "DEFINIR_QUANTIDADE":
      return { ...estado, quantidade: acao.payload };
    case "ATUALIZAR_TOTAIS":
      const { subtotal, desconto, total } = acao.payload;
      return { ...estado, subtotal, desconto, total };
    case "LIMPAR_INPUT":
      return { ...estado, codigoInput: "", quantidade: 1 };

    case "LIMPAR_CARRINHO":
      return { ...estadoInicial };

    case "REMOVER_ITEM":
      const itemNumero = acao.payload;
      const carrinhoAtualizado = estado.carrinho.filter(
        (_, index) => index !== itemNumero - 1,
      );
      const totaisAposRemocao = calcularTotais(
        carrinhoAtualizado,
        estado.percentualDesconto,
      );
      return { ...estado, carrinho: carrinhoAtualizado, ...totaisAposRemocao };

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
      const totaisAposAdicao = calcularTotais(
        novoCarrinho,
        estado.percentualDesconto,
      );
      return {
        ...estado,
        carrinho: novoCarrinho,
        codigoInput: "",
        quantidade: 1,
        ...totaisAposAdicao,
      };

    case "APLICAR_DESCONTO":
      const percentualDesconto = acao.payload;
      const totaisComDesconto = calcularTotais(
        estado.carrinho,
        percentualDesconto,
      );
      return { ...estado, percentualDesconto, ...totaisComDesconto };

    case "DEFINIR_PAGAMENTO":
      return { ...estado, pagamentoRecebido: acao.payload };
    case "FINALIZAR_VENDA":
      return { ...estadoInicial };
    default:
      return estado;
  }
}

export default function PDV() {
  const tenantId = getTenantId() || "sem_tenant";
  const chaveCaixaFechado = `pdv_caixaFechado_${tenantId}`;
  const chaveDadosFechamento = `pdv_dadosFechamento_${tenantId}`;
  const [mostrarF10, setMostrarF10] = useState(false);
  const [termoBuscaF10, setTermoBuscaF10] = useState("");
  const [mostrarPixModal, setMostrarPixModal] = useState(false);
  const [pixPayload, setPixPayload] = useState("");
  const [caixaFechado, setCaixaFechado] = useState(
    () => lerEstadoCaixa(tenantId, "caixaFechado") === "true",
  );
  const [dadosFechamento, setDadosFechamento] = useState(() => {
    const dados = lerEstadoCaixa(tenantId, "dadosFechamento");
    return dados ? JSON.parse(dados) : null;
  });
  const vendasRealizadasRef = useRef([]);
  const [estado, dispatch] = useReducer(reducer, estadoInicial);
  const { carrinho, codigoInput, quantidade, subtotal, desconto, total } =
    estado;
  const navigate = useNavigate();
  const inputBuscaF10Ref = useRef(null);
  const { login } = useAuth();
  const [reabrindoCaixa, setReabrindoCaixa] = useState(false);
  const [produtosDoTenant, setProdutosDoTenant] = useState([]);

  useEffect(() => {
    if (mostrarF10) {
      requestAnimationFrame(() => {
        inputBuscaF10Ref.current?.focus();
        inputBuscaF10Ref.current?.select();
      });
    }
  }, [mostrarF10]);

  useEffect(() => {
    async function carregarProdutos() {
      const produtos = await getProdutos();
      setProdutosDoTenant(produtos);
    }
    carregarProdutos();
  }, []);

  const produtosFiltradosF10 = termoBuscaF10
    ? buscarProdutos(termoBuscaF10, produtosDoTenant)
    : produtosDoTenant;

  useEffect(() => {
    const inputCodigoBarras = document.getElementById("codigo-barras-input");
    const manterFoco = () => {
      const isSwalOpen = document.body.classList.contains("swal2-shown");
      if (mostrarF10) return;
      if (document.activeElement !== inputCodigoBarras && !isSwalOpen) {
        inputCodigoBarras?.focus();
      }
    };

    if (!caixaFechado && !mostrarF10) {
      manterFoco();
      document.addEventListener("focusin", manterFoco);
      return () => {
        document.removeEventListener("focusin", manterFoco);
      };
    }
  }, [mostrarF10, caixaFechado]);

  const FocusLoginInputs = ({ caixaFechado }) => {
    useEffect(() => {
      if (caixaFechado) {
        const timer = setTimeout(() => {
          const inputPin = document.getElementById("reabrir-pin");
          if (inputPin) {
            inputPin.focus();
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [caixaFechado]);
    return null;
  };

  const lidarComBipe = (codigoBipado) => {
    const produtoEncontrado = produtosDoTenant.find(
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

    const adicionarProduto = (qtdEscolhida) => {
      const validacao = canAddProductToCart(produtoEncontrado, qtdEscolhida);
      if (!validacao.allowed) {
        Swal.fire({
          icon: "warning",
          title: "Estoque indisponível",
          text:
            validacao.reason === "out_of_stock"
              ? "Este produto está sem estoque."
              : `Quantidade solicitada excede o estoque disponível (${validacao.availableStock}).`,
        });
        dispatch({ type: "LIMPAR_INPUT" });
        return;
      }

      dispatch({
        type: "ADICIONAR_PRODUTO",
        payload: { produto: produtoEncontrado, quantidade: qtdEscolhida },
      });
    };

    const qtdInicial = quantidade > 0 ? quantidade : 1;
    if (produtoEncontrado.solicitarQuantidade) {
      Swal.fire({
        title: `Quantidade para ${produtoEncontrado.descricao}`,
        input: "number",
        inputValue: qtdInicial,
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
          adicionarProduto(parseFloat(result.value));
        }
      });
      return;
    }

    adicionarProduto(qtdInicial);
  };

  const finalizarVenda = async (metodo) => {
    let nfpConfigurada = false;
    try {
      nfpConfigurada = await isConfigurado();
    } catch (error) {
      console.error("Não foi possível carregar as configurações fiscais:", error);
    }
    let valorPago = total;
    let troco = 0;

    let { value: querCpf } = await Swal.fire({
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
        inputValidator: (value) => {
          if (value && !validarCPF(value)) {
            return "CPF inválido! Digite um CPF válido.";
          }
        },
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
      valorPago = parseFloat(valorRecebido);
      troco = valorPago - total;
      await Swal.fire("Troco", `O troco é de ${formatCurrency(troco)}`, "info");
    } else if (metodo === "Cartão") {
      const tenant = getTenant();
      const cartaoProvedor = tenant?.cartaoProvedor || "manual_pos";

      const { processarPagamento } =
        await import("./services/pagamentoService");

      let paymentResult;
      try {
        if (cartaoProvedor === "mercadopago") {
          const mercadoPagoDeviceId = tenant?.mercadoPagoDeviceId;

          if (!mercadoPagoDeviceId) {
            Swal.fire({
              icon: "warning",
              title: "Mercado Pago não configurado",
              text: "Configure seu Access Token e Device ID do Mercado Pago nas Configurações da Loja para aceitar pagamentos com cartão.",
            });
            return;
          }

          Swal.fire({
            title: "Aguardando Pagamento no Cartão...",
            html: `Total: <strong>${formatCurrency(total)}</strong><br>
                   Por favor, insira ou passe o cartão na maquininha.`,
            icon: "info",
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          paymentResult = await processarPagamento({
            venda: {
              tenantId: tenant.id,
              amount: total,
              description: "Venda PDV",
            },
            formaPagamento: {
              provedor: "mercadopago",
              deviceId: mercadoPagoDeviceId,
            },
          });

          Swal.close();
        } else {
          const { value: confirmarPagamento } = await Swal.fire({
            title: "Pagamento na Maquininha",
            html: `Total: <strong>${formatCurrency(total)}</strong><br><br>
                   Passe o cartão na maquininha física.<br>
                   Após a aprovação, confirme para finalizar a venda.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Pagamento Aprovado",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#dc2626",
          });

          if (!confirmarPagamento) {
            return;
          }

          paymentResult = await processarPagamento({
            venda: {
              tenantId: tenant.id,
              amount: total,
              description: "Venda PDV",
            },
            formaPagamento: {
              provedor: cartaoProvedor,
            },
          });
        }

        if (!paymentResult.success) {
          Swal.fire(
            "Erro no Pagamento",
            paymentResult.error ||
              "Não foi possível processar o pagamento com cartão.",
            "error",
          );
          return;
        }
      } catch (error) {
        Swal.fire(
          "Erro de Conexão",
          "Não foi possível comunicar com o serviço de pagamento. Verifique sua conexão.",
          "error",
        );
        return;
      }
    }

    let notaEmitida = null;
    if (cpfCliente && nfpConfigurada) {
      try {
        const dadosVenda = {
          carrinho: [...carrinho],
          total,
          subtotal,
          desconto,
          metodo,
        };
        const resultado = await emitirNotaFiscal(dadosVenda, cpfCliente);
        notaEmitida = resultado;
      } catch (error) {
        console.error("A emissão fiscal falhou:", error);
        await Swal.fire({
          icon: "error",
          title: "NFC-e não emitida",
          text: `${error.message} A venda será registrada, mas não existe autorização fiscal para entregar ao cliente.`,
        });
      }
    } else if (cpfCliente) {
      await Swal.fire({
        icon: "warning",
        title: "NFC-e não emitida",
        text: "Os dados fiscais da empresa não foram carregados ou estão incompletos. A venda será registrada sem emissão de documento fiscal.",
      });
    }

    const produtosAtualizados = carrinho.reduce((acc, item) => {
      const produtoOriginal = produtosDoTenant.find(
        (p) => p.codigo === item.codigo,
      );
      if (!produtoOriginal) return acc;

      const produtoAtualizado = calculateUpdatedStock(
        produtoOriginal,
        item.qtd,
      );
      acc.push(produtoAtualizado);
      return acc;
    }, []);

    const vendaAtual = {
      carrinho: [...carrinho],
      total,
      subtotal,
      desconto,
      metodo,
      valorPago,
      troco,
      cpfCliente: cpfCliente || null,
      data: new Date().toISOString(),
      operador: getOperadorAtual()?.nome || "Sistema",
      notaFiscal: notaEmitida
        ? {
            numeroNota: notaEmitida.numeroNota,
            chaveAcesso: notaEmitida.chaveAcesso,
            protocolo: notaEmitida.protocolo,
          }
        : null,
    };

    await Swal.fire({
      icon: "success",
      title: "Venda Finalizada!",
      text: `Pagamento via ${metodo} confirmado.`,
      timer: 1500,
      showConfirmButton: false,
    });

    const { value: querImprimir } = await Swal.fire({
      title: "Imprimir Cupom?",
      text: "Deseja imprimir o cupom da venda?",
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "Sim, imprimir",
      denyButtonText: "Não",
    });

    if (querImprimir) {
      imprimirCupom(vendaAtual);
    }

    vendasRealizadasRef.current = [...vendasRealizadasRef.current, vendaAtual];
    addVenda(vendaAtual);

    if (produtosAtualizados.length > 0) {
      const produtosPersistidos = produtosDoTenant.map((produto) => {
        const atualizado = produtosAtualizados.find(
          (p) => p.codigo === produto.codigo,
        );
        return atualizado || produto;
      });
      await setProdutos(produtosPersistidos);
      setProdutosDoTenant(produtosPersistidos);
    }

    dispatch({ type: "FINALIZAR_VENDA" });
  };

  const abrirPixQrCode = () => {
    if (carrinho.length === 0) {
      Swal.fire("Atenção", "O cupom está vazio!", "warning");
      return;
    }

    const pixKey = getPixKeyFromTenant();

    if (!pixKey) {
      Swal.fire({
        icon: "warning",
        title: "Chave PIX não configurada",
        text: "Configure sua chave PIX nas Configurações da Loja.",
      });
      return;
    }

    try {
      const holderName = getPixHolderFromTenant();
      const city = getMerchantCityFromTenant();
      const txId = String(Date.now()).slice(-8);

      const payload = gerarPayloadPix({
        pixKey,
        amount: total,
        merchantName: holderName,
        merchantCity: city,
        description: "VENDA PDV",
        txId,
      });

      setPixPayload(payload);
      setMostrarPixModal(true);
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      Swal.fire("Erro", error.message, "error");
    }
  };

  const handleReabrirCaixa = async () => {
    setReabrindoCaixa(true);
    const pinField = document.getElementById("reabrir-pin");
    const senhaField = document.getElementById("reabrir-senha");

    const pin = pinField?.value?.trim();
    const senha = senhaField?.value?.trim();

    if (!pin || !senha) {
      Swal.fire("Atenção", "Preencha o PIN e a Senha!", "warning");
      setReabrindoCaixa(false);
      return;
    }

    try {
      // ✅ Autentica usando o PIN e a Senha do funcionário/operador cadastrado
      const funcionario = await autenticarFuncionarioPorCodigo(pin, senha);

      // (Opcional) Se quiser restringir a reabertura apenas para Gerente/Admin:
      // const cargo = String(funcionario.cargo || "").toLowerCase();
      // if (cargo !== "admin" && cargo !== "gerente") {
      //   Swal.fire("Acesso Negado", "Apenas Gerentes ou Administradores podem reabrir o caixa.", "error");
      //   setReabrindoCaixa(false);
      //   return;
      // }

      // ✅ Define o operador atual com os dados do funcionário autenticado
      setOperadorAtual({
        codigo: funcionario.codigo,
        nome: funcionario.nome,
        cargo: funcionario.cargo || "caixa",
      });

      setCaixaFechado(false);
      setDadosFechamento(null);
      localStorage.removeItem(chaveCaixaFechado);
      localStorage.removeItem(chaveDadosFechamento);
      vendasRealizadasRef.current = [];

      Swal.fire(
        "Sucesso!",
        `Caixa reaberto com sucesso por ${funcionario.nome || "Operador"}.`,
        "success",
      );
    } catch (error) {
      console.error("Erro ao reabrir caixa:", error);
      Swal.fire(
        "Acesso Negado",
        error.message || "PIN ou senha inválidos!",
        "error",
      );
    } finally {
      setReabrindoCaixa(false);
    }
  };

  const acoesTeclado = {
    F2: () => {
      if (carrinho.length === 0) return;
      Swal.fire({
        title: "Cancelar Item",
        input: "number",
        inputLabel: "Digite o número do item:",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const itemNum = parseInt(result.value, 10);
          if (itemNum > 0 && itemNum <= carrinho.length) {
            dispatch({ type: "REMOVER_ITEM", payload: itemNum });
          }
        }
      });
    },

    F3: () => {
      if (carrinho.length === 0) return;
      Swal.fire({
        title: "Cancelar Cupom?",
        showCancelButton: true,
        confirmButtonColor: "#d33",
      }).then((res) => {
        if (res.isConfirmed) dispatch({ type: "LIMPAR_CARRINHO" });
      });
    },

    F4: async () => {
      const autorizado = await verificarPinAdmin();

      if (autorizado) {
        setOperadorAtual(null);
        navigate("/dashboard");
      }
    },

    F5: () => {
      Swal.fire({
        title: "Definir Quantidade",
        input: "number",
        inputValue: 1,
        showCancelButton: true,
      }).then((res) => {
        if (res.isConfirmed && res.value > 0) {
          dispatch({
            type: "DEFINIR_QUANTIDADE",
            payload: parseFloat(res.value),
          });
        }
      });
    },

    F6: () => {
      if (carrinho.length === 0) return;
      Swal.fire({
        title: "Aplicar Desconto (R$)",
        input: "number",
        inputValue: 0,
        showCancelButton: true,
      }).then((res) => {
        if (res.isConfirmed && res.value >= 0) {
          dispatch({
            type: "APLICAR_DESCONTO",
            payload: parseFloat(res.value),
          });
        }
      });
    },

    F7: () => abrirPixQrCode(),

    F8: () => {
      if (carrinho.length > 0) finalizarVenda("Dinheiro");
    },

    F9: () => {
      if (carrinho.length > 0) finalizarVenda("Cartão");
    },

    F10: () => {
      setTermoBuscaF10("");
      setMostrarF10((prev) => !prev);
    },

    F12: async () => {
      let vendasDoDia = [];

      try {
        const todasVendas = await getVendas();
        vendasDoDia = todasVendas.filter((v) => {
          return new Date(v.data).toDateString() === new Date().toDateString();
        });
      } catch (error) {
        console.warn("Erro ao carregar vendas do dia:", error);
      }

      const vendasSessao = vendasRealizadasRef.current.filter((v) => {
        return new Date(v.data).toDateString() === new Date().toDateString();
      });

      const vendasCombinadas = [...vendasDoDia];
      for (const vendaSessao of vendasSessao) {
        const jaExiste = vendasCombinadas.some(
          (v) =>
            v.id === vendaSessao.id || v.timestamp === vendaSessao.timestamp,
        );
        if (!jaExiste) {
          vendasCombinadas.push(vendaSessao);
        }
      }

      abrirFechamentoCaixa(vendasCombinadas, (dadosFechamento) => {
        setDadosFechamento(dadosFechamento);
        setCaixaFechado(true);
        localStorage.setItem(chaveCaixaFechado, "true");
        localStorage.setItem(
          chaveDadosFechamento,
          JSON.stringify(dadosFechamento),
        );
        dispatch({ type: "LIMPAR_CARRINHO" });
      });
    },
    Escape: () => {
      if (mostrarF10) setMostrarF10(false);
    },
  };

  useKeyboardShortcuts(acoesTeclado, mostrarF10 || caixaFechado);

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
          disabled={caixaFechado}
          aoBipar={lidarComBipe}
          quantidadeAtual={quantidade}
        />
      </div>

      <RodapeAtalhos />

      {caixaFechado && <FocusLoginInputs caixaFechado={caixaFechado} />}

      {caixaFechado && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6 text-center flex flex-col items-center">
              <img
                src={logoFechado}
                alt="Logo do Estabelecimento"
                className="w-20 h-20 object-contain mb-3 rounded-full bg-white p-1 shadow"
              />
              <h2 className="text-2xl font-bold tracking-wide">
                CAIXA FECHADO
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {dadosFechamento?.data
                  ? `Fechado em ${new Date(dadosFechamento.data).toLocaleString("pt-BR")}`
                  : "Sistema bloqueado"}
              </p>
            </div>

            <div className="p-6">
              {dadosFechamento && (
                <div className="bg-slate-50 rounded-lg p-3 mb-4 font-mono text-xs border border-slate-100">
                  <div className="flex justify-between"></div>
                </div>
              )}

              <p className="text-xs font-semibold text-slate-900 text-center mb-3">
                <span>
                  Informe as credenciais do operador para reabrir o caixa:
                </span>
              </p>

              <div className="space-y-3">
                <input
                  id="reabrir-pin"
                  type="password"
                  placeholder="PIN do operador"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  id="reabrir-senha"
                  type="password"
                  placeholder="Senha"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleReabrirCaixa();
                  }}
                />
                <button
                  onClick={handleReabrirCaixa}
                  disabled={reabrindoCaixa}
                  className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {reabrindoCaixa ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Reabrindo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-unlock"></i> Abrir Caixa / Entrar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarPixModal && pixPayload ? (
        <PixQrCodeModal
          payloadPix={pixPayload}
          valor={total}
          onConfirmar={() => {
            setMostrarPixModal(false);
            finalizarVenda("PIX");
          }}
          onCancelar={() => {
            setMostrarPixModal(false);
            setPixPayload("");
          }}
        />
      ) : mostrarPixModal ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Erro ao carregar QR Code
            </h2>
            <p className="text-slate-600 mb-4">
              Payload PIX não foi gerado corretamente.
            </p>
            <button
              onClick={() => {
                setMostrarPixModal(false);
                setPixPayload("");
              }}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      {mostrarF10 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-text">
          <div className="f10-modal-container bg-white w-full max-w-2xl rounded shadow-2xl border-2 border-[#1e3a8a] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-[#1e3a8a] text-white p-3 font-mono font-bold flex justify-between items-center">
              <span>[F10] CONSULTA DE PRODUTOS</span>
              <button
                onClick={() => setMostrarF10(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs"
              >
                ESC / FECHAR
              </button>
            </div>

            <div className="p-2 bg-slate-100 border-b border-slate-300">
              <input
                ref={inputBuscaF10Ref}
                type="text"
                placeholder="Buscar por código ou descrição..."
                value={termoBuscaF10}
                onChange={(e) => setTermoBuscaF10(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none font-mono text-sm"
              />
            </div>

            <div className="p-2 overflow-y-auto flex-1 bg-slate-50 font-mono text-sm">
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
                      className="border-b border-slate-200 hover:bg-blue-50"
                    >
                      <td className="p-2 font-bold">{produto.codigo}</td>
                      <td className="p-2 truncate">{produto.descricao}</td>
                      <td className="p-2 text-right font-bold text-blue-900">
                        {produto.preco.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
