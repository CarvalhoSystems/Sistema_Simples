import React, { useRef, useEffect } from "react";

export default function PainelLateral({
  codigo,
  setCodigo,
  carrinho,
  total,
  aoBipar,
  quantidadeAtual,
}) {
  const inputRef = useRef(null);
  const ultimoItem = carrinho[carrinho.length - 1] || null;

  useEffect(() => {
    if (inputRef.current && !document.body.classList.contains("swal2-shown")) {
      inputRef.current.focus();
    }
  }, [carrinho.length]); // Foca novamente a cada item adicionado

  const handleBlur = () => {
    // Garante que o foco sempre retorne ao input, essencial para um PDV,
    // mas sem roubar o foco de pop-ups como o SweetAlert.
    setTimeout(() => {
      const isSwalOpen = document.body.classList.contains("swal2-shown");
      const activeElement = document.activeElement;
      const isInsideSwal = activeElement?.closest(".swal2-container");

      if (!isSwalOpen && !isInsideSwal && inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && codigo.trim() !== "") {
      aoBipar(codigo);
      e.preventDefault(); // Previne qualquer comportamento padrão do Enter
    }
  };

  return (
    <div className="w-5/12 flex flex-col gap-3 justify-between h-full">
      {/* Input do Bipador */}
      <div className="bg-white p-4 border-2 border-[#93c5fd] rounded-r shadow-sm">
        <label className="block text-xs font-bold text-[#1e3a8a] mb-1 font-mono">
          CÓDIGO / BARRA (F10 para buscar):
        </label>
        <input
          id="codigo-barras-input"
          ref={inputRef}
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#f8fafc] border-2 border-[#bfdbfe] p-3 text-3xl font-mono font-bold text-[#1e3a8a] outline-none focus:border-[#2563eb] focus:bg-white"
          placeholder="Aguardando bip..."
        />
      </div>

      {/* Mini Visores Atualizados */}
      <div className="grid grid-cols-3 gap-3 font-mono">
        <div className="bg-white p-2 border-2 border-[#93c5fd] rounded text-right">
          <label className="block text-[10px] font-bold text-blue-400 text-left">
            QUANTIDADE
          </label>
          <span className="text-xl font-black text-slate-700">
            {ultimoItem
              ? ultimoItem.qtd.toFixed(3)
              : quantidadeAtual.toFixed(3)}
          </span>
        </div>
        <div className="bg-white p-2 border-2 border-[#93c5fd] rounded text-right">
          <label className="block text-[10px] font-bold text-blue-400 text-left">
            VALOR UNIT.
          </label>
          <span className="text-xl font-black text-slate-700">
            R$ {ultimoItem ? ultimoItem.vUnit.toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="bg-white p-2 border-2 border-[#93c5fd] rounded text-right">
          <label className="block text-[10px] font-bold text-blue-400 text-left">
            SUBTOTAL
          </label>
          <span className="text-xl font-black text-slate-700">
            R${" "}
            {ultimoItem
              ? (ultimoItem.vUnit * ultimoItem.qtd).toFixed(2)
              : "0.00"}
          </span>
        </div>
      </div>

      {/* Display do Total Geral Azul da Imagem */}
      <div className="bg-[#0f172a] border-2 border-[#1e3a8a] p-6 rounded shadow-inner flex flex-col justify-between items-end flex-1 min-h-40">
        <span className="text-sm font-bold text-blue-400 tracking-wider self-start font-mono">
          TOTAL DO CUPOM
        </span>
        <span className="text-6xl font-black text-[#38bdf8] tracking-tight font-mono">
          R${" "}
          {total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
