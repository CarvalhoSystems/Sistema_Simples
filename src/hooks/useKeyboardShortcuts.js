import { useEffect } from "react";

/**
 * Hook customizado para registrar e remover listeners de atalhos de teclado.
 * @param {Object.<string, function>} actions - Objeto com os atalhos (ex: { F10: fn, "Alt+F11": fn, Escape: fn }).
 * @param {boolean} [disabled=false] - Se true, bloqueia atalhos normais mas permite fechar/alternar modais.
 */
export default function useKeyboardShortcuts(actions, disabled = false) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 1. Identifica se o usuário pressionou com Alt ou Ctrl
      let keyCombination = event.key;

      if (event.altKey && event.key !== "Alt") {
        keyCombination = `Alt+${event.key}`;
      } else if (event.ctrlKey && event.key !== "Control") {
        keyCombination = `Ctrl+${event.key}`;
      }

      // 2. Se estiver digitando num input/textarea normal e NÃO for tecla especial (F1-F12 / ESC / Atalhos com Alt/Ctrl)
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
        event.target.tagName,
      );
      const isFunctionKey =
        /^F\d{1,2}$/.test(event.key) ||
        event.key === "Escape" ||
        event.altKey ||
        event.ctrlKey;

      if (isInput && !isFunctionKey) {
        return;
      }

      // 3. Se o SweetAlert2 estiver aberto, ignora
      const isSwalOpen = document.body.classList.contains("swal2-shown");
      if (isSwalOpen) {
        return;
      }

      // 4. Se o modal F10 está aberto (disabled = true), só permite ESC e F10
      if (disabled && !["Escape", "F10"].includes(event.key)) {
        return;
      }

      // Busca a ação correspondente (ex: "F10" ou "Alt+F11")
      const action = actions[keyCombination] || actions[event.key];

      if (action) {
        event.preventDefault(); // Impede o comportamento padrão do navegador (como o F11 de tela cheia)
        action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions, disabled]);
}
