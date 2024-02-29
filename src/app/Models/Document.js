const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const Document = mongoose.model(
  "Documents",
  new Schema(
    {
      application: { type: String, required: true },
      topUp: { type: String, required: true },
    },
    { timestamps: true }
  )
);

module.exports = { Document };
