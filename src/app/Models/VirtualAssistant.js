const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const VirtualAssistant = mongoose.model(
  "VirtualAssistant",
  new Schema(
    {
      accountId: { type: Schema.Types.ObjectId, ref: "accountId" },
      assistantId: { type: String, require: true },
    },
    { timestamps: true }
  )
);

module.exports = { VirtualAssistant };
