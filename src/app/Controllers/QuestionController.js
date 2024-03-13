require("dotenv").config();

module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "question";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const questionService = require("../Services/QuestionService");

  // Api lấy danh sách câu hỏi cho admin
  onRoute(
    "get",
    "/admin",
    async (req, res) => {
      try {
        const { tab, keySearch } = req.query;
        // Hàm xử lý logic và trả ra kết quả
        const result = await questionService.getAllAdmin({ tab, keySearch });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // Api lấy danh sách câu hỏi cho người dùng
  onRoute(
    "get",
    "/user",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await questionService.getAll({
          accountId: req.headers.accountid,
          scope: req.query.scope,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );

  // API thêm câu hỏi
  onRoute("post", "", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(
        { ...req.body, accountId: req.headers.accountid },
        ["accountId", "question"]
      ); // Yêu cầu phải có các trường này trong body

      // Hàm xử lý logic và trả ra kết quả
      const result = await questionService.create(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Thêm dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API trả lời câu hỏi
  onRoute(
    "put",
    "/:id",
    async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(
          { ...req.body, accountId: req.headers.accountid },
          ["answer"]
        ); // Yêu cầu phải có các trường này trong body

        // Hàm xử lý logic và trả ra kết quả
        const result = await questionService.update({
          questionId: req.params.id,
          ...request,
          host: process.env.HOST_BE,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Cập nhật dữ liệu thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );

  // API xóa câu hỏi
  onRoute(
    "delete",
    "/:id",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await questionService.delete(req.params.id);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Xóa dữ liệu thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "ADMIN"
  );
};
