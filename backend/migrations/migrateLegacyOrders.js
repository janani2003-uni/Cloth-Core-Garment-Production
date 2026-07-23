// backend/migrations/migrateLegacyOrders.js
//
// Migrates legacy Order documents (shopName/garment/fabric/color/amount —
// predating the current Order schema) into the current shape, filling in
// only fields that can be safely inferred from data already on the
// document. Nothing is ever deleted; each document's own _id is preserved;
// original legacy fields (shopName, garment, fabric, color, amount,
// paymentMethod, advancePaid, balancePayment) are kept alongside the new
// fields rather than removed, for traceability.
//
// A document is treated as "legacy" if it has no `orderId` — every order
// created through the current API always gets one, so this is a reliable
// signal without needing a separate flag field.
//
// Field mapping (each justified individually — nothing is fabricated):
//   orderId       -> generated "LEGACY-<year>-<seq>", unique, derived from createdAt
//   item          <- garment (direct copy)
//   unitPrice     <- amount / quantity (computed, only when quantity > 0)
//   totalAmount   <- amount (direct copy)
//   customerName  <- shopName (closest available proxy in this B2B context)
//   status        <- kept as-is if it's a valid value in the current enum, else "Pending"
//   paymentStatus <- kept as-is if it's a valid value in the current enum, else "Pending"
//   notes         <- "Fabric: X, Color: Y" plus legacy advance/balance info if present
//   progress      -> 0 (schema default; no way to infer real progress)
//
// Fields that CANNOT be safely inferred and are left unset (the frontend
// shows "Legacy order data incomplete" for these instead of blank/crashing):
//   customerEmail -> no email appears anywhere in the legacy data
//   userId        -> the `shops` collection has no matching records to link
//                     shopName to a real Shop Owner account
//
// Usage:
//   node migrations/migrateLegacyOrders.js            (dry run — preview only, no writes)
//   node migrations/migrateLegacyOrders.js --apply     (actually performs the update)

require("dotenv").config();
const mongoose = require("mongoose");

const VALID_STATUS = ["Pending", "Approved", "Production", "Delivered", "Cancelled"];
const VALID_PAYMENT_STATUS = ["Pending", "Partial", "Paid"];

function buildNotes(doc) {
  const parts = [];
  if (doc.fabric || doc.color) {
    parts.push(`Fabric: ${doc.fabric || "N/A"}, Color: ${doc.color || "N/A"}`);
  }
  if (doc.advancePaid !== undefined || doc.balancePayment !== undefined) {
    parts.push(
      `Legacy payment record — advance paid: LKR ${doc.advancePaid ?? "N/A"}, balance: LKR ${doc.balancePayment ?? "N/A"} (method: ${doc.paymentMethod || "N/A"})`
    );
  }
  return parts.join(" | ");
}

async function run() {
  const apply = process.argv.includes("--apply");

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in backend/.env — aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const legacyDocs = await db.collection("orders").find({ orderId: { $exists: false } }).toArray();
  const existingOrderIds = new Set(
    (await db.collection("orders").find({ orderId: { $exists: true } }).project({ orderId: 1 }).toArray()).map((d) => d.orderId)
  );

  const plan = [];
  const yearCounters = {};

  legacyDocs.forEach((doc) => {
    const year = new Date(doc.createdAt || Date.now()).getFullYear();
    if (yearCounters[year] === undefined) yearCounters[year] = 0;

    let generatedOrderId;
    do {
      yearCounters[year] += 1;
      generatedOrderId = `LEGACY-${year}-${String(yearCounters[year]).padStart(3, "0")}`;
    } while (existingOrderIds.has(generatedOrderId));
    existingOrderIds.add(generatedOrderId);

    const unitPrice = doc.quantity > 0 && doc.amount !== undefined ? Math.round((doc.amount / doc.quantity) * 100) / 100 : undefined;

    const updates = {
      orderId: generatedOrderId,
      item: doc.garment || "Unknown item",
      quantity: doc.quantity,
      totalAmount: doc.amount,
      status: VALID_STATUS.includes(doc.status) ? doc.status : "Pending",
      paymentStatus: VALID_PAYMENT_STATUS.includes(doc.paymentStatus) ? doc.paymentStatus : "Pending",
      customerName: doc.shopName || "Unknown customer",
      notes: buildNotes(doc),
      progress: 0,
    };
    if (unitPrice !== undefined) updates.unitPrice = unitPrice;

    const stillMissing = [];
    if (!doc.customerEmail) stillMissing.push("customerEmail");
    stillMissing.push("userId"); // never inferable — no shops collection match possible

    plan.push({ id: doc._id, before: doc, updates, stillMissing });
  });

  console.log("=".repeat(70));
  console.log(`LEGACY ORDER MIGRATION ${apply ? "(APPLY MODE)" : "(DRY RUN — no writes)"}`);
  console.log("=".repeat(70));
  const totalOrders = await db.collection("orders").countDocuments();
  console.log(`Total orders in database: ${totalOrders}`);
  console.log(`Legacy orders found (no orderId): ${legacyDocs.length}`);
  console.log("");

  plan.forEach((p) => {
    console.log(`_id: ${p.id}`);
    console.log(`  -> orderId: ${p.updates.orderId}`);
    console.log(`  -> item: "${p.updates.item}" (from garment: "${p.before.garment || ""}")`);
    console.log(`  -> customerName: "${p.updates.customerName}" (from shopName: "${p.before.shopName || ""}")`);
    console.log(`  -> quantity: ${p.updates.quantity}, unitPrice: ${p.updates.unitPrice ?? "N/A"}, totalAmount: ${p.updates.totalAmount}`);
    console.log(`  -> status: ${p.updates.status}, paymentStatus: ${p.updates.paymentStatus}`);
    console.log(`  -> notes: "${p.updates.notes}"`);
    console.log(`  -> STILL MISSING (left unset, not fabricated): ${p.stillMissing.join(", ")}`);
    console.log("");
  });

  if (!apply) {
    console.log("This was a dry run. No documents were modified.");
    console.log("Re-run with --apply to write these changes.");
  } else {
    console.log("Applying updates...");
    for (const p of plan) {
      await db.collection("orders").updateOne({ _id: p.id }, { $set: p.updates });
    }
    console.log(`Done. ${plan.length} legacy order(s) updated (fields added/filled — nothing deleted, _id preserved on every record).`);
  }

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Migration script failed:", error);
  process.exit(1);
});
