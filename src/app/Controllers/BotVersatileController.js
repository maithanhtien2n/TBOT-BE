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
        host: renderHost(req),
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Gửi thông điệp thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API lấy danh sách mẫu bot đa năng
  onRoute(
    "get",
    "",
    async (req, res) => {
      try {
        const { tab, keySearch } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await botVersatileService.getAll({ tab, keySearch });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  onRoute(
    "get",
    "/:id",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await botVersatileService.getOne(req.params.id);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  onRoute(
    "put",
    "",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, [
          "image",
          "name",
          "content",
          "message",
          "placeholder",
        ]); // Yêu cầu phải có các trường này trong body

        // Hàm xử lý logic và trả ra kết quả
        const result = await botVersatileService.save(req.query.id, {
          ...request,
          host: renderHost(req),
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lưu dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // Api xóa bot mẫu
  onRoute(
    "delete",
    "",
    async (req, res) => {
      try {
        const request = checkNullRequest(req.body, ["ids"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await botVersatileService.delete(request);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Xóa ${result} dữ liệu thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // API cập trạng thái mâu bot
  onRoute(
    "put",
    "/update-status",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["ids", "status"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await botVersatileService.updateStatus(request);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Cập nhật ${result} dữ liệu thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // API lấy danh sách mẫu bot đa năng cho người dùng
  onRoute("put", "/dropdown", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await botVersatileService.getDropdown();

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // Api lấy chi tiết bot mẫu cho người dùng
  onRoute("put", "/detail", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await botVersatileService.getDetail(req.query.id);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });
};
