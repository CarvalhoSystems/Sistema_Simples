import { useEffect } from "react";

export default function useKeyboardShortcuts(acoes) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Lista de teclas que queremos monitorar
      const chavesSuportadas = [
        "F2",
        "F3",
        "F5",
        "F6",
        "F7",
        "F8",
        "F9",
        "F10",
        "F11",
        "F12",
        "Escape",
      ];

      if (chavesSuportadas.includes(event.key)) {
        // Impede a ação nativa do navegador (ex: F5 não vai atualizar a página)
        event.preventDefault();

        // Se existir uma função mapeada para essa tecla, ela é executada
        if (acoes[event.key]) {
          acoes[event.key]();
        }
      }
    };

    // Adiciona o ouvinte de evento no carregamento do app
    window.addEventListener("keydown", handleKeyDown);

    // Limpa o ouvinte ao desmontar o componente
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [acoes]);
}
