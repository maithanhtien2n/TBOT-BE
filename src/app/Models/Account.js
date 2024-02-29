const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const Account = mongoose.model(
  "Accounts",
  new Schema(
    {
      email: { type: String, required: true, default: null },
      password: { type: String, required: false, default: null },
      moneyBalance: { type: Number, required: false, default: 0 },
      otp: { type: Number, required: true, default: null },
      role: { type: String, required: false, default: "USER" },
      status: { type: String, required: false, default: "ACTIVE" },
    },
    { timestamps: true }
  )
);

module.exports = { Account };
