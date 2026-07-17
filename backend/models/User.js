const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  factoryName: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  role: {
  type: String,
  enum: ["admin", "shopOwner", "productionSupervisor"],
  default: "shopOwner",
},
   otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);