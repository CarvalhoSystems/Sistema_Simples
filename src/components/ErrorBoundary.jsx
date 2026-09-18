import React from "react";
import Swal from "sweetalert2";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você pode registrar o erro em um serviço de log aqui (ex: Sentry, console)
    console.error("Erro capturado pelo Error Boundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI personalizada de fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 text-red-600">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Ops! Algo deu errado.
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Ocorreu um erro inesperado nesta tela. Nossa equipe foi
              notificada, ou você pode recarregar a página para continuar.
            </p>
            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
