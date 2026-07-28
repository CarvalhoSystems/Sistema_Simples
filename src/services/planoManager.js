/**
 * Gerenciamento de Planos e Assinaturas
 *
 * Controla:
 * - Plano de cada cliente (Free, Básico, Profissional, Premium)
 * - Período de teste grátis (7 dias)
 * - Status da mensalidade (ativa, vencida, cancelada)
 * - Limites por plano (estabelecimentos, usuários, features)
 *
 * USO: Este serviço funciona com localStorage + Firebase.
 * Quando o Firebase estiver configurado, os dados sobem para nuvem.
 */

import { firebaseDisponivel, db } from "./firebaseClient";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getTenantId, getTenant } from "../hooks/useTenant";

// ===== CONFIGURAÇÃO DOS PLANOS =====

export const PLANOS = {
  free: {
    id: "free",
    nome: "Free",
    preco: 0,
    periodo: "7 dias grátis",
    maxEstabelecimentos: 1,
    maxProdutos: 50,
    maxUsuarios: 1,
    features: {
      pdv: true,
      dashboard: true,
      relatorios: false,
      nfp: false,
      backup: false,
      api: false,
      multiplosEstabelecimentos: false,
    },
  },
  basico: {
    id: "basico",
    nome: "Básico",
    preco: 79.9,
    periodo: "/mês",
    maxEstabelecimentos: 1,
    maxProdutos: Infinity,
    maxUsuarios: 1,
    features: {
      pdv: true,
      dashboard: true,
      relatorios: true,
      nfp: false,
      backup: true,
      api: false,
      multiplosEstabelecimentos: false,
    },
  },
  profissional: {
    id: "profissional",
    nome: "Profissional",
    preco: 99.9,
    periodo: "/mês",
    maxEstabelecimentos: 3,
    maxProdutos: Infinity,
    maxUsuarios: 3,
    features: {
      pdv: true,
      dashboard: true,
      relatorios: true,
      nfp: true,
      backup: true,
      api: false,
      multiplosEstabelecimentos: true,
    },
  },
  premium: {
    id: "premium",
    nome: "Premium",
    preco: 149.9,
    periodo: "/mês",
    maxEstabelecimentos: Infinity,
    maxProdutos: Infinity,
    maxUsuarios: Infinity,
    features: {
      pdv: true,
      dashboard: true,
      relatorios: true,
      nfp: true,
      backup: true,
      api: true,
      multiplosEstabelecimentos: true,
    },
  },
};

// ===== CHAVES DO LOCALSTORAGE =====

const ASSINATURA_KEY = "pdv_assinatura";

// ===== FUNÇÕES DE ASSINATURA =====

/**
 * Cria uma nova assinatura para o tenant
 */
export function criarAssinatura(planoId, periodoTeste = true) {
  const tenantId = getTenantId();
  if (!tenantId) return null;

  const agora = new Date();
  const plano = PLANOS[planoId] || PLANOS.free;

  const assinatura = {
    tenantId,
    planoId: plano.id,
    status: periodoTeste ? "trial" : "ativa",
    iniciadoEm: agora.toISOString(),
    trialExpiracao: periodoTeste
      ? new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null,
    ultimoPagamento: null,
    proximoVencimento: periodoTeste
      ? new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    renovacaoAutomatica: true,
    historicoPagamentos: [],
  };

  salvarAssinatura(assinatura);
  return assinatura;
}

/**
 * Salva a assinatura no localStorage e tenta no Firebase
 */
export function salvarAssinatura(assinatura) {
  localStorage.setItem(ASSINATURA_KEY, JSON.stringify(assinatura));

  // Tenta salvar no Firebase
  if (firebaseDisponivel && db) {
    const tenantId = getTenantId();
    if (tenantId) {
      const docRef = doc(db, "tenants", tenantId);
      setDoc(docRef, { assinatura }, { merge: true }).catch((err) =>
        console.warn("Erro ao salvar assinatura no Firebase:", err),
      );
    }
  }
}

/**
 * Carrega a assinatura do tenant
 */
export function carregarAssinatura() {
  try {
    const data = localStorage.getItem(ASSINATURA_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Erro ao carregar assinatura:", e);
  }
  return null;
}

/**
 * Verifica o status atual da assinatura
 */
export function verificarStatusAssinatura() {
  const assinatura = carregarAssinatura();
  if (!assinatura) {
    return {
      ativo: false,
      status: "sem_assinatura",
      plano: PLANOS.free,
      diasRestantes: 0,
      mensagem: "Sem assinatura ativa",
    };
  }

  const agora = new Date();
  const vencimento = new Date(assinatura.proximoVencimento);
  const diasRestantes = Math.ceil(
    (vencimento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Verifica se trial expirou
  if (assinatura.status === "trial") {
    const trialFim = new Date(assinatura.trialExpiracao);
    if (agora > trialFim) {
      assinatura.status = "expirado";
      salvarAssinatura(assinatura);
      return {
        ativo: false,
        status: "trial_expirado",
        plano: PLANOS[assinatura.planoId] || PLANOS.free,
        diasRestantes: 0,
        mensagem: "Período de teste expirou. Escolha um plano!",
      };
    }
    return {
      ativo: true,
      status: "trial",
      plano: PLANOS[assinatura.planoId] || PLANOS.free,
      diasRestantes,
      mensagem: `${diasRestantes} dias restantes do teste grátis`,
    };
  }

  // Verifica se está ativo
  if (assinatura.status === "ativa") {
    if (diasRestantes <= 0) {
      assinatura.status = "vencida";
      salvarAssinatura(assinatura);
      return {
        ativo: false,
        status: "vencida",
        plano: PLANOS[assinatura.planoId] || PLANOS.free,
        diasRestantes: 0,
        mensagem: "Assinatura vencida. Renove para continuar!",
      };
    }
    return {
      ativo: true,
      status: "ativa",
      plano: PLANOS[assinatura.planoId] || PLANOS.free,
      diasRestantes,
      mensagem: `Próximo vencimento em ${diasRestantes} dias`,
    };
  }

  return {
    ativo: false,
    status: assinatura.status,
    plano: PLANOS[assinatura.planoId] || PLANOS.free,
    diasRestantes: 0,
    mensagem: "Assinatura não ativa",
  };
}

/**
 * Verifica se uma feature está disponível no plano atual
 */
export function featureDisponivel(featureName) {
  const status = verificarStatusAssinatura();
  if (!status.ativo) return false;
  return status.plano.features[featureName] === true;
}

/**
 * Verifica se pode adicionar mais estabelecimentos
 */
export function podeAdicionarEstabelecimento(qtdAtual) {
  const status = verificarStatusAssinatura();
  if (!status.ativo) return false;
  return qtdAtual < status.plano.maxEstabelecimentos;
}

/**
 * Verifica se pode adicionar mais produtos
 */
export function podeAdicionarProduto(qtdAtual) {
  const status = verificarStatusAssinatura();
  if (!status.ativo) return false;
  return qtdAtual < status.plano.maxProdutos;
}

/**
 * Registra um pagamento (simulado)
 */
export function registrarPagamento(planoId, valor) {
  const assinatura = carregarAssinatura();
  if (!assinatura) return null;

  const agora = new Date();

  assinatura.status = "ativa";
  assinatura.planoId = planoId;
  assinatura.ultimoPagamento = agora.toISOString();
  assinatura.proximoVencimento = new Date(
    agora.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  assinatura.historicoPagamentos.push({
    data: agora.toISOString(),
    valor,
    planoId,
    metodo: "simulado",
  });

  salvarAssinatura(assinatura);
  return assinatura;
}

/**
 * Cancela a assinatura
 */
export function cancelarAssinatura() {
  const assinatura = carregarAssinatura();
  if (!assinatura) return;

  assinatura.status = "cancelada";
  assinatura.renovacaoAutomatica = false;
  salvarAssinatura(assinatura);
}

/**
 * Inicializa a assinatura para um novo tenant (7 dias grátis)
 */
export function inicializarAssinatura(planoId = "profissional") {
  return criarAssinatura(planoId, true);
}

// ===== PAINEL ADMIN (para você gerenciar) =====

/**
 * Gera relatório de todos os tenants cadastrados
 * (apenas para uso do administrador)
 */
export function gerarRelatorioAdmin() {
  const tenants = [];
  const keys = Object.keys(localStorage);

  // Procura todos os tenants salvos
  for (const key of keys) {
    if (key.startsWith("pdv_tenant")) {
      try {
        const tenant = JSON.parse(localStorage.getItem(key));
        const assinatura = JSON.parse(
          localStorage.getItem(ASSINATURA_KEY) || "null",
        );
        const vendas = JSON.parse(
          localStorage.getItem(`pdv_vendas_${tenant.id}`) || "[]",
        );

        tenants.push({
          id: tenant.id,
          nome: tenant.nomeEstabelecimento || tenant.nome,
          email: tenant.email,
          ramo: tenant.ramo,
          criadoEm: tenant.criadoEm,
          totalVendas: vendas.length,
          valorTotalVendas: vendas.reduce(
            (acc, v) => acc + (v.total || 0),
            0,
          ),
          assinatura: assinatura
            ? {
                plano: assinatura.planoId,
                status: assinatura.status,
                trialExpiracao: assinatura.trialExpiracao,
                proximoVencimento: assinatura.proximoVencimento,
              }
            : null,
        });
      } catch (e) {
        // Ignora erros
      }
    }
  }

  return tenants;
}

/**
 * Obtém dados do tenant para exibição no dashboard
 */
export function getDadosTenant() {
  const tenant = getTenant();
  const assinatura = carregarAssinatura();
  const status = verificarStatusAssinatura();

  return {
    tenant,
    assinatura,
    status,
    plano: status.plano,
  };
}

// ===== CONTROLE MANUAL (Admin) =====

/**
 * Altera o plano de um tenant manualmente
 */
export function alterarPlanoManual(tenantId, novoTenant, novoPlanoId) {
  try {
    // Salva no tenant
    const tenantKey = `pdv_tenant_${tenantId}`;
    const tenantSalvo = localStorage.getItem(tenantKey);
    if (!tenantSalvo) return { success: false, error: "Tenant não encontrado" };

    const tenant = JSON.parse(tenantSalvo);
    tenant.assinatura = tenant.assinatura || {};
    tenant.assinatura.plano = novoPlanoId;

    // Atualiza a assinatura
    const assinatura = JSON.parse(localStorage.getItem(ASSINATURA_KEY) || "{}");
    assinatura.planoId = novoPlanoId;
    assinatura.tenantId = tenantId;
    salvarAssinatura(assinatura);

    return { success: true, mensagem: `Plano alterado para ${PLANOS[novoPlanoId]?.nome || novoPlanoId}` };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Renova trial do tenant por mais 7 dias
 */
export function renovarTrialManual(tenantId, dias = 7) {
  try {
    const assinatura = JSON.parse(localStorage.getItem(ASSINATURA_KEY) || "{}");
    if (!assinatura.tenantId) return { success: false, error: "Nenhuma assinatura encontrada" };

    const agora = new Date();
    assinatura.status = "trial";
    assinatura.iniciadoEm = agora.toISOString();
    assinatura.trialExpiracao = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000).toISOString();
    assinatura.proximoVencimento = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000).toISOString();
    salvarAssinatura(assinatura);

    return { success: true, mensagem: `Trial renovado por mais ${dias} dias` };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Ativa ou desativa a assinatura manualmente
 */
export function alterarStatusManual(tenantId, novoStatus) {
  try {
    const assinatura = JSON.parse(localStorage.getItem(ASSINATURA_KEY) || "{}");
    if (!assinatura.tenantId) return { success: false, error: "Nenhuma assinatura encontrada" };

    assinatura.status = novoStatus;
    if (novoStatus === "ativa") {
      // Se for ativar, renova por 30 dias
      const agora = new Date();
      assinatura.proximoVencimento = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    salvarAssinatura(assinatura);

    const nomesStatus = {
      ativa: "Ativada",
      cancelada: "Cancelada",
      vencida: "Vencida",
      trial: "Teste Grátis",
      trial_expirado: "Trial Expirado",
    };

    return { success: true, mensagem: `Assinatura ${nomesStatus[novoStatus] || novoStatus} com sucesso` };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Lista todos os tenants do localStorage (para o admin)
 */
export function listarTodosTenants() {
  const tenants = [];
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    if (key.startsWith("pdv_tenant")) {
      try {
        const tenant = JSON.parse(localStorage.getItem(key));
        tenants.push(tenant);
      } catch (e) {
        // Ignora
      }
    }
  }

  return tenants;
}
