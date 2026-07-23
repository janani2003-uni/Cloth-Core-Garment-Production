const mongoose = require("mongoose");

const getStageFromProgress = (progress) => {
  const value = Number(progress);

  if (value <= 0) return "Not Started";
  if (value <= 25) return "Cutting";
  if (value <= 50) return "Sewing";
  if (value <= 75) return "Quality Assurance";
  if (value < 100) return "Packing";

  return "Completed";
};

const productionSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    product: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    unit: {
      type: String,
      default: "Pcs",
      trim: true,
    },

    progress: {
      type: Number,
      required: true,
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot exceed 100"],
      default: 0,
    },

    stage: {
      type: String,
      enum: [
        "Not Started",
        "Cutting",
        "Sewing",
        "Quality Assurance",
        "Packing",
        "Completed",
      ],
      default: "Not Started",
    },

    status: {
      type: String,
      enum: ["In Production", "Completed", "On Hold", "Cancelled"],
      default: "In Production",
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // Optional Supervisor -> Staff work assignment. All fields default to
    // "unassigned" so existing records keep working untouched; nothing here
    // is ever set automatically.
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedStaffIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignmentNotes: {
      type: String,
      default: "",
      trim: true,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validate dates
productionSchema.pre("validate", function (next) {
  if (
    this.startDate &&
    this.dueDate &&
    new Date(this.startDate) > new Date(this.dueDate)
  ) {
    return next(new Error("Start date cannot be after due date"));
  }

  next();
});

// Automatically update stage and status
productionSchema.pre("save", function (next) {
  if (this.status === "Completed") {
    this.progress = 100;
  }

  this.stage = getStageFromProgress(this.progress);

  if (
    this.progress === 100 &&
    this.status !== "On Hold" &&
    this.status !== "Cancelled"
  ) {
    this.status = "Completed";
    this.stage = "Completed";
  }

  next();
});

module.exports = mongoose.model("Production", productionSchema);