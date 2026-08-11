import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getProdutos } from "../services/tenantData";

export default function ProdutosEmFalta() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const produtos = await getProdutos();
      setProdutos(produtos);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setCarregando(false);
    }
  };

  const mostrarProdutosEmFalta = async () => {
    await carregarProdutos();

    // Verificar se há produtos em falta
    const produtosEmFalta = produtos.filter((p) => p.stock === 0);
    const produtosEstoqueBaixo = produtos.filter(
      (p) => p.stock > 0 && p.stock <= (p.minStock || 5),
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
            <strong>${produto.descricao || produto.name}</strong><br>
            <span style="color: #666;">Código: ${produto.codigo || "N/A"}</span><br>
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
            <strong>${produto.descricao || produto.name}</strong><br>
            <span style="color: #666;">Código: ${produto.codigo || "N/A"}</span><br>
            <span style="color: #856404; font-weight: bold;">Estoque: ${produto.stock} unidades (mín: ${produto.minStock || 5})</span>
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
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirecionar para a página de inventário
        window.location.href = "/inventario";
      }
    });
  };

  return null; // Este componente não renderiza nada, apenas executa a função
}
