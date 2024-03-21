module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "bot-video";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const botVideoService = require("../Services/BotVideoService");

  // Api chat bot
  onRoute("post", "/render", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, ["messages"]);

      // Hàm xử lý logic và trả ra kết quả
      const result = await botVideoService.renderVideo({
        ...request,
        accountId: req.headers.accountid,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Tạo video thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });
};
