module.exports = (app) => {
  const {
    onResponse,
    checkNullRequest,
    renderHost,
  } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "bot-versatile";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const botVersatileService = require("../Services/BotVersatileService");

  // Api chat bot
  onRoute("post", "/send-message", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, [
        "botVersatileId",
        "messages",
      ]);

      // Hàm xử lý logic và trả ra kết quả
      const result = await botVersatileService.sendMessage({
        ...request,
        accountId: req.headers.accountid,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Gửi thông điệp thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });
};
