// backend/migrations/removeStaffRole.js
//
// The "staff" role has been removed from the system (see backend/models/User.js —
// it's no longer in the role enum). This migration converts any existing
// User documents with role "staff" to "supervisor" instead, since the
// product decision is "there are only supervisors, no separate staff role."
// Non-destructive: only the `role` field is touched, no document is deleted
// or recreated, and every other field (name, email, password, etc.) is left
// exactly as-is.
//
// Usage:
//   node migrations/removeStaffRole.js            (dry run — preview only, no writes)
//   node migrations/removeStaffRole.js --apply     (actually performs the update)

require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  const apply = process.argv.includes("--apply");

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in backend/.env — aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const staffUsers = await db.collection("users").find({ role: "staff" }).project({ email: 1, role: 1 }).toArray();

  console.log("=".repeat(70));
  console.log(`REMOVE STAFF ROLE MIGRATION ${apply ? "(APPLY MODE)" : "(DRY RUN — no writes)"}`);
  console.log("=".repeat(70));
  console.log(`Accounts with role "staff": ${staffUsers.length}`);
  console.log("");

  if (staffUsers.length > 0) {
    console.log("Affected accounts (email — current role -> proposed role):");
    staffUsers.forEach((u) => {
      console.log(`  ${u.email}  —  "staff" -> "supervisor"`);
    });
    console.log("");
  }

  if (!apply) {
    console.log("This was a dry run. No documents were modified.");
    console.log("Re-run with --apply to write these changes.");
  } else {
    for (const u of staffUsers) {
      await db.collection("users").updateOne({ _id: u._id }, { $set: { role: "supervisor" } });
    }
    console.log(`Done. ${staffUsers.length} account(s) updated.`);
  }

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Migration script failed:", error);
  process.exit(1);
});
