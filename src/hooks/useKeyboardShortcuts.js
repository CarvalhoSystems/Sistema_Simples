import { useEffect } from "react";

/**
 * Hook customizado para registrar e remover listeners de atalhos de teclado.
 * @param {Object.<string, function>} actions - Um objeto onde as chaves são os códigos das teclas (ex: 'F1', 'Enter') e os valores são as funções a serem executadas.
 */
export default function useKeyboardShortcuts(actions) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Verifica se um modal do SweetAlert está ativo. Se estiver, não faz nada.
      const isSwalOpen = document.body.classList.contains("swal2-shown");
      if (isSwalOpen) {
        return;
      }

      const action = actions[event.key];

      if (action) {
        event.preventDefault();
        action();
        return false; // Adicionado para garantir a prevenção em todos os navegadores
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Função de limpeza para remover o listener quando o componente for desmontado
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions]); // O efeito será re-executado se as ações mudarem
}