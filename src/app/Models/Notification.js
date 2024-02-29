const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const Notification = mongoose.model(
  "Notifications",
  new Schema(
    {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: false,
        default: null,
      },
      isNewNotification: { type: Boolean, required: false, default: true },
      sendType: { type: String, required: true },
      image: { type: String, required: false, default: null },
      title: { type: String, required: true },
      content: { type: String, required: true, default: null },
      status: { type: String, required: false, default: "ACTIVE" },
    },
    { timestamps: true }
  )
);

module.exports = { Notification };
