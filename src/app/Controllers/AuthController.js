module.exports = (app) => {
  const {
    onResponse,
    checkNullRequest,
    isValidEmail,
    throwError,
  } = require("../Utils/index");

  const controllerName = "auth";
  const onRoute = (method, route, handler) => {
    app[method](`/api/v1/${controllerName}/${route}`, handler);
  };

  // Service import
  const authService = require("../Services/AuthService");

  // API đăng ký tài khoản
  onRoute("post", "register", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, ["otp", "email", "password"]);

      if (!isValidEmail(request.email)) {
        throwError("INVALID_EMAIL", "Lỗi email không hợp lệ!");
      }

      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.register(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Đăng ký tài khoản thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API đăng nhập
  onRoute("post", "login", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, ["email", "password"]);

      if (!isValidEmail(request.email)) {
        throwError("INVALID_EMAIL", "Lỗi email không hợp lệ!");
      }

      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.login(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Đăng nhập thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API gửi mã otp
  onRoute("post", "otp-send", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, ["email"]);

      if (!isValidEmail(request.email)) {
        throwError("INVALID_EMAIL", "Lỗi email không hợp lệ!");
      }

      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.sendOtp(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({
        sttValue: "Gửi email xác thực thành công!",
      });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API xác thực mã otp
  onRoute("post", "otp-authentication", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, ["otp", "email"]);

      if (!isValidEmail(request.email)) {
        throwError("INVALID_EMAIL", "Lỗi email không hợp lệ!");
      }

      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.otpAuthentication(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Xác thực email thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });
};
