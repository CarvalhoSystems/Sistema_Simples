import React, { useMemo } from "react";

const StatCard = ({ label, value, colorClass = "text-gray-800" }) => (
  <div className="bg-gray-200/60 p-2 px-4 rounded-lg flex items-center gap-2">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`font-bold text-base ${colorClass}`}>{value}</span>
  </div>
);

export default function InventoryHeader({ products }) {
  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter(
      (p) => p.estoque > 0 && p.estoque <= p.estoqueMinimo,
    ).length;
    const outOfStock = products.filter((p) => p.estoque === 0).length;
    return { total, lowStock, outOfStock };
  }, [products]);

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Gerenciamento de Inventário
        </h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Estatísticas Rápidas */}
        <div className="hidden md:flex items-center gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard
            label="Baixo Estoque"
            value={stats.lowStock}
            colorClass="text-yellow-600"
          />
          <StatCard
            label="Sem Estoque"
            value={stats.outOfStock}
            colorClass="text-red-600"
          />
        </div>
        {/* Informações do Usuário */}
        <div className="flex items-center gap-3">
          <i className="fas fa-user-circle text-2xl text-indigo-600"></i>
          <span className="font-semibold text-gray-700">Administrador</span>
        </div>
      </div>
    </header>
  );
}
