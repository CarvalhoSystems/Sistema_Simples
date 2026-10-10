export function canAddProductToCart(product, quantity) {
  if (!product) {
    return { allowed: false, reason: "product_not_found" };
  }

  const safeQuantity = Number(quantity || 0);
  const stock = Number(product.estoque ?? product.stock ?? 0);

  if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
    return { allowed: false, reason: "invalid_quantity" };
  }

  if (stock <= 0) {
    return { allowed: false, reason: "out_of_stock" };
  }

  if (safeQuantity > stock) {
    return {
      allowed: false,
      reason: "stock_insufficient",
      availableStock: stock,
    };
  }

  return { allowed: true, availableStock: stock };
}

export function calculateUpdatedStock(product, quantitySold) {
  const stock = Number(product?.estoque ?? product?.stock ?? 0);
  const sold = Number(quantitySold || 0);

  return {
    ...product,
    estoque: Number(Math.max(0, stock - sold).toFixed(3)),
  };
}

export function calculateStockQuantity(product, quantity, saleType = "unidade") {
  if (product?.vendaPorPeso && saleType === "pacote") {
    return Number(quantity) * Number(product.pesoPorPacote);
  }

  return Number(quantity);
}

export function validateLoginInput(email, password) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedPassword = String(password || "").trim();

  if (!normalizedEmail || !normalizedPassword) {
    return { valid: false, reason: "empty_fields" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { valid: false, reason: "invalid_email" };
  }

  return { valid: true };
}
