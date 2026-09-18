import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Dashboard.css"; // Digite "./Dashboard.css" completo à mão


export default function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      {/* O Outlet renderizará o componente da rota filha (ex: Dashboard) */}
      <Outlet />
    </div>
  );
}
