import test from "node:test";
import assert from "node:assert/strict";
import {
  canAddProductToCart,
  validateLoginInput,
  calculateUpdatedStock,
  calculateStockQuantity,
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

test("baixa no estoque o peso equivalente aos pacotes vendidos", () => {
  const product = { codigo: "racao", descricao: "Ração", estoque: 200 };
  const quantidadeEmKg = calculateStockQuantity(
    { ...product, vendaPorPeso: true, pesoPorPacote: 20 },
    2,
    "pacote",
  );
  const updated = calculateUpdatedStock(product, quantidadeEmKg);

  assert.equal(updated.estoque, 160);
});

test("usa a quantidade em quilos diretamente quando a venda é fracionada", () => {
  const quantidadeEmKg = calculateStockQuantity(
    { vendaPorPeso: true, pesoPorPacote: 20 },
    2.5,
    "kg",
  );

  assert.equal(quantidadeEmKg, 2.5);
});

test("baixa quilos fracionados sem deixar imprecisão decimal no estoque", () => {
  const product = { codigo: "racao", descricao: "Ração", estoque: 10 };
  const updated = calculateUpdatedStock(product, 0.3);

  assert.equal(updated.estoque, 9.7);
});
