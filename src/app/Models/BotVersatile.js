const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const BotVersatile = mongoose.model(
  "BotVersatile",
  new Schema(
    {
      image: { type: String, require: true },
      name: { type: String, require: true },
      content: { type: String, require: true },
      message: { type: String, require: true },
      placeholder: { type: String, require: true },
      status: { type: String, require: false, default: "DRAFT" },
    },
    { timestamps: true }
  )
);

module.exports = { BotVersatile };
