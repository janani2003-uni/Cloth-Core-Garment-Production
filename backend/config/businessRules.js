// Central source of truth for configurable business rules. Set
// MINIMUM_ORDER_QUANTITY / ADVANCE_PAYMENT_PERCENTAGE in backend/.env to
// override for a given environment — the values below are dev-only fallback
// defaults used whenever those env vars are unset.
const DEV_DEFAULT_MINIMUM_ORDER_QUANTITY = 100;
const DEV_DEFAULT_ADVANCE_PAYMENT_PERCENTAGE = 30;

function getMinimumOrderQuantity() {
  const fromEnv = Number(process.env.MINIMUM_ORDER_QUANTITY);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEV_DEFAULT_MINIMUM_ORDER_QUANTITY;
}

function getAdvancePaymentPercentage() {
  const fromEnv = Number(process.env.ADVANCE_PAYMENT_PERCENTAGE);
  return Number.isFinite(fromEnv) && fromEnv > 0 && fromEnv <= 100
    ? fromEnv
    : DEV_DEFAULT_ADVANCE_PAYMENT_PERCENTAGE;
}

module.exports = { getMinimumOrderQuantity, getAdvancePaymentPercentage };
