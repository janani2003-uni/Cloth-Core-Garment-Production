const mongoose = require("mongoose");
require("dotenv").config();

const Production = require("./models/Production");

const dummyProductionOrders = [
  {
  orderId: "PO-24-025",
  product: "Polo T-Shirt",
  sku: "POLO-T-001",
  quantity: 1000,
  unit: "Pcs",
  progress: 75,
  stage: "Quality Assurance",
  status: "In Production",
  startDate: new Date("2026-05-20"),
  dueDate: new Date("2026-06-05"),
},
{
  orderId: "PO-24-024",
  product: "Uniform",
  sku: "UNI-S-002",
  quantity: 500,
  unit: "Pcs",
  progress: 40,
  stage: "Sewing",
  status: "In Production",
  startDate: new Date("2026-05-18"),
  dueDate: new Date("2026-06-02"),
},
{
  orderId: "PO-24-023",
  product: "Shirt",
  sku: "SHIRT-F-003",
  quantity: 800,
  unit: "Pcs",
  progress: 100,
  stage: "Completed",
  status: "Completed",
  startDate: new Date("2026-05-10"),
  dueDate: new Date("2026-05-20"),
},
{
  orderId: "PO-24-022",
  product: "Hoodie",
  sku: "HOODIE-H-004",
  quantity: 600,
  unit: "Pcs",
  progress: 20,
  stage: "Cutting",
  status: "In Production",
  startDate: new Date("2026-05-15"),
  dueDate: new Date("2026-05-30"),
},
];

async function seedProduction() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    for (const order of dummyProductionOrders) {
      await Production.findOneAndUpdate(
        { orderId: order.orderId },
        order,
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    console.log("Dummy production data inserted successfully.");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

seedProduction();