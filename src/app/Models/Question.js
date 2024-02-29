const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const Question = mongoose.model(
  "Questions",
  new Schema(
    {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      question: { type: String, required: true },
      answer: { type: String, required: false, default: null },
    },
    { timestamps: true }
  )
);

module.exports = { Question };
