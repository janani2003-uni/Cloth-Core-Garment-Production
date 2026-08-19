// src/utils/productionStage.js
// Mirrors the EXACT stage-from-progress derivation backend/models/Production.js
// already uses (getStageFromProgress, in its pre("save") hook) — so a Shop
// Owner's Dashboard always shows the same real stage name an Admin/
// Supervisor would see on the Production Management page for the same
// order, never an invented or mismatched one. order.progress itself is kept
// in sync with the linked Production record by
// backend/routes/productionRoutes.js's syncOrderProgress() on every save,
// so this can be derived safely from the Order document alone — no
// separate Production-record fetch needed (Shop Owners have no read access
// to /api/production anyway).
export function getProductionStage(progress) {
  const value = Number(progress);

  if (!Number.isFinite(value) || value <= 0) return "Not Started";
  if (value <= 25) return "Cutting";
  if (value <= 50) return "Sewing";
  if (value <= 75) return "Quality Assurance";
  if (value < 100) return "Packing";

  return "Completed";
}
