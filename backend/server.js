
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});


const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes"); // <-- Added
const orderRoutes = require("./routes/orderRoutes");
const productionRoutes = require("./routes/productionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const inventoryRoutes = require(
  "./routes/inventoryRoutes"
);
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const shopRoutes = require("./routes/shopRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const sampleRoutes = require("./routes/sampleRoutes");
const adminAccessCodeRoutes = require("./routes/adminAccessCodeRoutes");
const designRoutes = require("./routes/designRoutes");
const garmentStockRoutes = require("./routes/garmentStockRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contactRoutes");
const { isEmailConfigured } = require("./utils/mailer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Real disk-backed uploads (Shop Logos, Step 2 design uploads, payment
// proofs — see backend/middleware/upload.js) are served statically from
// here, e.g. GET /uploads/logos/xxx.png. Only the relative path
// ("/uploads/logos/xxx.png") is ever stored in MongoDB.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes); // <-- Added
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/admin-codes", adminAccessCodeRoutes);
app.use("/api/design", designRoutes);
app.use("/api/garment-stock", garmentStockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

// Log errors that would otherwise silently kill the process (or crash it
// with no explanation), instead of letting the server go down without a trace.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing from backend/.env");
  process.exit(1);
}

// Password recovery is the only feature that depends on email — everything
// else must keep working even if this isn't configured yet, so this is a
// warning, not a fatal exit.
if (!isEmailConfigured) {
  console.warn(
    "EMAIL_USER / EMAIL_PASS are not set in backend/.env — Forgot Password emails will not be sent until a Gmail App Password is configured."
  );
}

const RETRY_DELAY_MS = 5000;

function connectToDatabase() {
  console.log("Trying to connect MongoDB...");

  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    })
    .then(() => {
      console.log("MongoDB Connected");

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error(
        `Mongo Error: ${err.message} — retrying in ${RETRY_DELAY_MS / 1000}s`
      );
      setTimeout(connectToDatabase, RETRY_DELAY_MS);
    });
}

// If an already-open connection drops later (network blip, Atlas pause),
// log it clearly instead of leaving the server in a silent, unreachable state.
mongoose.connection.on("disconnected", () => {
  console.error("MongoDB disconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

connectToDatabase();