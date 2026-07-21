import React from "react";

export default function RodapeAtalhos() {
  const atalhos = [
    { tecla: "F2", acao: "Cancelar Item" },
    { tecla: "F3", acao: "Cancelar Cupom" },
    { tecla: "F5", acao: "Quantidade" },
    { tecla: "F6", acao: "Desconto" },
    { tecla: "F7", acao: "Pix" },
    { tecla: "F8", acao: "Dinheiro" },
    { tecla: "F9", acao: "Cartao" },
    { tecla: "F10", acao: "Produtos" },
    { tecla: "F11", acao: "Dashboard" },
    { tecla: "F12", acao: "Imprimir Nota" },
  ];

  return (
    <div className="bg-[#1e293b] border-t border-slate-700 text-[11px] font-bold p-2 grid grid-cols-5 gap-y-1 gap-x-4 text-slate-300 shadow-inner font-mono">
      {atalhos.map((item, index) => (
        <div key={index} className="truncate">
          <span className="text-[#38bdf8] bg-slate-900 px-1.5 py-0.5 border border-slate-700 rounded shadow-sm mr-1">
            {item.tecla}
          </span>
          - {item.acao}
        </div>
      ))}
    </div>
  );
}
