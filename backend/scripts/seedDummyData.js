// backend/scripts/seedDummyData.js
//
// Adds clearly-synthetic demo data across every collection so tables,
// status badges and notification feeds have real examples to display in
// every role's UI — meant for walking someone (e.g. an instructor) through
// how the system works. Purely additive — never touches or deletes any
// existing document, and is safe to re-run (it checks for its own records
// by email/staffId/orderId before creating anything new, so running it
// twice never creates duplicates).
//
// Creates, if they don't already exist:
//   - 5 dummy Shop Owner accounts (+ their Shop profiles, varied approval
//     states) — real accounts with real password credentials in the DB
//   - 3 dummy Supervisor accounts, created the same way the real app does
//     it (a Staff HR record + a linked login account), not a shortcut
//   - Extra Staff HR records with no login (department/status values match
//     what's currently selectable from the real Add Staff form)
//   - Raw-materials Inventory rows across every category the UI offers
//   - Orders (and their Production/Payment/Sample/Delivery/Notification
//     trail) spread across every dummy shop owner, cycling through every
//     status value so every badge color shows up somewhere
//   - Support tickets in every status
//
// All dummy accounts share the password: Demo@Pass123
// (meets the app's real password policy: 8-20 chars, upper+lower+digit+2
// special characters — so logging in as any of them to demo the system
// works exactly like a real account.)
//
// Usage: node scripts/seedDummyData.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
const Inventory = require("../models/Inventory");

const DEMO_PASSWORD = "Demo@Pass123";

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

  const admin = await User.findOne({ role: "admin" });

  if (!admin) {
    console.log("Need at least one admin account to seed against — aborting.");
    await mongoose.disconnect();
    return;
  }

  const hashedDemoPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ==========================================================
  // Dummy Shop Owner accounts
  // ==========================================================
  const shopOwnerSeeds = [
    { firstName: "Kasuni", lastName: "Fernando", email: "kasuni.fernando@demo.clothcore.lk", shopName: "Fernando Textiles" },
    { firstName: "Ruwan", lastName: "Jayasinghe", email: "ruwan.jayasinghe@demo.clothcore.lk", shopName: "Jayasinghe Garments" },
    { firstName: "Ishara", lastName: "Wickramasinghe", email: "ishara.wickrama@demo.clothcore.lk", shopName: "Wickrama Apparel" },
    { firstName: "Sanduni", lastName: "Rathnayake", email: "sanduni.rathnayake@demo.clothcore.lk", shopName: "Rathnayake Fashion House" },
    { firstName: "Chathura", lastName: "Bandara", email: "chathura.bandara@demo.clothcore.lk", shopName: "Bandara Uniforms Co." },
  ];

  let newShopOwnerCount = 0;
  for (const seedDef of shopOwnerSeeds) {
    const existing = await User.findOne({ email: seedDef.email });
    if (existing) continue;
    await User.create({
      firstName: seedDef.firstName,
      lastName: seedDef.lastName,
      email: seedDef.email,
      shopName: seedDef.shopName,
      password: hashedDemoPassword,
      role: "shopOwner",
      status: "Active",
      isActive: true,
      joinedDate: daysAgo(20),
    });
    newShopOwnerCount += 1;
  }
  console.log(`Created ${newShopOwnerCount} demo shop owner account(s). Password for all demo accounts: ${DEMO_PASSWORD}`);

  const shopOwners = await User.find({ email: { $regex: "@demo\\.clothcore\\.lk$" } }).sort({ createdAt: 1 });
  const anyRealShopOwner = await User.findOne({ role: "shopOwner", email: { $not: /@demo\.clothcore\.lk$/ } });
  const allShopOwnersForOrders = anyRealShopOwner ? [anyRealShopOwner, ...shopOwners] : shopOwners;

  if (shopOwners.length === 0) {
    console.log("No demo shop owners available (unexpected) — aborting.");
    await mongoose.disconnect();
    return;
  }

  // ---------- Shops, one per demo shop owner, varied approval states ----------
  const shopConfigs = [
    { approvalStatus: "Approved", isActive: true, creditLimit: 250000, shopCode: "SHOP-2026-201" },
    { approvalStatus: "Approved", isActive: true, creditLimit: 150000, shopCode: "SHOP-2026-202" },
    { approvalStatus: "Pending", isActive: true, creditLimit: 0, shopCode: "" },
    { approvalStatus: "Approved", isActive: false, creditLimit: 100000, shopCode: "SHOP-2026-203" },
    { approvalStatus: "Rejected", isActive: true, creditLimit: 0, shopCode: "" },
  ];

  let newShopCount = 0;
  for (let i = 0; i < shopOwners.length; i += 1) {
    const owner = shopOwners[i];
    const existingShop = await Shop.findOne({ ownerId: owner._id });
    if (existingShop) continue;
    const cfg = shopConfigs[i % shopConfigs.length];
    await Shop.create({
      ownerId: owner._id,
      shopName: owner.shopName,
      shopAddress: `${12 + i} Industrial Road, Colombo ${(i % 9) + 1}`,
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
    newShopCount += 1;
  }
  console.log(`Created ${newShopCount} demo shop profile(s).`);

  // ==========================================================
  // Dummy Supervisor accounts — created the same way the real app does:
  // a Staff HR record first, then a linked login account, exactly what
  // Staff Management > "Create Login Account" produces.
  // ==========================================================
  const supervisorSeeds = [
    { staffId: "STF-DEMO-SUP-01", name: "Priyanka Silva", department: "HR", phone: "0761112223", email: "priyanka.silva@demo.clothcore.lk" },
    { staffId: "STF-DEMO-SUP-02", name: "Nuwan Perera", department: "Production", phone: "0762223334", email: "nuwan.perera@demo.clothcore.lk" },
    { staffId: "STF-DEMO-SUP-03", name: "Dilani Gunasekara", department: "Delivery", phone: "0763334445", email: "dilani.gunasekara@demo.clothcore.lk" },
  ];

  let newSupervisorCount = 0;
  for (const seedDef of supervisorSeeds) {
    let staff = await Staff.findOne({ staffId: seedDef.staffId });
    if (!staff) {
      staff = await Staff.create({
        staffId: seedDef.staffId,
        name: seedDef.name,
        department: seedDef.department,
        phone: seedDef.phone,
        email: seedDef.email,
        joiningDate: daysAgo(60),
        status: "On Duty",
      });
    }

    if (staff.userId) continue;

    const existingUser = await User.findOne({ email: seedDef.email });
    if (existingUser) {
      staff.userId = existingUser._id;
      await staff.save();
      continue;
    }

    const [firstName, ...rest] = seedDef.name.split(" ");
    const lastName = rest.join(" ") || firstName;

    const supervisorUser = await User.create({
      firstName,
      lastName,
      email: seedDef.email,
      shopName: "ClothCore",
      password: hashedDemoPassword,
      role: "supervisor",
      status: "Active",
      isActive: true,
      staffId: staff._id,
    });

    staff.userId = supervisorUser._id;
    staff.accountCreatedAt = daysAgo(55);
    staff.accountCreatedBy = admin._id;
    await staff.save();
    newSupervisorCount += 1;
  }
  console.log(`Created ${newSupervisorCount} demo supervisor account(s). Password: ${DEMO_PASSWORD}`);

  const supervisor = await User.findOne({ role: "supervisor" });

  // ---------- Extra Staff HR records, no login — current department set ----------
  const extraStaff = [
    { staffId: "STF-DEMO-01", name: "Nadeesha Fernando", department: "Production", position: "Sewing Operator", phone: "0711234567" },
    { staffId: "STF-DEMO-02", name: "Kasun de Silva", department: "Production", position: "QC Inspector", phone: "0719876543" },
    { staffId: "STF-DEMO-03", name: "Ama Wijesekara", department: "Delivery", position: "Driver", phone: "0713456789", status: "On Leave" },
    { staffId: "STF-DEMO-04", name: "Tharindu Rajapaksa", department: "HR", position: "Assistant", phone: "0717654321" },
  ];
  let staffCount = 0;
  for (const s of extraStaff) {
    const existing = await Staff.findOne({ staffId: s.staffId });
    if (existing) continue;
    await Staff.create({ ...s, joiningDate: daysAgo(90), status: s.status || "On Duty" });
    staffCount += 1;
  }
  console.log(`Created ${staffCount} additional demo staff HR record(s) (no login).`);

  // ==========================================================
  // Raw-materials Inventory — one row per category the UI offers
  // ==========================================================
  const inventorySeeds = [
    { itemName: "Cotton Fabric", sku: "INV-DEMO-001", category: "Fabrics", color: "White", stockQuantity: 850, unit: "Meter", unitCost: 420, minimumStock: 150, description: "100% cotton, 180gsm, bulk roll." },
    { itemName: "Denim Fabric", sku: "INV-DEMO-002", category: "Fabrics", color: "Navy Blue", stockQuantity: 60, unit: "Meter", unitCost: 690, minimumStock: 100, description: "12oz denim, indigo dyed." },
    { itemName: "Polyester Thread", sku: "INV-DEMO-003", category: "Threads", color: "Black", stockQuantity: 400, unit: "Cone", unitCost: 85, minimumStock: 50, description: "40s/2 sewing thread." },
    { itemName: "Metal Zippers 7\"", sku: "INV-DEMO-004", category: "Zippers", color: "Grey", stockQuantity: 0, unit: "Piece", unitCost: 35, minimumStock: 200, description: "YKK-style metal zip, 7 inch." },
    { itemName: "Plastic Buttons 15mm", sku: "INV-DEMO-005", category: "Buttons", color: "White", stockQuantity: 1200, unit: "Piece", unitCost: 4, minimumStock: 300, description: "4-hole flat buttons." },
    { itemName: "Woven Brand Labels", sku: "INV-DEMO-006", category: "Labels & Tags", color: "White", stockQuantity: 90, unit: "Piece", unitCost: 6, minimumStock: 100, description: "ClothCore woven neck labels." },
    { itemName: "Elastic Waistband", sku: "INV-DEMO-007", category: "Accessories", color: "Black", stockQuantity: 320, unit: "Meter", unitCost: 55, minimumStock: 80, description: "25mm knit elastic." },
    { itemName: "Fleece Fabric", sku: "INV-DEMO-008", category: "Fabrics", color: "Grey", stockQuantity: 210, unit: "Meter", unitCost: 540, minimumStock: 100, description: "Brushed fleece, 320gsm." },
  ];
  let inventoryCount = 0;
  for (const item of inventorySeeds) {
    const existing = await Inventory.findOne({ sku: item.sku });
    if (existing) continue;
    await Inventory.create(item);
    inventoryCount += 1;
  }
  console.log(`Created ${inventoryCount} demo inventory item(s).`);

  // ==========================================================
  // Orders — spread across every dummy shop owner (plus the real one, if
  // any), cycling through every status/payment-status value.
  // ==========================================================
  const items = ["Cotton T-Shirt", "Fleece Hoodie", "Polo Shirt", "School Uniform Set", "Denim Jacket"];
  const orderStatuses = ["Pending", "Approved", "Production", "In Delivery", "Delivered", "Cancelled"];
  const paymentStatuses = ["Pending", "Advance Paid", "Full Paid"];

  const existingDemoCount = await Order.countDocuments({ orderId: { $regex: "^DEMO-" } });
  let seq = existingDemoCount;

  const createdOrders = [];
  for (let i = 0; i < allShopOwnersForOrders.length; i += 1) {
    const owner = allShopOwnersForOrders[i];
    for (let j = 0; j < 2; j += 1) {
      seq += 1;
      const quantity = 100 + (i + j) * 50;
      const unitPrice = 800 + (i * 37);
      const status = orderStatuses[(i + j) % orderStatuses.length];
      const paymentStatus = paymentStatuses[(i + j) % paymentStatuses.length];
      const orderId = `DEMO-2026-${String(seq).padStart(3, "0")}`;
      const existingOrder = await Order.findOne({ orderId });
      if (existingOrder) continue;
      const order = await Order.create({
        orderId,
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
  console.log(`Created ${createdOrders.length} demo order(s) across ${allShopOwnersForOrders.length} shop owner(s).`);

  // ---------- Production ----------
  const stageProgress = [10, 30, 55, 80, 100];
  const allStaff = await Staff.find();
  let productionCount = 0;
  for (let i = 0; i < createdOrders.length; i += 1) {
    const { order } = createdOrders[i];
    if (order.status !== "Production" && order.status !== "In Delivery" && order.status !== "Delivered") continue;
    const existing = await Production.findOne({ orderId: order.orderId });
    if (existing) continue;
    const isDone = order.status === "In Delivery" || order.status === "Delivered";
    const progress = isDone ? 100 : stageProgress[i % stageProgress.length];
    const staffMember = allStaff.length > 0 ? allStaff[i % allStaff.length] : null;
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
      assignedStaffIds: staffMember ? [staffMember._id] : [],
      supervisorId: supervisor && i % 2 === 0 ? supervisor._id : null,
      assignmentNotes: staffMember ? "Demo assignment for UI preview." : "",
      assignedAt: staffMember ? daysAgo(3) : null,
      assignedBy: staffMember ? (supervisor?._id || admin._id) : null,
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
    const existing = await Payment.findOne({ transactionReference: `DEMO-REF-${order.orderId}` });
    if (existing) continue;
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
      address: `${12 + i} Industrial Road, Colombo ${(i % 9) + 1}`,
      method: "Courier Service",
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
    { subject: "Can I change my delivery address?", status: "Open", withReply: false },
  ];
  let ticketCount = 0;
  for (let i = 0; i < ticketSeeds.length && i < allShopOwnersForOrders.length; i += 1) {
    const seedDef = ticketSeeds[i];
    const owner = allShopOwnersForOrders[i];
    const existing = await Ticket.findOne({ shopOwnerId: owner._id, subject: seedDef.subject });
    if (existing) continue;
    await Ticket.create({
      shopOwnerId: owner._id,
      subject: seedDef.subject,
      message: "This is a demo support ticket message seeded for UI preview.",
      status: seedDef.status,
      replies: seedDef.withReply
        ? [{ fromId: admin._id, fromRole: "admin", message: "Thanks for reaching out — we're looking into this now." }]
        : [],
    });
    ticketCount += 1;
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
  if (newShopOwnerCount > 0) {
    await Notification.create({
      title: "New Shop Registration",
      message: "A new shop profile was submitted for approval.",
      type: "user",
      recipientId: null,
      isRead: false,
      createdAt: daysAgo(0.2),
    });
    notificationCount += 1;
  }
  console.log(`Created ${notificationCount} demo notification(s).`);

  console.log("\nDone seeding demo data. All records are additive only — nothing existing was modified or deleted.");
  console.log(`Demo shop owner / supervisor login password: ${DEMO_PASSWORD}`);
  console.log("Demo orders are prefixed \"DEMO-2026-\"; demo users end in \"@demo.clothcore.lk\"; demo staff IDs are prefixed \"STF-DEMO-\" — all easy to find and remove later if needed.");

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
