import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";

// Caminhos corrigidos para buscar os componentes da pasta 'src'
import InventoryHeader from "./InventoryHeader.jsx";
import Toolbar from "./Toolbar.jsx";
import ProductTable from "./ProductTable.jsx";
import ProductModal from "./ProductModal.jsx";

// Importa o serviço para carregar dados do tenant (usuário logado)
import {
  getProdutos,
  getCategorias,
  addProduto,
  updateProduto,
  removeProduto,
} from "../services/tenantData";

export default function Inventario() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Carrega os dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      // Carrega os produtos e categorias do tenant logado
      const produtosData = await getProdutos();
      const categoriasData = await getCategorias();
      setProducts(produtosData);
      setCategories(categoriasData);
    };
    carregarDados();
  }, []);

  // Lógica de filtragem dos produtos
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Filtro de busca por texto
        const searchLower = searchTerm.toLowerCase();
        return (
          product.descricao.toLowerCase().includes(searchLower) ||
          product.codigo.toLowerCase().includes(searchLower)
        );
      })
      .filter((product) => {
        // Filtro de categoria
        if (!categoryFilter) return true;
        return product.categoriaId === categoryFilter;
      })
      .filter((product) => {
        // Filtro de status de estoque
        if (!statusFilter) return true;
        const status =
          product.estoque === 0
            ? "out_of_stock"
            : product.estoque <= product.estoqueMinimo
              ? "low_stock"
              : "in_stock";
        return status === statusFilter;
      });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    console.log("💾 Salvando produto:", productData);

    try {
      // Lógica para salvar (adicionar novo ou editar existente)
      if (editingProduct) {
        console.log("Atualizando produto existente:", editingProduct.codigo);
        await updateProduto(editingProduct.codigo, productData);
        Swal.fire("Sucesso!", "Produto atualizado com sucesso.", "success");
      } else {
        console.log("Adicionando novo produto");
        await addProduto(productData);
        Swal.fire("Sucesso!", "Produto adicionado com sucesso.", "success");
      }

      // Recarrega os produtos para refletir a mudança
      console.log("Recarregando produtos...");
      const produtosData = await getProdutos();
      console.log("Produtos carregados:", produtosData);
      setProducts(produtosData);

      handleCloseModal();
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error);
      Swal.fire(
        "Erro",
        `Não foi possível salvar o produto: ${error.message}`,
        "error",
      );
    }
  };

  const handleDeleteProduct = async (productCode) => {
    try {
      const result = await Swal.fire({
        title: "Tem certeza?",
        text: "Você não poderá reverter isso!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, deletar!",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        console.log("🗑️ Deletando produto:", productCode);
        await removeProduto(productCode);

        // Recarrega os produtos para refletir a mudança
        const produtosData = await getProdutos();
        setProducts(produtosData);

        Swal.fire("Deletado!", "O produto foi removido.", "success");
      }
    } catch (error) {
      console.error("❌ Erro ao deletar produto:", error);
      Swal.fire(
        "Erro",
        `Não foi possível deletar o produto: ${error.message}`,
        "error",
      );
    }
  };

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden">
        <InventoryHeader products={products} />

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          <Toolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categories={categories}
            onAddNew={() => handleOpenModal()}
          />

          <div className="mt-6">
            <ProductTable
              products={filteredProducts}
              onEdit={handleOpenModal}
              onDelete={handleDeleteProduct}
            />
          </div>
        </div>
      </main>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </>
  );
}
