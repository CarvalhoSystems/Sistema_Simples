function MostrarProdutoFalta() {} // Função para mostrar produtos em falta (com SweetAlert2)
window.mostrarProdutosEmFalta = async function mostrarProdutosEmFalta() {
  try {
    // Carregar produtos do Firebase
    let products = [];

    try {
      products = await dbManager.getProducts();
    } catch (error) {
      console.warn(
        "Erro ao carregar produtos do Firebase, usando localStorage:",
        error,
      );
      // Fallback para localStorage
      products = JSON.parse(localStorage.getItem("products")) || [];
    }

    // Verificar se há produtos em falta
    const produtosEmFalta = products.filter((p) => p.stock === 0);
    const produtosEstoqueBaixo = products.filter(
      (p) => p.stock > 0 && p.stock <= p.minStock,
    );

    if (produtosEmFalta.length === 0 && produtosEstoqueBaixo.length === 0) {
      Swal.fire({
        title: "🎉 Excelente!",
        text: "Todos os produtos estão com estoque adequado.",
        icon: "success",
        confirmButtonText: "Fechar",
        confirmButtonColor: "#28a745",
      });
      return;
    }

    // Construir conteúdo HTML para a lista de produtos
    let htmlContent =
      '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';

    if (produtosEmFalta.length > 0) {
      htmlContent +=
        '<h4 style="color: #dc3545; margin-bottom: 1rem;">🔴 Produtos SEM ESTOQUE:</h4>';
      produtosEmFalta.forEach((produto) => {
        htmlContent += `
          <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
            <strong>${produto.name}</strong><br>
            <span style="color: #666;">Código: ${produto.code || "N/A"}</span><br>
            <span style="color: #dc3545; font-weight: bold;">Estoque: 0 unidades</span>
          </div>
        `;
      });
    }

    if (produtosEstoqueBaixo.length > 0) {
      htmlContent +=
        '<h4 style="color: #ffc107; margin: 20px 0 10px 0;">🟡 Produtos com ESTOQUE BAIXO:</h4>';
      produtosEstoqueBaixo.forEach((produto) => {
        htmlContent += `
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
            <strong>${produto.name}</strong><br>
            <span style="color: #666;">Código: ${produto.code || "N/A"}</span><br>
            <span style="color: #856404; font-weight: bold;">Estoque: ${produto.stock} unidades (mín: ${produto.minStock})</span>
          </div>
        `;
      });
    }

    htmlContent += "</div>";

    // Exibir o SweetAlert2
    Swal.fire({
      title: '<h3 style="margin: 0;">📦 Resumo de Estoque</h3>',
      html: htmlContent,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ir para Inventário",
      cancelButtonText: "Fechar",
      confirmButtonColor: "#007bff",
      cancelButtonColor: "#6c757d",
      width: "600px",
      customClass: {
        popup: "swal2-popup-custom",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirecionar para a página de inventário
        window.location.href = "inventario.html";
      }
    });
  } catch (error) {
    console.error("Erro ao exibir produtos em falta:", error);
    Swal.fire({
      title: "Erro",
      text: "Não foi possível carregar os produtos. Por favor, tente novamente.",
      icon: "error",
      confirmButtonText: "Fechar",
      confirmButtonColor: "#dc3545",
    });
  }
};

function carregarProdutosEmFalta() {
  try {
    // Tentar carregar do Firebase primeiro
    dbManager
      .getProducts()
      .then((products) => {
        exibirProdutosEmFalta(products);
      })
      .catch((error) => {
        console.warn(
          "Erro ao carregar produtos do Firebase, usando localStorage:",
          error,
        );

        // Fallback para localStorage
        const products = JSON.parse(localStorage.getItem("products")) || [];
        exibirProdutosEmFalta(products);
      });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    exibirProdutosEmFalta([]);
  }
}

function exibirProdutosEmFalta(products) {
  const tbody = document.getElementById("products-falta-body");
  if (!tbody) return;

  // Filtrar produtos com estoque baixo ou zerado
  const produtosEmFalta = products.filter((product) => product.stock <= 0);
  const produtosEstoqueBaixo = products.filter(
    (product) => product.stock > 0 && product.stock <= 5,
  );

  if (produtosEmFalta.length === 0 && produtosEstoqueBaixo.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--success-color);">
          <i class="fas fa-check-circle"></i> Nenhum produto em falta!
        </td>
      </tr>
    `;
    return;
  }

  let html = "";

  // Produtos em falta (estoque = 0)
  if (produtosEmFalta.length > 0) {
    html += `
      <tr>
        <td colspan="3" style="background: #fff5f5; color: #ef4444; font-weight: bold; padding: 10px;">
          <i class="fas fa-exclamation-circle"></i> PRODUTOS EM FALTA
        </td>
      </tr>
    `;
    produtosEmFalta.forEach((product) => {
      html += `
        <tr>
          <td>${product.name}</td>
          <td style="color: #ef4444; font-weight: bold;">${product.stock}</td>
          <td><span class="status-badge status-out">EM FALTA</span></td>
        </tr>
      `;
    });
  }
}
export { carregarProdutosEmFalta };
export default MostrarProdutoFalta;
