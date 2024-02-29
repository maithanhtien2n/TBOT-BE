require("dotenv").config();
const mongoose = require("mongoose");

// Kết nối đến MongoDB
mongoose.connect(process.env.DATA_BASE_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sự kiện kết nối thành công
mongoose.connection.on("connected", () => {
  console.log("Kết nối đến MongoDB thành công");
});

// Sự kiện lỗi kết nối
mongoose.connection.on("error", (err) => {
  console.error("Kết nối đến MongoDB lỗi:", err);
});

// Sự kiện ngắt kết nối
mongoose.connection.on("disconnected", () => {
  console.log("Ngắt kết nối đến MongoDB");
});

module.exports = mongoose;
