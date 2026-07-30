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
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
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
    maxEstabelecimentos: 2,
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
    maxEstabelecimentos: 4,
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
function getAssinaturaKey(tenantId) {
  return `pdv_assinatura_${tenantId}`;
}

// ===== FUNÇÕES DE ASSINATURA =====

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
    dataAtivacaoPlano: periodoTeste ? null : agora.toISOString(), // Nova data de ativação do plano
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
 * @param {Object} assinatura - Dados da assinatura
 * @param {string} [tenantIdOverride] - ID do tenant (opcional, para uso do admin ao alterar assinatura de outro cliente)
 */
export function salvarAssinatura(assinatura, tenantIdOverride) {
  const tenantId = tenantIdOverride || getTenantId();
  if (tenantId)
    localStorage.setItem(
      getAssinaturaKey(tenantId),
      JSON.stringify(assinatura),
    );

  // Tenta salvar no Firebase
  if (firebaseDisponivel && db) {
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
export async function carregarAssinatura(forceRefresh = false) {
  const tenantId = getTenantId();
  if (!tenantId) return null;

  // Tenta carregar do Firebase primeiro, especialmente se forçado
  if (firebaseDisponivel && db) {
    try {
      const docRef = doc(db, "tenants", tenantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().assinatura) {
        const assinatura = docSnap.data().assinatura;
        localStorage.setItem(
          getAssinaturaKey(tenantId),
          JSON.stringify(assinatura),
        ); // Atualiza o cache local
        return assinatura;
      }
    } catch (error) {
      console.warn("Falha ao carregar assinatura do Firebase:", error);
    }
  }

  // Fallback para localStorage (mesmo com forceRefresh, se o Firebase falhou ou não tem dados)
  try {
    const data = localStorage.getItem(getAssinaturaKey(tenantId));
    if (data) {
      const assinaturaLocal = JSON.parse(data);
      // Se forceRefresh e temos dados do Firebase que são diferentes, preferimos os do Firebase
      // Mas se o Firebase não tinha assinatura, usamos o localStorage
      return assinaturaLocal;
    }
  } catch (e) {
    console.warn("Erro ao carregar assinatura do localStorage:", e);
  }
  return null;
}

/**
 * Verifica o status atual da assinatura
 */
export async function verificarStatusAssinatura(forceRefresh = false) {
  // Se forceRefresh for verdadeiro, ignora o cache do localStorage
  // e busca diretamente do Firebase.
  const assinatura = await carregarAssinatura(forceRefresh);

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
export async function podeAdicionarEstabelecimento(qtdAtual) {
  const status = await verificarStatusAssinatura();
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
export async function registrarPagamento(planoId, valor) {
  let assinatura = await carregarAssinatura();

  const agora = new Date();

  // Se não existir assinatura, cria uma nova
  if (!assinatura) {
    const tenantId = getTenantId();
    if (!tenantId) return null;

    assinatura = {
      tenantId,
      planoId: planoId,
      status: "ativa",
      iniciadoEm: agora.toISOString(),
      dataAtivacaoPlano: agora.toISOString(),
      trialExpiracao: null,
      ultimoPagamento: null,
      proximoVencimento: new Date(
        agora.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      renovacaoAutomatica: true,
      historicoPagamentos: [],
    };
  }

  assinatura.status = "ativa";
  assinatura.planoId = planoId;
  assinatura.ultimoPagamento = agora.toISOString();
  assinatura.dataAtivacaoPlano = agora.toISOString(); // Registra a data de ativação do plano
  assinatura.trialExpiracao = null; // Remove a data de expiração do trial
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
export async function cancelarAssinatura() {
  const assinatura = await carregarAssinatura();
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
 * Agora busca do Firebase.
 */
export async function gerarRelatorioAdmin() {
  if (!firebaseDisponivel || !db) {
    console.warn(
      "Firebase não disponível. Não é possível gerar relatório admin.",
    );
    // Fallback para localStorage se Firebase não estiver disponível
    return gerarRelatorioAdminLocalStorageFallback();
  }

  const tenants = [];
  try {
    const querySnapshot = await getDocs(collection(db, "tenants"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.info) {
        const tenantInfo = data.info;
        const assinatura = data.assinatura || null;

        tenants.push({
          id: docSnap.id,
          nome: tenantInfo.nomeEstabelecimento || tenantInfo.nome,
          email: tenantInfo.email,
          ramo: tenantInfo.ramo,
          criadoEm: tenantInfo.criadoEm,
          // totalVendas e valorTotalVendas removidos para evitar consultas caras
          assinatura: assinatura
            ? {
                plano: assinatura.planoId,
                status: assinatura.status,
                trialExpiracao: assinatura.trialExpiracao,
                proximoVencimento: assinatura.proximoVencimento,
                dataAtivacaoPlano: assinatura.dataAtivacaoPlano, // Inclui a nova data
              }
            : null,
        });
      }
    });
  } catch (error) {
    console.error("Erro ao carregar relatório admin do Firebase:", error);
    // Em caso de erro no Firebase, tenta o fallback do localStorage
    return gerarRelatorioAdminLocalStorageFallback();
  }

  return tenants.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

// Fallback para localStorage (apenas para desenvolvimento/demo sem Firebase)
function gerarRelatorioAdminLocalStorageFallback() {
  // ... (código existente para ler do localStorage)
  // Este código não será alterado aqui, mas deve ser o que já existia antes
  // e que você pode manter como um fallback ou remover se o Firebase for obrigatório.
  // Para este diff, vou manter a estrutura original do fallback, mas em um sistema real
  // você precisaria garantir que ele também leria os dados de assinatura corretamente.
  const tenants = [];
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    if (key.startsWith("pdv_tenant_")) {
      // Corrigido para buscar tenants específicos
      try {
        const tenant = JSON.parse(localStorage.getItem(key));
        const tenantId = tenant.id;
        const assinaturaKey = `pdv_assinatura_${tenantId}`; // Assinatura agora é por tenant
        const assinatura = JSON.parse(
          localStorage.getItem(assinaturaKey) || "null",
        );
        const vendas = JSON.parse(
          localStorage.getItem(`pdv_vendas_${tenantId}`) || "[]",
        );

        tenants.push({
          id: tenant.id,
          nome: tenant.nomeEstabelecimento || tenant.nome,
          email: tenant.email,
          ramo: tenant.ramo,
          criadoEm: tenant.criadoEm,
          totalVendas: vendas.length,
          valorTotalVendas: vendas.reduce((acc, v) => acc + (v.total || 0), 0),
          assinatura: assinatura
            ? {
                plano: assinatura.planoId,
                status: assinatura.status,
                trialExpiracao: assinatura.trialExpiracao,
                proximoVencimento: assinatura.proximoVencimento,
                dataAtivacaoPlano: assinatura.dataAtivacaoPlano,
              }
            : null,
        });
      } catch (e) {
        console.warn(
          "Erro ao carregar tenant do localStorage para relatório admin:",
          e,
        );
      }
    }
  }
  return tenants.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

/**
 * Simula a geração de um link de pagamento do Mercado Pago.
 * Em um ambiente real, esta função faria uma chamada a um backend
 * que, por sua vez, se comunicaria com a API do Mercado Pago.
 */
export function gerarLinkPagamentoMercadoPago(planoId, tenantId, valor) {
  // URL de exemplo do Mercado Pago para checkout de um produto/serviço
  // Em produção, você usaria a API do Mercado Pago para criar uma preferência de pagamento
  // e obter um link real.
  const baseUrl = "https://www.mercadopago.com.br/checkout/v1/redirect";
  const params = new URLSearchParams({
    preference_id: `mock_pref_${planoId}_${tenantId}_${Date.now()}`, // ID de preferência simulado
    external_reference: `${tenantId}_${planoId}`, // Referência externa para identificar a transação
    amount: valor.toFixed(2), // Valor do plano
    description: `Assinatura Plano ${PLANOS[planoId].nome} - Sistema PDV`,
    // Em um cenário real, você teria URLs de sucesso, pendente e falha
    // back_urls: JSON.stringify({
    //   success: `${window.location.origin}/pagamento/sucesso?tenantId=${tenantId}&planoId=${planoId}`,
    //   pending: `${window.location.origin}/pagamento/pendente?tenantId=${tenantId}&planoId=${planoId}`,
    //   failure: `${window.location.origin}/pagamento/falha?tenantId=${tenantId}&planoId=${planoId}`,
    // }),
  });
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Obtém dados do tenant para exibição no dashboard
 */
export async function getDadosTenant() {
  const tenant = getTenant();
  const assinatura = await carregarAssinatura();
  const status = await verificarStatusAssinatura();

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
    // O tenant já vem como parâmetro (novoTenant), não precisa buscar do localStorage
    const tenant = novoTenant || {};
    tenant.assinatura = tenant.assinatura || {};
    tenant.assinatura.plano = novoPlanoId;

    // Atualiza a assinatura usando a chave específica do tenant
    const assinatura = JSON.parse(
      localStorage.getItem(getAssinaturaKey(tenantId)) || "{}",
    );
    assinatura.planoId = novoPlanoId;
    assinatura.tenantId = tenantId;
    assinatura.status = assinatura.status || "trial";
    // Passa o tenantId do cliente para salvar na chave correta
    salvarAssinatura(assinatura, tenantId);

    return {
      success: true,
      mensagem: `Plano alterado para ${PLANOS[novoPlanoId]?.nome || novoPlanoId}`,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Renova trial do tenant por mais 7 dias
 */
export function renovarTrialManual(tenantId, dias = 7) {
  try {
    const assinatura = JSON.parse(
      localStorage.getItem(getAssinaturaKey(tenantId)) || "{}",
    );
    if (!assinatura.tenantId)
      return { success: false, error: "Nenhuma assinatura encontrada" };

    const agora = new Date();
    assinatura.status = "trial";
    assinatura.iniciadoEm = agora.toISOString();
    assinatura.trialExpiracao = new Date(
      agora.getTime() + dias * 24 * 60 * 60 * 1000,
    ).toISOString();
    assinatura.proximoVencimento = new Date(
      agora.getTime() + dias * 24 * 60 * 60 * 1000,
    ).toISOString();
    // Passa o tenantId do cliente para salvar na chave correta
    salvarAssinatura(assinatura, tenantId);

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
    const assinatura = JSON.parse(
      localStorage.getItem(getAssinaturaKey(tenantId)) || "{}",
    );
    if (!assinatura.tenantId)
      return { success: false, error: "Nenhuma assinatura encontrada" };

    assinatura.status = novoStatus;
    if (novoStatus === "ativa") {
      // Se for ativar, renova por 30 dias
      const agora = new Date();
      assinatura.proximoVencimento = new Date(
        agora.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
    }
    // Passa o tenantId do cliente para salvar na chave correta
    salvarAssinatura(assinatura, tenantId);

    const nomesStatus = {
      ativa: "Ativada",
      cancelada: "Cancelada",
      vencida: "Vencida",
      trial: "Teste Grátis",
      trial_expirado: "Trial Expirado",
    };

    return {
      success: true,
      mensagem: `Assinatura ${nomesStatus[novoStatus] || novoStatus} com sucesso`,
    };
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
