/**
 * Hook para gerenciamento do Tenant (cliente/estabelecimento)
 *
 * Cada usuário cadastrado é um tenant com seu próprio ramo de negócio,
 * produtos, vendas e configurações isoladas.
 */
import {
  PRODUTOS_PADRAO,
  CATEGORIAS_PADRAO,
} from "../services/supabaseClient.js";

export const TENANT_KEY = "pdv_tenant";

export function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

function getTenantEmailStorageKey(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  return `${TENANT_KEY}_email_${btoa(normalizedEmail)}`;
}

/**
 * Obtém o tenant atual do localStorage
 */
export function getTenant() {
  try {
    const data = localStorage.getItem(TENANT_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Erro ao carregar tenant:", e);
  }
  return null;
}

/**
 * Salva o tenant no localStorage
 */
export function setTenant(tenantData) {
  localStorage.setItem(TENANT_KEY, JSON.stringify(tenantData));
}

/**
 * Remove o tenant do localStorage (logout)
 */
export function clearTenant() {
  localStorage.removeItem(TENANT_KEY);
  localStorage.removeItem("pdv_estabelecimento_ativo");
}

/**
 * Verifica se o tenant está configurado
 */
export function hasTenant() {
  return !!getTenant();
}

/**
 * Obtém o ID do tenant atual
 */
export function getTenantId() {
  const tenant = getTenant();
  const tenantId = tenant?.id || tenant?.uid || null;
  console.log("🔑 getTenantId - tenant:", tenant, "ID:", tenantId);
  return tenantId;
}

/**
 * Obtém o ramo de negócio do tenant atual
 */
export function getTenantRamo() {
  const tenant = getTenant();
  return tenant?.ramo || "mercado";
}

/**
 * Inicializa os dados padrão para um novo tenant baseado no ramo
 */
export function getInitialDataForRamo(ramoId) {
  return {
    produtos: PRODUTOS_PADRAO[ramoId] || PRODUTOS_PADRAO.mercado,
    categorias: CATEGORIAS_PADRAO[ramoId] || CATEGORIAS_PADRAO.mercado,
    vendas: [],
    configNFP: {
      razaoSocial: "",
      cnpj: "",
      ie: "",
      ambiente: "producao",
    },
  };
}

/**
 * Obtém tenant específico de um usuário pelo email
 * Isso permite que cada usuário tenha seus dados isolados
 */
export function resolveTenantForLogin(
  email,
  currentTenant = null,
  tenantPorEmail = null,
  estabelecimentoAtivoId = null,
) {
  const normalizedEmail = normalizeEmail(email);

  const tenantFromEmail = tenantPorEmail || getTenantByEmail(normalizedEmail);
  if (tenantFromEmail) {
    return { ...tenantFromEmail, email: normalizedEmail };
  }

  const tenantPersistido = currentTenant || getTenant();
  if (
    tenantPersistido &&
    normalizeEmail(tenantPersistido.email) === normalizedEmail
  ) {
    return { ...tenantPersistido, email: normalizedEmail };
  }

  if (estabelecimentoAtivoId) {
    return {
      id: estabelecimentoAtivoId,
      uid: estabelecimentoAtivoId,
      nome: normalizedEmail || "Usuário",
      nomeEstabelecimento: "Meu Estabelecimento",
      email: normalizedEmail,
      ramo: "mercado",
      criadoEm: new Date().toISOString(),
      estabelecimentoAtivo: estabelecimentoAtivoId,
    };
  }

  return null;
}

export function getTenantByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  try {
    const key = getTenantEmailStorageKey(normalizedEmail);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Erro ao carregar tenant por email:", e);
  }
  return null;
}

/**
 * Salva tenant específico de um usuário pelo email
 * Também atualiza o tenant ativo
 */
export function setTenantByEmail(email, tenantData) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !tenantData) return;
  try {
    const key = getTenantEmailStorageKey(normalizedEmail);
    const tenantToStore = {
      ...tenantData,
      email: normalizedEmail,
    };
    localStorage.setItem(key, JSON.stringify(tenantToStore));
    // Também atualiza o tenant ativo
    setTenant(tenantToStore);
  } catch (e) {
    console.warn("Erro ao salvar tenant por email:", e);
  }
}

/**
 * Remove tenant específico de um usuário pelo email
 */
export function clearTenantByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;
  try {
    const key = getTenantEmailStorageKey(normalizedEmail);
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Erro ao limpar tenant por email:", e);
  }
}

export default function useTenant() {
  const tenant = getTenant();

  return {
    tenant,
    isAuthenticated: !!tenant,
    ramo: tenant?.ramo || "mercado",
    nomeEstabelecimento:
      tenant?.nomeEstabelecimento || tenant?.email || "Meu Estabelecimento",
    email: tenant?.email || "",
    tenantId: getTenantId(),
  };
}
