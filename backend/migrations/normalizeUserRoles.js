// backend/migrations/normalizeUserRoles.js
//
// Normalizes every User document's `role` field to the current enum
// (admin/shopOwner/supervisor/staff/user — see backend/models/User.js).
// Only the `role` field is ever touched: no document is deleted, created,
// or has any other field modified, and each document's own _id is
// preserved throughout.
//
// Usage:
//   node migrations/normalizeUserRoles.js            (dry run — preview only, no writes)
//   node migrations/normalizeUserRoles.js --apply     (actually performs the update)
//
// Run from the backend/ directory so it can resolve backend/.env and
// node_modules the same way the server does.

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const ROLE_MAP = {
  Admin: "admin",
  admin: "admin",
  "Shop Owner": "shopOwner",
  shopOwner: "shopOwner",
  Supervisor: "supervisor",
  supervisor: "supervisor",
  Staff: "staff",
  staff: "staff",
  User: "user",
  user: "user",
};

async function run() {
  const apply = process.argv.includes("--apply");

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in backend/.env — aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  // .lean() returns the raw document with no schema defaults applied, so a
  // user with no `role` field at all shows up as undefined here — that's
  // intentional, so we can tell "field genuinely missing" apart from "field
  // present but holds a garbage value" below.
  const users = await User.find().select("email role").lean();

  const toMigrate = [];
  const toBackfill = [];
  const unmigratable = [];

  users.forEach((user) => {
    const currentRole = user.role;

    if (currentRole === undefined) {
      // No role field stored at all. The schema's own default ("user") is
      // already what every read of this document resolves to at runtime
      // (Mongoose applies schema defaults on hydration outside .lean()) —
      // this just makes that default explicit and persisted.
      toBackfill.push({ id: user._id, email: user.email });
      return;
    }

    const proposedRole = ROLE_MAP[currentRole];

    if (proposedRole === undefined) {
      unmigratable.push({ id: user._id, email: user.email, currentRole });
      return;
    }

    if (proposedRole !== currentRole) {
      toMigrate.push({ id: user._id, email: user.email, currentRole, proposedRole });
    }
  });

  console.log("=".repeat(70));
  console.log(`ROLE NORMALIZATION ${apply ? "(APPLY MODE)" : "(DRY RUN — no writes)"}`);
  console.log("=".repeat(70));
  console.log(`Total users in database: ${users.length}`);
  console.log(`Accounts needing a role value change: ${toMigrate.length}`);
  console.log(`Accounts with no role field at all (will be backfilled to "user"): ${toBackfill.length}`);
  console.log(`Accounts with an unrecognized role (left untouched): ${unmigratable.length}`);
  console.log("");

  if (toMigrate.length > 0) {
    console.log("Affected accounts (email — current role -> proposed role):");
    toMigrate.forEach((u) => {
      console.log(`  ${u.email}  —  "${u.currentRole}" -> "${u.proposedRole}"`);
    });
    console.log("");
  }

  if (toBackfill.length > 0) {
    console.log("Accounts with no role field (will be set to \"user\" explicitly):");
    toBackfill.forEach((u) => {
      console.log(`  ${u.email}  —  (missing) -> "user"`);
    });
    console.log("");
  }

  if (unmigratable.length > 0) {
    console.log("Accounts with an unrecognized role value (NOT changed, needs manual review):");
    unmigratable.forEach((u) => {
      console.log(`  ${u.email}  —  "${u.currentRole}"`);
    });
    console.log("");
  }

  if (!apply) {
    console.log("This was a dry run. No documents were modified.");
    console.log("Re-run with --apply to write these changes.");
  } else {
    console.log("Applying updates...");
    for (const u of toMigrate) {
      await User.updateOne({ _id: u.id }, { $set: { role: u.proposedRole } });
    }
    for (const u of toBackfill) {
      await User.updateOne({ _id: u.id }, { $set: { role: "user" } });
    }
    console.log(`Done. ${toMigrate.length + toBackfill.length} account(s) updated.`);
  }

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Migration script failed:", error);
  process.exit(1);
});
