/**
 * Hook para gerenciamento do Tenant (cliente/estabelecimento)
 *
 * Cada usuário cadastrado é um tenant com seu próprio ramo de negócio,
 * produtos, vendas e configurações isoladas.
 */
import { PRODUTOS_PADRAO, CATEGORIAS_PADRAO } from "../services/supabaseClient";

export const TENANT_KEY = "pdv_tenant";

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
  return tenant?.id || tenant?.uid || null;
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
      ambiente: "homologacao",
    },
  };
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
