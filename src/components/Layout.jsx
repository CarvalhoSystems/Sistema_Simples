import React from "react";
import { Outlet } from "react-router-dom";

// Este Layout é usado para as rotas que precisam do fundo escuro e
// comportamento de "tela cheia" do PDV.
export default function Layout() {
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
