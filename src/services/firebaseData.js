/**
 * Serviço de dados Firebase Firestore
 *
 * Camada de abstração que usa Firebase quando disponível,
 * e faz fallback automático para localStorage.
 */

import { firebaseDisponivel, db } from "./firebaseClient.js";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { PRODUTOS_PADRAO, CATEGORIAS_PADRAO } from "./supabaseClient.js";
import { getTenantId, getTenantRamo, getTenant } from "../hooks/useTenant.js";

function removerCamposSensiveis(dados) {
  if (!dados || typeof dados !== "object") return dados;

  const seguro = { ...dados };
  delete seguro.senha;
  delete seguro.password;
  delete seguro.mercadoPagoAccessToken;
  delete seguro.certificadoDigital;
  delete seguro.csc;
  delete seguro.CSC;
  delete seguro.cscToken;
  delete seguro.tokenCSC;
  delete seguro.cscHomologacao;
  delete seguro.cscProducao;
  return seguro;
}

// ===== UTILITÁRIOS =====

function isFirebaseReady() {
  return firebaseDisponivel && db;
}

function getTenantDocRef(tenantId) {
  if (!db) return null;
  return doc(db, "tenants", tenantId);
}

function getVendasCollectionRef(tenantId) {
  if (!db) return null;
  return collection(db, "tenants", tenantId, "vendas");
}

function getUserId() {
  const tenant = getTenant() || {};
  return tenant.uid || tenant.id || null;
}

export async function carregarConfiguracaoNFPFirebase(
  tenantId = getTenantId(),
) {
  if (!tenantId || !isFirebaseReady()) return null;

  const docSnap = await getDoc(getTenantDocRef(tenantId));
  const configNFP = docSnap.exists() ? docSnap.data().configNFP : null;
  if (!configNFP?.razaoSocial && !configNFP?.cnpj && !configNFP?.ie) {
    return null;
  }
  return configNFP;
}

export async function salvarConfiguracaoNFPFirebase(
  configNFP,
  tenantId = getTenantId(),
) {
  if (!isFirebaseReady()) return false;
  if (!tenantId) {
    throw new Error("Não foi possível identificar o estabelecimento ativo.");
  }

  const userId = getUserId();
  await setDoc(
    getTenantDocRef(tenantId),
    { configNFP, uid: userId },
    { merge: true },
  );
  return true;
}

// ===== PRODUTOS =====

export async function salvarProdutosFirebase(produtos) {
  const tenantId = getTenantId();
  const userId = getUserId();
  if (!tenantId) {
    throw new Error("Não foi possível identificar o estabelecimento ativo.");
  }

  if (isFirebaseReady()) {
    await setDoc(
      getTenantDocRef(tenantId),
      { produtos, uid: userId },
      { merge: true },
    );
  }

  try {
    localStorage.setItem(`pdv_produtos_${tenantId}`, JSON.stringify(produtos));
  } catch (error) {
    console.error("Erro ao atualizar o cache local dos produtos:", error);
  }
}

export async function carregarProdutosFirebase() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  if (isFirebaseReady()) {
    try {
      const docRef = getTenantDocRef(tenantId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data()?.produtos) {
        const produtos = docSnap.data().produtos;
        localStorage.setItem(
          `pdv_produtos_${tenantId}`,
          JSON.stringify(produtos),
        );
        return produtos;
      }
    } catch (error) {
      console.error("❌ Erro ao carregar produtos do Firebase:", error);
    }
  }

  try {
    const data = localStorage.getItem(`pdv_produtos_${tenantId}`);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("❌ Erro ao carregar produtos do localStorage:", e);
  }

  return [];
}

// ===== CATEGORIAS =====

export async function salvarCategoriasFirebase(categorias) {
  const tenantId = getTenantId();
  const userId = getUserId();
  if (!tenantId) return;

  localStorage.setItem(
    `pdv_categorias_${tenantId}`,
    JSON.stringify(categorias),
  );

  if (isFirebaseReady()) {
    try {
      const docRef = getTenantDocRef(tenantId);
      await setDoc(docRef, { categorias, uid: userId }, { merge: true });
      console.log("✅ Categorias salvas no Firebase");
    } catch (error) {
      console.warn("⚠️ Erro ao salvar categorias no Firebase:", error.message);
    }
  }
}

export async function carregarCategoriasFirebase() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  if (isFirebaseReady()) {
    try {
      const docRef = getTenantDocRef(tenantId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().categorias) {
        const categorias = docSnap.data().categorias;
        localStorage.setItem(
          `pdv_categorias_${tenantId}`,
          JSON.stringify(categorias),
        );
        return categorias;
      }
    } catch (error) {
      console.warn(
        "⚠️ Erro ao carregar categorias do Firebase:",
        error.message,
      );
    }
  }

  try {
    const data = localStorage.getItem(`pdv_categorias_${tenantId}`);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Erro ao carregar categorias do localStorage:", e);
  }

  return [];
}

// ===== FUNCIONÁRIOS =====

export async function salvarFuncionariosFirebase(funcionarios) {
  const tenantId = getTenantId();
  const userId = getUserId();
  if (!tenantId) return;

  try {
    localStorage.setItem(
      `pdv_funcionarios_${tenantId}`,
      JSON.stringify(funcionarios.map(removerCamposSensiveis)),
    );
  } catch (error) {
    console.error("❌ Erro ao salvar funcionários no localStorage:", error);
  }

  if (isFirebaseReady()) {
    try {
      const docRef = getTenantDocRef(tenantId);
      await setDoc(docRef, { funcionarios, uid: userId }, { merge: true });
      console.log("✅ Funcionários salvos no Firebase com sucesso");
    } catch (error) {
      console.error("❌ Erro ao salvar funcionários no Firebase:", error);
    }
  }
}

export async function carregarFuncionariosFirebase() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  if (isFirebaseReady()) {
    try {
      const docRef = getTenantDocRef(tenantId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && Array.isArray(docSnap.data().funcionarios)) {
        const funcionarios = docSnap.data().funcionarios;
        localStorage.setItem(
          `pdv_funcionarios_${tenantId}`,
          JSON.stringify(funcionarios.map(removerCamposSensiveis)),
        );
        return funcionarios;
      }
    } catch (error) {
      console.warn(
        "⚠️ Erro ao carregar funcionários do Firebase:",
        error.message,
      );
    }
  }

  try {
    const data = localStorage.getItem(`pdv_funcionarios_${tenantId}`);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed.map(removerCamposSensiveis);
    }
  } catch (e) {
    console.warn("Erro ao carregar funcionários do localStorage:", e);
  }

  return [];
}

// ===== VENDAS =====

export async function salvarVendaFirebase(dadosVenda) {
  const tenantId = getTenantId();
  const userId = getUserId();
  if (!tenantId) return null;

  let proximoNumeroVenda = 1;
  try {
    const vendasAtuais = await carregarVendasFirebase();
    if (vendasAtuais && vendasAtuais.length > 0) {
      const numerosExistentes = vendasAtuais
        .map((v) => Number(v.numeroVenda) || 0)
        .filter((n) => n > 0);

      if (numerosExistentes.length > 0) {
        proximoNumeroVenda = Math.max(...numerosExistentes) + 1;
      }
    }
  } catch (e) {
    proximoNumeroVenda = Date.now().toString().slice(-5);
  }

  const vendaCompleta = {
    ...dadosVenda,
    numeroVenda: proximoNumeroVenda,
    id: Date.now(),
    data: new Date().toISOString(),
    timestamp: Date.now(),
    uid: userId,
  };

  try {
    const vendasExistentes = JSON.parse(
      localStorage.getItem(`pdv_vendas_${tenantId}`) || "[]",
    );
    vendasExistentes.unshift(vendaCompleta);
    localStorage.setItem(
      `pdv_vendas_${tenantId}`,
      JSON.stringify(vendasExistentes.slice(0, 500)),
    );
  } catch (e) {
    console.warn("Erro ao salvar venda no localStorage:", e);
  }

  if (isFirebaseReady()) {
    try {
      const vendasRef = getVendasCollectionRef(tenantId);
      await addDoc(vendasRef, vendaCompleta);
      console.log(`✅ Venda #${proximoNumeroVenda} salva no Firebase`);
    } catch (error) {
      console.warn("⚠️ Erro ao salvar venda no Firebase:", error.message);
    }
  }

  return vendaCompleta;
}

export async function carregarVendasFirebase() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  if (isFirebaseReady()) {
    try {
      const vendasRef = getVendasCollectionRef(tenantId);
      const q = query(vendasRef, orderBy("timestamp", "desc"), limit(100));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const vendas = [];
        querySnapshot.forEach((doc) => {
          vendas.push({ firebaseId: doc.id, ...doc.data() });
        });
        localStorage.setItem(`pdv_vendas_${tenantId}`, JSON.stringify(vendas));
        return vendas;
      }
    } catch (error) {
      console.warn("⚠️ Erro ao carregar vendas do Firebase:", error.message);
    }
  }

  try {
    const data = localStorage.getItem(`pdv_vendas_${tenantId}`);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Erro ao carregar vendas do localStorage:", e);
  }

  return [];
}

// ===== ESTABELECIMENTOS =====

export async function salvarEstabelecimentosFirebase(estabelecimentos) {
  const userId = getUserId();
  if (!userId) return;

  localStorage.setItem(
    `pdv_estabelecimentos_${userId}`,
    JSON.stringify(estabelecimentos),
  );

  if (!isFirebaseReady()) return;

  try {
    const userDocRef = doc(db, "tenants", userId);
    await setDoc(
      userDocRef,
      {
        estabelecimentos,
        uid: userId,
        ultimaSincronizacao: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("❌ Erro ao salvar estabelecimentos no Firebase:", error);
  }
}

export async function carregarEstabelecimentosFirebase() {
  const userId = getUserId();
  if (!userId) return [];

  if (isFirebaseReady()) {
    try {
      const userDocRef = doc(db, "tenants", userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists() && Array.isArray(docSnap.data().estabelecimentos)) {
        const estabelecimentos = docSnap.data().estabelecimentos;
        localStorage.setItem(
          `pdv_estabelecimentos_${userId}`,
          JSON.stringify(estabelecimentos),
        );
        return estabelecimentos;
      }
    } catch (error) {
      console.warn("⚠️ Erro ao carregar estabelecimentos do Firebase:", error);
    }
  }

  try {
    const data = localStorage.getItem(`pdv_estabelecimentos_${userId}`);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Erro ao carregar estabelecimentos do localStorage:", e);
  }

  return [];
}

export async function salvarEstabelecimentoAtivoFirebase(estabId) {
  const userId = getUserId();
  if (!userId) return;

  localStorage.setItem("pdv_estabelecimento_ativo", estabId || "");

  if (!isFirebaseReady() || !estabId) return;

  try {
    const userDocRef = doc(db, "tenants", userId);
    await setDoc(
      userDocRef,
      {
        estabelecimentoAtivoId: estabId,
        uid: userId,
        ultimaSincronizacao: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    console.warn(
      "⚠️ Erro ao salvar estabelecimento ativo no Firebase:",
      error.message,
    );
  }
}

export async function carregarEstabelecimentoAtivoFirebase() {
  const userId = getUserId();
  if (!userId) return null;

  if (isFirebaseReady()) {
    try {
      const userDocRef = doc(db, "tenants", userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists() && docSnap.data().estabelecimentoAtivoId) {
        const estabId = docSnap.data().estabelecimentoAtivoId;
        localStorage.setItem("pdv_estabelecimento_ativo", estabId);
        return estabId;
      }
    } catch (error) {
      console.warn(
        "⚠️ Erro ao carregar estabelecimento ativo do Firebase:",
        error.message,
      );
    }
  }

  return localStorage.getItem("pdv_estabelecimento_ativo");
}

// ===== INFORMAÇÕES DO TENANT E INICIALIZAÇÃO =====

export async function salvarInfoTenantFirebase(info, tenantId = getTenantId()) {
  if (!tenantId) return;

  const userId = getUserId();
  const infoLocal = removerCamposSensiveis(info);
  localStorage.setItem(
    `pdv_tenant_info_${tenantId}`,
    JSON.stringify(infoLocal),
  );

  if (!isFirebaseReady()) return;

  try {
    const docRef = getTenantDocRef(tenantId);
    await setDoc(docRef, { info, uid: userId }, { merge: true });
  } catch (error) {
    console.error("❌ Erro ao salvar info do tenant no Firebase:", error);
  }
}

export async function carregarInfoTenantFirebase(tenantId) {
  if (!tenantId) return {};

  let info = {};
  try {
    info = removerCamposSensiveis(
      JSON.parse(localStorage.getItem(`pdv_tenant_info_${tenantId}`) || "{}"),
    );
  } catch (error) {
    console.warn("Erro ao carregar informações locais:", error);
  }

  if (isFirebaseReady()) {
    try {
      const docSnap = await getDoc(getTenantDocRef(tenantId));
      const infoFirebase = docSnap.exists() ? docSnap.data().info : null;
      if (infoFirebase && typeof infoFirebase === "object") {
        info = { ...info, ...removerCamposSensiveis(infoFirebase) };
        localStorage.setItem(
          `pdv_tenant_info_${tenantId}`,
          JSON.stringify(info),
        );
      }
    } catch (error) {
      console.warn("Erro ao carregar informações do estabelecimento:", error);
    }
  }

  return info;
}

export async function inicializarDadosTenant(tenantId, ramo, info) {
  if (!tenantId || !isFirebaseReady()) return;

  try {
    const userId = getUserId();
    const ramoNegocio = ramo || getTenantRamo() || "mercado";
    const docRef = getTenantDocRef(tenantId);
    const docSnap = await getDoc(docRef);

    const dataToSet = { info: info, uid: userId };

    if (!docSnap.exists() || !docSnap.data().produtos) {
      dataToSet.produtos = PRODUTOS_PADRAO[ramoNegocio] || [];
    }
    if (!docSnap.exists() || !docSnap.data().categorias) {
      dataToSet.categorias = CATEGORIAS_PADRAO[ramoNegocio] || [];
    }

    await setDoc(docRef, dataToSet, { merge: true });
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar dados do tenant:", error);
    return false;
  }
}

export async function carregarTenantFirebase(tenantId) {
  if (!tenantId || !isFirebaseReady()) return null;

  try {
    const docRef = getTenantDocRef(tenantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Erro ao carregar dados do tenant do Firebase:", error);
  }
  return null;
}
