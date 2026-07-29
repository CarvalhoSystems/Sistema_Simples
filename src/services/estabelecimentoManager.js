/**
 * Gerenciamento de Múltiplos Estabelecimentos
 *
 * Permite que um mesmo usuário (tenant principal) tenha vários
 * estabelecimentos vinculados à sua conta, respeitando os limites
 * do plano contratado.
 *
 * Estrutura no localStorage:
 *   pdv_estabelecimentos_{userId} -> [{ id, nome, ramo, criadoEm, ativo }]
 *   pdv_estabelecimento_ativo -> id do estabelecimento ativo no momento
 *
 * Cada estabelecimento tem seus próprios dados isolados:
 *   pdv_produtos_{estabId}
 *   pdv_vendas_{estabId}
 *   pdv_categorias_{estabId}
 *   pdv_assinatura_{estabId}
 */

import { getTenantId, getTenant, setTenant } from "../hooks/useTenant";
import { podeAdicionarEstabelecimento } from "./planoManager";

const ESTABELECIMENTOS_KEY = "pdv_estabelecimentos";
const ESTABELECIMENTO_ATIVO_KEY = "pdv_estabelecimento_ativo";

/**
 * Retorna a chave para a lista de estabelecimentos do usuário
 */
function getEstabelecimentosKey(userId) {
  return `${ESTABELECIMENTOS_KEY}_${userId}`;
}

/**
 * Lista todos os estabelecimentos do usuário logado
 */
export function listarEstabelecimentos() {
  const userId = getTenantId();
  if (!userId) return [];

  try {
    const data = localStorage.getItem(getEstabelecimentosKey(userId));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn("Erro ao carregar estabelecimentos:", e);
    return [];
  }
}

/**
 * Salva a lista de estabelecimentos
 */
function salvarEstabelecimentos(userId, estabelecimentos) {
  localStorage.setItem(
    getEstabelecimentosKey(userId),
    JSON.stringify(estabelecimentos),
  );
}

/**
 * Obtém o ID do estabelecimento ativo no momento
 */
export function getEstabelecimentoAtivoId() {
  try {
    return localStorage.getItem(ESTABELECIMENTO_ATIVO_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Obtém os dados completos do estabelecimento ativo
 */
export function getEstabelecimentoAtivo() {
  const id = getEstabelecimentoAtivoId();
  if (!id) return null;

  const estabelecimentos = listarEstabelecimentos();
  return estabelecimentos.find((e) => e.id === id) || null;
}

/**
 * Cria um novo estabelecimento para o usuário
 */
export function criarEstabelecimento(nome, ramo = "mercado") {
  const userId = getTenantId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  // Verifica limite do plano
  const estabelecimentos = listarEstabelecimentos();
  if (!podeAdicionarEstabelecimento(estabelecimentos.length)) {
    return {
      success: false,
      error:
        "Limite de estabelecimentos atingido para seu plano. Faça upgrade para adicionar mais.",
    };
  }

  const novoEstabelecimento = {
    id: `estab_${Date.now()}`,
    nome: nome,
    ramo: ramo,
    criadoEm: new Date().toISOString(),
    ativo: false,
  };

  estabelecimentos.push(novoEstabelecimento);
  salvarEstabelecimentos(userId, estabelecimentos);

  // Inicializa dados padrão para o novo estabelecimento
  inicializarDadosEstabelecimento(novoEstabelecimento.id, ramo);

  return { success: true, estabelecimento: novoEstabelecimento };
}

/**
 * Inicializa dados padrão para um novo estabelecimento
 */
function inicializarDadosEstabelecimento(estabId, ramo) {
  // Cria estrutura vazia para produtos, vendas e categorias
  localStorage.setItem(`pdv_produtos_${estabId}`, JSON.stringify([]));
  localStorage.setItem(`pdv_vendas_${estabId}`, JSON.stringify([]));
  localStorage.setItem(`pdv_categorias_${estabId}`, JSON.stringify([]));
}

/**
 * Alterna para um estabelecimento (define como ativo)
 */
export function alternarEstabelecimento(estabId) {
  const userId = getTenantId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  const estabelecimentos = listarEstabelecimentos();
  const estab = estabelecimentos.find((e) => e.id === estabId);
  if (!estab) return { success: false, error: "Estabelecimento não encontrado" };

  // Salva o ID do estabelecimento ativo
  localStorage.setItem(ESTABELECIMENTO_ATIVO_KEY, estabId);

  // Atualiza o tenant no localStorage para refletir o estabelecimento ativo
  const tenant = getTenant();
  if (tenant) {
    const updatedTenant = {
      ...tenant,
      id: estabId,
      uid: userId,
      nomeEstabelecimento: estab.nome,
      ramo: estab.ramo,
      estabelecimentoAtivo: estabId,
    };
    setTenant(updatedTenant);
  }

  return { success: true, estabelecimento: estab };
}

/**
 * Remove um estabelecimento
 */
export function removerEstabelecimento(estabId) {
  const userId = getTenantId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  let estabelecimentos = listarEstabelecimentos();
  const index = estabelecimentos.findIndex((e) => e.id === estabId);
  if (index === -1)
    return { success: false, error: "Estabelecimento não encontrado" };

  // Não permite remover o último estabelecimento
  if (estabelecimentos.length <= 1) {
    return {
      success: false,
      error: "Não é possível remover o único estabelecimento",
    };
  }

  estabelecimentos.splice(index, 1);
  salvarEstabelecimentos(userId, estabelecimentos);

  // Se o estabelecimento removido era o ativo, alterna para o primeiro
  const ativoId = getEstabelecimentoAtivoId();
  if (ativoId === estabId && estabelecimentos.length > 0) {
    alternarEstabelecimento(estabelecimentos[0].id);
  }

  // Limpa dados do estabelecimento removido
  localStorage.removeItem(`pdv_produtos_${estabId}`);
  localStorage.removeItem(`pdv_vendas_${estabId}`);
  localStorage.removeItem(`pdv_categorias_${estabId}`);

  return { success: true };
}

/**
 * Renomeia um estabelecimento
 */
export function renomearEstabelecimento(estabId, novoNome) {
  const userId = getTenantId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  const estabelecimentos = listarEstabelecimentos();
  const estab = estabelecimentos.find((e) => e.id === estabId);
  if (!estab) return { success: false, error: "Estabelecimento não encontrado" };

  estab.nome = novoNome;
  salvarEstabelecimentos(userId, estabelecimentos);

  // Se for o ativo, atualiza o tenant também
  const ativoId = getEstabelecimentoAtivoId();
  if (ativoId === estabId) {
    const tenant = getTenant();
    if (tenant) {
      tenant.nomeEstabelecimento = novoNome;
      setTenant(tenant);
    }
  }

  return { success: true };
}

/**
 * Obtém a contagem de estabelecimentos do usuário
 */
export function contarEstabelecimentos() {
  return listarEstabelecimentos().length;
}