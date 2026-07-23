// backend/scripts/seedDummyData.js
//
// Adds clearly-synthetic demo data across every collection so tables,
// status badges and notification feeds have real examples to display in
// every role's UI. Purely additive — never touches or deletes any existing
// document. Safe to re-run; it skips creating a Shop for an owner that
// already has one, and always inserts fresh Orders/Payments/etc. with new
// unique IDs (prefixed "DEMO-" for orders, so they're easy to spot/remove
// later) rather than duplicating check keys.
//
// Usage: node scripts/seedDummyData.js

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Order = require("../models/Order");
const Shop = require("../models/Shop");
const Production = require("../models/Production");
const Payment = require("../models/Payment");
const Sample = require("../models/Sample");
const Delivery = require("../models/Delivery");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");
const Staff = require("../models/Staff");

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in backend/.env — aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const shopOwners = await User.find({ role: "shopOwner" }).limit(6);
  const admin = await User.findOne({ role: "admin" });
  const supervisor = await User.findOne({ role: "supervisor" });
  const staffUser = await User.findOne({ role: "staff" });

  if (shopOwners.length === 0 || !admin) {
    console.log("Need at least one shopOwner and one admin account to seed against — aborting.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Seeding against ${shopOwners.length} shop owner account(s)...`);

  // ---------- Shops ----------
  const shopNames = ["Elegance Garments", "Northline Apparel", "Coastal Threads", "Urban Stitch Co.", "Vista Textiles"];
  const shopStatuses = [
    { approvalStatus: "Approved", isActive: true, creditLimit: 250000, shopCode: "SHOP-2026-101" },
    { approvalStatus: "Approved", isActive: true, creditLimit: 150000, shopCode: "SHOP-2026-102" },
    { approvalStatus: "Pending", isActive: true, creditLimit: 0, shopCode: "" },
    { approvalStatus: "Approved", isActive: false, creditLimit: 100000, shopCode: "SHOP-2026-103" },
    { approvalStatus: "Rejected", isActive: true, creditLimit: 0, shopCode: "" },
  ];

  const shopsByOwner = {};
  for (let i = 0; i < Math.min(shopOwners.length, shopNames.length); i += 1) {
    const owner = shopOwners[i];
    let shop = await Shop.findOne({ ownerId: owner._id });
    if (!shop) {
      const cfg = shopStatuses[i];
      shop = await Shop.create({
        ownerId: owner._id,
        shopName: shopNames[i],
        shopAddress: `${12 + i} Industrial Road, Colombo ${i + 1}`,
        phone: `07${i}1234567`,
        email: owner.email,
        city: "Colombo",
        district: "Colombo",
        businessType: "Retail Garments",
        garmentCategories: "T-Shirts, Hoodies, Uniforms",
        estimatedMonthlyVolume: "500-1000 pcs",
        preferredPaymentMethod: "Bank Transfer",
        businessDescription: "Demo shop profile seeded for UI preview.",
        approvalStatus: cfg.approvalStatus,
        isActive: cfg.isActive,
        creditLimit: cfg.creditLimit,
        shopCode: cfg.shopCode,
        rejectionReason: cfg.approvalStatus === "Rejected" ? "Business registration document was unclear — please resubmit." : "",
        reviewedAt: cfg.approvalStatus === "Pending" ? null : daysAgo(5),
        reviewedBy: cfg.approvalStatus === "Pending" ? null : admin._id,
      });
      console.log(`Created Shop "${shop.shopName}" (${shop.approvalStatus}) for ${owner.email}`);
    }
    shopsByOwner[owner._id.toString()] = shop;
  }

  // ---------- Orders (new, current-schema, real userId) ----------
  const items = ["Cotton T-Shirt", "Fleece Hoodie", "Polo Shirt", "School Uniform Set", "Denim Jacket"];
  const orderStatuses = ["Pending", "Approved", "Production", "Delivered", "Cancelled"];
  const paymentStatuses = ["Pending", "Partial", "Paid"];

  const existingDemoCount = await Order.countDocuments({ orderId: { $regex: "^DEMO-" } });
  let seq = existingDemoCount;

  const createdOrders = [];
  for (let i = 0; i < Math.min(shopOwners.length, 5); i += 1) {
    const owner = shopOwners[i];
    for (let j = 0; j < 2; j += 1) {
      seq += 1;
      const quantity = 100 + (i + j) * 50;
      const unitPrice = 800 + (i * 37);
      const status = orderStatuses[(i + j) % orderStatuses.length];
      const paymentStatus = paymentStatuses[(i + j) % paymentStatuses.length];
      const order = await Order.create({
        orderId: `DEMO-2026-${String(seq).padStart(3, "0")}`,
        userId: owner._id,
        customerName: `${owner.firstName} ${owner.lastName}`,
        customerEmail: owner.email,
        item: items[(i + j) % items.length],
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
        status,
        progress: status === "Delivered" ? 100 : status === "Production" ? 55 : 0,
        deliveryDate: daysFromNow(10 + j),
        paymentStatus,
        notes: "Seeded demo order for UI preview.",
        createdAt: daysAgo(10 - j),
      });
      createdOrders.push({ order, owner });
    }
  }
  console.log(`Created ${createdOrders.length} demo order(s).`);

  // ---------- Production ----------
  const stageProgress = [10, 30, 55, 80, 100];
  let productionCount = 0;
  for (let i = 0; i < createdOrders.length; i += 1) {
    const { order } = createdOrders[i];
    if (order.status !== "Production" && order.status !== "Delivered") continue;
    const existing = await Production.findOne({ orderId: order.orderId });
    if (existing) continue;
    const progress = order.status === "Delivered" ? 100 : stageProgress[i % stageProgress.length];
    await Production.create({
      orderId: order.orderId,
      product: order.item,
      sku: `SKU-${order.orderId}`,
      quantity: order.quantity,
      unit: "Pcs",
      progress,
      status: progress === 100 ? "Completed" : "In Production",
      startDate: daysAgo(6),
      dueDate: daysFromNow(8),
      assignedStaffIds: staffUser && i % 2 === 0 ? [staffUser._id] : [],
      supervisorId: supervisor && i % 2 === 0 ? supervisor._id : null,
      assignmentNotes: staffUser && i % 2 === 0 ? "Demo assignment for UI preview." : "",
      assignedAt: staffUser && i % 2 === 0 ? daysAgo(3) : null,
      assignedBy: staffUser && i % 2 === 0 ? (supervisor?._id || admin._id) : null,
    });
    productionCount += 1;
  }
  console.log(`Created ${productionCount} demo production record(s).`);

  // ---------- Payments ----------
  const paymentTypes = ["Advance Payment", "Full Payment", "Remaining Balance"];
  const paymentStatusCycle = ["Submitted", "Verified", "Rejected"];
  let paymentCount = 0;
  for (let i = 0; i < createdOrders.length; i += 1) {
    const { order } = createdOrders[i];
    if (order.paymentStatus === "Pending") continue;
    const status = paymentStatusCycle[i % paymentStatusCycle.length];
    await Payment.create({
      orderId: order._id,
      paymentType: paymentTypes[i % paymentTypes.length],
      paymentMethod: i % 2 === 0 ? "Bank Transfer" : "Cheque",
      amount: Math.round(order.totalAmount * 0.4),
      transactionReference: `DEMO-REF-${order.orderId}`,
      status,
      verifiedAt: status === "Verified" ? daysAgo(2) : null,
      verifiedBy: status === "Verified" ? admin._id : null,
      rejectionReason: status === "Rejected" ? "Transaction reference could not be matched to bank records." : "",
    });
    paymentCount += 1;
  }
  console.log(`Created ${paymentCount} demo payment record(s).`);

  // ---------- Samples ----------
  const sampleStatuses = ["Preparing", "Awaiting Shop Approval", "Approved", "Revision Requested"];
  let sampleCount = 0;
  for (let i = 0; i < createdOrders.length; i += 1) {
    const { order } = createdOrders[i];
    const existing = await Sample.findOne({ orderId: order._id });
    if (existing) continue;
    const status = sampleStatuses[i % sampleStatuses.length];
    await Sample.create({
      orderId: order._id,
      imageUrl: "",
      notes: "Sample prepared per approved design notes — demo record.",
      status,
      shopComment: status === "Revision Requested" ? "Please use a darker shade of navy." : "",
    });
    sampleCount += 1;
  }
  console.log(`Created ${sampleCount} demo sample record(s).`);

  // ---------- Deliveries ----------
  const deliveryStatuses = ["Not Scheduled", "Scheduled", "Dispatched", "In Transit", "Delivered", "Delivery Failed"];
  let deliveryCount = 0;
  for (let i = 0; i < createdOrders.length; i += 1) {
    const { order } = createdOrders[i];
    const existing = await Delivery.findOne({ orderId: order._id });
    if (existing) continue;
    const status = deliveryStatuses[i % deliveryStatuses.length];
    await Delivery.create({
      orderId: order._id,
      deliveryStaffName: status !== "Not Scheduled" ? "Demo Driver" : "",
      trackingNumber: status !== "Not Scheduled" ? `TRK-DEMO-${1000 + i}` : "",
      scheduledDate: status !== "Not Scheduled" ? daysFromNow(3 + i) : null,
      status,
      notes: "Demo delivery record for UI preview.",
    });
    deliveryCount += 1;
  }
  console.log(`Created ${deliveryCount} demo delivery record(s).`);

  // ---------- Support Tickets ----------
  const ticketSeeds = [
    { subject: "Question about bulk pricing", status: "Open", withReply: false },
    { subject: "Delivery delay on my last order", status: "In Progress", withReply: true },
    { subject: "Sample image not loading", status: "Resolved", withReply: true },
    { subject: "Invoice discrepancy", status: "Closed", withReply: true },
  ];
  let ticketCount = 0;
  for (let i = 0; i < ticketSeeds.length && i < shopOwners.length; i += 1) {
    const seedDef = ticketSeeds[i];
    const owner = shopOwners[i];
    const existing = await Ticket.findOne({ shopOwnerId: owner._id, subject: seedDef.subject });
    if (existing) continue;
    const ticket = await Ticket.create({
      shopOwnerId: owner._id,
      subject: seedDef.subject,
      message: "This is a demo support ticket message seeded for UI preview.",
      status: seedDef.status,
      replies: seedDef.withReply
        ? [{ fromId: admin._id, fromRole: "admin", message: "Thanks for reaching out — we're looking into this now." }]
        : [],
    });
    ticketCount += 1;
    void ticket;
  }
  console.log(`Created ${ticketCount} demo support ticket(s).`);

  // ---------- Notifications ----------
  let notificationCount = 0;
  for (let i = 0; i < createdOrders.length; i += 1) {
    const { order, owner } = createdOrders[i];
    await Notification.create({
      title: "Order Status Updated",
      message: `Order ${order.orderId} is now "${order.status}".`,
      type: "order",
      relatedId: order._id,
      relatedModel: "Order",
      recipientId: owner._id,
      isRead: i % 3 === 0,
      createdAt: daysAgo(i),
    });
    notificationCount += 1;
  }
  await Notification.create({
    title: "New Shop Registration",
    message: "A new shop profile was submitted for approval.",
    type: "user",
    recipientId: null,
    isRead: false,
    createdAt: daysAgo(0.2),
  });
  notificationCount += 1;
  console.log(`Created ${notificationCount} demo notification(s).`);

  // ---------- Staff HR records (extra, for variety) ----------
  const extraStaff = [
    { staffId: "STF-DEMO-01", name: "Nadeesha Perera", department: "Sewing", position: "Sewing Operator", phone: "0711234567" },
    { staffId: "STF-DEMO-02", name: "Kasun Silva", department: "Quality Control", position: "QC Inspector", phone: "0719876543" },
  ];
  let staffCount = 0;
  for (const s of extraStaff) {
    const existing = await Staff.findOne({ staffId: s.staffId });
    if (existing) continue;
    await Staff.create({ ...s, attendance: "Present", status: "Active" });
    staffCount += 1;
  }
  console.log(`Created ${staffCount} demo staff HR record(s).`);

  console.log("\nDone seeding demo data. All records are additive only — nothing existing was modified or deleted.");
  console.log("Demo orders are prefixed \"DEMO-2026-\" and shop/staff records use recognizable seeded names for easy identification later.");

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
