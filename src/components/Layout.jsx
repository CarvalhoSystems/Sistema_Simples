import React from "react";
import { Outlet } from "react-router-dom";

// Este Layout é usado para a rota do PDV, que precisa do fundo escuro e
// comportamento de "tela cheia".
export default function PdvLayout() {
  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#0f172a]"
      style={{
        userSelect: "none",
      }}
    >
      <main className="h-full w-full">
        <Outlet />
      </main>
    </div>
  );
}
