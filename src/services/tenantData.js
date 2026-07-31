/**
 * Serviço de dados multi-tenant
 * 
 * Gerencia produtos, categorias e vendas de forma isolada
 * para cada tenant (cliente/estabelecimento).
 *
 * Cada tenant tem seu próprio namespace no localStorage:
 * - pdv_produtos_{tenantId}
 * - pdv_categorias_{tenantId}
 * - pdv_vendas_{tenantId}
 */
import { getTenantId, getTenantRamo, getTenant } from "../hooks/useTenant";
import {
  PRODUTOS_PADRAO,
  CATEGORIAS_PADRAO as CATEGORIAS_MOCK,
} from "./supabaseClient";
import {
  carregarProdutosFirebase,
  salvarProdutosFirebase,
  salvarVendaFirebase,
} from "./firebaseData";

/**
 * Retorna a chave do localStorage para um dado do tenant
 */
function tenantKey(tenantId, tipo) {
  return `pdv_${tipo}_${tenantId}`;
}

/**
 * Obtém os produtos do tenant atual
 */
export async function getProdutos() {
  const tenantId = getTenantId();
  if (!tenantId) return [];
  // Prioriza Firebase, com fallback para localStorage
  return await carregarProdutosFirebase();
}

/**
 * Salva os produtos do tenant atual
 */
export async function setProdutos(produtos) {
  // Salva no Firebase e no localStorage (o firebaseData já faz o fallback)
  await salvarProdutosFirebase(produtos);

  const tenantId = getTenantId();
  if (!tenantId) return;
  localStorage.setItem(
    tenantKey(tenantId, "produtos"),
    JSON.stringify(produtos),
  );
}

/**
 * Adiciona um produto ao tenant atual
 */
export async function addProduto(produto) {
  const produtos = await getProdutos();
  const novoProduto = {
    ...produto,
    codigo: produto.codigo || String(Date.now()).slice(-6),
  };
  produtos.push(novoProduto);
  await setProdutos(produtos);
  return novoProduto;
}

/**
 * Atualiza um produto do tenant atual
 */
export async function updateProduto(codigo, dadosAtualizados) {
  const produtos = await getProdutos();
  const index = produtos.findIndex((p) => p.codigo === codigo);
  if (index === -1) return null;

  produtos[index] = { ...produtos[index], ...dadosAtualizados };
  await setProdutos(produtos);
  return produtos[index];
}

/**
 * Remove um produto do tenant atual
 */
export async function removeProduto(codigo) {
  const produtos = await getProdutos();
  const novosProdutos = produtos.filter((p) => p.codigo !== codigo);
  await setProdutos(novosProdutos);
  return novosProdutos;
}

/**
 * Obtém as categorias do tenant atual
 */
export async function getCategorias() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  // Categorias são salvas junto com produtos no Firebase
  const produtos = await carregarProdutosFirebase();
  // Se não houver produtos/categorias no Firebase, usa o fallback do localStorage.
  return produtos.categorias || getCategoriasFromLocalStorage();
}

/**
 * Função de fallback para obter categorias do localStorage.
 */
function getCategoriasFromLocalStorage() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  try {
    const data = localStorage.getItem(tenantKey(tenantId, "categorias"));
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Erro ao carregar categorias do localStorage:", e);
  }

  // Fallback para categorias padrão do ramo
  const ramo = getTenantRamo();
  // CATEGORIAS_MOCK é um alias para CATEGORIAS_PADRAO de supabaseClient.js
  return CATEGORIAS_MOCK[ramo] || CATEGORIAS_MOCK.mercado;
}

/**
 * Salva as categorias do tenant atual
 */
export function setCategorias(categorias) {
  const tenantId = getTenantId();
  if (!tenantId) return;
  localStorage.setItem(
    tenantKey(tenantId, "categorias"),
    JSON.stringify(categorias),
  );
}

/**
 * Obtém as vendas do tenant atual
 */
export function getVendas() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  try {
    const data = localStorage.getItem(tenantKey(tenantId, "vendas"));
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Erro ao carregar vendas:", e);
  }
  return [];
}

/**
 * Salva uma nova venda no histórico do tenant
 */
export async function addVenda(dadosVenda) {
  // A função salvarVendaFirebase já faz o fallback para localStorage
  const novaVenda = await salvarVendaFirebase(dadosVenda);
  return novaVenda;
}

/**
 * Busca um produto pelo código
 */
export function buscarProdutoPorCodigo(codigo) {
  const produtos = getProdutos();
  return produtos.find((p) => p.codigo === codigo) || null;
}

/**
 * Busca produtos por termo (código ou descrição)
 */
export function buscarProdutos(termo, produtos) {
  if (!termo) return produtos;
  const termoLower = String(termo).toLowerCase();
  return produtos.filter(
    (p) =>
      p.descricao.toLowerCase().includes(termoLower) ||
      p.codigo.toLowerCase().includes(termoLower),
  );
}

/**
 * Obtém informações do estabelecimento do tenant
 */
export function getEstabelecimentoInfo() {
  const tenant = getTenant() || {};
  return {
    nome: tenant.nomeEstabelecimento || "Meu Estabelecimento",
    ramo: tenant.ramo || "mercado",
    ramoInfo: tenant.ramoInfo || null,
    email: tenant.email || "",
  };
}
