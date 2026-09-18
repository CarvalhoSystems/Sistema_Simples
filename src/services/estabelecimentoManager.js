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
 *
 * Os dados são sincronizados com o Firebase para que o mesmo
 * usuário veja os mesmos estabelecimentos em qualquer dispositivo.
 */

import {
  getTenantId,
  getTenant,
  setTenant,
  setTenantByEmail,
} from "../hooks/useTenant";
import { podeAdicionarEstabelecimento } from "./planoManager";
import {
  salvarEstabelecimentosFirebase,
  carregarEstabelecimentosFirebase,
  salvarEstabelecimentoAtivoFirebase,
  carregarEstabelecimentoAtivoFirebase,
} from "./firebaseData";

const ESTABELECIMENTOS_KEY = "pdv_estabelecimentos";
const ESTABELECIMENTO_ATIVO_KEY = "pdv_estabelecimento_ativo";

/**
 * Retorna a chave para a lista de estabelecimentos do usuário
 */
function getEstabelecimentosKey(userId) {
  return `${ESTABELECIMENTOS_KEY}_${userId}`;
}

/**
 * Obtém o UID do usuário principal (dono da conta).
 * IMPORTANTE: getTenantId() pode retornar o ID do estabelecimento ativo (ex: estab_xxx),
 * mas para a lista de estabelecimentos devemos sempre usar o UID do usuário dono.
 */
function getUserId() {
  const tenant = getTenant() || {};
  return tenant.uid || tenant.id || null;
}

/**
 * Lista todos os estabelecimentos do usuário logado
 * Busca do Firebase primeiro (sincronizado entre dispositivos)
 */
export async function listarEstabelecimentos() {
  const userId = getUserId();
  if (!userId) return [];

  // Busca do Firebase primeiro para garantir dados sincronizados
  const estabelecimentosFirebase = await carregarEstabelecimentosFirebase();
  if (estabelecimentosFirebase && estabelecimentosFirebase.length > 0) {
    return estabelecimentosFirebase;
  }

  // Fallback: localStorage
  try {
    const data = localStorage.getItem(getEstabelecimentosKey(userId));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn("Erro ao carregar estabelecimentos:", e);
    return [];
  }
}

/**
 * Salva a lista de estabelecimentos (local + Firebase)
 */
async function salvarEstabelecimentos(userId, estabelecimentos) {
  localStorage.setItem(
    getEstabelecimentosKey(userId),
    JSON.stringify(estabelecimentos),
  );
  // Sincroniza com Firebase
  await salvarEstabelecimentosFirebase(estabelecimentos);
}

/**
 * Obtém o ID do estabelecimento ativo no momento
 * Busca do Firebase primeiro (sincronizado entre dispositivos)
 */
export async function getEstabelecimentoAtivoId() {
  // Busca do Firebase primeiro
  const estabIdFirebase = await carregarEstabelecimentoAtivoFirebase();
  if (estabIdFirebase) {
    return estabIdFirebase;
  }

  try {
    return localStorage.getItem(ESTABELECIMENTO_ATIVO_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Obtém os dados completos do estabelecimento ativo
 */
export async function getEstabelecimentoAtivo() {
  const id = await getEstabelecimentoAtivoId();
  if (!id) return null;

  const estabelecimentos = await listarEstabelecimentos();
  return estabelecimentos.find((e) => e.id === id) || null;
}

/**
 * Cria um novo estabelecimento para o usuário
 */
export async function criarEstabelecimento(nome, ramo = "") {
  const userId = getUserId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  // Verifica limite do plano
  const estabelecimentos = await listarEstabelecimentos();
  const podeAdicionar = await podeAdicionarEstabelecimento(
    estabelecimentos.length,
  );
  if (!podeAdicionar) {
    return {
      success: false,
      error:
        "Limite de estabelecimentos atingido para seu plano. Faça upgrade para adicionar mais.",
    };
  }

  // IMPORTANTE: O primeiro estabelecimento usa o UID do usuário como ID.
  // Isso garante que os dados iniciais (produtos, categorias) salvos em
  // tenants/{uid} sejam usados pelo estabelecimento principal.
  // Estabelecimentos adicionais usam IDs gerados (estab_xxx).
  const novoEstabelecimento = {
    id: estabelecimentos.length === 0 ? userId : `estab_${Date.now()}`,
    nome: nome,
    ramo: ramo,
    criadoEm: new Date().toISOString(),
    ativo: false,
  };

  estabelecimentos.push(novoEstabelecimento);
  await salvarEstabelecimentos(userId, estabelecimentos);

  // Inicializa dados padrão para o novo estabelecimento
  // IMPORTANTE: Não sobrescreve os dados do primeiro estabelecimento (userId)
  // pois os produtos/categorias iniciais já foram salvos no Firebase
  // durante o cadastro (inicializarDadosTenant).
  if (novoEstabelecimento.id !== userId) {
    inicializarDadosEstabelecimento(novoEstabelecimento.id, ramo);
  }

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
export async function alternarEstabelecimento(estabId) {
  const userId = getUserId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  const estabelecimentos = await listarEstabelecimentos();
  const estab = estabelecimentos.find((e) => e.id === estabId);
  if (!estab)
    return { success: false, error: "Estabelecimento não encontrado" };

  // Salva o ID do estabelecimento ativo (local + Firebase)
  await salvarEstabelecimentoAtivoFirebase(estabId);

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
    // Salva também no tenant por email para manter consistência
    if (tenant.email) {
      setTenantByEmail(tenant.email, updatedTenant);
    }
  }

  return { success: true, estabelecimento: estab };
}

/**
 * Remove um estabelecimento
 */
export async function removerEstabelecimento(estabId) {
  const userId = getUserId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  let estabelecimentos = await listarEstabelecimentos();
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
  await salvarEstabelecimentos(userId, estabelecimentos);

  // Se o estabelecimento removido era o ativo, alterna para o primeiro
  const ativoId = await getEstabelecimentoAtivoId();
  if (ativoId === estabId && estabelecimentos.length > 0) {
    await alternarEstabelecimento(estabelecimentos[0].id);
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
export async function renomearEstabelecimento(estabId, novoNome) {
  const userId = getUserId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  const estabelecimentos = await listarEstabelecimentos();
  const estab = estabelecimentos.find((e) => e.id === estabId);
  if (!estab)
    return { success: false, error: "Estabelecimento não encontrado" };

  estab.nome = novoNome;
  await salvarEstabelecimentos(userId, estabelecimentos);

  // Se for o ativo, atualiza o tenant também
  const ativoId = await getEstabelecimentoAtivoId();
  if (ativoId === estabId) {
    const tenant = getTenant();
    if (tenant) {
      tenant.nomeEstabelecimento = novoNome;
      setTenant(tenant);
      // Salva também no tenant por email para manter consistência
      if (tenant.email) {
        setTenantByEmail(tenant.email, tenant);
      }
    }
  }

  return { success: true };
}

/**
 * Obtém a contagem de estabelecimentos do usuário
 */
export async function contarEstabelecimentos() {
  const estabelecimentos = await listarEstabelecimentos();
  return estabelecimentos.length;
}