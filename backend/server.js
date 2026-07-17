
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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes); // <-- Added
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

console.log("Trying to connect MongoDB...");

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing from backend/.env");
  process.exit(1);
}
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
    console.log("Mongo Error:", err.message);
  });