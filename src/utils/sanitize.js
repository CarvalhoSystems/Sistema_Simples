/**
 * Remove caracteres que podem ser usados para injeção de HTML.
 * Isso é uma medida de segurança para previnir ataques de XSS (Cross-Site Scripting).
 *
 * @param {string} input - A string a ser sanitizada.
 * @returns {string} A string sanitizada.
 */
export function sanitizeInput(input) {
  return typeof input === "string" ? input.replace(/[<>]/g, "") : input;
}