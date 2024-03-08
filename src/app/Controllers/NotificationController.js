module.exports = (app) => {
  const {
    onResponse,
    checkNullRequest,
    renderHost,
  } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "notification";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const notificationService = require("../Services/NotificationService");

  // API lấy danh sách thông báo cho admin quản lý
  onRoute(
    "get",
    "/admin",
    async (req, res) => {
      try {
        const { tab, keySearch } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await notificationService.getAllNotificationAdmin({
          tab,
          keySearch,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // API lấy danh sách thông báo đến người dùng
  onRoute("get", "/user", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await notificationService.getAllNotificationUser(
        req.headers.accountid
      );

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API lấy chi tiết thông báo
  onRoute("get", "/detail/:notificationId", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await notificationService.getOneNotification({
        accountId: req.headers.accountid,
        notificationId: req.params.notificationId,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API lưu thông báo
  onRoute(
    "put",
    "",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, [
          "sendType",
          "image",
          "title",
          "content",
        ]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await notificationService.saveNotification(
          req.query.notificationId,
          {
            ...request,
            host: renderHost(req),
          }
        );

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lưu dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // Api thêm thông báo khi nạp tiền
  onRoute(
    "put",
    "/topup",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, [
          "accountIds",
          "sendType",
          "title",
          "content",
        ]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await notificationService.addNotificationTopUp({
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

  // API cập trạng thái thông báo
  onRoute(
    "put",
    "/update-status",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["ids", "status"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await notificationService.updateStatusNotification(
          request
        );

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
};
