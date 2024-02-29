const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const TopUpHistory = mongoose.model(
  "TopUpHistories",
  new Schema(
    {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
      moneyNumber: { type: Number, required: true },
      content: {
        type: String,
        required: false,
        default: "Nạp tiền tài khoản!",
      },
      moneyBalance: { type: Number, required: false, default: 0 },
    },
    { timestamps: true }
  )
);

module.exports = { TopUpHistory };
