import React, { useRef, useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";

// Caminhos corrigidos para buscar os componentes da pasta 'src'
import InventoryHeader from "./InventoryHeader.jsx";
import Toolbar from "./Toolbar.jsx";
import ProductTable from "./ProductTable.jsx";
import ProductModal from "./ProductModal.jsx";

// Importa o serviço para carregar dados do tenant (usuário logado)
import {
  getProdutos,
  assinarProdutos,
  buscarProdutos,
  addProduto,
  updateProduto,
  removeProduto,
} from "../services/tenantData";

export default function Inventario() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const savingProductRef = useRef(false);

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Carrega os dados iniciais
  useEffect(() => {
    let versao = 0;
    let ativo = true;
    const carregarDados = async () => {
      const versaoAtual = ++versao;
      // Carrega os produtos do tenant logado
      const produtosData = await getProdutos();
      if (ativo && versaoAtual === versao) setProducts(produtosData);
    };
    const cancelarAssinatura = assinarProdutos((produtosData) => {
      versao += 1;
      if (ativo) setProducts(produtosData);
    }, (error) => {
      console.error("Erro ao sincronizar produtos do Firestore:", error);
    });
    carregarDados();
    return () => {
      ativo = false;
      cancelarAssinatura();
    };
  }, []);

  // Lógica de filtragem dos produtos
  const filteredProducts = useMemo(() => {
    return buscarProdutos(searchTerm, products).filter((product) => {
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
  }, [products, searchTerm, statusFilter]);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    if (savingProductRef.current) return;
    savingProductRef.current = true;
    console.log("💾 Salvando produto:", productData);

    try {
      // Lógica para salvar (adicionar novo ou editar existente)
      if (editingProduct) {
        console.log("Atualizando produto existente:", editingProduct.codigo);
        const produtoAtualizado = await updateProduto(
          editingProduct,
          productData,
        );
        if (!produtoAtualizado) {
          throw new Error("O produto não foi encontrado para atualização.");
        }
        let substituido = false;
        setProducts((currentProducts) =>
          currentProducts.map((product) => {
            if (
              substituido ||
              (editingProduct.id
                ? product.id !== editingProduct.id
                : product.codigo !== editingProduct.codigo ||
                  product.descricao !== editingProduct.descricao ||
                  product.preco !== editingProduct.preco ||
                  product.estoque !== editingProduct.estoque)
            ) {
              return product;
            }
            substituido = true;
            return produtoAtualizado;
          }),
        );
        Swal.fire("Sucesso!", "Produto atualizado com sucesso.", "success");
      } else {
        console.log("Adicionando novo produto");
        const novoProduto = await addProduto(productData);
        setProducts((currentProducts) => [...currentProducts, novoProduto]);
        Swal.fire("Sucesso!", "Produto adicionado com sucesso.", "success");
      }

      handleCloseModal();
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error);
      Swal.fire(
        "Erro",
        `Não foi possível salvar o produto: ${error.message}`,
        "error",
      );
    } finally {
      savingProductRef.current = false;
    }
  };

  const handleDeleteProduct = async (product) => {
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
        console.log("🗑️ Deletando produto:", product.codigo);
        const produtosRestantes = await removeProduto(product);
        setProducts(produtosRestantes);

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
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
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
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </>
  );
}
