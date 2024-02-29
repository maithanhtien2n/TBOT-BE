const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;
const { Date } = require("mongoose");

const User = mongoose.model(
  "Users",
  new Schema(
    {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
      avatar: { type: String, required: false, default: null },
      fullName: { type: String, required: false, default: null },
      gender: { type: String, required: false, default: null },
      dateOfBirth: { type: Date, required: false, default: null },
      phoneNumber: { type: String, required: false, default: null },
    },
    { timestamps: true }
  )
);

module.exports = { User };
