const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    attendance: {
      type: String,
      enum: ["Present", "Absent", "On Leave"],
      default: "Present",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Staff", staffSchema);