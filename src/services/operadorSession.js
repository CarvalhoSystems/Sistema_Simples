// src/services/operadorSession.js
import { getTenantId } from "../hooks/useTenant";

const CHAVE_OPERADOR_PREFIX = "pdv_operador_atual_";

export function getOperadorAtual() {
  const tenantId = getTenantId();
  if (!tenantId) return null;

  try {
    const data = sessionStorage.getItem(`${CHAVE_OPERADOR_PREFIX}${tenantId}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Erro ao carregar operador atual:", e);
    return null;
  }
}

export function setOperadorAtual(funcionario) {
  const tenantId = getTenantId();
  if (!tenantId) return;

  try {
    if (funcionario) {
      sessionStorage.setItem(
        `${CHAVE_OPERADOR_PREFIX}${tenantId}`,
        JSON.stringify(funcionario),
      );
    } else {
      sessionStorage.removeItem(`${CHAVE_OPERADOR_PREFIX}${tenantId}`);
    }
  } catch (e) {
    console.error("Erro ao salvar operador atual:", e);
  }
}
