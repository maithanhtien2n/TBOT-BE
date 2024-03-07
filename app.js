const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Import cors module

const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: {} });

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "500MB" })); // Tăng giới hạn kích thước lên 500MB

// Định tuyến các API endpoint
require("./src/app/Controllers/CommonController")(app, io);
require("./src/app/Controllers/AuthController")(app);
require("./src/app/Controllers/UserController")(app);
require("./src/app/Controllers/VirtualAssistantController")(app);
require("./src/app/Controllers/NotificationController")(app);
require("./src/app/Controllers/QuestionController")(app);
require("./src/app/Controllers/DocumentController")(app);
require("./src/app/Controllers/BotImageController")(app);
require("./src/app/Controllers/BotAudioController")(app);
require("./src/app/Controllers/BotVersatileController")(app);

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`);
});
