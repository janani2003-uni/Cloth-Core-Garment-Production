// backend/utils/revenue.js
// Single source of truth for "real revenue collected" — every place that
// reports revenue (Admin Dashboard, Admin Reports) reads it from here
// instead of re-deriving its own (previously drifting) definition.
//
// Revenue is defined as the sum of Verified Payment records — the same
// number the Shop Owner/Admin Payments pages already call "Total Paid
// (Verified)". It deliberately does NOT match on Order.paymentStatus ===
// "Paid" (that value doesn't exist in the current enum — Order.paymentStatus
// is "Pending" | "Advance Paid" | "Full Paid" — matching the literal string
// "Paid" silently returned zero everywhere it was used).
const Payment = require("../models/Payment");

function round2(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

// Total verified revenue collected within [from, to] (inclusive), based on
// when each payment was actually verified — not when the order was created.
async function getVerifiedRevenueInRange(from, to) {
  const match = { status: "Verified" };
  if (from || to) {
    match.verifiedAt = {};
    if (from) match.verifiedAt.$gte = from;
    if (to) match.verifiedAt.$lte = to;
  }

  const agg = await Payment.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return agg.length ? round2(agg[0].total) : 0;
}

// Day-by-day verified revenue between from/to (inclusive), one entry per
// calendar day so charts never have to guess at missing days.
async function getDailyVerifiedRevenue(from, to) {
  const agg = await Payment.aggregate([
    { $match: { status: "Verified", verifiedAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$verifiedAt" } },
        revenue: { $sum: "$amount" },
        payments: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(agg.map((d) => [d._id, { revenue: round2(d.revenue), payments: d.payments }]));

  const days = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const entry = map.get(key) || { revenue: 0, payments: 0 };
    days.push({ date: key, revenue: entry.revenue, payments: entry.payments });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

module.exports = { getVerifiedRevenueInRange, getDailyVerifiedRevenue, round2 };
