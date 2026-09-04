import React, { useState } from "react";
import { autenticarFuncionarioPorCodigo } from "../services/tenantData";
import { setOperadorAtual } from "../services/operadorSession";
import Swal from "sweetalert2";

export default function ModalLoginCaixa({ onLoginSucesso }) {
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!codigo || !senha) {
      Swal.fire("Atenção", "Digite o código (PIN) e a senha.", "warning");
      return;
    }

    setCarregando(true);
    try {
      // Utiliza a função que já existe no seu tenantData.js
      const funcionario = await autenticarFuncionarioPorCodigo(codigo, senha);

      // Salva na sessão do PDV
      setOperadorAtual(funcionario);

      Swal.fire({
        icon: "success",
        title: `Bem-vindo(a), ${funcionario.nome}!`,
        text: `Caixa liberado com sucesso.`,
        timer: 1500,
        showConfirmButton: false,
      });

      if (onLoginSucesso) {
        onLoginSucesso(funcionario);
      }
    } catch (error) {
      console.error("Erro no login do caixa:", error);
      Swal.fire(
        "Acesso Negado",
        error.message || "PIN ou senha incorretos.",
        "error",
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "0.75rem",
          width: "100%",
          maxWidth: "400px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              fontSize: "2.5rem",
              color: "#4f46e5",
              marginBottom: "0.5rem",
            }}
          >
            <i className="fas fa-cash-register"></i>
          </div>
          <h2
            style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b" }}
          >
            Identificação do Caixa
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Digite seu PIN e senha para operar o PDV
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "0.25rem",
              }}
            >
              Código (PIN) do Funcionário
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: 101"
              autoFocus
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "0.25rem",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                fontSize: "1rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            {carregando ? "Verificando..." : "Entrar no Caixa"}
          </button>
        </form>
      </div>
    </div>
  );
}
