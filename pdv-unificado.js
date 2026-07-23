// Sistema PDV JavaScript - Versão Unificada
// Combina funcionalidades do PDV padrão com Firebase integration

import { authManager, dbManager } from "./firebase-config.js";
import { NFePrinter } from "./nfe-printer.js";

// --- Estado da Aplicação ---
// Centraliza o estado para evitar o uso excessivo de variáveis globais.
const AppState = {
  products: [],
  categories: [],
  cart: [],
  currentSaleId: null,
  isHoldingSale: false,
  clienteCpf: null,
  cpfNotaDefinido: false,
};

// Instância do NFePrinter
const nfePrinter = new NFePrinter();

// --- Funções de Utilidade e Formatação ---

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, type = "info") {
  if (typeof Swal === "undefined") {
    console.warn("SweetAlert2 (Swal) não está disponível. Mensagem:", message);
    return;
  }

  const iconMap = {
    info: "info",
    success: "success",
    warning: "warning",
    danger: "error",
    error: "error",
  };

  Swal.fire({
    icon: iconMap[type] || "info",
    title: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
}

// --- Funções de Validação e Coleta de CPF ---

function limparCpf(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function validarCpf(cpf) {
  const cpfLimpo = limparCpf(cpf);
  if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) return false;

  const calcDigito = (base, fator) => {
    let total = base
      .split("")
      .reduce((acc, digit, i) => acc + parseInt(digit) * (fator - i), 0);
    const resto = (total * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcDigito(cpfLimpo.slice(0, 9), 10);
  const digito2 = calcDigito(cpfLimpo.slice(0, 10), 11);
  return (
    parseInt(cpfLimpo[9]) === digito1 && parseInt(cpfLimpo[10]) === digito2
  );
}

async function confirmarCpfNaNota() {
  if (typeof Swal === "undefined") return false;

  const resposta = await Swal.fire({
    title: "Deseja CPF na nota?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sim",
    cancelButtonText: "Não",
  });

  return resposta.isConfirmed;
}

async function solicitarCpfCliente() {
  if (typeof Swal === "undefined") return null;

  const { value: cpf, isConfirmed } = await Swal.fire({
    title: "CPF na nota",
    input: "text",
    inputPlaceholder: "Digite o CPF (somente números)",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    inputAttributes: {
      inputmode: "numeric",
      maxlength: "14",
    },
    preConfirm: (valor) => {
      const cpfLimpo = limparCpf(valor);
      if (!validarCpf(cpfLimpo)) {
        Swal.showValidationMessage("CPF inválido. Verifique os dígitos.");
        return false;
      }
      return cpfLimpo;
    },
  });

  return isConfirmed ? cpf : null;
}

async function verificarCpfSeNecessario() {
  if (AppState.cpfNotaDefinido) return;

  if (await confirmarCpfNaNota()) {
    AppState.clienteCpf = await solicitarCpfCliente();
  } else {
    AppState.clienteCpf = null;
  }

  AppState.cpfNotaDefinido = true;
}

// --- Lógica de Produtos e Estoque ---

function getProductById(productId) {
  return AppState.products.find((p) => p.id === productId);
}

function getProductByCode(codigo) {
  const codigoLimpo = String(codigo || "").trim();
  return AppState.products.find((p) => String(p.code) === codigoLimpo);
}

function getProductStatus(product) {
  if (!product) return "out_of_stock";
  if (product.stock === 0) return "out_of_stock";
  if (product.stock <= product.minStock) return "low_stock";
  return "in_stock";
}

// --- Lógica do Carrinho (Cart) ---

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const existingItem = AppState.cart.find(
    (item) => item.productId === productId,
  );
  const currentQty = existingItem ? existingItem.quantity : 0;

  if (currentQty + 1 > product.stock) {
    showToast(
      `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`,
      "warning",
    );
    return;
  }

  if (existingItem) {
    existingItem.quantity++;
  } else {
    AppState.cart.push({
      id: generateId(),
      productId: productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      discount: 0,
    });
  }

  updateUI();
  showToast(`${product.name} adicionado ao carrinho!`, "success");
}

function updateQuantity(itemId, change) {
  const item = AppState.cart.find((i) => i.id === itemId);
  if (!item) return;

  const newQuantity = item.quantity + change;
  if (newQuantity < 1) {
    removeFromCart(itemId);
    return;
  }

  const product = getProductById(item.productId);
  if (newQuantity > product.stock) {
    showToast("Quantidade excede o estoque disponível!", "warning");
    return;
  }

  item.quantity = newQuantity;
  updateUI();
}

function setQuantity(itemId, quantityStr) {
  const item = AppState.cart.find((i) => i.id === itemId);
  if (!item) return;

  const newQuantity = parseInt(quantityStr, 10);
  if (isNaN(newQuantity) || newQuantity < 1) {
    item.quantity = 1; // Reseta para 1 se o valor for inválido
  } else {
    const product = getProductById(item.productId);
    if (newQuantity > product.stock) {
      showToast("Quantidade excede o estoque disponível!", "warning");
      item.quantity = product.stock; // Ajusta para o máximo em estoque
    } else {
      item.quantity = newQuantity;
    }
  }

  updateUI();
}

function removeFromCart(itemId) {
  AppState.cart = AppState.cart.filter((item) => item.id !== itemId);
  updateUI();
}

function clearCart() {
  if (AppState.cart.length === 0) return;

  Swal.fire({
    title: "Limpar Carrinho",
    text: "Deseja remover todos os itens do carrinho?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, limpar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      AppState.cart = [];
      updateUI();
      showToast("Carrinho limpo!", "info");
    }
  });
}

// --- Renderização e Atualização da UI ---

function updateUI() {
  renderCart();
  renderPaymentSummary();
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartEmptyMessage = document.getElementById("cartEmpty");
  const cartTableBody = document.getElementById("cartTableBody");

  if (AppState.cart.length === 0) {
    if (cartItemsContainer) cartItemsContainer.style.display = "none";
    if (cartEmptyMessage) cartEmptyMessage.style.display = "flex";
    if (cartTableBody) {
      cartTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: #666; padding: 40px;">
            <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
            Carrinho vazio
          </td>
        </tr>`;
    }
  } else {
    if (cartItemsContainer) {
      cartItemsContainer.style.display = "block";
      cartItemsContainer.innerHTML = AppState.cart
        .map((item) => {
          const totalWithDiscount =
            item.price * item.quantity * (1 - (item.discount || 0) / 100);
          return `
          <div class="cart-item" data-item-id="${item.id}">
              <div class="cart-item-image"><i class="fas fa-box"></i></div>
              <div class="cart-item-info">
                  <h4>${item.name}</h4>
                  <p>${formatCurrency(item.price)} x ${item.quantity}</p>
                  ${item.discount > 0 ? `<p style="color: var(--danger-color);">Desconto: ${item.discount}%</p>` : ""}
              </div>
              <div class="cart-item-actions">
                  <div class="cart-item-quantity">
                      <button class="btn-qty-minus">-</button>
                      <input type="number" value="${item.quantity}" min="1" class="input-qty">
                      <button class="btn-qty-plus">+</button>
                  </div>
                  <div class="cart-item-price">${formatCurrency(totalWithDiscount)}</div>
                  <button class="cart-item-remove">
                      <i class="fas fa-trash"></i> Remover
                  </button>
              </div>
          </div>`;
        })
        .join("");
    }
    if (cartEmptyMessage) cartEmptyMessage.style.display = "none";

    if (cartTableBody) {
      cartTableBody.innerHTML = AppState.cart
        .map(
          (item, index) => `
            <tr data-item-id="${item.id}">
                <td>${index + 1}</td>
                <td>${item.productId}</td>
                <td>${item.name}</td>
                <td>
                    <button class="btn-qty btn-minus btn-qty-minus"><i class="fas fa-minus"></i></button>
                    <span style="margin: 0 10px;">${item.quantity}</span>
                    <button class="btn-qty btn-plus btn-qty-plus"><i class="fas fa-plus"></i></button>
                </td>
                <td>${formatCurrency(item.price)}</td>
                <td>
                    <button class="btn-qty btn-minus cart-item-remove"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`,
        )
        .join("");
    }
  }
}

function getTotals() {
  const subtotal = AppState.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalDiscount = AppState.cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    return sum + (itemTotal * (item.discount || 0)) / 100;
  }, 0);
  const total = subtotal - totalDiscount;
  return { subtotal, totalDiscount, total };
}

function renderPaymentSummary() {
  const { subtotal, totalDiscount, total } = getTotals();

  document.getElementById("subtotalAmount").textContent =
    formatCurrency(subtotal);
  document.getElementById("discountAmount").textContent =
    formatCurrency(totalDiscount);
  document.getElementById("taxAmount").textContent = formatCurrency(0); // Lógica de imposto pode ser adicionada aqui
  document.getElementById("totalAmount").textContent = formatCurrency(total);
  document.getElementById("pdv-total").textContent = formatCurrency(total);

  // Atualizar valores nos inputs de pagamento
  const pixAmount = document.getElementById("pixAmount");
  if (pixAmount) pixAmount.textContent = formatCurrency(total);

  calculateChange();
  updateSplitPayment();
  updateCardAmount();
}

function renderProducts(searchTerm = "") {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const searchLower = searchTerm.toLowerCase();

  if (!searchLower.trim()) {
    grid.style.display = "none";
    return;
  }

  const filteredProducts = AppState.products
    .filter(
      (product) =>
        (product.name?.toLowerCase() || "").includes(searchLower) ||
        (product.code?.toLowerCase() || "").includes(searchLower),
    )
    .slice(0, 10); // Limita a 10 para performance

  grid.style.display = "grid";

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 2rem; grid-column: 1 / -1;">
        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <h4>Nenhum produto encontrado</h4>
        <p>Procure por nome ou código de barras</p>
      </div>`;
  } else {
    grid.innerHTML = filteredProducts
      .map((product) => {
        const category = AppState.categories.find(
          (c) => c.id == product.categoryId,
        );
        const status = getProductStatus(product);
        const statusClass = {
          in_stock: "in-stock",
          low_stock: "low-stock",
          out_of_stock: "out-of-stock",
        }[status];

        return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-card-image"><i class="fas fa-box"></i></div>
          <div class="product-card-info">
            <h4>${product.name}</h4>
            <span class="product-card-category" style="border-color: ${category?.color}20; background: ${category?.color}10; color: ${category?.color}">
              ${category?.name || "Sem categoria"}
            </span>
            <div class="product-card-price">${formatCurrency(product.price)}</div>
            <div class="product-card-stock ${statusClass}">
              ${status === "in_stock" ? "✓" : status === "low_stock" ? "⚠" : "✗"}
              ${product.stock} em estoque
            </div>
          </div>
        </div>`;
      })
      .join("");
  }
}

// --- Lógica de Pagamento ---

function selectPaymentMethod(method) {
  document
    .querySelectorAll(".pay-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.pay-btn[data-method="${method}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  const paymentGroups = {
    cash: "cashInputGroup",
    card: "cardOptions",
    split: "splitPayment",
    pix: "pixAmountDisplay",
  };

  Object.values(paymentGroups).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const activeGroup = document.getElementById(paymentGroups[method]);
  if (activeGroup) activeGroup.style.display = "block";

  if (method === "pix") {
    generatePixPayment();
  }
}

function calculateChange() {
  const { total } = getTotals();
  const cashReceived =
    parseFloat(document.getElementById("cashReceived").value) || 0;
  const change = cashReceived > total ? cashReceived - total : 0;

  const changeAmountEl = document.getElementById("changeAmount");
  if (changeAmountEl) {
    changeAmountEl.textContent = formatCurrency(change);
    changeAmountEl.style.color =
      change > 0 ? "var(--success-color)" : "var(--text-light)";
  }
}

function updateSplitPayment() {
  const { total } = getTotals();
  const cashAmount =
    parseFloat(document.getElementById("splitCash").value) || 0;
  const cardInput = document.getElementById("splitCard");

  if (cashAmount >= total) {
    cardInput.value = "0.00";
  } else {
    cardInput.value = (total - cashAmount).toFixed(2);
  }
}

function updateCardAmount() {
  const { total } = getTotals();
  const cardAmountInput = document.getElementById("cardAmount");
  if (cardAmountInput) {
    cardAmountInput.value = total.toFixed(2);
  }
}

async function finalizeSale() {
  if (AppState.cart.length === 0) {
    showToast("Adicione produtos ao carrinho antes de finalizar!", "warning");
    return;
  }

  const paymentMethod =
    document.querySelector(".pay-btn.active")?.dataset.method;
  if (!paymentMethod) {
    showToast("Selecione um método de pagamento.", "warning");
    return;
  }

  const { total } = getTotals();
  let paymentValid = true;

  if (paymentMethod === "cash") {
    const cashReceived =
      parseFloat(document.getElementById("cashReceived").value) || 0;
    if (cashReceived < total) {
      showToast("Valor recebido insuficiente!", "warning");
      paymentValid = false;
    }
  } else if (paymentMethod === "split") {
    const cashAmount =
      parseFloat(document.getElementById("splitCash").value) || 0;
    const cardAmount =
      parseFloat(document.getElementById("splitCard").value) || 0;
    if (Math.abs(cashAmount + cardAmount - total) > 0.01) {
      showToast(
        "Valores do pagamento dividido não correspondem ao total.",
        "warning",
      );
      paymentValid = false;
    }
  }

  if (!paymentValid) return;

  // Sempre perguntar CPF na finalização
  if (await confirmarCpfNaNota()) {
    AppState.clienteCpf = await solicitarCpfCliente();
  } else {
    AppState.clienteCpf = null;
  }

  // Se o CPF for necessário mas não foi preenchido, interrompe.
  if (
    AppState.clienteCpf === null &&
    AppState.cpfNotaDefinido &&
    !AppState.clienteCpf
  ) {
    // O usuário optou por não informar o CPF após a solicitação.
    // Se for obrigatório, adicione uma lógica de interrupção aqui.
  }

  await processSale(paymentMethod);
}

async function processSale(paymentMethod) {
  const storeConfig = await dbManager.getStoreSettings();
  const { subtotal, total } = getTotals();

  const sale = {
    id: generateId(),
    date: new Date().toISOString(),
    items: AppState.cart.map((item) => ({ ...item })), // Clona os itens
    subtotal,
    total,
    paymentMethod,
    paymentDetails: getPaymentDetails(paymentMethod),
    customer: {
      cpf: AppState.clienteCpf || "Não informado",
    },
    storeInfo: {
      name: storeConfig?.storeName || "Minha Loja",
      cnpj: storeConfig?.storeCnpj || "00.000.000/0000-00",
      address: storeConfig?.storeAddress || "",
      footer: storeConfig?.receiptMessage || "Obrigado pela preferência!",
    },
  };

  try {
    await dbManager.addSale(sale);

    // Atualizar estoque no Firebase
    const stockUpdates = AppState.cart.map((item) => {
      const product = getProductById(item.productId);
      if (product) {
        const newStock = product.stock - item.quantity;
        return dbManager.updateProduct(product.id, { stock: newStock });
      }
      return Promise.resolve();
    });
    await Promise.all(stockUpdates);

    const printResult = await Swal.fire({
      icon: "success",
      title: "Venda Finalizada!",
      text: `Total: ${formatCurrency(sale.total)}`,
      showCancelButton: true,
      confirmButtonText: "Imprimir Cupom",
      cancelButtonText: "Concluir",
    });

    if (printResult.isConfirmed) {
      try {
        await nfePrinter.printNFe(sale, sale.customer);
      } catch (error) {
        console.error("Erro ao imprimir:", error);
        showToast("Erro ao imprimir cupom. Verifique o console.", "warning");
      }
    }

    resetForNewSale();
  } catch (error) {
    console.error("Erro ao processar venda:", error);
    Swal.fire(
      "Erro",
      "Falha ao salvar a venda. Verifique sua conexão.",
      "error",
    );
  }
}

function getPaymentDetails(method) {
  const { total } = getTotals();
  switch (method) {
    case "cash":
      const received =
        parseFloat(document.getElementById("cashReceived").value) || 0;
      return { method: "Dinheiro", received, change: received - total };
    case "card":
      const cardType =
        document.querySelector(".btn-method.active")?.dataset.cardType ||
        "debit";
      return {
        method: cardType === "debit" ? "Cartão de Débito" : "Cartão de Crédito",
        type: cardType,
        installments:
          parseInt(document.getElementById("installments").value) || 1,
        amount: total,
      };
    case "pix":
      return { method: "Pix", amount: total };
    case "split":
      return {
        method: "Dividido",
        cash: parseFloat(document.getElementById("splitCash").value) || 0,
        card: parseFloat(document.getElementById("splitCard").value) || 0,
      };
    default:
      return { method: "Não especificado" };
  }
}

// --- Funções de Ações do PDV (Nova Venda, Cancelar, etc.) ---

function resetForNewSale() {
  AppState.cart = [];
  AppState.currentSaleId = generateId();
  AppState.isHoldingSale = false;
  AppState.clienteCpf = null;
  AppState.cpfNotaDefinido = false;

  document.getElementById("productSearch").value = "";
  document.getElementById("cashReceived").value = "";
  document.getElementById("splitCash").value = "";
  document.getElementById("splitCard").value = "";

  selectPaymentMethod("cash");
  updateUI();
  updateSaleInfo();
}

function startNewSale() {
  if (AppState.cart.length > 0) {
    Swal.fire({
      title: "Iniciar Nova Venda?",
      text: "O carrinho atual será limpo. Deseja continuar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
    }).then((result) => {
      if (result.isConfirmed) {
        resetForNewSale();
        showToast("Nova venda iniciada!", "info");
      }
    });
  } else {
    resetForNewSale();
    showToast("Nova venda iniciada!", "info");
  }
}

function cancelSale() {
  if (AppState.cart.length === 0) {
    showToast("Nenhuma venda em andamento para cancelar.", "info");
    return;
  }

  Swal.fire({
    title: "Cancelar Venda",
    text: "Tem certeza que deseja cancelar esta venda e limpar o carrinho?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, cancelar",
    cancelButtonText: "Não",
    confirmButtonColor: "#dc3545",
  }).then((result) => {
    if (result.isConfirmed) {
      resetForNewSale();
      showToast("Venda cancelada!", "info");
    }
  });
}

function holdSale() {
  if (AppState.cart.length === 0) {
    showToast(
      "Adicione produtos ao carrinho antes de suspender a venda.",
      "warning",
    );
    return;
  }

  const heldSales = JSON.parse(localStorage.getItem("heldSales")) || [];
  const heldSale = {
    id: AppState.currentSaleId || generateId(),
    date: new Date().toISOString(),
    cart: AppState.cart,
  };

  heldSales.push(heldSale);
  localStorage.setItem("heldSales", JSON.stringify(heldSales));

  resetForNewSale();
  showToast("Venda suspensa com sucesso!", "info");
}

function checkHeldSale() {
  const heldSales = JSON.parse(localStorage.getItem("heldSales")) || [];
  if (heldSales.length > 0) {
    const lastHeldSale = heldSales.pop(); // Pega e remove a última
    Swal.fire({
      title: "Venda Suspensa Encontrada",
      text: `Deseja restaurar a venda de ${new Date(lastHeldSale.date).toLocaleString("pt-BR")}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, restaurar",
      cancelButtonText: "Não, descartar",
    }).then((result) => {
      if (result.isConfirmed) {
        AppState.cart = lastHeldSale.cart;
        AppState.currentSaleId = lastHeldSale.id;
        AppState.isHoldingSale = true;
        localStorage.setItem("heldSales", JSON.stringify(heldSales)); // Salva o restante
        updateUI();
        updateSaleInfo();
        showToast("Venda restaurada.", "success");
      } else {
        localStorage.setItem("heldSales", JSON.stringify(heldSales)); // Salva sem a venda descartada
      }
    });
  }
}

// --- Lógica de Desconto ---

function openDiscountModal() {
  if (AppState.cart.length === 0) {
    showToast(
      "Adicione produtos ao carrinho para aplicar um desconto.",
      "warning",
    );
    return;
  }

  const { total } = getTotals();

  Swal.fire({
    title: "Aplicar Desconto",
    text: "Digite o valor do desconto em Reais (R$):",
    input: "number",
    inputAttributes: {
      min: 0,
      step: "0.01",
    },
    showCancelButton: true,
    confirmButtonText: "Aplicar",
    inputValidator: (value) => {
      const discountValue = parseFloat(value);
      if (!value || discountValue < 0) {
        return "Por favor, informe um valor de desconto válido.";
      }
      if (discountValue > total) {
        return `O desconto não pode ser maior que o total da venda (${formatCurrency(total)}).`;
      }
      return null;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      applyDiscountToSale(parseFloat(result.value));
    }
  });
}

function applyDiscountToSale(discountAmount) {
  const { subtotal } = getTotals();
  if (subtotal === 0) return;

  // Distribui o desconto proporcionalmente entre os itens do carrinho
  AppState.cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    const proportion = itemTotal / subtotal;
    const itemDiscountAmount = discountAmount * proportion;
    item.discount = (itemDiscountAmount / itemTotal) * 100; // Armazena como percentual
  });

  updateUI();
  showToast(
    `Desconto de ${formatCurrency(discountAmount)} aplicado!`,
    "success",
  );
}

// --- Lógica de Pagamento PIX ---

async function generatePixPayment() {
  const { total } = getTotals();
  const pixAmountEl = document.getElementById("pixAmount");
  if (pixAmountEl) {
    pixAmountEl.textContent = formatCurrency(total);
  }
  showPixQRCode(total);
}

async function showPixQRCode(totalAmount) {
  const config = await dbManager.getStoreSettings();
  const pixKey = config?.pixKey;

  if (!pixKey) {
    Swal.fire(
      "Configuração Incompleta",
      "A chave PIX não foi configurada nas definições da loja.",
      "warning",
    );
    return;
  }

  const merchantName = (config?.storeName || "PDV").substring(0, 25);
  const merchantCity = (config?.storeCity || "CIDADE").substring(0, 15);
  const transactionId = generateId().slice(0, 10).toUpperCase();

  const pixPayload = generatePixPayload(
    pixKey,
    merchantName,
    merchantCity,
    totalAmount,
    transactionId,
  );

  Swal.fire({
    title: "Pagamento via PIX",
    html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <p>Valor: <strong>${formatCurrency(totalAmount)}</strong></p>
            <div id="swal-qrcode" style="padding: 10px; background: white; border-radius: 8px;"></div>
            <button id="copyPixBtn" class="swal2-confirm swal2-styled" style="width: auto;">
              <i class="fas fa-copy"></i> Copiar Código PIX
            </button>
          </div>`,
    showCancelButton: true,
    confirmButtonText: "Pagamento Confirmado",
    cancelButtonText: "Cancelar",
    didOpen: () => {
      if (typeof QRCode !== "undefined") {
        new QRCode(document.getElementById("swal-qrcode"), {
          text: pixPayload,
          width: 200,
          height: 200,
          correctLevel: QRCode.CorrectLevel.M,
        });
      } else {
        document.getElementById("swal-qrcode").innerText =
          "Erro: Biblioteca QRCode não carregada.";
      }

      document.getElementById("copyPixBtn").addEventListener("click", () => {
        navigator.clipboard.writeText(pixPayload).then(() => {
          showToast("Código PIX copiado!", "success");
        });
      });
    },
  }).then((result) => {
    if (result.isConfirmed) {
      processSale("pix");
    }
  });
}

function generatePixPayload(key, name, city, amount, txid) {
  const format = (id, value) => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };

  const payload = [
    format("00", "01"),
    format("26", `${format("00", "BR.GOV.BCB.PIX")}${format("01", key)}`),
    format("52", "0000"),
    format("53", "986"),
    format("54", amount.toFixed(2)),
    format("58", "BR"),
    format("59", name.substring(0, 25)),
    format("60", city.substring(0, 15)),
    format("62", format("05", txid.substring(0, 25))),
  ].join("");

  const payloadWithCrc = `${payload}6304`;
  const crc = calculateCRC16(payloadWithCrc);
  return `${payloadWithCrc}${crc}`;
}

function calculateCRC16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

// --- Inicialização e Carregamento de Dados ---

function updateSaleInfo() {
  const dateElement = document.getElementById("currentSaleDate");
  const numberElement = document.getElementById("currentSaleNumber");

  if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString("pt-BR");
  }
  if (numberElement) {
    numberElement.textContent = AppState.currentSaleId
      ? `#${AppState.currentSaleId.slice(-6).toUpperCase()}`
      : "N/A";
  }
}

async function loadInitialData() {
  try {
    const [productsData, categoriesData] = await Promise.all([
      dbManager.getProducts(),
      dbManager.getCategories(), // Supondo que exista uma função para buscar categorias
    ]);

    AppState.products = productsData || [];
    AppState.categories =
      categoriesData || JSON.parse(localStorage.getItem("categories")) || [];

    if (AppState.products.length === 0) {
      showToast("Nenhum produto encontrado. Verifique a conexão.", "warning");
    }

    resetForNewSale();
    checkHeldSale();
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
    showToast("Falha ao carregar dados do sistema.", "danger");
  }
}

function setupEventListeners() {
  // Busca de produtos
  const productSearch = document.getElementById("productSearch");
  if (productSearch) {
    productSearch.addEventListener("input", (e) =>
      renderProducts(e.target.value),
    );
    productSearch.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const product = getProductByCode(e.target.value);
        if (product) {
          addToCart(product.id);
          e.target.value = "";
          renderProducts("");
        } else {
          showToast("Produto não encontrado pelo código.", "warning");
        }
      }
    });
  }

  // Grid de produtos
  const productGrid = document.getElementById("productGrid");
  if (productGrid) {
    productGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      if (card && card.dataset.productId) {
        addToCart(card.dataset.productId);
      }
    });
  }

  // Ações do carrinho
  const cartContainer = document.querySelector(".pdv-cart");
  if (cartContainer) {
    cartContainer.addEventListener("click", (e) => {
      const itemEl = e.target.closest(".cart-item, tr[data-item-id]");
      if (!itemEl) return;

      const { itemId } = itemEl.dataset;

      if (e.target.closest(".btn-qty-plus")) {
        updateQuantity(itemId, 1);
      } else if (e.target.closest(".btn-qty-minus")) {
        updateQuantity(itemId, -1);
      } else if (e.target.closest(".cart-item-remove")) {
        removeFromCart(itemId);
      }
    });

    cartContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("input-qty")) {
        const itemEl = e.target.closest(".cart-item, tr[data-item-id]");
        if (itemEl) {
          setQuantity(itemEl.dataset.itemId, e.target.value);
        }
      }
    });
  }

  // Botões de ação do PDV
  document
    .getElementById("newSaleBtn")
    ?.addEventListener("click", startNewSale);
  document.getElementById("holdSaleBtn")?.addEventListener("click", holdSale);
  document
    .getElementById("cancelSaleBtn")
    ?.addEventListener("click", cancelSale);
  document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);
  document
    .querySelector('.pay-btn[data-method="discount"]')
    ?.addEventListener("click", openDiscountModal);
  document
    .getElementById("finalizeSaleBtn")
    ?.addEventListener("click", finalizeSale);

  // Botões de método de pagamento
  document.querySelector(".payment-methods")?.addEventListener("click", (e) => {
    const payBtn = e.target.closest(".pay-btn");
    if (payBtn && payBtn.dataset.method !== "discount") {
      selectPaymentMethod(payBtn.dataset.method);
    }
  });

  // Inputs de pagamento
  document
    .getElementById("cashReceived")
    ?.addEventListener("input", calculateChange);
  document
    .getElementById("splitCash")
    ?.addEventListener("input", updateSplitPayment);
  document
    .getElementById("splitCard")
    ?.addEventListener("input", updateSplitPayment);

  // Opções de cartão
  document.getElementById("cardOptions")?.addEventListener("click", (e) => {
    const methodBtn = e.target.closest(".btn-method");
    if (methodBtn) {
      document
        .querySelectorAll(".btn-method")
        .forEach((b) => b.classList.remove("active"));
      methodBtn.classList.add("active");
    }
  });

  // Atalhos de teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "F2") {
      e.preventDefault();
      finalizeSale();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      productSearch?.focus();
    }
  });

  // Menu lateral
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () =>
      sidebar.classList.toggle("active"),
    );
  }
}

async function initPDV() {
  authManager.initAuth();
  await authManager.ensureAuth();

  const user = localStorage.getItem("userEmail");
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  setupEventListeners();
  await loadInitialData();
}

// --- Ponto de Entrada da Aplicação ---
document.addEventListener("DOMContentLoaded", initPDV);

// --- Funções de compatibilidade (se necessário) ---
// Estas funções são mantidas para garantir que chamadas antigas não quebrem o sistema.
// O ideal é refatorar o código para não depender delas.

window.adicionarItemVendaPorCodigo = (codigo) => {
  const product = getProductByCode(codigo);
  if (product) {
    addToCart(product.id);
  } else {
    showToast("Produto não encontrado", "warning");
  }
};

window.updateQuantityTable = (productId, change) => {
  const item = AppState.cart.find((i) => i.productId === productId);
  if (item) {
    updateQuantity(item.id, change);
  }
};

window.removeFromTable = (productId) => {
  const item = AppState.cart.find((i) => i.productId === productId);
  if (item) {
    removeFromCart(item.id);
  }
};

window.gerarQRCode = () => {
  /* Deprecated */
};

class PDVManager {
  constructor() {
    // Esta classe pode ser mantida para compatibilidade, mas sua lógica
    // agora é gerenciada pelas funções principais do estado.
  }
  get cart() {
    return AppState.cart;
  }
  selectProduct(productId) {
    addToCart(productId);
  }
  updateCartDisplay() {
    renderCart();
  }
  updateStats() {
    renderPaymentSummary();
  }
}
window.pdvManager = new PDVManager();
