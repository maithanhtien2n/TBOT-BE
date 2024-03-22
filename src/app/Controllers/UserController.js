require("dotenv").config();

module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "user";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const userService = require("../Services/UserService");

  // API lấy danh sách thông tin người dùng
  onRoute(
    "get",
    "",
    async (req, res) => {
      try {
        const { tab, keySearch } = req.query;
        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.getAllUser({ tab, keySearch });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // API lấy thông tin người dùng
  onRoute("get", "/detail", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await userService.getOneUser(req.headers.accountid);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API lưu thông tin người dùng
  onRoute("put", "/save", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(
        { ...req.body, accountId: req.headers.accountid },
        ["accountId", "fullName", "gender", "dateOfBirth", "phoneNumber"]
      ); // Yêu cầu phải có các trường này trong body

      // Hàm xử lý logic và trả ra kết quả
      const result = await userService.saveUser({
        ...request,
        host: process.env.HOST_BE,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lưu dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API cập trạng thái người dùng
  onRoute(
    "put",
    "/update-status",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["ids", "status"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.updateStatusAccount(request);

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

  // API nạp tiền cho người dùng
  onRoute(
    "put",
    "/topup",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["ids", "moneyNumber"]); // Yêu cầu phải có các trường này trong body

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.updateMoneyBalanceUser({
          ...request,
          host: process.env.HOST_BE,
        });

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

  // API lịch sử nạp tiền
  onRoute("put", "/topup-history", async (req, res) => {
    try {
      // Các hàm xử lý request
      const { keySearch } = req.query;

      // Hàm xử lý logic và trả ra kết quả
      const result = await userService.getTopUpHistory({
        accountId: req.headers.accountid,
        keySearch,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // Api xóa người dùng
  onRoute(
    "delete",
    "",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.delete(req.query.ids);

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

  // API thay đổi mô hình
  onRoute("put", "/change-model", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.query, ["isUpgrade"]);

      // Hàm xử lý logic và trả ra kết quả
      const result = await userService.changeModel({
        accountId: req.headers.accountid,
        ...request,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: `Cập nhật dữ liệu thành công!` });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });
};
