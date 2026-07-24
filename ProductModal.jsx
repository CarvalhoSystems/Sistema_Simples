import React, { useState, useEffect } from "react";

export default function ProductModal({ product, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    descricao: "",
    categoriaId: "",
    estoque: 0,
    estoqueMinimo: 0,
    preco: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        descricao: product.descricao || "",
        categoriaId: product.categoriaId || "",
        estoque: product.estoque || 0,
        estoqueMinimo: product.estoqueMinimo || 0,
        preco: product.preco || 0,
      });
    } else {
      // Se for um novo produto, seleciona a primeira categoria por padrão
      setFormData((prev) => ({
        ...prev,
        categoriaId: categories[0]?.id || "",
      }));
    }
  }, [product, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {product ? "Editar Produto" : "Novo Produto"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do Produto
              </label>
              <input
                type="text"
                name="descricao"
                id="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="categoriaId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoria
              </label>
              <select
                name="categoriaId"
                id="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="preco"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preço de Venda
                </label>
                <input
                  type="number"
                  name="preco"
                  id="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="estoque"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Estoque Inicial
                </label>
                <input
                  type="number"
                  name="estoque"
                  id="estoque"
                  value={formData.estoque}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="estoqueMinimo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estoque Mínimo
              </label>
              <input
                type="number"
                name="estoqueMinimo"
                id="estoqueMinimo"
                value={formData.estoqueMinimo}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                O sistema irá alertar quando o estoque atingir este valor.
              </p>
            </div>
          </div>
        </form>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Salvar Produto
          </button>
        </div>
      </div>
    </div>
  );
}
