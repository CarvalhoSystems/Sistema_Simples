import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Em um app real, aqui você chamaria sua API para cadastrar o usuário
    console.log("Tentativa de cadastro com:", { fullName, businessType });
    alert("Usuário cadastrado com sucesso! Redirecionando para o login.");
    navigate("/login");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-100 p-4">
      {/* Botão posicionado no canto superior direito */}
      <button
        type="button"
        onClick={() => navigate("/")} // Ajuste a rota correspondente ao caixa aqui
        className="absolute top-6 right-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Voltar ao Caixa
      </button>

      {/* Card de Signup */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-2xl font-bold text-center text-slate-800">
          Crie sua Conta
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Ramo de Negócio
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              required
            >
              <option value="" disabled>
                Selecione uma opção
              </option>
              <option value="papelaria">Papelaria</option>
              <option value="hotelaria">Eletronicos</option>
              <option value="padaria">Padaria</option>
              <option value="Hamburgueria">Hamburgueria</option>
              <option value="pizzaria">Pizzaria</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
          >
            Cadastrar
          </button>
        </form>

        <p className="text-sm text-center text-slate-500">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Faça o login
          </Link>
        </p>
      </div>
    </div>
  );
}
