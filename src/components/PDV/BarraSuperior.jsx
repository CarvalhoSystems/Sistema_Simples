import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOperadorAtual,
  setOperadorAtual,
} from "../../services/operadorSession"; // Ajuste o caminho se necessário
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";

export default function BarraSuperior() {
  const [hora, setHora] = useState("");
  const [operadorNome, setOperadorNome] = useState("CAIXA 01");
  const navigate = useNavigate();

  useEffect(() => {
    // Carrega o nome do operador logado na sessão atual
    const operador = getOperadorAtual();
    if (operador && operador.nome) {
      setOperadorNome(operador.nome);
    }

    const atualizarHora = () => {
      const agora = new Date();
      setHora(agora.toLocaleString("pt-BR"));
    };
    atualizarHora();
    const interval = setInterval(atualizarHora, 1000);
    return () => clearInterval(interval);
  }, []);

  // Função para tratar a tentativa de sair do Caixa (pressionar ESC ou clicar)
  const handleSairDoCaixa = async () => {
    const { value: senhaAdmin } = await Swal.fire({
      title: "Área Restrita",
      text: "Digite a senha do Administrador para sair do Caixa:",
      input: "password",
      inputPlaceholder: "Senha do Admin",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1e3a8a",
    });

    if (senhaAdmin) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && user.email) {
          // Reautentica com o e-mail do admin atual e a senha digitada
          await signInWithEmailAndPassword(auth, user.email, senhaAdmin);

          // Limpa o operador da sessão e volta para o dashboard
          setOperadorAtual(null);
          navigate("/dashboard"); // Ajuste a rota se o seu dashboard for outra URL
        } else {
          throw new Error("Sessão do administrador não encontrada.");
        }
      } catch (error) {
        console.error("Erro ao validar senha:", error);
        Swal.fire(
          "Senha Incorreta",
          "A senha informada está incorreta.",
          "error",
        );
      }
    }
  };

  // Opcional: Permitir pressionar a tecla ESC para acionar a saída protegida
  /*useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSairDoCaixa();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);*/

  return (
    <div className="bg-[#1e3a8a] text-white px-4 py-2 flex justify-between items-center text-sm font-bold shadow-md border-b-2 border-[#172554]">
      <div className="flex items-center gap-6">
        <span className="text-xl italic font-black tracking-tighter text-[#eff6ff]">
          FÁCIL{" "}
          <span className="text-xs font-normal not-italic text-blue-200">
            Sistemas
          </span>
        </span>
      </div>
      <div className="flex gap-8 text-xs font-mono">
        <span>
          Operador:{" "}
          <span className="text-blue-200 uppercase">{operadorNome}</span>
        </span>
        <span>
          Nº da Venda: <span className="text-amber-300">{""}|</span>
        </span>
        <span>{hora}</span>
      </div>
      <div className="flex gap-4 text-xs font-mono items-center">
        <span>F1 - Ajuda</span>
        <button
          onClick={handleSairDoCaixa}
          className="text-red-300 animate-pulse hover:text-red-100 bg-transparent border-none cursor-pointer font-mono text-xs"
        >
          ESC - Sair
        </button>
      </div>
    </div>
  );
}
