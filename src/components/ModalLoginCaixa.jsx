import React, { useState } from "react";
import { getFuncionarios } from "../services/tenantData";
import { setOperadorAtual } from "../services/operadorSession";
import InputSenha from "../components/InputSenha"; // 1. Importe o componente reutilizável
import Swal from "sweetalert2";

export default function ModalLoginCaixa({ onLoginSucesso, onClose }) {
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);

  const fecharAntesDoAlerta = async () => {
    if (!onClose) return;
    onClose();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!codigo) {
      await fecharAntesDoAlerta();
      await Swal.fire(
        "Atenção",
        "Digite o código (PIN) do funcionário.",
        "warning",
      );
      return;
    }

    setCarregando(true);
    try {
      // Busca a lista de funcionários do tenant
      const funcionarios = await getFuncionarios();

      // Procura o funcionário apenas pelo PIN e se ele está ativo
      const funcionario = funcionarios.find(
        (f) => String(f.codigo) === String(codigo) && f.ativo !== false,
      );

      if (!funcionario) {
        throw new Error("PIN não encontrado ou funcionário inativo.");
      }

      // Salva na sessão do PDV
      setOperadorAtual(funcionario);

      await fecharAntesDoAlerta();
      await Swal.fire({
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
      await fecharAntesDoAlerta();
      await Swal.fire(
        "Acesso Negado",
        error.message || "PIN incorreto.",
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
          position: "relative",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "1.25rem",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        )}
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
            Digite seu PIN numérico para operar o PDV
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* AQUI SUBSTITUÍMOS O INPUT COMUM PELO SEU COMPONENTE REUTILIZÁVEL */}
          <InputSenha
            label="Código (PIN) do Funcionário"
            name="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: 101"
            inputStyle={{
              fontSize: "1.25rem",
              textAlign: "center",
              letterSpacing: "0.1em",
              fontWeight: "bold",
              padding: "0.75rem",
            }}
          />

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
              marginTop: "0.5rem",
            }}
          >
            {carregando ? "Verificando..." : "Entrar no Caixa"}
          </button>
        </form>
      </div>
    </div>
  );
}
