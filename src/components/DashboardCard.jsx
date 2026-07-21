import React from "react";

export default function DashboardCard({
  titulo,
  valor,
  descricao,
  alerta = false,
}) {
  return (
    <div
      className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${alerta ? "border-red-500" : "border-blue-500"}`}
    >
      <h3 className="text-sm font-bold text-slate-500 uppercase">{titulo}</h3>
      <p
        className={`text-3xl font-black my-1 ${alerta ? "text-red-600" : "text-slate-800"}`}
      >
        {valor}
      </p>
      <p className="text-xs text-slate-400">{descricao}</p>
    </div>
  );
}
