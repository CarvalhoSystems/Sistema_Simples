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
  carregarTenantFirebase,
  salvarEstabelecimentoAtivoFirebase,
  carregarEstabelecimentoAtivoFirebase,
  carregarInfoTenantFirebase,
  salvarInfoTenantFirebase,
} from "./firebaseData";

const ESTABELECIMENTOS_KEY = "pdv_estabelecimentos";
const ESTABELECIMENTO_ATIVO_KEY = "pdv_estabelecimento_ativo";
const CAMPOS_INFO_ESTABELECIMENTO = [
  "nomeFantasia",
  "cnpj",
  "endereco",
  "telefone",
  "pixKey",
  "pixHolder",
  "receiptMessage",
  "cartaoProvedor",
  "mercadoPagoAccessToken",
  "mercadoPagoDeviceId",
  "mercadoPagoCommercialAddress",
];
const criacoesEmAndamento = new Set();

/**
 * Retorna a chave para a lista de estabelecimentos do usuário
 */
function getEstabelecimentosKey(userId) {
  return `${ESTABELECIMENTOS_KEY}_${userId}`;
}

function gerarEstabelecimentoId() {
  return `estab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function notificarEstabelecimentosAlterados(estabId) {
  window.dispatchEvent(
    new CustomEvent("estabelecimento-alterado", { detail: { id: estabId } }),
  );
}

async function recuperarEstabelecimentoPrincipal(estabelecimentos, userId) {
  if (estabelecimentos.length === 0) return estabelecimentos;

  const tenant = getTenant() || {};
  const dadosPrincipais = await carregarTenantFirebase(userId);
  const infoPrincipal = dadosPrincipais?.info || {};
  const indicePrincipal = estabelecimentos.findIndex(
    (estab) => estab.id === userId,
  );
  const nomePrincipal =
    infoPrincipal.nomeEstabelecimento ||
    infoPrincipal.nomeFantasia ||
    tenant.nomeFantasia ||
    (tenant.id === userId ? tenant.nomeEstabelecimento : null) ||
    "Loja principal";
  const criadoEmPrincipal =
    infoPrincipal.criadoEm || tenant.criadoEm || new Date().toISOString();
  let alterado = false;

  if (indicePrincipal === -1) {
    estabelecimentos.unshift({
      id: userId,
      nome: nomePrincipal,
      ramo: infoPrincipal.ramo || tenant.ramo || "mercado",
      criadoEm: criadoEmPrincipal,
      ativo: false,
    });
    alterado = true;
  } else {
    const principal = estabelecimentos[indicePrincipal];
    const dataCadastro = Date.parse(criadoEmPrincipal);
    const dataRegistro = Date.parse(principal.criadoEm);
    const registroCriadoDepois =
      Number.isFinite(dataCadastro) &&
      Number.isFinite(dataRegistro) &&
      dataRegistro - dataCadastro > 60_000;

    if (registroCriadoDepois && principal.nome !== nomePrincipal) {
      const estabelecimentoRecuperado = {
        ...principal,
        id: gerarEstabelecimentoId(),
        ativo: false,
      };
      estabelecimentos[indicePrincipal] = {
        id: userId,
        nome: nomePrincipal,
        ramo: infoPrincipal.ramo || tenant.ramo || "mercado",
        criadoEm: criadoEmPrincipal,
        ativo: false,
      };
      estabelecimentos.push(estabelecimentoRecuperado);
      alterado = true;

      const ativoAtual =
        (await carregarEstabelecimentoAtivoFirebase()) ||
        localStorage.getItem(ESTABELECIMENTO_ATIVO_KEY);
      if (!ativoAtual || ativoAtual === userId) {
        await salvarEstabelecimentoAtivoFirebase(estabelecimentoRecuperado.id);
        const tenantBase = { ...tenant };
        CAMPOS_INFO_ESTABELECIMENTO.forEach(
          (campo) => delete tenantBase[campo],
        );
        const updatedTenant = {
          ...tenantBase,
          id: estabelecimentoRecuperado.id,
          uid: userId,
          nomeEstabelecimento: estabelecimentoRecuperado.nome,
          ramo: estabelecimentoRecuperado.ramo,
          estabelecimentoAtivo: estabelecimentoRecuperado.id,
        };
        setTenant(updatedTenant);
        if (tenant.email) setTenantByEmail(tenant.email, updatedTenant);
      }
    }
  }

  if (alterado) {
    await salvarEstabelecimentos(userId, estabelecimentos);
    notificarEstabelecimentosAlterados(
      estabelecimentos.find((estab) => estab.id !== userId)?.id || userId,
    );
  }

  return estabelecimentos;
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
  let estabelecimentos = estabelecimentosFirebase;

  if (!Array.isArray(estabelecimentos) || estabelecimentos.length === 0) {
    try {
      const data = localStorage.getItem(getEstabelecimentosKey(userId));
      estabelecimentos = data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Erro ao carregar estabelecimentos:", e);
      estabelecimentos = [];
    }
  }

  return recuperarEstabelecimentoPrincipal(estabelecimentos, userId);
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
    return localStorage.getItem(ESTABELECIMENTO_ATIVO_KEY) || getTenantId();
  } catch (e) {
    return getTenantId();
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
  if (criacoesEmAndamento.has(userId)) {
    return {
      success: false,
      error: "A criação de um estabelecimento já está em andamento.",
    };
  }

  criacoesEmAndamento.add(userId);
  try {
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
      id: estabelecimentos.length === 0 ? userId : gerarEstabelecimentoId(),
      nome: nome,
      ramo: ramo,
      criadoEm: new Date().toISOString(),
      ativo: false,
    };

    estabelecimentos.push(novoEstabelecimento);
    await salvarEstabelecimentos(userId, estabelecimentos);

    // Inicializa dados padrão para um novo estabelecimento
    // IMPORTANTE: Não sobrescreve os dados do primeiro estabelecimento (userId)
    // pois os produtos/categorias iniciais já foram salvos no Firebase
    // durante o cadastro (inicializarDadosTenant).
    if (novoEstabelecimento.id !== userId) {
      inicializarDadosEstabelecimento(novoEstabelecimento.id, ramo);
    }

    notificarEstabelecimentosAlterados(novoEstabelecimento.id);

    return { success: true, estabelecimento: novoEstabelecimento };
  } finally {
    criacoesEmAndamento.delete(userId);
  }
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
    const chaveInfoAtual = `pdv_tenant_info_${tenant.id}`;
    if (!localStorage.getItem(chaveInfoAtual)) {
      const infoAtual = Object.fromEntries(
        Object.entries(tenant).filter(([campo]) =>
          CAMPOS_INFO_ESTABELECIMENTO.includes(campo),
        ),
      );
      if (Object.keys(infoAtual).length > 0) {
        localStorage.setItem(chaveInfoAtual, JSON.stringify(infoAtual));
      }
    }
    const infoEstabelecimento = await carregarInfoTenantFirebase(estabId);
    const tenantBase = { ...tenant };
    CAMPOS_INFO_ESTABELECIMENTO.forEach((campo) => delete tenantBase[campo]);
    const updatedTenant = {
      ...tenantBase,
      ...infoEstabelecimento,
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
    notificarEstabelecimentosAlterados(estabId);
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
  localStorage.removeItem(`pdv_tenant_info_${estabId}`);
  localStorage.removeItem(`pdv_nfp_config_${estabId}`);
  localStorage.removeItem(`pdv_nfp_notas_${estabId}`);
  localStorage.removeItem(`pdv_caixaFechado_${estabId}`);
  localStorage.removeItem(`pdv_dadosFechamento_${estabId}`);
  notificarEstabelecimentosAlterados();

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

  if (estabId === userId) {
    const infoPrincipal = await carregarInfoTenantFirebase(userId);
    await salvarInfoTenantFirebase(
      { ...infoPrincipal, nomeEstabelecimento: novoNome },
      userId,
    );
  }

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

export async function alterarRamoEstabelecimento(estabId, novoRamo) {
  const userId = getUserId();
  if (!userId) return { success: false, error: "Usuário não encontrado" };

  const estabelecimentos = await listarEstabelecimentos();
  const estab = estabelecimentos.find((item) => item.id === estabId);
  if (!estab) {
    return { success: false, error: "Estabelecimento não encontrado" };
  }

  estab.ramo = novoRamo;
  await salvarEstabelecimentos(userId, estabelecimentos);

  const ativoId = await getEstabelecimentoAtivoId();
  if (ativoId === estabId) {
    const tenant = getTenant();
    if (tenant) {
      const updatedTenant = { ...tenant, ramo: novoRamo };
      setTenant(updatedTenant);
      if (tenant.email) setTenantByEmail(tenant.email, updatedTenant);
    }
  }

  notificarEstabelecimentosAlterados(estabId);
  return { success: true };
}

/**
 * Obtém a contagem de estabelecimentos do usuário
 */
export async function contarEstabelecimentos() {
  const estabelecimentos = await listarEstabelecimentos();
  return estabelecimentos.length;
}