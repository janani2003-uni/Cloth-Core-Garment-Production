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

  joinedDate: {
  type: Date,
  default: Date.now,
},

lastLogin: {
  type: Date,
  default: null,
},

  password: {
    type: String,
    required: true,
  },
   otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);