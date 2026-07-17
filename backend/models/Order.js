const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
    },

    garment: {
      type: String,
      required: true,
    },

    fabric: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      default: 0,
    },
     deliveryDate: {
  type: String,
},
advancePaid: {
  type: Number,
  default: 0,
},

balancePayment: {
  type: Number,
  default: 0,
},

address: {
  type: String,
},

deliveryMethod: {
  type: String,
},

specialInstructions: {
  type: String,
},

paymentMethod: {
  type: String,
},

paymentStatus: {
  type: String,
  default: "Pending",
},

    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);