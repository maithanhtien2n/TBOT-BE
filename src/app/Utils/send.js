require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports = {
  sendMail: async ({ to, subject, text }) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "maithanhtien840@gmail.com",
        clientId:
          "353235528056-2qh4f74rvm18jiuu7ecoko4i0e6u6ng9.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken:
          "1//04_jivq6MZhPeCgYIARAAGAQSNwF-L9IrM95g1HJq9MWEse77LtyHIIENzTsp2YUL3JBosARrnA_yx1ri0TJjAgxD3_NvZIcgm80",
      },
    });

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    return result.accepted[0];
  },
};
