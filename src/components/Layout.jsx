import React from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="h-screen w-screen">
      <main className="h-full w-full">
        <Outlet />
      </main>
    </div>
  );
}
