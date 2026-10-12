import test from "node:test";
import assert from "node:assert/strict";
import {
  getTenantOwnerId,
  normalizeEmail,
  resolveTenantForLogin,
} from "./useTenant.js";

test("getTenantOwnerId usa o UID do usuário, não o ID do estabelecimento ativo", () => {
  const previousLocalStorage = globalThis.localStorage;
  const previousSessionStorage = globalThis.sessionStorage;
  const tenant = {
    id: "estab_123",
    uid: "user_456",
  };

  globalThis.localStorage = {
    getItem: (key) => (key === "pdv_tenant" ? JSON.stringify(tenant) : null),
    setItem: () => {},
  };

  try {
    assert.equal(getTenantOwnerId(), "user_456");
  } finally {
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
  }
});

test("normalizeEmail remove espaços e deixa o e-mail em caixa baixa", () => {
  assert.equal(normalizeEmail(" Cliente@Loja.com "), "cliente@loja.com");
});

test("resolveTenantForLogin recupera o tenant ativo quando o login usa o mesmo e-mail", () => {
  const tenantAtivo = {
    id: "estab_123",
    uid: "user_456",
    email: "cliente@loja.com",
    nomeEstabelecimento: "Minha Loja",
    ramo: "mercado",
  };

  const result = resolveTenantForLogin(
    "Cliente@Loja.com",
    tenantAtivo,
    null,
    "estab_123",
  );

  assert.equal(result.id, "estab_123");
  assert.equal(result.email, "cliente@loja.com");
  assert.equal(result.nomeEstabelecimento, "Minha Loja");
});

test("resolveTenantForLogin usa o estabelecimento ativo como fallback quando não há tenant salvo", () => {
  const result = resolveTenantForLogin(
    "cliente@loja.com",
    null,
    null,
    "estab_999",
  );

  assert.equal(result.id, "estab_999");
  assert.equal(result.email, "cliente@loja.com");
  assert.equal(result.estabelecimentoAtivo, "estab_999");
});
