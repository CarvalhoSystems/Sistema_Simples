import test from "node:test";
import assert from "node:assert/strict";
import {
  canAddProductToCart,
  validateLoginInput,
  calculateUpdatedStock,
} from "./operacoesSeguras.js";

test("bloqueia item quando estoque é insuficiente", () => {
  const product = { codigo: "001", descricao: "Arroz", estoque: 2 };
  const result = canAddProductToCart(product, 3);

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "stock_insufficient");
});

test("permite adicionar quando há estoque suficiente", () => {
  const product = { codigo: "001", descricao: "Arroz", estoque: 5 };
  const result = canAddProductToCart(product, 2);

  assert.equal(result.allowed, true);
  assert.equal(result.availableStock, 5);
});

test("valida login com campos vazios", () => {
  const result = validateLoginInput("", " ");

  assert.equal(result.valid, false);
  assert.equal(result.reason, "empty_fields");
});

test("reduz o estoque corretamente após a venda", () => {
  const product = { codigo: "001", descricao: "Arroz", estoque: 10 };
  const updated = calculateUpdatedStock(product, 3);

  assert.equal(updated.estoque, 7);
});
