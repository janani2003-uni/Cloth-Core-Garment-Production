const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");







require("dotenv").config();



console.log(
  "SUPERVISOR_SETUP_KEY loaded:",
  Boolean(process.env.SUPERVISOR_SETUP_KEY)
);




const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
console.log(process.env.MONGO_URI);
console.log("MONGO_URI length:", process.env.MONGO_URI.length);

console.log("Trying to connect MongoDB...");

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo Error:", err);
  });