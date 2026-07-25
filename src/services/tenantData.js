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
import { getTenantId, getTenantRamo } from "../hooks/useTenant";
import { PRODUTOS_PADRAO, CATEGORIAS_PADRAO } from "./supabaseClient";

/**
 * Retorna a chave do localStorage para um dado do tenant
 */
function tenantKey(tenantId, tipo) {
  return `pdv_${tipo}_${tenantId}`;
}

/**
 * Obtém os produtos do tenant atual
 */
export function getProdutos() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  try {
    const data = localStorage.getItem(tenantKey(tenantId, "produtos"));
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Erro ao carregar produtos:", e);
  }

  // Fallback: carrega produtos padrão do ramo
  const ramo = getTenantRamo();
  return PRODUTOS_PADRAO[ramo] || PRODUTOS_PADRAO.mercado;
}

/**
 * Salva os produtos do tenant atual
 */
export function setProdutos(produtos) {
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
export function addProduto(produto) {
  const produtos = getProdutos();
  const novoProduto = {
    ...produto,
    codigo: produto.codigo || String(Date.now()).slice(-6),
  };
  produtos.push(novoProduto);
  setProdutos(produtos);
  return novoProduto;
}

/**
 * Atualiza um produto do tenant atual
 */
export function updateProduto(codigo, dadosAtualizados) {
  const produtos = getProdutos();
  const index = produtos.findIndex((p) => p.codigo === codigo);
  if (index === -1) return null;

  produtos[index] = { ...produtos[index], ...dadosAtualizados };
  setProdutos(produtos);
  return produtos[index];
}

/**
 * Remove um produto do tenant atual
 */
export function removeProduto(codigo) {
  const produtos = getProdutos();
  const novosProdutos = produtos.filter((p) => p.codigo !== codigo);
  setProdutos(novosProdutos);
  return novosProdutos;
}

/**
 * Obtém as categorias do tenant atual
 */
export function getCategorias() {
  const tenantId = getTenantId();
  if (!tenantId) return [];

  try {
    const data = localStorage.getItem(tenantKey(tenantId, "categorias"));
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Erro ao carregar categorias:", e);
  }

  // Fallback: categorias padrão do ramo
  const ramo = getTenantRamo();
  return CATEGORIAS_PADRAO[ramo] || CATEGORIAS_PADRAO.mercado;
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
export function addVenda(dadosVenda) {
  const vendas = getVendas();
  const novaVenda = {
    id: Date.now(),
    data: new Date().toISOString(),
    ...dadosVenda,
  };
  vendas.unshift(novaVenda);
  const tenantId = getTenantId();
  if (tenantId) {
    localStorage.setItem(
      tenantKey(tenantId, "vendas"),
      JSON.stringify(vendas.slice(0, 500)), // mantém últimas 500 vendas
    );
  }
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
export function buscarProdutos(termo) {
  const produtos = getProdutos();
  if (!termo) return produtos;
  const termoLower = termo.toLowerCase();
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
  const tenant = JSON.parse(
    localStorage.getItem("pdv_tenant") || "{}",
  );
  return {
    nome: tenant.nomeEstabelecimento || "Meu Estabelecimento",
    ramo: tenant.ramo || "mercado",
    ramoInfo: tenant.ramoInfo || null,
    email: tenant.email || "",
  };
}