const jwt = require("jsonwebtoken");
require("dotenv").config();
const { throwError } = require("../Utils/index");
const { Account } = require("../Models/Account");

module.exports = (role) => ({
  authenticateToken: async (req, res, next) => {
    try {
      if (
        [
          "virtual-assistant",
          "bot-image",
          "bot-audio",
          "bot-versatile",
        ].includes(req.url.split("/")[3]) &&
        role !== "ADMIN"
      ) {
        const accountId = req.headers.accountid;
        const account = await Account.findById(accountId);

        if (account?.moneyBalance <= 0) {
          throwError(
            "ERROR_BALANCE",
            "Vui lòng nạp tiền vào tài khoản để thực hiện dịch vụ này!"
          );
        }

        if (account?.moneyBalance < 5200) {
          throwError(
            "ERROR_BALANCE",
            "Số dư không đủ, vui lòng nạp thêm tiền vào tài khoản!"
          );
        }
      }

      if (role === "NO_AUTH") {
        return next();
      }

      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        throwError(
          "LOGIN_REQUEST",
          "Vui lòng đăng nhập để sử dụng tính năng này!"
        );
      }

      try {
        const data = await jwt.verify(token, process.env.JWT_SECRET);

        if (role !== data.role && data.role !== "ADMIN") {
          throwError(
            "ROLE_REQUEST",
            "Bạn không có quyền thực hiện tính năng này!"
          );
        }

        const account = await Account.findById(data._id);

        if (account.status === "LOCKED") {
          throwError("ACCOUNT_IS_LOCKED", "Tài khoản của bạn đã bị khóa!");
        }

        if (!req.headers.accountid && role !== "ADMIN") {
          throwError(
            "ACCOUNT_REQUIRED",
            "Không tìm thấy accountId trên header!"
          );
        }

        if (data._id !== req.headers.accountid && role !== "ADMIN") {
          throwError("ACCESS_IS_NOT_ALLOWED", "AccountId không chính xác!");
        }

        req.data = data;

        next();
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          throwError("LOGIN_EXPIRED", "Phiên đăng nhập đã hết hạn!");
        } else if (error.name === "JsonWebTokenError") {
          throwError("AUTH_ERROR", "Token không hợp lệ!");
        } else {
          throw error;
        }
      }
    } catch (error) {
      return res.status(error?.sttCode && error?.sttValue ? 400 : 500).json({
        success: false,
        statusCode: error?.sttCode || "AUTH_FAILED",
        statusValue: error?.sttValue || `Xác thực token thất bại (${error})`,
        data: null,
      });
    }
  },
});
