import React from "react";

export default function TabelaCupom({ carrinho }) {
  const ultimoItem = carrinho[carrinho.length - 1] || {
    descricao: "CAIXA LIVRE",
  };

  return (
    <div className="w-7/12 bg-white border-2 border-[#93c5fd] shadow-sm flex flex-col h-full rounded-l">
      {/* Cabeçalho em tom azul médio */}
      <div className="bg-[#f0f6ff] px-3 py-2 grid grid-cols-12 gap-1 text-xs font-bold border-b border-[#bfdbfe] text-[#1e3a8a] font-mono">
        <span className="col-span-1">Item</span>
        <span className="col-span-3">Código</span>
        <span className="col-span-4">Descrição</span>
        <span className="col-span-1 text-right">Qtde</span>
        <span className="col-span-1.5 text-right">Vl.Unit</span>
        <span className="col-span-1.5 text-right">Subtotal</span>
      </div>

      {/* Corpo da Lista */}
      <div className="flex-1 p-2 overflow-y-auto space-y-1 text-xs font-bold font-mono tracking-tight bg-[#fcfdfe]">
        {carrinho.length === 0 ? (
          <div className="h-full flex items-center justify-center text-blue-300 text-sm italic">
            Aguardando o primeiro produto...
          </div>
        ) : (
          carrinho.map((prod, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-1 py-1 border-b border-blue-50 hover:bg-blue-50 text-slate-800"
            >
              <span className="col-span-1 text-blue-400 text-center">
                {String(index + 1).padStart(3, "0")}
              </span>
              <span className="col-span-3 text-slate-500">{prod.codigo}</span>
              <span className="col-span-4 truncate uppercase">
                {prod.descricao}
              </span>
              <span className="col-span-1 text-right">
                {prod.qtd.toFixed(3)}
              </span>
              <span className="col-span-1.5 text-right">
                R$ {prod.vUnit.toFixed(2)}
              </span>
              <span className="col-span-1.5 text-right text-blue-900 font-extrabold">
                R$ {(prod.vUnit * prod.qtd).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Visor do Item Atual */}
      <div className="bg-[#1e40af] p-4 border-t-2 border-[#93c5fd] text-center min-h-[64px] flex items-center justify-center">
        <h2 className="text-2xl font-black text-white tracking-wide truncate uppercase">
          {ultimoItem.descricao}
        </h2>
      </div>
    </div>
  );
}
