import React from "react";
import { Routes, Route } from "react-router-dom";
import PDV from "./PDV";
import Dashboard from "./components/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Rotas do PDV e Protegidas */}
      <Route path="/" element={<Layout />}>
        <Route index element={<PDV />} />
        <Route element={<ProtectedRoute />}>
          {/* Rotas dentro daqui são protegidas */}
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
