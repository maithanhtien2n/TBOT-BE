module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "bot-audio";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const botAudioService = require("../Services/BotAudioService");

  // Api chat bot
  onRoute("post", "", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, ["input"]);

      // Hàm xử lý logic và trả ra kết quả
      const result = await botAudioService.convertTextToAudio({
        ...request,
        host: req.headers.host,
        accountId: req.headers.accountid,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Chuyển đổi văn bản thành hình ảnh thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });
};
