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
import { getTenantId, getTenantRamo, getTenant } from "../hooks/useTenant.js";
import {
  PRODUTOS_PADRAO,
  CATEGORIAS_PADRAO as CATEGORIAS_MOCK,
} from "./supabaseClient.js";
import {
  carregarProdutosFirebase,
  salvarProdutosFirebase,
  salvarVendaFirebase,
  carregarCategoriasFirebase, // Adicionado para carregar categorias do Firebase
  salvarCategoriasFirebase, // Adicionado para salvar categorias no Firebase
} from "./firebaseData.js";

/**
 * Retorna a chave do localStorage para um dado do tenant
 */
function tenantKey(tenantId, tipo) {
  return `pdv_${tipo}_${tenantId}`;
}

function normalizeRamo(ramo) {
  if (typeof ramo !== "string" || !ramo.trim()) return "mercado";
  const normalized = ramo.trim().toLowerCase();
  return normalized in PRODUTOS_PADRAO ? normalized : "mercado";
}

export function getDefaultInventoryForRamo(ramo = "mercado") {
  const ramoNormalizado = normalizeRamo(ramo);
  const produtos = PRODUTOS_PADRAO[ramoNormalizado] || PRODUTOS_PADRAO.mercado;
  const categorias =
    CATEGORIAS_MOCK[ramoNormalizado] || CATEGORIAS_MOCK.mercado;

  return {
    produtos: produtos.map((produto) => ({ ...produto })),
    categorias: [...categorias],
  };
}

/**
 * Obtém os produtos do tenant atual
 */
export async function getProdutos() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  // carregarProdutosFirebase já lida com o carregamento do Firebase e fallback para localStorage.
  // Se ele retornar vazio, significa que não há produtos persistidos.
  // Não deve haver fallback para PRODUTOS_PADRAO aqui, pois isso sobrescreveria o estoque real.
  const produtosDoTenant = await carregarProdutosFirebase();
  return produtosDoTenant;
}

/**
 * Salva os produtos do tenant atual
 */
export async function setProdutos(produtos) {
  // Salva no Firebase e no localStorage (o firebaseData já faz o fallback)
  await salvarProdutosFirebase(produtos);
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

  // Carrega categorias do Firebase com fallback para localStorage
  const categoriasDoTenant = await carregarCategoriasFirebase();
  return categoriasDoTenant;
}

/**
 * Função de fallback para obter categorias do localStorage.
 */
/* Removida, pois a lógica de fallback agora está em carregarCategoriasFirebase
  try {
    const data = localStorage.getItem(tenantKey(tenantId, "categorias"));
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar categorias do localStorage:", e);
  }
  const ramo = getTenantRamo();
  return getDefaultInventoryForRamo(ramo).categorias;
*/

/**
 * Salva as categorias do tenant atual
 */
export async function setCategorias(categorias) {
  // Tornar assíncrona para usar salvarCategoriasFirebase
  await salvarCategoriasFirebase(categorias);
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
export async function buscarProdutoPorCodigo(codigo) {
  const produtos = await getProdutos();
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
