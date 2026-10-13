import test from "node:test";
import assert from "node:assert/strict";
import {
  addProduto,
  buscarProdutoNaLista,
  buscarProdutos,
  getDefaultInventoryForRamo,
  removeProduto,
} from "./tenantData.js";

function configureLocalTenant(tenantId, initialProducts = []) {
  const data = new Map([
    ["pdv_tenant", JSON.stringify({ id: tenantId, uid: tenantId })],
    [`pdv_produtos_${tenantId}`, JSON.stringify(initialProducts)],
  ]);
  const previousLocalStorage = globalThis.localStorage;
  const previousSessionStorage = globalThis.sessionStorage;
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  globalThis.sessionStorage = {
    getItem: () => null,
  };
  return {
    getProducts: () => JSON.parse(data.get(`pdv_produtos_${tenantId}`)),
    restore: () => {
      if (previousLocalStorage === undefined) {
        delete globalThis.localStorage;
      } else {
        globalThis.localStorage = previousLocalStorage;
      }
      if (previousSessionStorage === undefined) {
        delete globalThis.sessionStorage;
      } else {
        globalThis.sessionStorage = previousSessionStorage;
      }
    },
  };
}

test("retorna o inventário padrão para o ramo de pet shop", () => {
  const inventory = getDefaultInventoryForRamo("casa_racao");

  assert.ok(Array.isArray(inventory.produtos));
  assert.ok(inventory.produtos.length > 0);
  assert.ok(
    inventory.produtos.some((produto) => produto.descricao.includes("RAÇÃO")),
  );
  assert.ok(Array.isArray(inventory.categorias));
  assert.ok(inventory.categorias.includes("Rações"));
});

test("não permite cadastrar produtos com código já utilizado", async () => {
  const storage = configureLocalTenant("tenant-duplicate-code", [
    { codigo: "42", descricao: "Produto existente" },
  ]);

  try {
    await assert.rejects(
      addProduto({ codigo: "42", descricao: "Produto duplicado" }),
      /Já existe um produto cadastrado com o código 42/,
    );
    assert.equal(storage.getProducts().length, 1);
  } finally {
    storage.restore();
  }
});

test("exclui apenas um item quando há produtos antigos com código duplicado", async () => {
  const duplicateProduct = {
    codigo: "7",
    descricao: "Produto repetido",
    preco: 10,
    estoque: 3,
  };
  const storage = configureLocalTenant("tenant-remove-duplicate", [
    duplicateProduct,
    { ...duplicateProduct },
  ]);

  try {
    const remaining = await removeProduto(duplicateProduct);
    assert.equal(remaining.length, 1);
    assert.equal(storage.getProducts().length, 1);
  } finally {
    storage.restore();
  }
});

test("busca produtos sem diferenciar maiúsculas, minúsculas ou acentos", () => {
  const products = [
    { codigo: 123, descricao: "Café Torrado" },
    { codigo: "ABC-1", descricao: "Produto de teste" },
  ];

  assert.equal(buscarProdutoNaLista(" abc-1 ", products), products[1]);
  assert.deepEqual(buscarProdutos("cafe", products), [products[0]]);
  assert.deepEqual(buscarProdutos("PRODUTO", products), [products[1]]);
});
