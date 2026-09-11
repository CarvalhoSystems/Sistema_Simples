import React from "react";
import { Link } from "react-router-dom";
import { Calculator, BarChart3 } from "lucide-react";

export default function SelecaoObjetivo() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm py-6 px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Selecione o Objetivo
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Escolha para onde deseja ir
        </p>
      </header>

      {/* Conteúdo Principal (Dois Objetivos) */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Objetivo 1: Caixa */}
          <Link
            to="/caixa"
            className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-transparent hover:border-emerald-500 cursor-pointer w-full"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Calculator className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acessar Caixa
            </h2>
            <p className="text-gray-500 text-sm">
              Gerencie vendas, pagamentos, aberturas e fechamentos de caixa.
            </p>
          </Link>

          {/* Objetivo 2: Dashboard */}
          <Link
            to="/dashboard"
            className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-transparent hover:border-blue-500 cursor-pointer w-full"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acessar Dashboard
            </h2>
            <p className="text-gray-500 text-sm">
              Visualize relatórios, métricas de desempenho e gráficos gerais.
            </p>
          </Link>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="text-center py-4 text-xs text-gray-400">
        &copy; 2026 - Todos os direitos reservados.
      </footer>
    </div>
  );
}
