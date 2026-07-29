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
    // Lógica para salvar (adicionar novo ou editar existente)
    if (editingProduct) {
      // Editar
      await updateProduto(editingProduct.codigo, productData);
      Swal.fire("Sucesso!", "Produto atualizado com sucesso.", "success");
    } else {
      // Adicionar novo
      await addProduto(productData);
      Swal.fire("Sucesso!", "Produto adicionado com sucesso.", "success");
    }

    // Recarrega os produtos para refletir a mudança
    const produtosData = await getProdutos();
    setProducts(produtosData);

    handleCloseModal();
  };

  const handleDeleteProduct = (productCode) => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter((p) => p.codigo !== productCode));
        Swal.fire("Deletado!", "O produto foi removido.", "success");
      }
    });
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
