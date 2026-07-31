/**
 * Serviço de dados Firebase Firestore
 *
 *
 * Camada de abstração que usa Firebase quando disponível,
 * e faz fallback automático para localStorage.
 *
 * Estrutura no Firestore:
 *   tenants/{tenantId}/
 *     ├── info: { nome, email, ramo, ... }
 *     ├── produtos: [{ codigo, descricao, preco, ... }]
 *     ├── categorias: ["Padaria", "Bebidas", ...]
 *     └── vendas: [{ id, data, total, ... }]
 *
 */

import { firebaseDisponivel, db } from "./firebaseClient";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
} from "firebase/firestore"; // Importa os dados mockados
import { PRODUTOS_PADRAO, CATEGORIAS_PADRAO } from "./supabaseClient";
import { getTenantId, getTenantRamo, getTenant } from "../hooks/useTenant";

// ===== UTILITÁRIOS =====

/**
 * Verifica se o Firebase está pronto para uso
 */
function isFirebaseReady() {
  return firebaseDisponivel && db;
}

/**
 * Retorna a referência do documento do tenant no Firestore
 */
function getTenantDocRef(tenantId) {
  if (!db) return null;
  return doc(db, "tenants", tenantId);
}

/**
 * Retorna a referência da subcoleção de vendas
 */
function getVendasCollectionRef(tenantId) {
  if (!db) return null;
  return collection(db, "tenants", tenantId, "vendas");
}

// ===== PRODUTOS =====

/**
 * Salva produtos no Firestore (e localStorage como backup)
 */
export async function salvarProdutosFirebase(produtos) {
  const tenantId = getTenantId();
  if (!tenantId) return;

  // Sempre salva no localStorage (fallback)
  localStorage.setItem(`pdv_produtos_${tenantId}`, JSON.stringify(produtos));

  // Tenta salvar no Firebase
  if (isFirebaseReady()) {
    try {
      const docRef = getTenantDocRef(tenantId);
      await setDoc(docRef, { produtos }, { merge: true });
      console.log("✅ Produtos salvos no Firebase");
    } catch (error) {
      console.warn("⚠️ Erro ao salvar produtos no Firebase:", error.message);
    }
  }
}

/**
 * Carrega produtos do Firebase (com fallback localStorage)
 */
export async function carregarProdutosFirebase() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  // Tenta carregar do Firebase primeiro
  if (isFirebaseReady()) {
    try {
      const docRef = getTenantDocRef(tenantId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().produtos) {
        const produtos = docSnap.data().produtos;
        // Atualiza localStorage com dados do Firebase
        localStorage.setItem(
          `pdv_produtos_${tenantId}`,
          JSON.stringify(produtos),
        );
        return produtos;
      } else {
        // Se o documento existe, mas não tem produtos, retorna array vazio
        // para evitar fallback desnecessário para o localStorage.
        if (docSnap.exists()) {
          return [];
        }
      }
    } catch (error) {
      console.warn("⚠️ Erro ao carregar produtos do Firebase:", error.message);
    }
  }

  // Fallback: carrega do localStorage
  try {
    const data = localStorage.getItem(`pdv_produtos_${tenantId}`);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Erro ao carregar produtos do localStorage:", e);
  }

  return [];
}

// ===== VENDAS =====

/**
 * Salva uma venda no Firebase (e localStorage como backup)
 */
export async function salvarVendaFirebase(dadosVenda) {
  const tenantId = getTenantId();
  if (!tenantId) return null;

  const vendaCompleta = {
    ...dadosVenda,
    id: Date.now(),
    data: new Date().toISOString(),
    timestamp: Date.now(),
  };

  // Salva no localStorage
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

  // Tenta salvar no Firebase
  if (isFirebaseReady()) {
    try {
      const vendasRef = getVendasCollectionRef(tenantId);
      await addDoc(vendasRef, vendaCompleta);
      console.log("✅ Venda salva no Firebase");
    } catch (error) {
      console.warn("⚠️ Erro ao salvar venda no Firebase:", error.message);
    }
  }

  return vendaCompleta;
}

/**
 * Carrega vendas do Firebase (com fallback localStorage)
 */
export async function carregarVendasFirebase() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  // Tenta carregar do Firebase
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

        // Atualiza localStorage com dados do Firebase
        localStorage.setItem(`pdv_vendas_${tenantId}`, JSON.stringify(vendas));
        return vendas;
      }
    } catch (error) {
      console.warn("⚠️ Erro ao carregar vendas do Firebase:", error.message);
    }
  }

  // Fallback: carrega do localStorage
  try {
    const data = localStorage.getItem(`pdv_vendas_${tenantId}`);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Erro ao carregar vendas do localStorage:", e);
  }

  return [];
}

// ===== BACKUP E EXPORTAÇÃO =====

/**
 * Exporta todos os dados do tenant para download
 */
export function exportarDadosTenant() {
  const tenantId = getTenantId();
  if (!tenantId) {
    alert("Nenhum tenant encontrado. Faça login primeiro.");
    return;
  }

  try {
    const dados = {
      exportadoEm: new Date().toISOString(),
      tenant: getTenant() || {},
      produtos: JSON.parse(
        localStorage.getItem(`pdv_produtos_${tenantId}`) || "[]",
      ),
      categorias: JSON.parse(
        localStorage.getItem(`pdv_categorias_${tenantId}`) || "[]",
      ),
      vendas: JSON.parse(
        localStorage.getItem(`pdv_vendas_${tenantId}`) || "[]",
      ),
      configNFP: JSON.parse(localStorage.getItem("nfp_config") || "{}"),
      notasFiscais: JSON.parse(localStorage.getItem("nfp_notas") || "[]"),
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${tenantId}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return dados;
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    alert("Erro ao exportar dados. Tente novamente.");
  }
}

// ===== INICIALIZAÇÃO DE DADOS (NOVO) =====

/**
 * Inicializa os dados para um novo tenant no Firebase.
 * Usa os dados do mockData.js como base.
 */
export async function inicializarDadosTenant(tenantId, ramo, info) {
  if (!tenantId || !isFirebaseReady()) {
    console.log(
      "Firebase não disponível ou tenantId não fornecido para inicialização.",
    );
    return;
  }

  try {
    const ramoNegocio = ramo || getTenantRamo() || "mercado";
    console.log(`🚀 Inicializando dados para o novo tenant: ${tenantId}`);
    const docRef = getTenantDocRef(tenantId);

    // Carrega os produtos e categorias padrão para o ramo de negócio
    const produtosIniciais = PRODUTOS_PADRAO[ramoNegocio] || [];
    const categoriasIniciais = CATEGORIAS_PADRAO[ramoNegocio] || [];

    await setDoc(
      docRef,
      {
        produtos: produtosIniciais,
        categorias: categoriasIniciais,
        info: info, // Salva as informações do tenant
      },
      { merge: true },
    );

    console.log("✅ Dados iniciais do tenant salvos no Firebase.");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar dados do tenant:", error);
    return false;
  }
}

/**
 * Sincroniza dados locais com o Firebase
 */
export async function sincronizarComFirebase() {
  const tenantId = getTenantId();
  if (!tenantId || !isFirebaseReady()) {
    console.log("Firebase não disponível para sincronização");
    return;
  }

  try {
    console.log("🔄 Sincronizando dados com Firebase...");

    // Sobe produtos
    const produtos = JSON.parse(
      localStorage.getItem(`pdv_produtos_${tenantId}`) || "[]",
    );
    if (produtos.length > 0) {
      const docRef = getTenantDocRef(tenantId);
      await setDoc(docRef, { produtos, ultimaSincronizacao: new Date().toISOString() }, { merge: true });
    }

    // Sobe vendas (últimas 50)
    const vendas = JSON.parse(
      localStorage.getItem(`pdv_vendas_${tenantId}`) || "[]",
    );
    if (vendas.length > 0) {
      const batch = writeBatch(db);
      const vendasRef = getVendasCollectionRef(tenantId);
      const recentes = vendas.slice(0, 50);

      for (const venda of recentes) {
        const novaRef = doc(vendasRef);
        batch.set(novaRef, { ...venda, sincronizado: true });
      }

      await batch.commit();
    }

    console.log("✅ Sincronização concluída!");
    return true;
  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    return false;
  }
}