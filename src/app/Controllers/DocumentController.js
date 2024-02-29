module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "document";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const documentService = require("../Services/DocumentService");

  // API lấy danh sách thông tin người dùng
  onRoute(
    "get",
    "",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await documentService.getAll();

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );

  onRoute(
    "put",
    "",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["application", "topUp"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await documentService.save(request);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lưu dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );
};
