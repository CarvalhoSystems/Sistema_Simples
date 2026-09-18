import test from "node:test";
import assert from "node:assert/strict";
import { getDefaultInventoryForRamo } from "./tenantData.js";

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
