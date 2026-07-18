import React, { useState, useEffect } from "react";

export default function BarraSuperior() {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const atualizarHora = () => {
      const agora = new Date();
      setHora(agora.toLocaleString("pt-BR"));
    };
    atualizarHora();
    const interval = setInterval(atualizarHora, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1e3a8a] text-white px-4 py-2 flex justify-between items-center text-sm font-bold shadow-md border-b-2 border-[#172554]">
      <div className="flex items-center gap-6">
        <span className="text-xl italic font-black tracking-tighter text-[#eff6ff]">
          FÁCIL{" "}
          <span className="text-xs font-normal not-italic text-blue-200">
            Sistemas
          </span>
        </span>
        <span className="text-xs bg-[#1d4ed8] px-2 py-0.5 rounded text-blue-100 border border-blue-400">
          Ambiente Homologação
        </span>
      </div>
      <div className="flex gap-8 text-xs font-mono">
        <span>
          Operador: <span className="text-blue-200">CAIXA 01</span>
        </span>
        <span>
          Nº da Venda: <span className="text-amber-300">00010582</span>
        </span>
        <span>{hora}</span>
      </div>
      <div className="flex gap-4 text-xs font-mono">
        <span>F1 - Ajuda</span>
        <span className="text-red-300 animate-pulse">ESC - Sair</span>
      </div>
    </div>
  );
}
