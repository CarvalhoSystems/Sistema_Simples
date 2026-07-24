import React from "react";
import { formatCurrency } from "../../utils/formatters"; // Reutilizando o formatador do PDV

const StockStatus = ({ stock, minStock }) => {
  if (stock === 0) {
    return (
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500"></span>
        <span className="text-red-600 font-medium">Sem estoque</span>
      </span>
    );
  }
  if (stock <= minStock) {
    return (
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
        <span className="text-yellow-600 font-medium">Estoque baixo</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-green-500"></span>
      <span>Em estoque</span>
    </span>
  );
};

export default function ProductTable({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
        <i className="fas fa-box-open text-5xl text-gray-400 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-700">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-500 mt-1">
          Tente ajustar seus filtros ou adicione um novo produto.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 w-2/5">
              Produto
            </th>
            <th scope="col" className="px-6 py-3">
              Código
            </th>
            <th scope="col" className="px-6 py-3">
              Estoque
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              Preço
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.codigo}
              className="bg-white border-b hover:bg-gray-50"
            >
              <td className="px-6 py-4 font-semibold text-gray-900">
                {product.descricao}
              </td>
              <td className="px-6 py-4">{product.codigo}</td>
              <td className="px-6 py-4 font-medium">{product.estoque}</td>
              <td className="px-6 py-4">
                <StockStatus
                  stock={product.estoque}
                  minStock={product.estoqueMinimo}
                />
              </td>
              <td className="px-6 py-4 font-semibold text-right">
                {formatCurrency(product.preco)}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onEdit(product)}
                  className="font-medium text-indigo-600 hover:text-indigo-800 mr-4"
                >
                  <i className="fas fa-pencil-alt"></i>
                </button>
                <button
                  onClick={() => onDelete(product.codigo)}
                  className="font-medium text-red-600 hover:text-red-800"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
