import React from "react";
import { useNavigate } from "react-router-dom";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { useAuth } from "./AuthContext.jsx";
import DashboardCard from "./DashboardCard";
import SalesChart from "../SalesChart";
import {
  VENDAS_REALIZADAS,
  CLIENTES_CADASTRADOS,
  BANCO_PRODUTOS,
} from "../mockData.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Hook para voltar ao PDV com a tecla ESC
  useKeyboardShortcuts({
    Escape: () => navigate("/"),
  });

  // Cálculos para os cards
  const totalVendas = VENDAS_REALIZADAS.reduce(
    (acc, venda) => acc + venda.total,
    0,
  );
  const numeroDeVendas = VENDAS_REALIZADAS.length;
  const numeroDeClientes = CLIENTES_CADASTRADOS.length;
  const produtosBaixoEstoque = BANCO_PRODUTOS.filter(
    (p) => p.estoque < 20,
  ).length;

  // Prepara os dados para o gráfico de vendas dos últimos 7 dias
  const getSalesDataForLast7Days = () => {
    const salesData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0]; // Formato AAAA-MM-DD
      const dayName = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });

      const totalForDay = VENDAS_REALIZADAS.filter((venda) =>
        venda.data.startsWith(dateString),
      ).reduce((acc, venda) => acc + venda.total, 0);

      salesData.push({
        name: dayName,
        Total: totalForDay,
      });
    }

    return salesData;
  };

  const chartData = getSalesDataForLast7Days();

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <div className="flex-1 p-4">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Dashboard Gerencial
            </h1>
            <p className="text-slate-500">
              Visão geral do seu negócio em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-bold text-slate-700">{user?.name}</span>
              <button
                onClick={logout}
                className="text-xs text-red-500 block hover:underline"
              >
                Sair
              </button>
            </div>
            <div className="font-mono text-sm text-slate-500 bg-slate-200 px-3 py-1 rounded border border-slate-300">
              Pressione <strong className="text-red-600">ESC</strong> para
              voltar ao PDV
            </div>
          </div>
        </header>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            titulo="Faturamento Total"
            valor={`R$ ${totalVendas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
            descricao="Soma de todas as vendas"
          />
          <DashboardCard
            titulo="Vendas Realizadas"
            valor={numeroDeVendas}
            descricao="Número total de cupons emitidos"
          />
          <DashboardCard
            titulo="Clientes Cadastrados"
            valor={numeroDeClientes}
            descricao="Total de clientes na base"
          />
          <DashboardCard
            titulo="Estoque Baixo"
            valor={produtosBaixoEstoque}
            descricao="Produtos com menos de 20 unidades"
            alerta={produtosBaixoEstoque > 0}
          />
        </div>

        {/* Aqui você poderia adicionar mais seções, como gráficos ou tabelas detalhadas */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-slate-700 mb-4">
            Vendas nos Últimos 7 Dias
          </h2>
          <SalesChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
