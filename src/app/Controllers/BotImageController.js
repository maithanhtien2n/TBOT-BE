module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "bot-image";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const botImageService = require("../Services/BotImageService");

  // Api chat bot
  onRoute(
    "post",
    "",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["prompt"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await botImageService.createImage({
          ...request,
          accountId: req.headers.accountid,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Tạo hình ảnh thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );
};
