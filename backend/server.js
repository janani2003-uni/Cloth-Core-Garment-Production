const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

console.log("Trying to connect MongoDB...");

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("MongoDB Connected");

    app.use("/api/auth", authRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo Error:", err.message);
  });