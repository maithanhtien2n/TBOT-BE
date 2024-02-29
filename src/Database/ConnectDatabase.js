const mongoose = require("mongoose");

// Kết nối đến MongoDB
mongoose.connect(
  "mongodb+srv://tbotai2000:0573725920@tbotai.sg8la6d.mongodb.net/tbotai?retryWrites=true&w=majority&appName=TBOTAI",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

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
