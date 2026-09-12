import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, BarChart3, Users } from "lucide-react";
import Swal from "sweetalert2";
import { getFuncionarios, verificarPinAdmin } from "../services/tenantData";
import GerenciarFuncionarios from "../components/GerenciarFuncionarios.jsx";
import ModalLoginCaixa from "../components/ModalLoginCaixa.jsx";

export default function SelecaoObjetivo() {
  const [mostrarModalFuncionarios, setMostrarModalFuncionarios] =
    useState(false);
  const [mostrarModalCaixa, setMostrarModalCaixa] = useState(false);
  const [destinoAposLogin, setDestinoAposLogin] = useState("/caixa");

  const navigate = useNavigate();

  // Esta função roda assim que o PIN do caixa é validado com sucesso
  const handleLoginSucesso = (funcionario) => {
    setMostrarModalCaixa(false);

    // Se o destino for o Dashboard, fazemos uma checagem de cargo aqui para garantir segurança
    if (destinoAposLogin === "/dashboard") {
      const cargo = String(funcionario?.cargo || "")
        .trim()
        .toLowerCase();
      const ehAdminOuGerente = cargo === "admin" || cargo === "gerente";

      if (!ehAdminOuGerente) {
        Swal.fire({
          icon: "error",
          title: "Acesso Negado",
          text: "Este funcionário não tem permissão para acessar o Dashboard.",
        });
        return; // Interrompe e não deixa ir para o dashboard
      }
    }

    // Se passou, vai para o destino correto (/caixa ou /dashboard)
    navigate(destinoAposLogin);
  };

  const abrirLogin = (destino) => {
    setDestinoAposLogin(destino);
    setMostrarModalCaixa(true);
  };

  // Clique do botão Gerenciar Funcionários com proteção para o 1º Acesso
  const handleGerenciarFuncionariosClick = async () => {
    try {
      const lista = await getFuncionarios();
      const existeAdministrador = (lista || []).some((funcionario) => {
        const cargo = String(funcionario.cargo || "")
          .trim()
          .toLowerCase();
        return (
          funcionario.ativo !== false &&
          (cargo === "admin" || cargo === "gerente")
        );
      });

      if (!existeAdministrador) {
        await Swal.fire({
          icon: "info",
          title: "Primeiro Acesso",
          text: "Nenhum Administrador cadastrado. Cadastre o primeiro Administrador agora.",
        });
        setMostrarModalFuncionarios(true);
        return;
      }

      const autorizado = await verificarPinAdmin();
      if (autorizado) {
        setMostrarModalFuncionarios(true);
      }
    } catch (error) {
      console.error("Erro ao verificar administradores:", error);
      await Swal.fire({
        icon: "error",
        title: "Não foi possível verificar o acesso",
        text: "Tente novamente.",
      });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm py-6 px-6 flex justify-between items-center max-w-6xl mx-auto w-full rounded-b-2xl">
        <div>
          <h1 className="text-2xl font-bold text-800">Painel Principal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Escolha o objetivo ou gerencie sua equipe
          </p>
        </div>

        <button
          onClick={handleGerenciarFuncionariosClick}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Users className="w-4 h-4" />
          Gerenciar Funcionários
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Card do Caixa (Abre direto para qualquer operador) */}
          <div
            onClick={() => abrirLogin("/caixa")}
            className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-transparent hover:border-emerald-500 cursor-pointer w-full"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Calculator className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acessar Caixa
            </h2>
            <p className="text-gray-500 text-sm">
              Gerencie vendas, pagamentos, aberturas e fechamentos de caixa.
            </p>
          </div>

          {/* Card do Dashboard (Exigirá login e validação de admin/gerente) */}
          <div
            onClick={() => abrirLogin("/dashboard")}
            className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-transparent hover:border-blue-500 cursor-pointer w-full"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acessar Dashboard
            </h2>
            <p className="text-gray-500 text-sm">
              Visualize relatórios, métricas de desempenho e gráficos gerais.
            </p>
          </div>
        </div>
      </main>

      {/* Modal de Login */}
      {mostrarModalCaixa && (
        <ModalLoginCaixa
          onLoginSucesso={handleLoginSucesso}
          onClose={() => setMostrarModalCaixa(false)}
        />
      )}

      {/* Modal de Funcionários */}
      {mostrarModalFuncionarios && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setMostrarModalFuncionarios(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              &times;
            </button>
            <GerenciarFuncionarios />
          </div>
        </div>
      )}

      <footer className="text-center py-4 text-xs text-gray-400">
        &copy; 2026 - Todos os direitos reservados.
      </footer>
    </div>
  );
}
