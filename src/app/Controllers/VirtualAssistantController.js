module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "virtual-assistant";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const virtualAssistantService = require("../Services/VirtualAssistantService");

  // Api chat bot
  onRoute(
    "post",
    "/chat",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, [
          "accountId",
          "threadId",
          "content",
        ]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await virtualAssistantService.chat(request);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Lấy dữ liệu thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );

  // Api lấy nội dung đào tạo bot
  onRoute("get", "/train", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await virtualAssistantService.getTrain(
        req.headers.accountid
      );

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Lấy dữ liệu thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // Api lưu nội dung đào tạo cho bot
  onRoute("post", "/train", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(
        { ...req.body, accountId: req.headers.accountid },
        ["accountId", "name", "instructions", "files"]
      );

      // Hàm xử lý logic và trả ra kết quả
      const result = await virtualAssistantService.saveTrain(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Lưu dữ liệu thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // Api lấy chi tiết cuộc trò chuyện
  onRoute(
    "get",
    "/chat-container/:threadId",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await virtualAssistantService.getChatContainer(
          req.params.threadId
        );

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Lấy dữ liệu thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );

  // Api tạo cuộc trò chuyện
  onRoute(
    "post",
    "/chat-container",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await virtualAssistantService.createChatContainer();

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Tạo dữ liệu thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );

  // Api xóa cuộc trò chuyện
  onRoute("delete", "/chat-container/:id", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await virtualAssistantService.deleteChatContainer(
        req.params.id
      );

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Tạo dữ liệu thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // Api check link chat
  onRoute(
    "get",
    "/check-link-chat/:accountId",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await virtualAssistantService.checkLinkChat(
          req.params.accountId
        );

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Lấy dữ liệu thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );
};
