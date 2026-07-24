import { useEffect } from "react";

/**
 * Hook customizado para registrar e remover listeners de atalhos de teclado.
 * @param {Object.<string, function>} actions - Objeto com os atalhos.
 * @param {boolean} [disabled=false] - Se true, bloqueia atalhos normais mas permite fechar/alternar modais.
 */
export default function useKeyboardShortcuts(actions, disabled = false) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 1. Se estiver digitando num input/textarea normal e NÃO for uma tecla de função (F1-F12 / ESC)
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
        event.target.tagName,
      );
      const isFunctionKey =
        /^F\d{1,2}$/.test(event.key) || event.key === "Escape";

      // Se o usuário está num campo de busca e apertou uma letra/número normal, deixa ele digitar!
      if (isInput && !isFunctionKey) {
        return;
      }

      // 2. Se o SweetAlert2 estiver aberto, não interfere
      const isSwalOpen = document.body.classList.contains("swal2-shown");
      if (isSwalOpen) {
        return;
      }

      // 3. Se o modal F10 está aberto (disabled = true), só permite ESC e F10
      if (disabled && !["Escape", "F10"].includes(event.key)) {
        return;
      }

      const action = actions[event.key];

      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions, disabled]);
}
