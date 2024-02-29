require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  throwError,
  cloneObjectWithoutFields,
  generateOTP,
} = require("../Utils/index");
const { sendMail } = require("../Utils/send");

const { Account } = require("../Models/Account");
const { User } = require("../Models/User");

module.exports = {
  register: async ({ otp, email, password }) => {
    try {
      const account = await Account.findOne({ otp, email });

      if (!account) {
        throwError("EMAIL_AUTHENTICATION", "Email chưa được xác thực!");
      }

      const result = await Account.updateOne(
        { _id: account?._id },
        { password: bcrypt.hashSync(password, 10) } // Mã hóa mật khẩu
      );

      await User.create({ accountId: account?._id });

      return email;
    } catch (error) {
      throw error;
    }
  },

  login: async ({ email, password }) => {
    try {
      const account = await Account.findOne({ email });

      if (
        !account ||
        (account && !account?.password) ||
        !bcrypt.compareSync(password, account.password)
      ) {
        throwError(
          "INCORRECT_INFO",
          "Tên tài khoản hoặc mật khẩu không chính xác!"
        );
      }

      if (account.status === "LOCKED") {
        throwError("ACCOUNT_BLOCKED", "Tài khoản của bạn đã bị khóa!");
      }

      const user = await User.findOne({ accountId: account._id });

      const result = {
        account: cloneObjectWithoutFields(account, ["password", "__v"]),
        user: cloneObjectWithoutFields(user, ["__v"]),
      };

      return {
        userData: result,
        accessToken: jwt.sign(
          cloneObjectWithoutFields(account, [
            "moneyBalance",
            "password",
            "createdAt",
            "updatedAt",
            "__v",
          ]),
          process.env.JWT_SECRET
          // { expiresIn: "10h" }
        ),
      };
    } catch (error) {
      throw error;
    }
  },

  sendOtp: async ({ email }) => {
    try {
      const account = await Account.findOne({ email });

      if (account && account?.password) {
        throwError("EMAIL_ALREADY_USED", "Email này đã được sử dụng!");
      }

      const otpCode = generateOTP();

      const result = await sendMail({
        to: email,
        subject: "Mã OTP của bạn",
        text: `Mã OTP của bạn là: ${otpCode}`,
      });

      if (account) {
        await Account.updateOne({ _id: account?._id }, { otp: otpCode });
      } else {
        await Account.create({ email, otp: otpCode });
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  otpAuthentication: async ({ otp, email }) => {
    try {
      const account = await Account.findOne({ otp, email });

      if (!account) {
        throwError("OTP_IS_INCORRECT", "Mã OTP không chính xác!");
      }

      const result = {
        email: account?.email,
        otp: account?.otp,
      };

      return result;
    } catch (error) {
      throw error;
    }
  },
};
